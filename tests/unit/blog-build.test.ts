/**
 * Tests for the content/blog compiler (scripts/blog/build.ts), the only
 * producer of blog data for the site. Fixtures are written to a temp dir so
 * the real content/blog tree is never touched.
 */
import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { compilePosts, renderModule } from '../../scripts/blog/build'

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
		expect(() => compilePosts(dir)).toThrow(/publishedAt is not a valid date/)
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
