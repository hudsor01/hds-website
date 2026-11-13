/**
 * The drip emails in src/data/email-templates.json go to real leads.
 * Every placeholder must be filled, and the copy may not make claims the
 * business cannot back up.
 */

import { describe, expect, test } from 'bun:test'
import emailTemplates from '@/data/email-templates.json'
import { getEmailSequences, replaceTemplateVariables } from '@/lib/email-utils'

const TEMPLATES = Object.entries(emailTemplates)

describe('email templates', () => {
	test('every placeholder is filled, even with no variables at all', () => {
		for (const [, template] of TEMPLATES) {
			for (const text of [template.subject, template.content]) {
				expect(replaceTemplateVariables(text, {})).not.toMatch(/\{\{|\}\}/)
			}
		}
	})

	test('calculator drips name the calculator and greet by first name', () => {
		const filled = replaceTemplateVariables(
			emailTemplates['calculator-follow-up'].subject,
			{ calculatorType: 'ROI Calculator' }
		)
		expect(filled).toBe('Still thinking about your ROI Calculator results?')
		expect(
			replaceTemplateVariables(emailTemplates['calculator-hot-lead'].content, {
				firstName: 'Dana'
			})
		).toStartWith('Hi Dana,')
	})

	test('every sequence the app schedules has a template', () => {
		const sequences = getEmailSequences()
		for (const id of [
			'standard-welcome',
			'high-value-consultation',
			'targeted-service-consultation',
			'enterprise-nurture',
			'calculator-hot-lead',
			'calculator-follow-up'
		]) {
			expect(sequences[id as keyof typeof sequences]).toBeDefined()
		}
	})

	test('no invented outcome numbers, client counts or dashes', () => {
		for (const [name, template] of TEMPLATES) {
			const text = `${template.subject}\n${template.content}`
			expect({ name, match: text.match(/\d+\s?%|\d+x\b|\$\d/) }).toEqual({
				name,
				match: null
			})
			expect(text).not.toMatch(/\d+ clients|dozens of/i)
			expect(text).not.toMatch(/[–—]/)
			expect(text).not.toMatch(/, and /)
		}
	})
})
