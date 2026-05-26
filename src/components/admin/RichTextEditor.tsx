'use client'

/**
 * Tiptap-based rich-text editor for the blog admin forms.
 *
 * Replaces the plain `<textarea>` on `/admin/blog/new` and
 * `/admin/blog/[id]/edit`. Controlled component: the parent owns the HTML
 * string in `useState`, this component renders a Tiptap instance over it
 * and reports edits back via `onChange(editor.getHTML())`. The Server
 * Action submit path (FormData append('content', html)) is unchanged.
 *
 * Output is HTML, a strict subset of the allowed-tag set in
 * `src/components/blog/BlogPostContent.tsx`'s sanitize-html config. The
 * pure helper at `rich-text-editor-tags.ts` plus its unit test guard that
 * round-trip invariant.
 *
 * Hydration: Next.js 16 + React 19 trips a hydrate mismatch if Tiptap's
 * server-side render fires synchronously. `immediatelyRender: false` (the
 * Tiptap-blessed SSR escape hatch) defers initialization to the client.
 * The `if (!editor) return null` guard avoids painting an empty shell
 * before mount.
 *
 * Accessibility: the parent (FormFieldSet) passes `aria-describedby` and
 * `aria-invalid` down to the actual contenteditable element via Tiptap's
 * `editorProps.attributes` seam -- not on a wrapper div, which screen
 * readers would not associate with the input. `aria-busy` on the wrapper
 * signals the pre-init render so assistive tech does not announce an
 * apparently empty field.
 */
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { type Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface RichTextEditorProps {
	id?: string
	value: string
	onChange: (html: string) => void
	ariaDescribedby?: string
	ariaInvalid?: 'true' | undefined
}

const TOOLBAR_BUTTON_CLASS =
	'inline-flex items-center justify-center min-w-8 h-8 px-2 rounded text-xs font-medium text-foreground border border-transparent hover:bg-surface-base hover:border-border transition-smooth disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:ring-offset-1 focus-visible:ring-offset-surface-raised'

const TOOLBAR_BUTTON_ACTIVE_CLASS = 'bg-surface-base border-border'

const TOOLBAR_DIVIDER_CLASS = 'self-stretch w-px bg-border mx-1'

// Editor scope styling: Tailwind utilities are applied to the editable
// content area via `editorProps.attributes.class` so the prose-like look
// stays scoped to the editor and never leaks into other admin surfaces.
// Intentionally NOT a global @utility because the public `.typography`
// class on the read side owns the production prose look; this is just an
// in-editor approximation that gives the author the right shape signal.
const EDITOR_CONTENT_CLASS = [
	'tiptap',
	'prose-base',
	'max-w-none',
	'min-h-[400px]',
	'p-4',
	'text-sm',
	'text-foreground',
	'focus:outline-none',
	'[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2',
	'[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2',
	'[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2',
	'[&_p]:my-2 [&_p]:leading-relaxed',
	'[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2',
	'[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2',
	'[&_li]:my-1',
	'[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-3',
	'[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs',
	'[&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:my-3',
	'[&_pre_code]:bg-transparent [&_pre_code]:p-0',
	'[&_a]:text-accent-text [&_a]:underline',
	'[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded [&_img]:my-3',
	'[&_strong]:font-semibold',
	'[&_em]:italic'
].join(' ')

interface ToolbarProps {
	editor: Editor
}

function Toolbar({ editor }: ToolbarProps) {
	function buttonClass(isActive: boolean) {
		return isActive
			? `${TOOLBAR_BUTTON_CLASS} ${TOOLBAR_BUTTON_ACTIVE_CLASS}`
			: TOOLBAR_BUTTON_CLASS
	}

	function handleSetLink() {
		const previous = editor.getAttributes('link').href as string | undefined
		const url = window.prompt('Link URL:', previous ?? '')
		// User cancelled the prompt: leave selection alone.
		if (url === null) {
			return
		}
		// Empty string: clear the link from the current selection.
		if (url.trim().length === 0) {
			editor.chain().focus().extendMarkRange('link').unsetLink().run()
			return
		}
		editor
			.chain()
			.focus()
			.extendMarkRange('link')
			.setLink({ href: url.trim() })
			.run()
	}

	function handleInsertImage() {
		const url = window.prompt('Image URL:')
		if (url === null || url.trim().length === 0) {
			return
		}
		editor.chain().focus().setImage({ src: url.trim() }).run()
	}

	function handleClearFormatting() {
		editor.chain().focus().clearNodes().unsetAllMarks().run()
	}

	return (
		<div
			className="flex flex-wrap items-center gap-1 border-b border-border bg-surface-raised px-2 py-2"
			role="toolbar"
			aria-label="Formatting"
		>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleBold().run()}
				className={buttonClass(editor.isActive('bold'))}
				aria-pressed={editor.isActive('bold')}
				aria-label="Bold"
				title="Bold"
			>
				B
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleItalic().run()}
				className={buttonClass(editor.isActive('italic'))}
				aria-pressed={editor.isActive('italic')}
				aria-label="Italic"
				title="Italic"
			>
				<span className="italic">I</span>
			</button>

			<span aria-hidden="true" className={TOOLBAR_DIVIDER_CLASS} />

			<button
				type="button"
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
				className={buttonClass(editor.isActive('heading', { level: 1 }))}
				aria-pressed={editor.isActive('heading', { level: 1 })}
				aria-label="Heading 1"
				title="Heading 1"
			>
				H1
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				className={buttonClass(editor.isActive('heading', { level: 2 }))}
				aria-pressed={editor.isActive('heading', { level: 2 })}
				aria-label="Heading 2"
				title="Heading 2"
			>
				H2
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
				className={buttonClass(editor.isActive('heading', { level: 3 }))}
				aria-pressed={editor.isActive('heading', { level: 3 })}
				aria-label="Heading 3"
				title="Heading 3"
			>
				H3
			</button>

			<span aria-hidden="true" className={TOOLBAR_DIVIDER_CLASS} />

			<button
				type="button"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={buttonClass(editor.isActive('bulletList'))}
				aria-pressed={editor.isActive('bulletList')}
				aria-label="Bullet list"
				title="Bullet list"
			>
				UL
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={buttonClass(editor.isActive('orderedList'))}
				aria-pressed={editor.isActive('orderedList')}
				aria-label="Ordered list"
				title="Ordered list"
			>
				OL
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				className={buttonClass(editor.isActive('blockquote'))}
				aria-pressed={editor.isActive('blockquote')}
				aria-label="Blockquote"
				title="Blockquote"
			>
				Quote
			</button>

			<span aria-hidden="true" className={TOOLBAR_DIVIDER_CLASS} />

			<button
				type="button"
				onClick={() => editor.chain().focus().toggleCode().run()}
				className={buttonClass(editor.isActive('code'))}
				aria-pressed={editor.isActive('code')}
				aria-label="Inline code"
				title="Inline code"
			>
				<span className="font-mono">{'<>'}</span>
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleCodeBlock().run()}
				className={buttonClass(editor.isActive('codeBlock'))}
				aria-pressed={editor.isActive('codeBlock')}
				aria-label="Code block"
				title="Code block"
			>
				<span className="font-mono">{'{ }'}</span>
			</button>

			<span aria-hidden="true" className={TOOLBAR_DIVIDER_CLASS} />

			<button
				type="button"
				onClick={handleSetLink}
				className={buttonClass(editor.isActive('link'))}
				aria-pressed={editor.isActive('link')}
				aria-label="Link"
				title="Link"
			>
				Link
			</button>
			<button
				type="button"
				onClick={handleInsertImage}
				className={buttonClass(false)}
				aria-label="Insert image"
				title="Insert image"
			>
				Image
			</button>

			<span aria-hidden="true" className={TOOLBAR_DIVIDER_CLASS} />

			<button
				type="button"
				onClick={() => editor.chain().focus().undo().run()}
				disabled={!editor.can().undo()}
				className={buttonClass(false)}
				aria-label="Undo"
				title="Undo"
			>
				Undo
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().redo().run()}
				disabled={!editor.can().redo()}
				className={buttonClass(false)}
				aria-label="Redo"
				title="Redo"
			>
				Redo
			</button>
			<button
				type="button"
				onClick={handleClearFormatting}
				className={buttonClass(false)}
				aria-label="Clear formatting"
				title="Clear formatting"
			>
				Clear
			</button>
		</div>
	)
}

export function RichTextEditor({
	id,
	value,
	onChange,
	ariaDescribedby,
	ariaInvalid
}: RichTextEditorProps) {
	const editorAttributes: Record<string, string> = {
		class: EDITOR_CONTENT_CLASS,
		role: 'textbox',
		'aria-multiline': 'true'
	}
	if (id) {
		editorAttributes.id = id
	}
	if (ariaDescribedby) {
		editorAttributes['aria-describedby'] = ariaDescribedby
	}
	if (ariaInvalid) {
		editorAttributes['aria-invalid'] = ariaInvalid
	}

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				// Strike (<s>) and HorizontalRule (<hr>) are disabled because
				// neither tag is in BlogPostContent.tsx's sanitize-html
				// allowedTags. The toolbar has no buttons for these, but
				// StarterKit registers them as default input rules
				// (--- -> hr) and keyboard shortcuts (Cmd+Shift+S -> strike)
				// that authors can reach inadvertently. Disabling at the
				// extension level prevents silent editor-to-public-render
				// diffs.
				strike: false,
				horizontalRule: false
			}),
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					rel: 'noopener noreferrer',
					target: '_blank'
				}
			}),
			Image
		],
		content: value,
		immediatelyRender: false,
		editorProps: {
			attributes: editorAttributes
		},
		onUpdate: ({ editor: instance }) => {
			onChange(instance.getHTML())
		}
	})

	if (!editor) {
		return (
			<div
				aria-busy="true"
				aria-live="polite"
				className="rounded-md border border-border bg-surface-raised min-h-[432px]"
			/>
		)
	}

	return (
		<div
			aria-busy="false"
			aria-live="polite"
			className="rounded-md border border-border bg-surface-raised overflow-hidden"
		>
			<Toolbar editor={editor} />
			<div className="max-h-[600px] overflow-y-auto">
				<EditorContent editor={editor} />
			</div>
		</div>
	)
}
