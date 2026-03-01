/**
 * JSON Formatter
 * Format, validate, and minify JSON data
 */

'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import type { ToolAction } from '@/components/layout/ToolPageLayout'
import { trackEvent } from '@/lib/analytics'
import { BUSINESS_INFO } from '@/lib/constants/business'
import { logger } from '@/lib/logger'

export default function JsonFormatterClient() {
	const [inputJson, setInputJson] = useState('')
	const [outputJson, setOutputJson] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [indentSize, setIndentSize] = useState(2)
	const [isValid, setIsValid] = useState<boolean | null>(null)

	const formatJson = () => {
		try {
			const parsed = JSON.parse(inputJson)
			const formatted = JSON.stringify(parsed, null, indentSize)
			setOutputJson(formatted)
			setError(null)
			setIsValid(true)

			trackEvent('calculator_used', {
				calculator_type: 'json-formatter',
				action: 'format',
				input_length: inputJson.length
			})
		} catch (e) {
			const errorMessage = e instanceof Error ? e.message : 'Invalid JSON'
			setError(errorMessage)
			setOutputJson('')
			setIsValid(false)
		}
	}

	const minifyJson = () => {
		try {
			const parsed = JSON.parse(inputJson)
			const minified = JSON.stringify(parsed)
			setOutputJson(minified)
			setError(null)
			setIsValid(true)

			trackEvent('calculator_used', {
				calculator_type: 'json-formatter',
				action: 'minify',
				input_length: inputJson.length
			})
		} catch (e) {
			const errorMessage = e instanceof Error ? e.message : 'Invalid JSON'
			setError(errorMessage)
			setOutputJson('')
			setIsValid(false)
		}
	}

	const validateJson = () => {
		try {
			JSON.parse(inputJson)
			setIsValid(true)
			setError(null)

			trackEvent('calculator_used', {
				calculator_type: 'json-formatter',
				action: 'validate',
				is_valid: true
			})
		} catch (e) {
			const errorMessage = e instanceof Error ? e.message : 'Invalid JSON'
			setError(errorMessage)
			setIsValid(false)

			trackEvent('calculator_used', {
				calculator_type: 'json-formatter',
				action: 'validate',
				is_valid: false
			})
		}
	}

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(outputJson)
		} catch (error) {
			// Fallback for browsers without clipboard API
			logger.debug('Clipboard API unavailable, using fallback', {
				error: error instanceof Error ? error.message : String(error)
			})
			const textArea = document.createElement('textarea')
			textArea.value = outputJson
			document.body.appendChild(textArea)
			textArea.select()
			document.execCommand('copy')
			document.body.removeChild(textArea)
		}
	}

	const clearAll = () => {
		setInputJson('')
		setOutputJson('')
		setError(null)
		setIsValid(null)
	}

	const loadSample = () => {
		const sample = {
			name: 'Hudson Digital Solutions',
			services: [
				'Website Development',
				'Business Automation',
				'Tool Integrations'
			],
			contact: {
				email: BUSINESS_INFO.email,
				location: 'Texas, USA'
			},
			stats: {
				clients: 50,
				satisfaction: '100%',
				yearsExperience: 5
			}
		}
		setInputJson(JSON.stringify(sample))
		setOutputJson('')
		setError(null)
		setIsValid(null)
	}

	const hasResult = outputJson.length > 0

	const actions: ToolAction[] = [
		{ type: 'copy', label: 'Copy', onClick: copyToClipboard }
	]

	const formSlot = (
		<div className="space-y-comfortable">
			{/* Input Section */}
			<div>
				<div className="flex items-center justify-between mb-subheading">
					<label className="block text-sm font-medium text-foreground">
						Input JSON
					</label>
					<div className="flex gap-tight">
						<button
							onClick={loadSample}
							className="text-xs text-accent hover:text-accent/80"
						>
							Load Sample
						</button>
						<button
							onClick={clearAll}
							className="text-xs text-muted-foreground hover:text-foreground"
						>
							Clear
						</button>
					</div>
				</div>
				<textarea
					value={inputJson}
					onChange={e => {
						setInputJson(e.target.value)
						setIsValid(null)
						setError(null)
					}}
					className={`w-full rounded-md border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-accent ${
						error
							? 'border-destructive'
							: isValid === true
								? 'border-success'
								: 'border-border'
					}`}
					rows={10}
					placeholder='{"key": "value"}'
					spellCheck={false}
				/>

				{/* Validation Status */}
				{error && (
					<div className="mt-2 flex items-start gap-tight text-destructive-text">
						<AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
						<span className="text-sm">{error}</span>
					</div>
				)}
				{isValid === true && !error && (
					<div className="mt-2 flex items-center gap-tight text-success-text">
						<CheckCircle2 className="w-4 h-4" />
						<span className="text-sm">Valid JSON</span>
					</div>
				)}
			</div>

			{/* Options */}
			<div className="flex flex-wrap items-center gap-content">
				<div className="flex items-center gap-tight">
					<label className="text-sm text-muted-foreground">Indent:</label>
					<select
						value={indentSize}
						onChange={e => setIndentSize(Number(e.target.value))}
						className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
					>
						<option value={2}>2 spaces</option>
						<option value={4}>4 spaces</option>
						<option value={1}>1 tab</option>
					</select>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="grid grid-cols-3 gap-3">
				<button
					onClick={formatJson}
					disabled={!inputJson.trim()}
					className="rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs hover:bg-accent/80 focus:outline-hidden focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Format
				</button>
				<button
					onClick={minifyJson}
					disabled={!inputJson.trim()}
					className="rounded-md border border-border bg-surface-raised px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Minify
				</button>
				<button
					onClick={validateJson}
					disabled={!inputJson.trim()}
					className="rounded-md border border-border bg-surface-raised px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Validate
				</button>
			</div>
		</div>
	)

	const resultSlot = outputJson ? (
		<div>
			<pre className="w-full rounded-md border border-border bg-background p-4 overflow-x-auto">
				<code className="text-sm text-foreground whitespace-pre-wrap break-all font-mono">
					{outputJson}
				</code>
			</pre>

			{/* Stats */}
			<div className="mt-2 flex gap-content text-xs text-muted-foreground">
				<span>Input: {inputJson.length} chars</span>
				<span>Output: {outputJson.length} chars</span>
				{inputJson.length !== outputJson.length && (
					<span
						className={
							outputJson.length < inputJson.length
								? 'text-success-text'
								: 'text-warning-text'
						}
					>
						{outputJson.length < inputJson.length
							? `Reduced by ${((1 - outputJson.length / inputJson.length) * 100).toFixed(1)}%`
							: `Increased by ${((outputJson.length / inputJson.length - 1) * 100).toFixed(1)}%`}
					</span>
				)}
			</div>
		</div>
	) : undefined

	return (
		<ToolPageLayout
			title="JSON Formatter"
			description="Format, validate, and minify your JSON data with syntax highlighting"
			columns="two"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={hasResult}
			resultPlaceholder="Paste JSON on the left to see formatted output"
			actions={actions}
		/>
	)
}
