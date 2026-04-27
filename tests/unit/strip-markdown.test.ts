import { describe, expect, test } from 'bun:test'
import { stripMarkdown } from '@/lib/strip-markdown'

describe('stripMarkdown', () => {
	test('returns empty string for empty input', () => {
		expect(stripMarkdown('')).toBe('')
	})

	test('strips bold (**text**)', () => {
		expect(
			stripMarkdown('Many businesses approach **web development** today')
		).toBe('Many businesses approach web development today')
	})

	test('strips bold (__text__)', () => {
		expect(stripMarkdown('use __strong__ words')).toBe('use strong words')
	})

	test('strips italic (*text*) without breaking list-like punctuation', () => {
		expect(stripMarkdown('an *italicised* phrase')).toBe('an italicised phrase')
	})

	test('strips italic (_text_)', () => {
		expect(stripMarkdown('an _italicised_ phrase')).toBe('an italicised phrase')
	})

	test('strips strikethrough', () => {
		expect(stripMarkdown('this is ~~wrong~~ corrected')).toBe(
			'this is wrong corrected'
		)
	})

	test('strips inline code', () => {
		expect(stripMarkdown('use `npm install` to install')).toBe(
			'use npm install to install'
		)
	})

	test('strips code fences while keeping content', () => {
		expect(stripMarkdown('Run:\n```\nnpm test\n```')).toBe('Run: npm test')
	})

	test('strips heading markers at line start', () => {
		expect(stripMarkdown('### Hidden Dangers\nbody text')).toBe(
			'Hidden Dangers body text'
		)
	})

	test('strips list-leading bullet (line start)', () => {
		expect(stripMarkdown('* one\n* two\n* three')).toBe('one two three')
		expect(stripMarkdown('- one\n- two')).toBe('one two')
		expect(stripMarkdown('+ one\n+ two')).toBe('one two')
	})

	test('strips inline list markers (n8n excerpt pattern)', () => {
		// This is the actual real-world excerpt shape that broke the UI:
		// `... :  *   **Item:** desc *   **Other:** more`
		const input =
			'leads to similar crashes:  *   **Undefined User Journeys:** Visitors arrive *   **Undefined Performance:** Slow load times'
		expect(stripMarkdown(input)).toBe(
			'leads to similar crashes: Undefined User Journeys: Visitors arrive Undefined Performance: Slow load times'
		)
	})

	test('strips numbered list markers', () => {
		expect(stripMarkdown('1. First step\n2. Second step')).toBe(
			'First step Second step'
		)
	})

	test('strips block quote markers', () => {
		expect(stripMarkdown('> a quoted line\nbody')).toBe('a quoted line body')
	})

	test('keeps link text and drops URL', () => {
		expect(
			stripMarkdown('see [our pricing](https://example.com/pricing) page')
		).toBe('see our pricing page')
	})

	test('drops images entirely', () => {
		expect(stripMarkdown('before ![alt text](https://x.com/y.png) after')).toBe(
			'before after'
		)
	})

	test('does NOT eat asterisks that are not formatting markers', () => {
		// e.g. multiplication-style asterisk inside a sentence with no closing pair
		expect(stripMarkdown('the formula a * b = c is simple')).toBe(
			'the formula a * b = c is simple'
		)
	})

	test('handles a real excerpt end-to-end', () => {
		const input =
			"The primary argument for adopting Kubernetes is **scalability**. In a traditional setup, handling a sudden spike in traffic often means manually provisioning new servers, waiting for configuration, and hoping your infrastructure doesn't buckle."
		expect(stripMarkdown(input)).toBe(
			"The primary argument for adopting Kubernetes is scalability. In a traditional setup, handling a sudden spike in traffic often means manually provisioning new servers, waiting for configuration, and hoping your infrastructure doesn't buckle."
		)
	})
})
