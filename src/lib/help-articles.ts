/**
 * Help Articles Library
 * Functions for managing help center content with Drizzle ORM
 */

import { and, asc, eq } from 'drizzle-orm'
import { cacheLife, cacheTag } from 'next/cache'
import { db } from './db'
import { reportError } from './error-tracking'
import { logger } from './logger'
import {
	type HelpArticle as HelpArticleRow,
	helpArticles
} from './schemas/schema'

export interface HelpArticle {
	id: string
	slug: string
	category: string
	title: string
	content: string
	excerpt: string | null
	order_index: number
	published: boolean
	created_at: string
	updated_at: string
}

export interface HelpCategory {
	slug: string
	name: string
	description: string
	metaDescription: string
	icon: string
	articleCount: number
}

const HELP_CATEGORIES: Omit<HelpCategory, 'articleCount'>[] = [
	{
		slug: 'getting-started',
		name: 'Getting Started',
		description: 'New to Hudson Digital Solutions? Start here.',
		metaDescription:
			'New to Hudson Digital Solutions? Start here for setup walkthroughs, first steps, and the essentials you need to get up and running quickly and with confidence.',
		icon: 'Rocket'
	},
	{
		slug: 'tools',
		name: 'Tools & Calculators',
		description: 'Learn how to use our free tools.',
		metaDescription:
			'Learn how to use the free Hudson Digital Solutions tools and calculators with clear, step-by-step guides covering inputs, results, and common questions.',
		icon: 'Wrench'
	},
	{
		slug: 'billing',
		name: 'Billing & Payments',
		description: 'Payment methods, invoices, and billing questions.',
		metaDescription:
			'Find answers about Hudson Digital Solutions billing and payments, including payment methods, invoices, receipts, refunds, and updating your details.',
		icon: 'CreditCard'
	},
	{
		slug: 'account',
		name: 'Account & Settings',
		description: 'Manage your account and preferences.',
		metaDescription:
			'Manage your Hudson Digital Solutions account and settings, from updating your profile and email preferences to security, notifications, and unsubscribe options.',
		icon: 'User'
	},
	{
		slug: 'faq',
		name: 'FAQs',
		description: 'Frequently asked questions.',
		metaDescription:
			'Browse frequently asked questions about Hudson Digital Solutions, covering our services, web design process, pricing, timelines, and how to get started.',
		icon: 'HelpCircle'
	}
]

const mapHelpArticle = (row: HelpArticleRow): HelpArticle => ({
	id: row.id,
	slug: row.slug,
	category: row.category,
	title: row.title,
	content: row.content,
	excerpt: row.excerpt,
	order_index: 0,
	published: row.published ?? false,
	created_at: row.createdAt?.toISOString() ?? new Date().toISOString(),
	updated_at: row.updatedAt?.toISOString() ?? new Date().toISOString()
})

/**
 * Get all published articles. Exported so the sitemap can enumerate
 * every /help/[category]/[slug] URL from a single source of truth.
 */
export async function getAllPublishedArticles(): Promise<HelpArticle[]> {
	'use cache'
	cacheLife('hours')
	cacheTag('help-articles')

	try {
		const data = await db
			.select()
			.from(helpArticles)
			.where(eq(helpArticles.published, true))
			.orderBy(asc(helpArticles.category), asc(helpArticles.createdAt))

		return data.map(mapHelpArticle)
	} catch (error) {
		logger.error('Failed to fetch help articles', error)
		reportError(error, {
			module: 'help-articles',
			op: 'getAllPublishedArticles'
		})
		return []
	}
}

/**
 * Get articles by category
 */
export async function getArticlesByCategory(
	category: string
): Promise<HelpArticle[]> {
	'use cache'
	cacheLife('hours')
	cacheTag('help-articles', `help-category:${category}`)

	try {
		const data = await db
			.select()
			.from(helpArticles)
			.where(
				and(
					eq(helpArticles.category, category),
					eq(helpArticles.published, true)
				)
			)
			.orderBy(asc(helpArticles.createdAt))

		return data.map(mapHelpArticle)
	} catch (error) {
		logger.error('Failed to fetch help articles by category', error, {
			metadata: { category }
		})
		reportError(error, {
			module: 'help-articles',
			op: 'getArticlesByCategory'
		})
		return []
	}
}

/**
 * Get a single article by slug
 */
export async function getArticleBySlug(
	slug: string
): Promise<HelpArticle | null> {
	'use cache'
	cacheLife('days')
	cacheTag('help-articles', `help-article:${slug}`)

	try {
		const [data] = await db
			.select()
			.from(helpArticles)
			.where(and(eq(helpArticles.slug, slug), eq(helpArticles.published, true)))
			.limit(1)

		return data ? mapHelpArticle(data) : null
	} catch (error) {
		logger.error('Failed to fetch help article by slug', error, {
			metadata: { slug }
		})
		reportError(error, {
			module: 'help-articles',
			op: 'getArticleBySlug'
		})
		return null
	}
}

/**
 * Get categories with article counts
 */
export async function getCategoriesWithCounts(): Promise<HelpCategory[]> {
	const articles = await getAllPublishedArticles()

	const countByCategory = articles.reduce(
		(acc, article) => {
			acc[article.category] = (acc[article.category] || 0) + 1
			return acc
		},
		{} as Record<string, number>
	)

	return HELP_CATEGORIES.map(category => ({
		...category,
		articleCount: countByCategory[category.slug] || 0
	}))
}

/**
 * Get adjacent articles for navigation
 */
export async function getAdjacentArticles(
	currentSlug: string,
	category: string
): Promise<{ prev: HelpArticle | null; next: HelpArticle | null }> {
	const articles = await getArticlesByCategory(category)
	const currentIndex = articles.findIndex(a => a.slug === currentSlug)

	// If current article not found, return nulls for both
	if (currentIndex === -1) {
		return { prev: null, next: null }
	}

	return {
		prev: currentIndex > 0 ? (articles[currentIndex - 1] ?? null) : null,
		next:
			currentIndex < articles.length - 1
				? (articles[currentIndex + 1] ?? null)
				: null
	}
}

/**
 * Get category info by slug
 */
export function getCategoryBySlug(
	slug: string
): Omit<HelpCategory, 'articleCount'> | undefined {
	return HELP_CATEGORIES.find(c => c.slug === slug)
}

/**
 * Get all category slugs (for static generation)
 */
export function getAllCategorySlugs(): string[] {
	return HELP_CATEGORIES.map(c => c.slug)
}
