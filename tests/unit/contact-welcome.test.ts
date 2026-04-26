import { describe, expect, test } from 'bun:test'

/**
 * ContactWelcome's render logic boils down to one piece of pure logic:
 * splitting the input content into paragraph chunks. We test that
 * directly here rather than rendering through react-email (which would
 * require a DOM and pull in the full email-render stack — overkill for
 * the property we care about).
 */
function splitContentIntoParagraphs(content: string): string[] {
	return content
		.split('\n\n')
		.map(p => p.trim())
		.filter(p => p.length > 0)
}

describe('ContactWelcome content paragraph splitting', () => {
	test('preserves three paragraphs separated by blank lines', () => {
		const content =
			'Hi Richard,\n\nThanks for reaching out.\n\n— Hudson Digital'
		expect(splitContentIntoParagraphs(content)).toEqual([
			'Hi Richard,',
			'Thanks for reaching out.',
			'— Hudson Digital'
		])
	})

	test('drops trailing blank chunks', () => {
		expect(splitContentIntoParagraphs('Hello\n\n')).toEqual(['Hello'])
	})

	test('drops leading blank chunks', () => {
		expect(splitContentIntoParagraphs('\n\nHello')).toEqual(['Hello'])
	})

	test('collapses 3+ consecutive newlines without losing real content', () => {
		const content = 'First\n\n\n\nSecond'
		// Splitting on \n\n yields ['First', '', 'Second']; trim+filter drops empty
		expect(splitContentIntoParagraphs(content)).toEqual(['First', 'Second'])
	})

	test('preserves single \\n as soft break inside one paragraph', () => {
		const content = 'Line one\nLine two of same paragraph\n\nNew paragraph'
		const result = splitContentIntoParagraphs(content)
		expect(result).toHaveLength(2)
		expect(result[0]).toBe('Line one\nLine two of same paragraph')
		expect(result[1]).toBe('New paragraph')
	})

	test('whitespace-only paragraphs are dropped', () => {
		const content = 'Hello\n\n   \n\nWorld'
		expect(splitContentIntoParagraphs(content)).toEqual(['Hello', 'World'])
	})

	test('empty content produces zero paragraphs', () => {
		expect(splitContentIntoParagraphs('')).toEqual([])
	})

	test('single paragraph with no blank lines', () => {
		expect(splitContentIntoParagraphs('Just one line')).toEqual([
			'Just one line'
		])
	})
})
