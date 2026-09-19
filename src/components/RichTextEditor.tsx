'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import { Underline } from '@tiptap/extension-underline'
import {
  Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered, Undo, Redo, Palette, Type,
} from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

// ─── Colors ───────────────────────────────────────────────────────────────────
const DARK_COLORS = [
  { name: 'Black',        value: '#000000' }, { name: 'Rich Black',  value: '#0B0F14' },
  { name: 'Onyx',         value: '#111827' }, { name: 'Gunmetal',    value: '#1F2937' },
  { name: 'Charcoal',     value: '#2D3748' }, { name: 'Slate Dark',  value: '#334155' },
  { name: 'Graphite',     value: '#374151' }, { name: 'Ash Gray',    value: '#4B5563' },
  { name: 'Steel Gray',   value: '#475569' }, { name: 'Smoke',       value: '#6B7280' },
  { name: 'Stone',        value: '#78716C' }, { name: 'Silver',      value: '#9CA3AF' },
  { name: 'Midnight Blue',value: '#0F172A' }, { name: 'Oxford Blue', value: '#14213D' },
  { name: 'Prussian Blue',value: '#1D3557' }, { name: 'Dark Blue',   value: '#1E3A8A' },
  { name: 'Navy',         value: '#172554' }, { name: 'Deep Cobalt', value: '#1e3799' },
  { name: 'Petrol Blue',  value: '#164E63' }, { name: 'Dark Cyan',   value: '#0C4A6E' },
  { name: 'Abyss Blue',   value: '#082f49' }, { name: 'Royal Blue',  value: '#1d4ed8' },
  { name: 'Indigo Night', value: '#312E81' }, { name: 'Deep Indigo', value: '#1e1b4b' },
  { name: 'Royal Purple', value: '#4C1D95' }, { name: 'Eggplant',    value: '#3B0764' },
  { name: 'Byzantium',    value: '#702963' }, { name: 'Dark Violet', value: '#2e1065' },
  { name: 'Plum Deep',    value: '#5B214A' }, { name: 'Dark Magenta',value: '#6b21a8' },
  { name: 'Dark Red',     value: '#991B1B' }, { name: 'Maroon',      value: '#7F1D1D' },
  { name: 'Burgundy',     value: '#7C2D12' }, { name: 'Wine',        value: '#6B1324' },
  { name: 'Blood Red',    value: '#450a0a' }, { name: 'Dark Rose',   value: '#881337' },
  { name: 'Claret',       value: '#500724' }, { name: 'Dark Green',  value: '#14532D' },
  { name: 'Pine Green',   value: '#064E3B' }, { name: 'Forest Deep', value: '#052e16' },
  { name: 'Olive Dark',   value: '#3F6212' }, { name: 'Teal Deep',   value: '#0F766E' },
  { name: 'Hunter Green', value: '#1a3c34' }, { name: 'Dark Moss',   value: '#1a2e05' },
  { name: 'Dark Brown',   value: '#78350F' }, { name: 'Coffee',      value: '#5C4033' },
  { name: 'Chocolate',    value: '#4E342E' }, { name: 'Walnut',      value: '#3B2F2F' },
  { name: 'Espresso',     value: '#1c0a00' }, { name: 'Dark Amber',  value: '#451a03' },
  { name: 'Sepia Dark',   value: '#3d1f00' }, { name: 'Crimson',     value: '#DC143C' },
  { name: 'Red',          value: '#EF4444' }, { name: 'Orange',      value: '#F97316' },
  { name: 'Amber',        value: '#D97706' }, { name: 'Yellow',      value: '#EAB308' },
  { name: 'Lime',         value: '#65A30D' }, { name: 'Green',       value: '#22C55E' },
  { name: 'Emerald',      value: '#059669' }, { name: 'Teal',        value: '#0D9488' },
  { name: 'Cyan',         value: '#0891B2' }, { name: 'Blue',        value: '#3B82F6' },
  { name: 'Light Blue',   value: '#0EA5E9' }, { name: 'Indigo',      value: '#6366F1' },
  { name: 'Violet',       value: '#8B5CF6' }, { name: 'Purple',      value: '#A855F7' },
  { name: 'Fuchsia',      value: '#D946EF' }, { name: 'Pink',        value: '#EC4899' },
  { name: 'Magenta',      value: '#e91e8c' }, { name: 'White',       value: '#FFFFFF' },
]

// ─── FontSize Extension ────────────────────────────────────────────────────────
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el: HTMLElement) => el.style.fontSize || null,
          renderHTML: (attrs: { fontSize?: string | null }) => {
            if (!attrs.fontSize) return {}
            return { style: `font-size: ${attrs.fontSize}` }
          },
        },
      },
    }]
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: { chain: () => any }) =>
        chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }: { chain: () => any }) =>
        chain().setMark('textStyle', { fontSize: null }).run(),
    } as any
  },
})

const FONT_SIZES = ['10px','12px','14px','16px','18px','20px','24px','28px','32px','36px','48px']

// ─── Color Picker Panel ────────────────────────────────────────────────────────
function ColorPickerPanel({ onApply, onReset }: {
  onApply: (color: string) => void
  onReset: () => void
}) {
  const [custom, setCustom] = useState('#000000')
  return (
    <div className="bg-white border rounded-lg shadow-2xl p-3" style={{ minWidth: 300, zIndex: 10000 }}>
      <div className="text-xs font-semibold mb-2 text-gray-700">Text Color</div>
      <div className="flex items-center gap-3 mb-3 p-2 bg-gray-50 rounded-lg border">
        <div className="w-10 h-10 rounded-full flex-shrink-0 cursor-pointer border-4"
          style={{ background: 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)', padding: 3, borderColor: custom }}>
          <div className="w-full h-full rounded-full border-2 border-white" style={{ backgroundColor: custom }} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 block mb-1">Custom Color</label>
          <div className="flex gap-2 items-center">
            <input type="color" value={custom} onChange={e => setCustom(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-gray-300" style={{ padding: 1 }} />
            <input type="text" value={custom}
              onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) setCustom(e.target.value) }}
              className="flex-1 text-xs px-2 py-1 border rounded font-mono" placeholder="#000000" />
            <button type="button" onMouseDown={e => { e.preventDefault(); onApply(custom) }}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap">Apply</button>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-400 mb-1">Presets</div>
      <div className="grid grid-cols-8 gap-1.5 max-h-44 overflow-y-auto pr-1">
        {DARK_COLORS.map(c => (
          <button key={c.value} type="button"
            onMouseDown={e => { e.preventDefault(); onApply(c.value) }}
            className="w-7 h-7 rounded-full border-2 border-gray-200 hover:border-blue-500 hover:scale-110 transition-all"
            style={{ backgroundColor: c.value }} title={c.name} />
        ))}
      </div>
      <button type="button" onMouseDown={e => { e.preventDefault(); onReset() }}
        className="w-full mt-3 text-xs py-1.5 bg-gray-100 hover:bg-gray-200 rounded transition">Reset Color</button>
    </div>
  )
}

// ─── Font options JSX ─────────────────────────────────────────────────────────
function FontOptions() {
  return (
    <>
      <option value="default">Default Font</option>
      <optgroup label="⭐ Recommended Tamil (Most Distinct)">
        <option value="Noto Sans Tamil, sans-serif">1. Noto Sans Tamil — Modern Clean</option>
        <option value="Tiro Tamil, serif">2. Tiro Tamil — Traditional Serif</option>
        <option value="Baloo Thambi 2, cursive">3. Baloo Thambi 2 — Bold Rounded</option>
        <option value="Kavivanar, cursive">4. Kavivanar — Poetic Script</option>
        <option value="Catamaran, sans-serif">5. Catamaran — Geometric Condensed</option>
      </optgroup>
      <optgroup label="── Tamil Sans-Serif ──">
        <option value="Hind Madurai, sans-serif">Hind Madurai</option>
        <option value="Mukta Malar, sans-serif">Mukta Malar</option>
        <option value="Pavanam, sans-serif">Pavanam</option>
        <option value="Anek Tamil, sans-serif">Anek Tamil</option>
        <option value="Meera Inimai, sans-serif">Meera Inimai</option>
        <option value="Inder, sans-serif">Inder</option>
      </optgroup>
      <optgroup label="── Tamil Serif ──">
        <option value="Noto Serif Tamil, serif">Noto Serif Tamil</option>
        <option value="Arima Madurai, serif">Arima Madurai</option>
      </optgroup>
      <optgroup label="── Tamil Decorative ──">
        <option value="Kalam, cursive">Kalam</option>
        <option value="Courgette, cursive">Courgette</option>
      </optgroup>
      <optgroup label="⚠️ Legacy Fonts (Non-Unicode)">
        <option value="Shree 0804, serif">Shree 0804 — Legacy Encoded</option>
        <option value="Shree 0805, serif">Shree 0805 — Legacy Encoded</option>
        <option value="Shree 0807, serif">Shree 0807 — Legacy Encoded</option>
      </optgroup>
      <optgroup label="── Latin Sans-Serif ──">
        <option value="Noto Sans, sans-serif">Noto Sans</option>
        <option value="Montserrat, sans-serif">Montserrat</option>
        <option value="Nunito, sans-serif">Nunito</option>
        <option value="Source Sans 3, sans-serif">Source Sans 3</option>
        <option value="IBM Plex Sans, sans-serif">IBM Plex Sans</option>
      </optgroup>
      <optgroup label="── Latin Serif ──">
        <option value="Merriweather, serif">Merriweather</option>
        <option value="Lora, serif">Lora</option>
        <option value="Crimson Pro, serif">Crimson Pro</option>
        <option value="Libre Baskerville, serif">Libre Baskerville</option>
        <option value="Playfair Display, serif">Playfair Display</option>
        <option value="Roboto Slab, serif">Roboto Slab</option>
      </optgroup>
      <optgroup label="── System Fonts ──">
        <option value="Arial">Arial</option>
        <option value="Georgia">Georgia</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
        <option value="Verdana">Verdana</option>
        <option value="Tahoma">Tahoma</option>
      </optgroup>
    </>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBubbleColor, setShowBubbleColor] = useState(false)
  const [bubblePos, setBubblePos] = useState<{ top: number; left: number } | null>(null)
  const [hasSelection, setHasSelection] = useState(false)

  // ── Saved selection refs (survive focus loss from clicking selects) ─────────
  const savedFrom = useRef<number | null>(null)
  const savedTo   = useRef<number | null>(null)

  const colorPickerRef = useRef<HTMLDivElement>(null)
  const bubbleColorRef = useRef<HTMLDivElement>(null)
  const wrapperRef     = useRef<HTMLDivElement>(null)

  // Close color pickers on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node))
        setShowColorPicker(false)
      if (bubbleColorRef.current && !bubbleColorRef.current.contains(e.target as Node))
        setShowBubbleColor(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Position bubble above the selected DOM text
  const positionBubble = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0 || !wrapperRef.current) return
    const range = sel.getRangeAt(0)
    if (!wrapperRef.current.contains(range.commonAncestorContainer)) return
    const rRect = range.getBoundingClientRect()
    const wRect = wrapperRef.current.getBoundingClientRect()
    if (rRect.width === 0 && rRect.height === 0) return
    setBubblePos({
      top:  rRect.top - wRect.top - 54,
      left: Math.max(130, Math.min(rRect.left - wRect.left + rRect.width / 2, wRect.width - 130)),
    })
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, strike: false }),
      TextStyle,
      Color,
      FontFamily.configure({ types: ['textStyle'] }),
      FontSize,
      Underline,
    ],
    content: value,
    immediatelyRender: false,
    // NOTE: shouldRerenderOnTransaction must be TRUE (default) so getAttributes()
    //       returns fresh data on each selection/transaction change.
    onUpdate: ({ editor }) => { onChange(editor.getHTML()) },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      if (from !== to) {
        savedFrom.current = from
        savedTo.current   = to
        setHasSelection(true)
        requestAnimationFrame(positionBubble)
      } else {
        setHasSelection(false)
        setBubblePos(null)
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none p-4 border-t min-h-[200px] focus:outline-none',
        spellcheck: 'false',
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    const incoming = value || ''
    if (editor.getHTML() !== incoming)
      editor.commands.setContent(incoming, { emitUpdate: false })
  }, [editor, value])

  useEffect(() => () => { editor?.destroy() }, [editor])

  if (!editor) return null

  // ────────────────────────────────────────────────────────────────────────────
  // THE KEY FIX: capture selection right before the select steals focus
  // (onMouseDown fires BEFORE focus moves), then restore it in onChange.
  // This works for BOTH the static toolbar AND the bubble menu selects.
  // ────────────────────────────────────────────────────────────────────────────
  const captureSelection = () => {
    if (!editor) return
    const { from, to } = editor.state.selection
    if (from !== to) {
      savedFrom.current = from
      savedTo.current   = to
    }
  }

  // Apply a command, restoring selection first if we have a saved range
  const applyWithSel = (fn: (ch: ReturnType<NonNullable<typeof editor>['chain']>) => void) => {
    if (!editor) return
    if (savedFrom.current != null && savedTo.current != null && savedFrom.current !== savedTo.current) {
      fn(editor.chain().focus().setTextSelection({ from: savedFrom.current, to: savedTo.current }))
    } else {
      fn(editor.chain().focus())
    }
  }

  const getCurrentHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1'
    if (editor.isActive('heading', { level: 2 })) return 'h2'
    if (editor.isActive('heading', { level: 3 })) return 'h3'
    return 'normal'
  }

  const currentFont     = editor.getAttributes('textStyle').fontFamily || 'default'
  const currentFontSize = editor.getAttributes('textStyle').fontSize   || 'default'
  const currentHeading  = getCurrentHeading()

  return (
    <div className="border rounded-lg overflow-visible relative" ref={wrapperRef}>
      <style>{`
        @keyframes bubbleIn {
          from { opacity:0; transform:translateX(-50%) translateY(6px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* ══ FLOATING BUBBLE TOOLBAR ═══════════════════════════════════════════ */}
      {hasSelection && bubblePos && (
        <div
          className="absolute z-[9999] flex items-center gap-0.5 bg-gray-900 text-white rounded-xl shadow-2xl px-2 py-1.5 border border-gray-700"
          style={{ top: bubblePos.top, left: bubblePos.left, transform: 'translateX(-50%)', animation: 'bubbleIn 0.15s ease', whiteSpace: 'nowrap' }}
        >
          {/* Bold / Italic / Underline — onMouseDown prevents focus loss */}
          <button type="button"
            onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
            className={`p-1.5 rounded hover:bg-white/15 transition ${editor.isActive('bold') ? 'bg-white/25 text-blue-300' : ''}`}
            title="Bold"><Bold size={13} /></button>
          <button type="button"
            onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
            className={`p-1.5 rounded hover:bg-white/15 transition ${editor.isActive('italic') ? 'bg-white/25 text-blue-300' : ''}`}
            title="Italic"><Italic size={13} /></button>
          <button type="button"
            onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleUnderline().run() }}
            className={`p-1.5 rounded hover:bg-white/15 transition ${editor.isActive('underline') ? 'bg-white/25 text-blue-300' : ''}`}
            title="Underline"><UnderlineIcon size={13} /></button>

          <div className="w-px bg-gray-600 mx-1 h-4" />

          {/* Font Family — onMouseDown captures selection BEFORE focus moves */}
          <div className="flex items-center gap-1">
            <Type size={11} className="text-gray-400 flex-shrink-0" />
            <select
              value={currentFont}
              onMouseDown={captureSelection}
              onChange={e => {
                const val = e.target.value
                applyWithSel(ch => val === 'default' ? ch.unsetFontFamily().run() : ch.setFontFamily(val).run())
              }}
              className="px-1 py-0.5 rounded border border-gray-600 bg-gray-800 text-white text-xs cursor-pointer max-w-[110px]"
              title="Font Family"
            >
              <FontOptions />
            </select>
          </div>

          {/* Font Size */}
          <select
            value={currentFontSize}
            onMouseDown={captureSelection}
            onChange={e => {
              const val = e.target.value
              applyWithSel(ch => val === 'default' ? (ch as any).unsetFontSize().run() : (ch as any).setFontSize(val).run())
            }}
            className="px-1 py-0.5 rounded border border-gray-600 bg-gray-800 text-white text-xs cursor-pointer ml-0.5 w-14"
            title="Font Size"
          >
            <option value="default">Size</option>
            {FONT_SIZES.map(s => <option key={s} value={s}>{s.replace('px', '')}</option>)}
          </select>

          <div className="w-px bg-gray-600 mx-1 h-4" />

          {/* Color */}
          <div className="relative" ref={bubbleColorRef}>
            <button type="button"
              onMouseDown={e => { e.preventDefault(); setShowBubbleColor(p => !p) }}
              className={`p-1.5 rounded hover:bg-white/15 transition ${showBubbleColor ? 'bg-white/25' : ''}`}
              title="Text Color"><Palette size={13} /></button>
            {showBubbleColor && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2" style={{ zIndex: 10001 }}>
                <ColorPickerPanel
                  onApply={c => { applyWithSel(ch => ch.setColor(c).run()); setShowBubbleColor(false) }}
                  onReset={() => { applyWithSel(ch => ch.unsetColor().run()); setShowBubbleColor(false) }}
                />
              </div>
            )}
          </div>

          {/* Heading */}
          <select
            value={currentHeading}
            onMouseDown={captureSelection}
            onChange={e => {
              const v = e.target.value
              applyWithSel(ch => {
                if (v === 'normal') return ch.setParagraph().run()
                if (v === 'h1')    return ch.setHeading({ level: 1 }).run()
                if (v === 'h2')    return ch.setHeading({ level: 2 }).run()
                if (v === 'h3')    return ch.setHeading({ level: 3 }).run()
              })
            }}
            className="px-1 py-0.5 rounded border border-gray-600 bg-gray-800 text-white text-xs cursor-pointer ml-0.5"
            title="Heading Style"
          >
            <option value="normal">¶ Para</option>
            <option value="h1">H1</option>
            <option value="h2">H2</option>
            <option value="h3">H3</option>
          </select>

          {/* Caret */}
          <span className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 border-r border-b border-gray-700 rotate-45 pointer-events-none" />
        </div>
      )}

      {/* ══ STATIC TOOLBAR ════════════════════════════════════════════════════ */}
      <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1 items-center relative">

        <button type="button"
          onClick={e => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
          className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('bold') ? 'bg-gray-300 text-blue-600' : ''}`}
          title="Bold (Ctrl+B)"><Bold size={16} /></button>
        <button type="button"
          onClick={e => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
          className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('italic') ? 'bg-gray-300 text-blue-600' : ''}`}
          title="Italic (Ctrl+I)"><Italic size={16} /></button>
        <button type="button"
          onClick={e => { e.preventDefault(); editor.chain().focus().toggleUnderline().run() }}
          className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('underline') ? 'bg-gray-300 text-blue-600' : ''}`}
          title="Underline (Ctrl+U)"><UnderlineIcon size={16} /></button>

        <div className="w-px bg-gray-300 mx-1 h-6" />

        <button type="button"
          onClick={e => { e.preventDefault(); editor.chain().focus().toggleBulletList().run() }}
          className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('bulletList') ? 'bg-gray-300 text-blue-600' : ''}`}
          title="Bullet List"><List size={16} /></button>
        <button type="button"
          onClick={e => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run() }}
          className={`p-2 rounded hover:bg-gray-200 transition ${editor.isActive('orderedList') ? 'bg-gray-300 text-blue-600' : ''}`}
          title="Ordered List"><ListOrdered size={16} /></button>

        <div className="w-px bg-gray-300 mx-1 h-6" />

        {/* Font Family — capture selection on mousedown, restore in onChange */}
        <select
          value={currentFont}
          onMouseDown={captureSelection}
          onChange={e => {
            const val = e.target.value
            applyWithSel(ch => val === 'default' ? ch.unsetFontFamily().run() : ch.setFontFamily(val).run())
          }}
          className="px-2 py-1 rounded border bg-white text-sm max-w-[220px]"
          title="Font Family"
        >
          <FontOptions />
        </select>

        {/* Heading Style */}
        <select
          value={currentHeading}
          onMouseDown={captureSelection}
          onChange={e => {
            const v = e.target.value
            applyWithSel(ch => {
              if (v === 'normal') return ch.setParagraph().run()
              if (v === 'h1')    return ch.setHeading({ level: 1 }).run()
              if (v === 'h2')    return ch.setHeading({ level: 2 }).run()
              if (v === 'h3')    return ch.setHeading({ level: 3 }).run()
            })
          }}
          className="px-2 py-1 rounded border bg-white text-sm"
          title="Text Style"
        >
          <option value="normal">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        {/* Font Size */}
        <select
          value={currentFontSize}
          onMouseDown={captureSelection}
          onChange={e => {
            const val = e.target.value
            applyWithSel(ch => val === 'default' ? (ch as any).unsetFontSize().run() : (ch as any).setFontSize(val).run())
          }}
          className="px-2 py-1 rounded border bg-white text-sm"
          title="Font Size"
        >
          <option value="default">Default</option>
          {FONT_SIZES.map(s => <option key={s} value={s}>{s.replace('px', '')}px</option>)}
        </select>

        {/* Color Picker */}
        <div className="relative" ref={colorPickerRef}>
          <button type="button"
            onClick={e => { e.preventDefault(); setShowColorPicker(p => !p) }}
            className={`p-2 rounded hover:bg-gray-200 transition ${showColorPicker ? 'bg-gray-300' : ''}`}
            title="Text Color"><Palette size={16} /></button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1" style={{ zIndex: 9999 }}>
              <ColorPickerPanel
                onApply={c => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false) }}
                onReset={() => { editor.chain().focus().unsetColor().run(); setShowColorPicker(false) }}
              />
            </div>
          )}
        </div>

        <div className="w-px bg-gray-300 mx-1 h-6" />

        <button type="button"
          onClick={e => { e.preventDefault(); editor.chain().focus().undo().run() }}
          disabled={!editor.can().undo()}
          className={`p-2 rounded hover:bg-gray-200 transition ${!editor.can().undo() ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Undo"><Undo size={16} /></button>
        <button type="button"
          onClick={e => { e.preventDefault(); editor.chain().focus().redo().run() }}
          disabled={!editor.can().redo()}
          className={`p-2 rounded hover:bg-gray-200 transition ${!editor.can().redo() ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Redo"><Redo size={16} /></button>
      </div>

      <EditorContent editor={editor} />

      {placeholder && !editor.getHTML().replace(/<[^>]+>/g, '').trim() && (
        <p className="absolute top-14 left-4 text-gray-400 pointer-events-none text-sm">{placeholder}</p>
      )}
    </div>
  )
}