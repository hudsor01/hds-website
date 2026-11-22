/**
 * Tests for the content/blog compiler (scripts/blog/build.ts), the only
 * producer of blog data for the site. Fixtures are written to a temp dir so
 * the real content/blog tree is never touched.
 */
import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
	compileAll,
	compilePosts,
	contentDir,
	loadPosts,
	renderModule,
	runBuild
} from '../../scripts/blog/build'
import {
	CONTENT_DIR,
	htmlAnchorHrefs,
	isLive,
	postSlugFromHref
} from '../../scripts/blog/lib'
import { validateAll } from '../../scripts/blog/validate'
import type { CompiledBlogPost } from '../../src/types/blog'

interface FixtureOptions {
	slug: string
	title?: string
	excerpt?: string
	publishedAt?: string
	published?: boolean
	featured?: boolean
	tags?: string[]
	author?: string
	readingTime?: number
	bodyFormat?: 'markdown' | 'html'
	body?: string
}

let dir: string

function writePost(options: FixtureOptions): void {
	const {
		slug,
		title = `Title for ${slug}`,
		excerpt = `Excerpt for ${slug}`,
		publishedAt = '2026-01-01',
		published = true,
		featured = false,
		tags = ['seo'],
		author = 'richard-hudson',
		readingTime = 0,
		bodyFormat = 'markdown',
		body = '## Heading\n\nSome **bold** body text.'
	} = options
	// legacy: true limits validation to the structural rules, so fixtures do
	// not need 1000 words of filler to exercise the compiler.
	const frontmatter = [
		'---',
		`title: ${JSON.stringify(title)}`,
		`slug: ${slug}`,
		`excerpt: ${JSON.stringify(excerpt)}`,
		`tags: [${tags.join(', ')}]`,
		`author: ${author}`,
		`publishedAt: '${publishedAt}'`,
		`published: ${published}`,
		`featured: ${featured}`,
		"featureImage: ''",
		`readingTime: ${readingTime}`,
		`bodyFormat: ${bodyFormat}`,
		'legacy: true',
		'---',
		''
	].join('\n')
	writeFileSync(join(dir, `${slug}.md`), `${frontmatter}${body}\n`)
}

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'blog-build-'))
})

afterEach(() => {
	rmSync(dir, { recursive: true, force: true })
})

describe('compilePosts', () => {
	test('compiles markdown bodies to HTML and resolves frontmatter', () => {
		writePost({ slug: 'first-post', tags: ['seo', 'local-marketing'] })
		const [post] = compilePosts(dir)
		expect(post).toEqual({
			slug: 'first-post',
			title: 'Title for first-post',
			excerpt: 'Excerpt for first-post',
			content:
				'<h2>Heading</h2>\n<p>Some <strong>bold</strong> body text.</p>\n',
			featureImage: null,
			publishedAt: '2026-01-01T00:00:00.000Z',
			readingTime: 1,
			featured: false,
			tagSlugs: ['seo', 'local-marketing'],
			authorSlug: 'richard-hudson'
		})
	})

	test('passes html bodies through untouched', () => {
		writePost({
			slug: 'html-post',
			bodyFormat: 'html',
			body: '<p>Already <em>HTML</em></p>'
		})
		expect(compilePosts(dir)[0]?.content).toBe('<p>Already <em>HTML</em></p>')
	})

	test('keeps an explicit readingTime and strips markdown from excerpts', () => {
		writePost({
			slug: 'timed',
			readingTime: 7,
			excerpt: '*   **Bold** lead in'
		})
		const [post] = compilePosts(dir)
		expect(post?.readingTime).toBe(7)
		expect(post?.excerpt).toBe('Bold lead in')
	})

	test('excludes drafts', () => {
		writePost({ slug: 'live-post' })
		writePost({ slug: 'draft-post', published: false })
		expect(compilePosts(dir).map(p => p.slug)).toEqual(['live-post'])
	})

	test('holds scheduled posts back until their date', () => {
		writePost({ slug: 'live-post', publishedAt: '2026-03-01' })
		writePost({ slug: 'scheduled-post', publishedAt: '2026-03-02' })
		const dayBefore = new Date('2026-03-01T23:59:59.999Z')
		const onTheDay = new Date('2026-03-02T00:00:00.000Z')
		expect(compilePosts(dir, dayBefore).map(p => p.slug)).toEqual(['live-post'])
		expect(compilePosts(dir, onTheDay).map(p => p.slug)).toEqual([
			'scheduled-post',
			'live-post'
		])
	})

	test('throws when every published post is still scheduled', () => {
		writePost({ slug: 'scheduled-post', publishedAt: '2026-03-02' })
		expect(() =>
			compilePosts(dir, new Date('2026-03-01T00:00:00.000Z'))
		).toThrow(/no published posts/)
	})

	test('ignores the README template', () => {
		writePost({ slug: 'live-post' })
		writeFileSync(join(dir, 'README.md'), '# Not a post\n')
		expect(compilePosts(dir)).toHaveLength(1)
	})

	test('sorts newest first and breaks same-day ties by slug', () => {
		writePost({ slug: 'old', publishedAt: '2025-01-01' })
		writePost({ slug: 'new-b', publishedAt: '2026-03-01' })
		writePost({ slug: 'new-a', publishedAt: '2026-03-01' })
		expect(compilePosts(dir).map(p => p.slug)).toEqual([
			'new-a',
			'new-b',
			'old'
		])
	})

	test('throws on unparseable frontmatter', () => {
		writePost({ slug: 'good-post' })
		writeFileSync(
			join(dir, 'broken.md'),
			'---\ntitle: [unclosed\nslug: broken\n---\nbody\n'
		)
		expect(() => compilePosts(dir)).toThrow(/broken\.md: cannot parse/)
	})

	test('throws on an unknown tag', () => {
		writePost({ slug: 'bad-tag', tags: ['not-a-tag'] })
		expect(() => compilePosts(dir)).toThrow(/unknown tag: not-a-tag/)
	})

	test('throws on an unknown author', () => {
		writePost({ slug: 'bad-author', author: 'nobody' })
		expect(() => compilePosts(dir)).toThrow(/unknown author: nobody/)
	})

	test('throws on an invalid publishedAt', () => {
		writePost({ slug: 'bad-date', publishedAt: 'someday' })
		expect(() => compilePosts(dir)).toThrow(/publishedAt must be a YYYY-MM-DD/)
	})

	test('throws on a date-time publishedAt, naming the file and field', () => {
		writePost({ slug: 'timed', publishedAt: '2026-01-01T23:30:00' })
		expect(() => compilePosts(dir)).toThrow(
			/timed\.md: \[R0\] publishedAt must be a YYYY-MM-DD date/
		)
	})

	test('throws when a slug does not match its filename', () => {
		writePost({ slug: 'real-slug' })
		writeFileSync(
			join(dir, 'other-name.md'),
			"---\ntitle: X\nslug: real-slug-2\nexcerpt: Y\ntags: [seo]\nauthor: richard-hudson\npublishedAt: '2026-01-01'\npublished: true\nlegacy: true\n---\nbody\n"
		)
		expect(() => compilePosts(dir)).toThrow(/!= filename/)
	})

	test('validates drafts too, so a broken draft fails the build', () => {
		writePost({ slug: 'live-post' })
		writePost({ slug: 'draft-post', published: false, tags: ['nope'] })
		expect(() => compilePosts(dir)).toThrow(/draft-post\.md/)
	})

	test('throws when there are no published posts', () => {
		writePost({ slug: 'only-draft', published: false })
		expect(() => compilePosts(dir)).toThrow(/no published posts/)
	})
})

describe('scheduled posts are compiled before their date (WR-06)', () => {
	const BEFORE = new Date('2026-11-16T00:00:00.000Z')
	// A title that passes validation (a non-empty string) but strips to nothing.
	const EMPTY_TITLE = '![](x)'

	beforeEach(() => {
		writePost({ slug: 'live-post', publishedAt: '2026-01-01' })
	})

	test('a held post whose title strips to empty fails every build', () => {
		writePost({
			slug: 'held-bad',
			title: EMPTY_TITLE,
			publishedAt: '2026-12-20'
		})
		expect(() => compilePosts(dir, BEFORE)).toThrow(
			/held-bad\.md: title is empty after stripping markdown/
		)
	})

	test('blog:validate reports it as a COMPILE error on the file', () => {
		writePost({
			slug: 'held-bad',
			title: EMPTY_TITLE,
			publishedAt: '2026-12-20'
		})
		const report = validateAll(dir, BEFORE).find(r => r.file === 'held-bad.md')
		expect(report?.violations).toContainEqual({
			rule: 'COMPILE',
			message: 'title is empty after stripping markdown',
			severity: 'error'
		})
	})

	test('a held post is compiled but left out of the output', () => {
		writePost({ slug: 'held-post', publishedAt: '2026-12-20' })
		const posts = loadPosts(dir)
		const { compiled, failures } = compileAll(posts, BEFORE)
		expect(failures).toEqual([])
		expect(compiled.map(p => p.slug)).toEqual(['live-post'])
	})

	test('drafts are never compiled', () => {
		writePost({ slug: 'draft-bad', title: EMPTY_TITLE, published: false })
		expect(compilePosts(dir, BEFORE).map(p => p.slug)).toEqual(['live-post'])
		const report = validateAll(dir, BEFORE).find(r => r.file === 'draft-bad.md')
		expect(report?.violations.filter(v => v.rule === 'COMPILE')).toEqual([])
	})

	test('validation and compile failures are reported together', () => {
		writePost({ slug: 'bad-tag', tags: ['not-a-tag'] })
		writePost({
			slug: 'held-bad',
			title: EMPTY_TITLE,
			publishedAt: '2026-12-20'
		})
		expect(() => compilePosts(dir, BEFORE)).toThrow(
			/failed for 2 issue\(s\):\n {2}bad-tag\.md: \[R4\] unknown tag: not-a-tag\n {2}held-bad\.md: title is empty/
		)
	})
})

describe('held-post links (D4)', () => {
	const DAY_BEFORE = new Date('2026-03-01T23:59:59.999Z')
	const ON_THE_DAY = new Date('2026-03-02T00:00:00.000Z')

	function contentOf(slug: string, now: Date): string | undefined {
		return compilePosts(dir, now).find(p => p.slug === slug)?.content
	}

	beforeEach(() => {
		writePost({ slug: 'held-post', publishedAt: '2026-03-02' })
	})

	test('a link to a held post renders as its text, formatting kept', () => {
		writePost({
			slug: 'live-post',
			publishedAt: '2026-03-01',
			body: 'See [**the held post**](/blog/held-post) now.'
		})
		expect(contentOf('live-post', DAY_BEFORE)).toBe(
			'<p>See <strong>the held post</strong> now.</p>\n'
		)
	})

	test('the link switches on when the held post goes live', () => {
		writePost({
			slug: 'live-post',
			publishedAt: '2026-03-01',
			body: 'See [**the held post**](/blog/held-post) now.'
		})
		const posts = compilePosts(dir, ON_THE_DAY)
		expect(posts.map(p => p.slug)).toEqual(['held-post', 'live-post'])
		expect(posts.find(p => p.slug === 'live-post')?.content).toBe(
			'<p>See <a href="/blog/held-post"><strong>the held post</strong></a> now.</p>\n'
		)
	})

	test('an absolute link to a held post also renders as text', () => {
		writePost({
			slug: 'live-post',
			publishedAt: '2026-03-01',
			body: 'See [it](https://hudsondigitalsolutions.com/blog/held-post/#faq).'
		})
		expect(contentOf('live-post', DAY_BEFORE)).toBe('<p>See it.</p>\n')
	})

	test('a link to a draft renders as text', () => {
		writePost({ slug: 'draft-post', published: false })
		writePost({
			slug: 'live-post',
			publishedAt: '2026-03-01',
			body: 'See [the draft](/blog/draft-post).'
		})
		expect(contentOf('live-post', DAY_BEFORE)).toBe('<p>See the draft.</p>\n')
	})

	test('every other link renders exactly as before', () => {
		writePost({ slug: 'other-live', publishedAt: '2026-02-01' })
		writePost({
			slug: 'live-post',
			publishedAt: '2026-03-01',
			body: '[x](/blog/other-live) [tools](/tools/paystub-calculator) [g](https://google.com "Google")'
		})
		expect(contentOf('live-post', DAY_BEFORE)).toBe(
			'<p><a href="/blog/other-live">x</a> <a href="/tools/paystub-calculator">tools</a> <a href="https://google.com" title="Google">g</a></p>\n'
		)
	})
})

describe('loadPosts', () => {
	test('returns every parsed post, drafts and scheduled included', () => {
		writePost({ slug: 'live-post' })
		writePost({ slug: 'draft-post', published: false })
		writePost({ slug: 'scheduled-post', publishedAt: '2099-01-01' })
		expect(
			loadPosts(dir)
				.map(p => p.slug)
				.sort()
		).toEqual(['draft-post', 'live-post', 'scheduled-post'])
	})

	test('returns posts even when none is live', () => {
		writePost({ slug: 'only-draft', published: false })
		expect(loadPosts(dir).map(p => p.slug)).toEqual(['only-draft'])
	})

	test('throws with file and rule on a validation error', () => {
		writePost({ slug: 'bad-tag', tags: ['not-a-tag'] })
		expect(() => loadPosts(dir)).toThrow(
			/blog:build failed for 1 issue\(s\):\n {2}bad-tag\.md: \[R4\] unknown tag: not-a-tag/
		)
	})

	test('throws on unparseable frontmatter', () => {
		// Different text from the compilePosts case: gray-matter caches by
		// input string, so a repeat of the same broken text would not throw.
		writeFileSync(
			join(dir, 'broken.md'),
			'---\ntitle: [still unclosed\nslug: broken\n---\nbody\n'
		)
		expect(() => loadPosts(dir)).toThrow(/broken\.md: cannot parse \(/)
	})
})

/**
 * Every <a href> in compiled posts that resolves (the way a browser does on
 * that post's page) to a post that is not live, as "source -> href". Hrefs
 * are read by an HTML parser, so any quote style and absolute form counts.
 */
function anchorsToNonLive(
	posts: CompiledBlogPost[],
	live: ReadonlySet<string>
): { offenders: string[]; postLinks: number } {
	const offenders: string[] = []
	let postLinks = 0
	for (const p of posts) {
		for (const href of htmlAnchorHrefs(p.content)) {
			const slug = postSlugFromHref(href, p.slug)
			if (slug === null) {
				continue
			}
			postLinks++
			if (!live.has(slug)) {
				offenders.push(`${p.slug} -> ${href}`)
			}
		}
	}
	return { offenders, postLinks }
}

describe('no compiled <a> points at a post that is not live', () => {
	const DAY_BEFORE = new Date('2026-03-01T23:59:59.999Z')
	const ON_THE_DAY = new Date('2026-03-02T00:00:00.000Z')
	// Every way a markdown body can link the held post; all must render as text.
	const FORMS = [
		'[a](/blog/held-post)',
		'[b](https://hudsondigitalsolutions.com/blog/held-post/#faq)',
		'[c](HTTPS://WWW.HudsonDigitalSolutions.com/blog/held-post)',
		'[d](//hudsondigitalsolutions.com/blog/held-post?x=1)',
		'[e](held-post)',
		'[f](./held-post)',
		'[g](../blog/held-post)',
		'[h](https://hudsondigitalsolutions.com:443/blog/./held-post)',
		'[i][ref]',
		'[j](/blog//held-post)',
		'[k](/blog/held-post//)',
		'[l](https://hudsondigitalsolutions.com//blog/held-post)',
		'<https://hudsondigitalsolutions.com/blog/held-post>',
		'https://www.hudsondigitalsolutions.com/blog/held-post'
	]

	test('a synthetic held post is never linked before its date', () => {
		writePost({ slug: 'held-post', publishedAt: '2026-03-02' })
		writePost({
			slug: 'live-post',
			publishedAt: '2026-03-01',
			body: `${FORMS.join('\n\n')}\n\n[ref]: /blog/held-post`
		})
		const live = (now: Date): Set<string> =>
			new Set(
				loadPosts(dir)
					.filter(p => isLive(p.data, now))
					.map(p => p.slug)
			)

		const before = anchorsToNonLive(
			compilePosts(dir, DAY_BEFORE),
			live(DAY_BEFORE)
		)
		expect(before).toEqual({ offenders: [], postLinks: 0 })

		// Not vacuous: on the day, every form is a real link to the post.
		const onTheDay = anchorsToNonLive(
			compilePosts(dir, ON_THE_DAY),
			live(ON_THE_DAY)
		)
		expect(onTheDay).toEqual({ offenders: [], postLinks: FORMS.length })
	})

	// Compiles every real post, so it scales with the blog and runs past
	// bun's 5s default under coverage on CI.
	test('real content: no compiled <a> resolves to a non-live post', () => {
		const now = new Date()
		const posts = loadPosts()
		const live = new Set(
			posts.filter(p => isLive(p.data, now)).map(p => p.slug)
		)
		const { offenders, postLinks } = anchorsToNonLive(
			compileAll(posts, now).compiled,
			live
		)
		expect(offenders).toEqual([])
		expect(postLinks).toBeGreaterThan(0)
	}, 30_000)
})

describe('runBuild (the blog:build link gate)', () => {
	const NOW = new Date('2026-03-01T12:00:00.000Z')
	let out: string

	beforeEach(() => {
		out = join(dir, 'out', 'blog-posts.ts')
	})

	/** Three posts that each link the other two, so every rule stays quiet. */
	function writeRing(): void {
		const ring = ['ring-a', 'ring-b', 'ring-c']
		for (const slug of ring) {
			writePost({
				slug,
				body: ring
					.filter(other => other !== slug)
					.map(other => `[${other}](/blog/${other})`)
					.join(' ')
			})
		}
	}

	test('writes the module when every rule passes', () => {
		writeRing()
		const result = runBuild(dir, NOW, out)
		expect(result.changed).toBe(true)
		expect(result.warnings).toEqual([])
		expect(result.posts.map(p => p.slug)).toEqual([
			'ring-a',
			'ring-b',
			'ring-c'
		])
		expect(readFileSync(out, 'utf8')).toBe(renderModule(result.posts))
		expect(runBuild(dir, NOW, out).changed).toBe(false)
	})

	test('an orphan throws, names the slug and writes nothing', () => {
		writeRing()
		writePost({ slug: 'lonely' })
		expect(() => runBuild(dir, NOW, out)).toThrow(
			/lonely\.md: \[LINK-orphan\] lonely has no qualifying inbound links/
		)
		expect(existsSync(out)).toBe(false)
	})

	test('a raw HTML link to a held post throws and leaves the old module', () => {
		writeRing()
		writePost({ slug: 'held-post', publishedAt: '2026-03-02' })
		writePost({
			slug: 'ring-a',
			body: '[b](/blog/ring-b) [c](/blog/ring-c) [h](/blog/held-post)'
		})
		writePost({
			slug: 'ring-b',
			body: '[a](/blog/ring-a) [c](/blog/ring-c) [h](/blog/held-post)'
		})
		runBuild(dir, NOW, out)
		const before = readFileSync(out, 'utf8')
		writePost({
			slug: 'ring-c',
			body: '[a](/blog/ring-a) [b](/blog/ring-b) <a href=/blog/held-post>h</a>'
		})
		expect(() => runBuild(dir, NOW, out)).toThrow(
			/ring-c\.md: \[LINK-html\] raw HTML link to \/blog\/held-post/
		)
		expect(readFileSync(out, 'utf8')).toBe(before)
	})

	test('a dead link throws and writes nothing', () => {
		writeRing()
		writePost({
			slug: 'ring-a',
			body: '[b](/blog/ring-b) [c](./ring-c) [x](./missing-post)'
		})
		expect(() => runBuild(dir, NOW, out)).toThrow(
			/ring-a\.md: \[LINK-dead\] links to \/blog\/missing-post/
		)
		expect(existsSync(out)).toBe(false)
	})

	test('a compile failure throws before the link rules and writes nothing', () => {
		writeRing()
		writePost({ slug: 'ring-a', title: '![](x)', body: '[b](/blog/ring-b)' })
		expect(() => runBuild(dir, NOW, out)).toThrow(/ring-a\.md: title is empty/)
		expect(existsSync(out)).toBe(false)
	})

	test('one qualifying inbound link is a warning, not a failure', () => {
		writeRing()
		writePost({ slug: 'target' })
		writePost({
			slug: 'ring-a',
			body: '[b](/blog/ring-b) [c](/blog/ring-c) [t](/blog/target)'
		})
		const result = runBuild(dir, NOW, out)
		expect(result.warnings.map(v => `${v.file} ${v.rule}`)).toEqual([
			'target.md LINK-below'
		])
		expect(existsSync(out)).toBe(true)
	})

	test('BLOG_CONTENT_DIR selects the content directory', () => {
		expect(contentDir(undefined)).toBe(CONTENT_DIR)
		expect(contentDir('')).toBe(CONTENT_DIR)
		expect(contentDir('tests/fixtures/blog')).toBe(
			join(process.cwd(), 'tests/fixtures/blog')
		)
	})

	test('the BLOG_CONTENT_DIR fixtures pass the gate', () => {
		const fixtures = contentDir('tests/fixtures/blog')
		const result = runBuild(fixtures, new Date('2026-02-01T00:00:00.000Z'), out)
		expect(result.posts).toHaveLength(5)
		expect(result.warnings).toEqual([])
		expect(readFileSync(out, 'utf8')).toBe(renderModule(result.posts))
	})
})

describe('renderModule', () => {
	test('emits a typed BLOG_POSTS module that round-trips the data', () => {
		writePost({ slug: 'first-post' })
		const posts = compilePosts(dir)
		const source = renderModule(posts)
		expect(source).toContain(
			"import type { CompiledBlogPost } from '@/types/blog'"
		)
		const json = source.slice(source.indexOf('= ') + 2)
		expect(JSON.parse(json)).toEqual(posts)
	})
})

describe('visual regression fixtures', () => {
	test('tests/fixtures/blog compiles to a stable, fully past-dated set', () => {
		const fixtures = join(process.cwd(), 'tests/fixtures/blog')
		const posts = compilePosts(fixtures, new Date('2026-02-01T00:00:00.000Z'))
		expect(posts).toHaveLength(5)
		expect(posts.filter(p => p.featured)).toHaveLength(3)
		// Same output far in the future: no fixture is ever held back or added.
		expect(
			compilePosts(fixtures, new Date('2099-01-01T00:00:00.000Z'))
		).toEqual(posts)
	})
})
