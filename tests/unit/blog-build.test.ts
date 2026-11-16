/**
 * Tests for the content/blog compiler (scripts/blog/build.ts), the only
 * producer of blog data for the site. Fixtures are written to a temp dir so
 * the real content/blog tree is never touched.
 */
import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { compilePosts, loadPosts, renderModule } from '../../scripts/blog/build'
import { isLive } from '../../scripts/blog/lib'

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

describe('real content', () => {
	test('no compiled post links to a post that is not live yet', () => {
		const now = new Date()
		const held = loadPosts()
			.filter(p => p.data.published && !isLive(p.data, now))
			.map(p => p.slug)
		const compiled = compilePosts(undefined, now)
		for (const slug of held) {
			const href = new RegExp(`href="/blog/${slug}["/#?]`)
			const offenders = compiled.filter(p => href.test(p.content))
			expect(offenders.map(p => p.slug)).toEqual([])
		}
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
