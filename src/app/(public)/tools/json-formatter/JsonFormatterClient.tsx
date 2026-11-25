/**
 * JSON Formatter
 * Format, validate and minify JSON without changing the data.
 */

'use client'

import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useId, useState } from 'react'
import type { ToolAction } from '@/components/layout/ToolPageLayout'
import { ToolPageLayout } from '@/components/layout/ToolPageLayout'
import { trackEvent } from '@/lib/analytics'
import {
	formatJson,
	type JsonIndent,
	type JsonParseError,
	type JsonWarning,
	minifyJson,
	validateJson
} from '@/lib/json-tools'

type OutputMode = 'format' | 'minify'

interface Output {
	text: string
	mode: OutputMode
}

type Status =
	| { kind: 'valid'; warnings: JsonWarning[] }
	| { kind: 'error'; error: JsonParseError }

const INDENT_OPTIONS: ReadonlyArray<{ value: JsonIndent; label: string }> = [
	{ value: '2', label: '2 spaces' },
	{ value: '4', label: '4 spaces' },
	{ value: 'tab', label: '1 tab' }
]

// A neutral sample: no real company, no claims.
const SAMPLE = {
	company: 'Example Co',
	founded: 2019,
	active: true,
	address: {
		street: '123 Main St',
		city: 'Anytown',
		state: 'TX'
	},
	tags: ['retail', 'online'],
	contacts: [{ name: 'Jane Doe', email: 'jane@example.com' }],
	notes: null
}

const MAX_WARNINGS_SHOWN = 5

export default function JsonFormatterClient() {
	const [inputJson, setInputJson] = useState('')
	const [indent, setIndent] = useState<JsonIndent>('2')
	const [output, setOutput] = useState<Output | null>(null)
	const [status, setStatus] = useState<Status | null>(null)
	const inputId = useId()
	const indentId = useId()
	const statusId = useId()

	const run = (mode: OutputMode, nextIndent: JsonIndent = indent) => {
		const result =
			mode === 'format'
				? formatJson(inputJson, nextIndent)
				: minifyJson(inputJson)
		if (result.ok) {
			setOutput({ text: result.output, mode })
			setStatus({ kind: 'valid', warnings: result.warnings })
			trackEvent('calculator_used', {
				calculator_type: 'json-formatter',
				action: mode,
				input_length: inputJson.length
			})
		} else {
			// Never leave an old output beside a new error.
			setOutput(null)
			setStatus({ kind: 'error', error: result.error })
		}
	}

	const validate = () => {
		const result = validateJson(inputJson)
		trackEvent('calculator_used', {
			calculator_type: 'json-formatter',
			action: 'validate',
			is_valid: result.ok
		})
		if (result.ok) {
			// Any output on screen was produced from this same input (it is
			// cleared on every edit), so it stays.
			setStatus({ kind: 'valid', warnings: result.warnings })
		} else {
			setOutput(null)
			setStatus({ kind: 'error', error: result.error })
		}
	}

	const changeInput = (value: string) => {
		setInputJson(value)
		// The output and status described the old input; drop both.
		setOutput(null)
		setStatus(null)
	}

	const changeIndent = (value: JsonIndent) => {
		setIndent(value)
		if (output?.mode === 'format') {
			run('format', value)
		}
	}

	const clearAll = () => changeInput('')

	const loadSample = () => changeInput(JSON.stringify(SAMPLE))

	const hasResult = output !== null

	const actions: ToolAction[] = [
		{
			type: 'copy',
			label: 'Copy',
			copyText: output?.text ?? '',
			copiedMessage: 'JSON copied',
			onClick: () => {
				trackEvent('calculator_used', {
					calculator_type: 'json-formatter',
					action: 'copy'
				})
			}
		}
	]

	const borderClass =
		status?.kind === 'error'
			? 'border-destructive'
			: status?.kind === 'valid'
				? 'border-success'
				: 'border-border'

	const formSlot = (
		<div className="space-y-comfortable">
			<div>
				<div className="flex items-center justify-between mb-subheading">
					<label
						htmlFor={inputId}
						className="block text-sm font-medium text-foreground"
					>
						Input JSON
					</label>
					<div className="flex gap-tight">
						<button
							type="button"
							onClick={loadSample}
							className="text-xs text-accent-text hover:underline underline-offset-4"
						>
							Load Sample
						</button>
						<button
							type="button"
							onClick={clearAll}
							className="text-xs text-muted-foreground hover:text-foreground"
						>
							Clear
						</button>
					</div>
				</div>
				<textarea
					id={inputId}
					value={inputJson}
					onChange={e => changeInput(e.target.value)}
					aria-describedby={status ? statusId : undefined}
					aria-invalid={status?.kind === 'error' ? true : undefined}
					className={`w-full rounded-md border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground ${borderClass}`}
					rows={10}
					placeholder='{"key": "value"}'
					spellCheck={false}
				/>

				<div id={statusId}>
					{status?.kind === 'error' && (
						<div
							role="alert"
							className="mt-2 flex items-start gap-tight text-destructive-text"
						>
							<AlertCircle
								className="w-4 h-4 mt-0.5 shrink-0"
								aria-hidden="true"
							/>
							<span className="text-sm">
								Line {status.error.line}, column {status.error.column}:{' '}
								{status.error.message}
							</span>
						</div>
					)}
					<div aria-live="polite">
						{status?.kind === 'valid' && (
							<StatusValid warnings={status.warnings} />
						)}
					</div>
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-content">
				<div className="flex items-center gap-tight">
					<label htmlFor={indentId} className="text-sm text-muted-foreground">
						Indent:
					</label>
					<select
						id={indentId}
						value={indent}
						onChange={e => changeIndent(e.target.value as JsonIndent)}
						className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
					>
						{INDENT_OPTIONS.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-3">
				<button
					type="button"
					onClick={() => run('format')}
					disabled={!inputJson.trim()}
					className="rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Format
				</button>
				<button
					type="button"
					onClick={() => run('minify')}
					disabled={!inputJson.trim()}
					className="rounded-md border border-border bg-surface-raised px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Minify
				</button>
				<button
					type="button"
					onClick={validate}
					disabled={!inputJson.trim()}
					className="rounded-md border border-border bg-surface-raised px-4 py-2.5 text-sm font-semibold text-foreground shadow-xs hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Validate
				</button>
			</div>
		</div>
	)

	const resultSlot = output ? (
		<div>
			<pre className="w-full rounded-md border border-border bg-background p-4 overflow-x-auto">
				<code className="text-sm text-foreground whitespace-pre-wrap break-all font-mono">
					{output.text}
				</code>
			</pre>

			<div className="mt-2 flex gap-content text-xs text-muted-foreground">
				<span>Input: {inputJson.length} chars</span>
				<span>Output: {output.text.length} chars</span>
				{inputJson.length !== output.text.length && (
					<span
						className={
							output.text.length < inputJson.length
								? 'text-success-text'
								: 'text-warning-text'
						}
					>
						{output.text.length < inputJson.length
							? `Reduced by ${((1 - output.text.length / inputJson.length) * 100).toFixed(1)}%`
							: `Increased by ${((output.text.length / inputJson.length - 1) * 100).toFixed(1)}%`}
					</span>
				)}
			</div>
		</div>
	) : undefined

	return (
		<ToolPageLayout
			title="JSON Formatter"
			description="Format, validate and minify JSON in your browser. Every value stays exactly as written, and you get a warning for duplicate keys or numbers other tools would round."
			columns="two"
			formSlot={formSlot}
			resultSlot={resultSlot}
			hasResult={hasResult}
			resultPlaceholder="Paste JSON on the left, then Format or Minify"
			actions={actions}
		/>
	)
}

function StatusValid({ warnings }: { warnings: JsonWarning[] }) {
	if (warnings.length === 0) {
		return (
			<div className="mt-2 flex items-center gap-tight text-success-text">
				<CheckCircle2 className="w-4 h-4" aria-hidden="true" />
				<span className="text-sm">Valid JSON</span>
			</div>
		)
	}
	const shown = warnings.slice(0, MAX_WARNINGS_SHOWN)
	const hidden = warnings.length - shown.length
	return (
		<div className="mt-2 text-warning-text">
			<div className="flex items-center gap-tight">
				<AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
				<span className="text-sm font-medium">
					Valid JSON with {warnings.length}{' '}
					{warnings.length === 1 ? 'warning' : 'warnings'}
				</span>
			</div>
			<ul className="mt-1 ml-6 list-disc space-y-1 text-sm">
				{shown.map((warning, index) => (
					<li key={`${index}:${warning.kind}:${warning.path}`}>
						<code className="font-mono text-xs">{warning.path}</code>:{' '}
						{warning.message}
					</li>
				))}
				{hidden > 0 && <li>And {hidden} more</li>}
			</ul>
		</div>
	)
}
