import { describe, expect, test } from 'bun:test'
import { parseContent } from '@/emails/_components/scheduled-drip-parser'

describe('scheduled-drip parseContent', () => {
	test('classifies a single paragraph', () => {
		const result = parseContent('Just one paragraph of text.')
		expect(result).toEqual([
			{ type: 'paragraph', value: 'Just one paragraph of text.' }
		])
	})

	test('splits paragraphs on real \\n\\n', () => {
		const result = parseContent('First paragraph.\n\nSecond paragraph.')
		expect(result).toHaveLength(2)
		expect(result[0]).toEqual({ type: 'paragraph', value: 'First paragraph.' })
		expect(result[1]).toEqual({
			type: 'paragraph',
			value: 'Second paragraph.'
		})
	})

	test('classifies **bold** wrapped paragraph as heading', () => {
		const result = parseContent('**Section Title**')
		expect(result).toEqual([{ type: 'heading', value: 'Section Title' }])
	})

	test('paragraph with bold mid-sentence is NOT a heading', () => {
		const result = parseContent('Some text with **bold** in the middle')
		expect(result[0]?.type).toBe('paragraph')
	})

	test('classifies single-bullet paragraph as list', () => {
		const result = parseContent('• one item')
		expect(result).toEqual([{ type: 'list', value: ['one item'] }])
	})

	test('classifies multi-bullet paragraph as list with all items', () => {
		const content = '• first item\n• second item\n• third item'
		const result = parseContent(content)
		expect(result).toEqual([
			{ type: 'list', value: ['first item', 'second item', 'third item'] }
		])
	})

	test('inline `•` mid-sentence with no bullet lines stays as paragraph', () => {
		const result = parseContent('Talk to us • get results today')
		expect(result).toEqual([
			{ type: 'paragraph', value: 'Talk to us • get results today' }
		])
	})

	test('mixed content: heading, paragraph, list', () => {
		const content =
			'**Welcome**\n\nHere is what you get:\n\n• Feature one\n• Feature two\n\nLet us know if you have questions.'
		const result = parseContent(content)
		expect(result).toHaveLength(4)
		expect(result[0]).toEqual({ type: 'heading', value: 'Welcome' })
		expect(result[1]).toEqual({
			type: 'paragraph',
			value: 'Here is what you get:'
		})
		expect(result[2]).toEqual({
			type: 'list',
			value: ['Feature one', 'Feature two']
		})
		expect(result[3]).toEqual({
			type: 'paragraph',
			value: 'Let us know if you have questions.'
		})
	})

	test('empty content produces a single empty paragraph', () => {
		const result = parseContent('')
		expect(result).toEqual([{ type: 'paragraph', value: '' }])
	})

	test('list with mixed bullet and non-bullet lines keeps only bullets', () => {
		const content = '• keeper\nintro line\n• another keeper'
		const result = parseContent(content)
		expect(result).toEqual([
			{ type: 'list', value: ['keeper', 'another keeper'] }
		])
	})
})
