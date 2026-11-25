/**
 * Tests for the cross-post link graph in scripts/blog/lib.ts: which hrefs are
 * post links, how a body becomes a set of linked slugs, which sources count
 * toward a target's inbound total and the LINK-* build rules. Most posts are
 * in-memory ParsedPost objects; the fixture dir and real content blocks read
 * posts from disk. Nothing is written.
 */
import { describe, expect, test } from 'bun:test'
import { join } from 'node:path'
import { loadPosts } from '../../scripts/blog/build'
import {
	type BlogFrontmatter,
	bodyToHtml,
	extractPostLinks,
	htmlAnchorHrefs,
	isLive,
	type LinkViolation,
	linkViolations,
	ORPHAN_SEVERITY,
	type ParsedPost,
	postSlugFromHref,
	publishedDay,
	qualifies,
	qualifyingInbound,
	validatePost
} from '../../scripts/blog/lib'

const NOW = new Date('2026-11-16T00:00:00Z')
const ORIGIN = 'https://hudsondigitalsolutions.com'

function post(
	slug: string,
	body = '',
	data: Partial<BlogFrontmatter> = {}
): ParsedPost {
	return {
		file: `${slug}.md`,
		slug,
		body,
		data: {
			title: `Title for ${slug}`,
			slug,
			excerpt: `Excerpt for ${slug}`,
			tags: ['seo'],
			author: 'richard-hudson',
			publishedAt: '2026-01-01',
			published: true,
			...data
		}
	}
}

/** Builds posts whose bodies link to the given slugs. */
function linking(
	slug: string,
	targets: string[],
	data: Partial<BlogFrontmatter> = {}
): ParsedPost {
	return post(slug, targets.map(t => `[to ${t}](/blog/${t})`).join(' '), data)
}

function rules(violations: LinkViolation[], rule: string): LinkViolation[] {
	return violations.filter(v => v.rule === rule)
}

describe('postSlugFromHref', () => {
	test.each([
		['/blog/a-post', 'a-post'],
		['/blog/a-post/', 'a-post'],
		['/blog/a-post#faq', 'a-post'],
		['/blog/a-post?ref=x', 'a-post'],
		[`${ORIGIN}/blog/a-post`, 'a-post'],
		[`${ORIGIN}/blog/a-post/#faq`, 'a-post'],
		['https://www.hudsondigitalsolutions.com/blog/a-post', 'a-post'],
		['/blog/Bad_Slug', 'Bad_Slug']
	])('%s is a link to %s', (href, slug) => {
		expect(postSlugFromHref(href)).toBe(slug)
	})

	test.each([
		'/blog',
		'/blog/',
		'/blog/tag',
		'/blog/tag/seo',
		'/blog/author/richard-hudson',
		'https://evil.example/blog/a-post',
		'https://hudsondigitalsolutions.com.evil.example/blog/a-post',
		'/tools/x',
		'/contact',
		'#faq'
	])('%s is not a post link', href => {
		expect(postSlugFromHref(href)).toBeNull()
	})
})

/**
 * Every href form a browser on /blog/src resolves to /blog/held (the site sets
 * trailingSlash: false). Each must hit the same slug in the renderer and in
 * every LINK rule.
 */
const HELD_FORMS = [
	'/blog/held',
	'HTTPS://HudsonDigitalSolutions.com/blog/held',
	'https://HUDSONDIGITALSOLUTIONS.COM/blog/held',
	'http://www.hudsondigitalsolutions.com/blog/held',
	'//hudsondigitalsolutions.com/blog/held',
	'held',
	'./held',
	'../blog/held',
	'held/',
	'https://hudsondigitalsolutions.com:443/blog/held',
	'http://hudsondigitalsolutions.com:80/blog/held',
	'/blog/./held',
	'/blog/x/../held',
	'/blog//held',
	'/blog/held//',
	'held//',
	'https://hudsondigitalsolutions.com//blog/held',
	'//hudsondigitalsolutions.com//blog/held',
	'/blog/%68eld',
	'&#x2F;blog&#x2F;held',
	'/blog&sol;held'
]

describe('postSlugFromHref resolves like a browser on the source page', () => {
	test.each(HELD_FORMS)('%s from /blog/src is held', href => {
		expect(postSlugFromHref(href, 'src')).toBe('held')
	})

	test.each([
		['#faq', 'src'],
		['?ref=x', 'src'],
		['', 'src']
	])('%p resolves to the source page itself', (href, slug) => {
		expect(postSlugFromHref(href, 'src')).toBe(slug)
	})

	test.each([
		'tag/seo',
		'../blog',
		'../tools/x',
		'/blog/a/b',
		'https://hudsondigitalsolutions.com:8443/blog/held',
		'ftp://hudsondigitalsolutions.com/blog/held',
		'mailto:hello@hudsondigitalsolutions.com',
		'javascript:alert(1)',
		'https://[bad'
	])('%s from /blog/src is not a post link', href => {
		expect(postSlugFromHref(href, 'src')).toBeNull()
	})

	test('without a source, relative hrefs resolve against the site root', () => {
		expect(postSlugFromHref('held')).toBeNull()
		expect(postSlugFromHref('blog/held')).toBe('held')
	})
})

describe('non-canonical hrefs in the renderer and the LINK rules', () => {
	const notHeld = (slug: string): boolean => slug !== 'held'

	test.each(HELD_FORMS)('[x](%s) to a held post renders as text', href => {
		const html = bodyToHtml(`See [it](${href}).`, 'markdown', notHeld, 'src')
		expect(html).toBe('<p>See it.</p>\n')
	})

	test.each(HELD_FORMS)('[x](%s) to a live post renders as a link', href => {
		const html = bodyToHtml(`See [it](${href}).`, 'markdown', () => true, 'src')
		expect(html).toContain('<a href=')
	})

	test.each(HELD_FORMS)('[x](%s) counts as a link to held', href => {
		const { targets } = extractPostLinks(post('src', `[it](${href})`))
		expect([...targets]).toEqual(['held'])
	})

	test.each(HELD_FORMS)(
		'<a href="%s"> counts as a raw HTML link to held',
		href => {
			const { htmlTargets } = extractPostLinks(
				post('src', `<a href="${href}">it</a>`, { bodyFormat: 'html' })
			)
			expect([...htmlTargets]).toEqual(['held'])
		}
	)

	test.each([
		'./missing-post',
		'missing-post',
		'HTTPS://HUDSONDIGITALSOLUTIONS.COM/blog/missing-post',
		'//www.hudsondigitalsolutions.com/blog/missing-post/',
		'/blog/./missing-post',
		'/blog//missing-post',
		'https://hudsondigitalsolutions.com//blog/missing-post'
	])('[x](%s) to an unknown slug is LINK-dead', href => {
		const posts = [
			linking('ring-a', ['ring-b', 'ring-c']),
			linking('ring-b', ['ring-a', 'ring-c']),
			linking('ring-c', ['ring-a', 'ring-b']),
			post('src', `[x](${href}) [y](/blog/ring-a)`)
		]
		const dead = rules(linkViolations(posts, NOW), 'LINK-dead')
		expect(dead.map(v => v.file)).toEqual(['src.md'])
		expect(dead[0]?.message).toContain('/blog/missing-post')
	})
})

describe('extractPostLinks', () => {
	test('counts an inline link', () => {
		const { targets, htmlTargets } = extractPostLinks(
			post('src', 'Read [the guide](/blog/a) first.')
		)
		expect([...targets]).toEqual(['a'])
		expect(htmlTargets.size).toBe(0)
	})

	test('counts a reference-style link', () => {
		const body = 'Read [the guide][ref] first.\n\n[ref]: /blog/b'
		expect([...extractPostLinks(post('src', body)).targets]).toEqual(['b'])
	})

	test('counts an autolink', () => {
		const body = `See <${ORIGIN}/blog/c> for more.`
		expect([...extractPostLinks(post('src', body)).targets]).toEqual(['c'])
	})

	test('counts links inside lists, headings and emphasis', () => {
		const body =
			'## See [h](/blog/h)\n\n- item [l](/blog/l)\n\n**[s](/blog/s)**'
		expect([...extractPostLinks(post('src', body)).targets].sort()).toEqual([
			'h',
			'l',
			's'
		])
	})

	test('counts a target once no matter how often it is linked', () => {
		const body = '[one](/blog/a) [two](/blog/a/) [three](/blog/a#faq)'
		expect([...extractPostLinks(post('src', body)).targets]).toEqual(['a'])
	})

	test('ignores a link to the post itself', () => {
		const body = '[me](/blog/src) and [other](/blog/a)'
		expect([...extractPostLinks(post('src', body)).targets]).toEqual(['a'])
	})

	test('ignores tag, author and index links', () => {
		const body =
			'[t](/blog/tag/seo) [a](/blog/author/richard-hudson) [i](/blog)'
		expect(extractPostLinks(post('src', body)).targets.size).toBe(0)
	})

	test('does not count a link inside an inline code span', () => {
		const body = 'Write `[x](/blog/d)` in markdown.'
		expect(extractPostLinks(post('src', body)).targets.size).toBe(0)
	})

	test('does not count a link inside a fenced code block', () => {
		const body = 'Example:\n\n```md\n[x](/blog/d)\n```\n'
		expect(extractPostLinks(post('src', body)).targets.size).toBe(0)
	})

	test('finds raw HTML anchors and marks them as raw HTML', () => {
		const body = 'Read <a href="/blog/e">e</a> and [f](/blog/f).'
		const { targets, htmlTargets } = extractPostLinks(post('src', body))
		expect([...targets].sort()).toEqual(['e', 'f'])
		expect([...htmlTargets]).toEqual(['e'])
	})

	test('finds single-quoted raw HTML anchors in a block of HTML', () => {
		const body = "<div>\n<a href='/blog/g'>g</a>\n</div>"
		const { targets, htmlTargets } = extractPostLinks(post('src', body))
		expect([...targets]).toEqual(['g'])
		expect([...htmlTargets]).toEqual(['g'])
	})

	test('treats every link in an html-format body as raw HTML', () => {
		const body = '<p><a href="/blog/a">a</a> <A HREF="/blog/b/">b</A></p>'
		const { targets, htmlTargets } = extractPostLinks(
			post('src', body, { bodyFormat: 'html' })
		)
		expect([...targets].sort()).toEqual(['a', 'b'])
		expect([...htmlTargets].sort()).toEqual(['a', 'b'])
	})

	test('ignores a self-link in an html-format body', () => {
		const body = '<a href="/blog/src">me</a>'
		const links = extractPostLinks(post('src', body, { bodyFormat: 'html' }))
		expect(links.targets.size).toBe(0)
		expect(links.htmlTargets.size).toBe(0)
	})
})

describe('raw HTML is parsed, not pattern-matched', () => {
	/** Raw HTML link targets for a body, in both body formats. */
	function htmlTargetsBoth(body: string): string[][] {
		return (['markdown', 'html'] as const).map(bodyFormat => [
			...extractPostLinks(post('src', body, { bodyFormat })).targets
		])
	}

	test.each([
		['double-quoted', '<a href="/blog/held">x</a>'],
		['single-quoted', "<a href='/blog/held'>x</a>"],
		['unquoted', '<a href=/blog/held>x</a>'],
		['unquoted, uppercase tag', '<A HREF=/blog/held/>x</A>'],
		['unquoted, other attributes', '<a class=x href=/blog/held rel=y>x</a>'],
		['a real anchor inside pre', '<pre><a href="/blog/held">x</a></pre>']
	])('a %s href counts as a raw HTML link', (_, body) => {
		for (const bodyFormat of ['markdown', 'html'] as const) {
			const links = extractPostLinks(post('src', body, { bodyFormat }))
			expect([...links.targets]).toEqual(['held'])
			expect([...links.htmlTargets]).toEqual(['held'])
		}
	})

	test.each([
		['an HTML comment', '<!-- <a href="/blog/gone">x</a> -->'],
		[
			'a comment inside a paragraph',
			'Text <!-- <a href="/blog/gone">x</a> --> more text.'
		],
		[
			'a multi-line comment',
			'<!--\nold link:\n<a href="/blog/gone">x</a>\n-->'
		],
		[
			'escaped markup in pre and code',
			'<pre><code>&lt;a href="/blog/gone"&gt;x&lt;/a&gt;</code></pre>'
		],
		[
			'escaped markup in inline code',
			'Use <code>&lt;a href=/blog/gone&gt;</code>.'
		],
		['a data-href attribute', '<div data-href="/blog/gone">x</div>'],
		['data-href on an anchor', '<a data-href="/blog/gone">x</a>'],
		['xlink:href', '<svg><a xlink:href="/blog/gone">x</a></svg>'],
		['script text', '<script>const s = \'<a href="/blog/gone">\'</script>'],
		['style text', '<style>/* <a href="/blog/gone"> */</style>']
	])('%s never counts', (_, body) => {
		expect(htmlTargetsBoth(body)).toEqual([[], []])
	})

	test('a markdown link inside an HTML comment never counts', () => {
		const body = 'Text.\n\n<!-- [x](/blog/gone) -->\n\nMore.'
		expect(extractPostLinks(post('src', body)).targets.size).toBe(0)
	})

	test('htmlAnchorHrefs reads every anchor in document order', () => {
		expect(
			htmlAnchorHrefs(
				'<a href="/a">a</a><!-- <a href="/b"> --><a href=\'/c\'>c</a><a href=/d>d</a>'
			)
		).toEqual(['/a', '/c', '/d'])
	})

	test('an unquoted raw HTML link to a held post is LINK-html', () => {
		for (const bodyFormat of ['markdown', 'html'] as const) {
			const posts = [
				linking('ring-a', ['ring-b', 'ring-c']),
				linking('ring-b', ['ring-a', 'ring-c']),
				linking('ring-c', ['ring-a', 'ring-b']),
				post('held', '', { publishedAt: '2026-12-03' }),
				post('src', '<p><a href=/blog/held>x</a></p>', { bodyFormat })
			]
			const v = rules(linkViolations(posts, NOW), 'LINK-html')
			expect(v.map(x => x.file)).toEqual(['src.md'])
		}
	})

	test('commented-out anchors are not dead links', () => {
		const posts = [
			linking('ring-a', ['ring-b', 'ring-c']),
			linking('ring-b', ['ring-a', 'ring-c']),
			linking('ring-c', ['ring-a', 'ring-b']),
			post('src', '<!-- <a href="/blog/gone">x</a> --> [y](/blog/ring-a)')
		]
		expect(rules(linkViolations(posts, NOW), 'LINK-dead')).toEqual([])
	})

	test('a post whose only inbound links are commented out is an orphan', () => {
		const commented = '<!-- <a href="/blog/tg">x</a> -->'
		const posts = [
			linking('ring-a', ['ring-b', 'ring-c']),
			linking('ring-b', ['ring-a', 'ring-c']),
			linking('ring-c', ['ring-a', 'ring-b']),
			post('tg'),
			post('one', `${commented} [r](/blog/ring-a)`),
			post('two', `${commented} [r](/blog/ring-b)`),
			post('three', `<p>${commented}<a href="/blog/ring-c">r</a></p>`, {
				bodyFormat: 'html'
			})
		]
		const orphans = rules(linkViolations(posts, NOW), 'LINK-orphan')
		expect(orphans.map(v => v.file)).toContain('tg.md')
	})
})

describe('qualifies', () => {
	const live = post('live', '', { publishedAt: '2026-01-01' })
	const held = post('held', '', { publishedAt: '2026-12-03' })

	test('an unpublished source never qualifies', () => {
		const draft = post('draft', '', { published: false })
		expect(qualifies(draft, live, NOW)).toBe(false)
		expect(qualifies(draft, held, NOW)).toBe(false)
	})

	test('a live source qualifies for a live target', () => {
		const other = post('other', '', { publishedAt: '2026-06-01' })
		expect(qualifies(other, live, NOW)).toBe(true)
	})

	test('a live source qualifies for a held target', () => {
		expect(qualifies(live, held, NOW)).toBe(true)
	})

	test('a held source dated before a held target qualifies', () => {
		const earlier = post('earlier', '', { publishedAt: '2026-12-01' })
		expect(qualifies(earlier, held, NOW)).toBe(true)
	})

	test('a held source dated the same day as a held target qualifies', () => {
		const sameDay = post('same-day', '', { publishedAt: '2026-12-03' })
		expect(qualifies(sameDay, held, NOW)).toBe(true)
	})

	test('a held source dated after a held target does not qualify', () => {
		const later = post('later', '', { publishedAt: '2026-12-10' })
		expect(qualifies(later, held, NOW)).toBe(false)
	})

	test('a held source with a date-time publishedAt never qualifies', () => {
		const timed = post('timed', '', { publishedAt: '2026-12-03T01:00:00Z' })
		expect(qualifies(timed, held, NOW)).toBe(false)
	})

	test('a held source with an unparsable date does not qualify', () => {
		const bad = post('bad', '', { publishedAt: 'someday' })
		expect(qualifies(bad, held, NOW)).toBe(false)
	})

	test('a held source never qualifies for a target with an unparsable date', () => {
		const later = post('later', '', { publishedAt: '2026-12-10' })
		const bad = post('bad', '', { publishedAt: 'someday' })
		expect(qualifies(later, bad, NOW)).toBe(false)
	})

	test('a non-string publishedAt never throws', () => {
		const odd = post('odd', '', {
			publishedAt: 20261210 as unknown as string
		})
		const later = post('later', '', { publishedAt: '2026-12-10' })
		expect(() => qualifies(odd, held, NOW)).not.toThrow()
		expect(qualifies(later, odd, NOW)).toBe(false)
	})

	test('a live source qualifies even when the target date is unparsable', () => {
		const bad = post('bad', '', { publishedAt: 'someday' })
		expect(qualifies(live, bad, NOW)).toBe(true)
	})
})

describe('publishedAt dates (UTC calendar days)', () => {
	test.each(['2026-12-03', '2024-02-29'])('%s is a valid day', value => {
		expect(publishedDay(value)).toBe(value)
	})

	test.each([
		'2026-12-03T23:30:00',
		'2026-12-03T00:00:00Z',
		'2026-12-03 ',
		'Dec 3, 2026',
		'2026-1-3',
		'2026-02-30',
		'2025-02-29',
		'someday',
		''
	])('%p is rejected', value => {
		expect(publishedDay(value)).toBeNull()
	})

	test('a non-string value is rejected', () => {
		expect(publishedDay(20261203)).toBeNull()
		expect(publishedDay(new Date('2026-12-03'))).toBeNull()
		expect(publishedDay(undefined)).toBeNull()
	})

	test('validation names the field and rejects anything but YYYY-MM-DD', () => {
		for (const publishedAt of ['Dec 3, 2026', '2026-12-03T23:30:00']) {
			const errors = validatePost(post('p', '', { publishedAt })).filter(
				v => v.severity === 'error'
			)
			expect(errors).toHaveLength(1)
			expect(errors[0]?.message).toContain('publishedAt')
			expect(errors[0]?.message).toContain(publishedAt)
		}
	})

	test('validation accepts a YYYY-MM-DD date', () => {
		const errors = validatePost(post('p', '', { publishedAt: '2026-12-03' }))
		expect(
			errors.filter(v => v.rule === 'R0' && v.severity === 'error')
		).toEqual([])
	})

	test('a post goes live at UTC midnight of its day', () => {
		const data = post('p', '', { publishedAt: '2026-12-03' }).data
		expect(isLive(data, new Date('2026-12-02T23:59:59.999Z'))).toBe(false)
		expect(isLive(data, new Date('2026-12-03T00:00:00.000Z'))).toBe(true)
	})

	test('a date-time publishedAt is never live', () => {
		const data = post('p', '', { publishedAt: '2026-01-01T00:00:00Z' }).data
		expect(isLive(data, NOW)).toBe(false)
	})

	// Every rule works on UTC days, so a machine in any timezone must get the
	// same answers as CI and Vercel (UTC).
	test('results do not depend on the machine timezone', () => {
		const target = post('target', '', { publishedAt: '2026-12-03' })
		const sameDay = post('same-day', '', { publishedAt: '2026-12-03' })
		const later = post('later', '', { publishedAt: '2026-12-04' })
		const instants = [
			'2026-12-02T12:00:00Z',
			'2026-12-02T23:59:59Z',
			'2026-12-03T00:00:00Z',
			'2026-12-03T10:30:00Z'
		].map(t => new Date(t))
		const snapshot = (): unknown[] =>
			instants.map(now => [
				isLive(target.data, now),
				qualifies(sameDay, target, now),
				qualifies(later, target, now),
				validatePost(target).filter(v => v.message.includes('publishedAt'))
					.length
			])
		// Capture the effective zone and restore it by assignment. Deleting
		// process.env.TZ removes Bun's TZ accessor, which freezes ICU at the
		// last zone set below (Asia/Tokyo) for the rest of the run.
		const original =
			process.env.TZ ?? Intl.DateTimeFormat().resolvedOptions().timeZone
		try {
			process.env.TZ = 'UTC'
			const utc = snapshot()
			expect(utc).toEqual([
				[false, true, false, 0],
				[false, true, false, 0],
				[true, true, false, 0],
				[true, true, false, 0]
			])
			for (const tz of [
				'America/Chicago',
				'Pacific/Kiritimati',
				'Asia/Tokyo'
			]) {
				process.env.TZ = tz
				expect(snapshot()).toEqual(utc)
			}
		} finally {
			process.env.TZ = original
		}
	})
})

describe('qualifyingInbound', () => {
	test('has one key per published post, drafts excluded', () => {
		const inbound = qualifyingInbound(
			[post('a'), post('b'), post('draft', '', { published: false })],
			NOW
		)
		expect([...inbound.keys()].sort()).toEqual(['a', 'b'])
	})

	test('a post with no inbound links has an empty list', () => {
		expect(qualifyingInbound([post('a')], NOW).get('a')).toEqual([])
	})

	test('lists each source once and sorted', () => {
		const posts = [
			post('target'),
			post('zeta', '[x](/blog/target) [y](/blog/target#faq)'),
			linking('alpha', ['target'])
		]
		expect(qualifyingInbound(posts, NOW).get('target')).toEqual([
			'alpha',
			'zeta'
		])
	})

	test('excludes unpublished sources', () => {
		const posts = [
			post('target'),
			linking('draft', ['target'], { published: false })
		]
		expect(qualifyingInbound(posts, NOW).get('target')).toEqual([])
	})

	test('excludes held sources dated after a held target', () => {
		const posts = [
			post('target', '', { publishedAt: '2026-12-03' }),
			linking('earlier', ['target'], { publishedAt: '2026-12-01' }),
			linking('later', ['target'], { publishedAt: '2026-12-10' })
		]
		expect(qualifyingInbound(posts, NOW).get('target')).toEqual(['earlier'])
	})

	test('ignores links to unknown and unpublished slugs', () => {
		const posts = [
			post('draft', '', { published: false }),
			linking('src', ['draft', 'missing'])
		]
		const inbound = qualifyingInbound(posts, NOW)
		expect(inbound.has('draft')).toBe(false)
		expect(inbound.has('missing')).toBe(false)
	})
})

describe('linkViolations', () => {
	/** Two well-linked companions so threshold rules stay quiet elsewhere. */
	function ringed(extra: ParsedPost[]): ParsedPost[] {
		return [
			linking('ring-a', ['ring-b', 'ring-c']),
			linking('ring-b', ['ring-a', 'ring-c']),
			linking('ring-c', ['ring-a', 'ring-b']),
			...extra
		]
	}

	describe('dead links', () => {
		test('a link to a missing slug is an error on the source file', () => {
			const v = rules(
				linkViolations(ringed([linking('src', ['missing-post'])]), NOW),
				'LINK-dead'
			)
			expect(v).toHaveLength(1)
			expect(v[0]?.severity).toBe('error')
			expect(v[0]?.file).toBe('src.md')
			expect(v[0]?.message).toContain('missing-post')
		})

		test('fires when the source is a draft', () => {
			const draft = linking('draft', ['missing-post'], { published: false })
			const v = rules(linkViolations(ringed([draft]), NOW), 'LINK-dead')
			expect(v).toHaveLength(1)
			expect(v[0]?.file).toBe('draft.md')
		})

		test('catches a malformed slug', () => {
			const src = post('src', '[x](/blog/Bad_Slug)')
			const v = rules(linkViolations(ringed([src]), NOW), 'LINK-dead')
			expect(v[0]?.message).toContain('Bad_Slug')
		})

		test('a link to an existing post is not dead', () => {
			const v = linkViolations(ringed([linking('src', ['ring-a'])]), NOW)
			expect(rules(v, 'LINK-dead')).toHaveLength(0)
		})
	})

	describe('unpublished targets', () => {
		test('a published source linking a draft is an error on the source', () => {
			const posts = ringed([
				post('draft', '', { published: false }),
				linking('src', ['draft'])
			])
			const v = rules(linkViolations(posts, NOW), 'LINK-unpublished')
			expect(v).toHaveLength(1)
			expect(v[0]?.severity).toBe('error')
			expect(v[0]?.file).toBe('src.md')
			expect(v[0]?.message).toContain('draft')
		})

		test('a draft linking a draft is allowed', () => {
			const posts = ringed([
				post('draft-a', '', { published: false }),
				linking('draft-b', ['draft-a'], { published: false })
			])
			expect(
				rules(linkViolations(posts, NOW), 'LINK-unpublished')
			).toHaveLength(0)
		})
	})

	describe('raw HTML links', () => {
		test('a raw HTML anchor to a held post is an error on the source', () => {
			const posts = ringed([
				post('held-post', '', { publishedAt: '2026-12-03' }),
				post('src', 'See <a href="/blog/held-post">it</a>.')
			])
			const v = rules(linkViolations(posts, NOW), 'LINK-html')
			expect(v).toHaveLength(1)
			expect(v[0]?.severity).toBe('error')
			expect(v[0]?.file).toBe('src.md')
			expect(v[0]?.message).toContain('held-post')
		})

		test('a raw HTML anchor to a live post is allowed', () => {
			const posts = ringed([post('src', 'See <a href="/blog/ring-a">it</a>.')])
			expect(rules(linkViolations(posts, NOW), 'LINK-html')).toHaveLength(0)
		})

		test('a held source dated before a held target is an error', () => {
			const posts = ringed([
				post('held-post', '', { publishedAt: '2026-12-03' }),
				post('src', 'See <a href="/blog/held-post">it</a>.', {
					publishedAt: '2026-12-01'
				})
			])
			const v = rules(linkViolations(posts, NOW), 'LINK-html')
			expect(v.map(x => x.file)).toEqual(['src.md'])
		})

		test('a held source dated after a held target is allowed', () => {
			const posts = ringed([
				post('held-post', '', { publishedAt: '2026-12-03' }),
				post('src', 'See <a href="/blog/held-post">it</a>.', {
					publishedAt: '2026-12-10'
				})
			])
			expect(rules(linkViolations(posts, NOW), 'LINK-html')).toHaveLength(0)
		})

		test('a held source dated the same day as the target is allowed', () => {
			const posts = ringed([
				post('held-post', '', { publishedAt: '2026-12-03' }),
				post('src', 'See <a href="/blog/held-post">it</a>.', {
					publishedAt: '2026-12-03'
				})
			])
			expect(rules(linkViolations(posts, NOW), 'LINK-html')).toHaveLength(0)
		})

		test('a draft source linking a held post is allowed', () => {
			const posts = ringed([
				post('held-post', '', { publishedAt: '2026-12-03' }),
				post('draft', 'See <a href="/blog/held-post">it</a>.', {
					published: false
				})
			])
			expect(rules(linkViolations(posts, NOW), 'LINK-html')).toHaveLength(0)
		})

		test('a draft linking a draft in raw HTML is allowed', () => {
			const posts = ringed([
				post('draft-a', '', { published: false }),
				post('draft-b', '<a href="/blog/draft-a">a</a>', { published: false })
			])
			const v = linkViolations(posts, NOW)
			expect(rules(v, 'LINK-html')).toHaveLength(0)
			expect(rules(v, 'LINK-unpublished')).toHaveLength(0)
		})

		test('a markdown link to a held post is allowed', () => {
			const posts = ringed([
				post('held-post', '', { publishedAt: '2026-12-03' }),
				linking('src', ['held-post'])
			])
			expect(rules(linkViolations(posts, NOW), 'LINK-html')).toHaveLength(0)
		})
	})

	describe('inbound threshold', () => {
		test('0 qualifying inbound is an orphan on the target file', () => {
			const v = rules(
				linkViolations(ringed([post('lonely')]), NOW),
				'LINK-orphan'
			)
			expect(v).toHaveLength(1)
			expect(v[0]?.severity).toBe(ORPHAN_SEVERITY)
			expect(v[0]?.file).toBe('lonely.md')
			expect(v[0]?.message).toContain('lonely')
		})

		test('an orphan fails the build', () => {
			expect(ORPHAN_SEVERITY).toBe('error')
		})

		test('exactly 1 qualifying inbound warns and names the source', () => {
			const posts = ringed([
				post('target'),
				linking('fan', ['target', 'ring-a'])
			])
			const v = rules(linkViolations(posts, NOW), 'LINK-below')
			const forTarget = v.filter(x => x.file === 'target.md')
			expect(forTarget).toHaveLength(1)
			expect(forTarget[0]?.severity).toBe('warn')
			expect(forTarget[0]?.message).toContain('target')
			expect(forTarget[0]?.message).toContain('fan')
		})

		test('2 or more qualifying inbound is clean', () => {
			const v = linkViolations(ringed([]), NOW)
			expect(v).toEqual([])
		})

		test('drafts are never orphan-checked', () => {
			const posts = ringed([post('draft', '', { published: false })])
			expect(linkViolations(posts, NOW)).toEqual([])
		})

		test('a held post linked only by a later held post is an orphan', () => {
			const posts = ringed([
				post('held-post', '', { publishedAt: '2026-12-03' }),
				linking('later', ['held-post', 'ring-a'], {
					publishedAt: '2026-12-10'
				})
			])
			const v = rules(linkViolations(posts, NOW), 'LINK-orphan')
			expect(v.map(x => x.file)).toContain('held-post.md')
		})

		test('links from a draft do not lift a post off orphan', () => {
			const posts = ringed([
				post('target'),
				linking('draft-a', ['target'], { published: false }),
				linking('draft-b', ['target'], { published: false })
			])
			const v = rules(linkViolations(posts, NOW), 'LINK-orphan')
			expect(v.map(x => x.file)).toEqual(['target.md'])
		})
	})

	test('never throws on a missing or invalid publishedAt', () => {
		const posts = ringed([
			linking('no-date', ['ring-a'], {
				publishedAt: undefined as unknown as string
			}),
			linking('bad-date', ['no-date'], { publishedAt: 'someday' })
		])
		expect(() => linkViolations(posts, NOW)).not.toThrow()
	})
})

describe('fixture dir', () => {
	const FIXTURE_DIR = join(process.cwd(), 'tests/fixtures/blog')
	const FIXTURE_NOW = new Date('2026-02-01T00:00:00.000Z')

	test('the visual fixtures have no link violations', () => {
		expect(linkViolations(loadPosts(FIXTURE_DIR), FIXTURE_NOW)).toEqual([])
	})

	test('every fixture has exactly 2 qualifying inbound links', () => {
		const inbound = qualifyingInbound(loadPosts(FIXTURE_DIR), FIXTURE_NOW)
		expect(inbound.size).toBe(5)
		for (const sources of inbound.values()) {
			expect(sources).toHaveLength(2)
		}
	})
})

/** Tests that walk every real post: slower than unit tests by design. */
const REAL_CONTENT_TIMEOUT_MS = 30_000

describe('real content', () => {
	// Errors only: a post at 1 qualifying inbound is a warning by design, so
	// this never asserts that the full violation list is empty.
	// Reads and lexes every post, so it scales with the blog and runs well
	// past bun's 5s default under coverage on CI. REAL_CONTENT_TIMEOUT_MS
	// leaves headroom as posts are added.
	test(
		'content/blog has no link errors',
		() => {
			const errors = linkViolations(loadPosts(), new Date()).filter(
				v => v.severity === 'error'
			)
			expect(errors).toEqual([])
		},
		REAL_CONTENT_TIMEOUT_MS
	)
})
