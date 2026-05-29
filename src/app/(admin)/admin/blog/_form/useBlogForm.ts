'use client'

/**
 * Shared state hook for the admin blog create/edit form pair.
 *
 * Owns every field that both CreateBlogForm and EditBlogForm need to drive,
 * plus the shared `errors` map and `useTransition` pending flag. The two
 * outer forms differ only in the initial value source (empty vs. loaded
 * row), the title-blur behavior (create auto-fills slug, edit does not),
 * the submit action binding, and the toast copy.
 */
import { useState, useTransition } from 'react'

export interface BlogFormInitial {
	title: string
	slug: string
	excerpt: string
	content: string
	featureImage: string
	readingTime: number
	authorId: string
	tagIds: string[]
	featured: boolean
	published: boolean
}

export interface BlogFormState extends BlogFormInitial {
	setTitle: (v: string) => void
	setSlug: (v: string) => void
	setExcerpt: (v: string) => void
	setContent: (v: string) => void
	setFeatureImage: (v: string) => void
	setReadingTime: (v: number) => void
	setAuthorId: (v: string) => void
	setFeatured: (v: boolean) => void
	setPublished: (v: boolean) => void
	toggleTag: (id: string) => void
	errors: Record<string, string>
	setErrors: (next: Record<string, string>) => void
	isPending: boolean
	startTransition: (fn: () => void | Promise<void>) => void
}

export function useBlogForm(initial: BlogFormInitial): BlogFormState {
	const [title, setTitle] = useState(initial.title)
	const [slug, setSlug] = useState(initial.slug)
	const [excerpt, setExcerpt] = useState(initial.excerpt)
	const [content, setContent] = useState(initial.content)
	const [featureImage, setFeatureImage] = useState(initial.featureImage)
	const [readingTime, setReadingTime] = useState(initial.readingTime)
	const [authorId, setAuthorId] = useState(initial.authorId)
	const [tagIds, setTagIds] = useState<string[]>(initial.tagIds)
	const [featured, setFeatured] = useState(initial.featured)
	const [published, setPublished] = useState(initial.published)
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [isPending, startTransition] = useTransition()

	function toggleTag(id: string) {
		setTagIds(prev =>
			prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
		)
	}

	return {
		title,
		setTitle,
		slug,
		setSlug,
		excerpt,
		setExcerpt,
		content,
		setContent,
		featureImage,
		setFeatureImage,
		readingTime,
		setReadingTime,
		authorId,
		setAuthorId,
		tagIds,
		setFeatured,
		setPublished,
		toggleTag,
		featured,
		published,
		errors,
		setErrors,
		isPending,
		startTransition
	}
}

/**
 * Pack a BlogFormState into a FormData payload the Server Action consumes.
 * `id` is appended only on the edit path; create posts the same shape
 * without it.
 */
export function buildBlogFormData(
	state: BlogFormState,
	id: string | null
): FormData {
	const fd = new FormData()
	if (id) {
		fd.append('id', id)
	}
	fd.append('title', state.title)
	fd.append('slug', state.slug)
	fd.append('excerpt', state.excerpt)
	fd.append('content', state.content)
	fd.append('featureImage', state.featureImage)
	fd.append('readingTime', String(state.readingTime))
	fd.append('authorId', state.authorId)
	fd.append('featured', state.featured ? 'true' : 'false')
	fd.append('published', state.published ? 'true' : 'false')
	for (const tagId of state.tagIds) {
		fd.append('tagIds', tagId)
	}
	return fd
}
