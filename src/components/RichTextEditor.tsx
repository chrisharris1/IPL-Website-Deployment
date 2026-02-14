'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Undo, Redo, Palette } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Gray', value: '#6B7280' },
]

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.fontSize || null,
            renderHTML: (attributes: { fontSize?: string | null }) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: { chain: () => any }) =>
          chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }: { chain: () => any }) =>
          chain().setMark('textStyle', { fontSize: null }).run(),
    } as any
  },
})

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const colorPickerRef = useRef<HTMLDivElement>(null)
  
  // Close color picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false)
      }
    }
    
    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColorPicker])
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      FontSize,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none p-4 border-t min-h-[200px] focus:outline-none',
        spellcheck: 'false',
      },
    },
  })

  if (!editor) return null

  // Get current heading level
  const getCurrentHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1'
    if (editor.isActive('heading', { level: 2 })) return 'h2'
    if (editor.isActive('heading', { level: 3 })) return 'h3'
    return 'normal'
  }

  return (
    <div className="border rounded-lg overflow-hidden relative">
      <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1 items-center relative">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleBold().run()
          }}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive('bold') ? 'bg-gray-300 text-blue-600' : ''
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleItalic().run()
          }}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive('italic') ? 'bg-gray-300 text-blue-600' : ''
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleUnderline().run()
          }}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive('underline') ? 'bg-gray-300 text-blue-600' : ''
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon size={16} />
        </button>
        
        <div className="w-px bg-gray-300 mx-1 h-6" />
        
        {/* Lists */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleBulletList().run()
          }}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive('bulletList') ? 'bg-gray-300 text-blue-600' : ''
          }`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleOrderedList().run()
          }}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive('orderedList') ? 'bg-gray-300 text-blue-600' : ''
          }`}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>
        
        <div className="w-px bg-gray-300 mx-1 h-6" />
        
        {/* Font Family */}
        <select
          value={editor.getAttributes('textStyle').fontFamily || 'default'}
          onChange={(e) => {
            if (e.target.value === 'default') {
              editor.chain().focus().unsetFontFamily().run()
            } else {
              editor.chain().focus().setFontFamily(e.target.value).run()
            }
          }}
          className="px-2 py-1 rounded border bg-white text-sm max-w-[120px]"
          title="Font Family"
        >
          <option value="default">Default</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times</option>
          <option value="Courier New">Courier</option>
          <option value="Verdana">Verdana</option>
          <option value="Tahoma">Tahoma</option>
        </select>
        
        {/* Heading Styles */}
        <select
          value={getCurrentHeading()}
          onChange={(e) => {
            const value = e.target.value
            if (value === 'normal') {
              editor.chain().focus().setParagraph().run()
            } else if (value === 'h1') {
              editor.chain().focus().setHeading({ level: 1 }).run()
            } else if (value === 'h2') {
              editor.chain().focus().setHeading({ level: 2 }).run()
            } else if (value === 'h3') {
              editor.chain().focus().setHeading({ level: 3 }).run()
            }
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
          value={editor.getAttributes('textStyle').fontSize || 'default'}
          onChange={(e) => {
            if (e.target.value === 'default') {
              ;(editor.chain().focus() as any).unsetFontSize().run()
            } else {
              ;(editor.chain().focus() as any).setFontSize(e.target.value).run()
            }
          }}
          className="px-2 py-1 rounded border bg-white text-sm"
          title="Font Size"
        >
          <option value="default">Default</option>
          <option value="12px">12</option>
          <option value="14px">14</option>
          <option value="16px">16</option>
          <option value="18px">18</option>
          <option value="20px">20</option>
          <option value="24px">24</option>
          <option value="28px">28</option>
          <option value="32px">32</option>
        </select>
        
        {/* Color Picker */}
        <div className="relative" ref={colorPickerRef}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              setShowColorPicker(!showColorPicker)
            }}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              showColorPicker ? 'bg-gray-300' : ''
            }`}
            title="Text Color"
          >
            <Palette size={16} />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-xl p-3 z-100 min-w-[200px]">
              <div className="text-xs font-semibold mb-2 text-gray-700">Text Color</div>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      editor.chain().focus().setColor(color.value).run()
                      setShowColorPicker(false)
                    }}
                    className="w-8 h-8 rounded border-2 border-gray-300 hover:border-blue-500 hover:scale-110 transition-all"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  editor.chain().focus().unsetColor().run()
                  setShowColorPicker(false)
                }}
                className="w-full mt-3 text-xs py-1.5 px-2 bg-gray-100 hover:bg-gray-200 rounded transition"
              >
                Reset Color
              </button>
            </div>
          )}
        </div>
        
        <div className="w-px bg-gray-300 mx-1 h-6" />
        
        {/* Undo/Redo */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().undo().run()
          }}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            !editor.can().undo() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Undo (Ctrl+Z)"
          disabled={!editor.can().undo()}
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().redo().run()
          }}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            !editor.can().redo() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Redo (Ctrl+Y)"
          disabled={!editor.can().redo()}
        >
          <Redo size={16} />
        </button>
      </div>
      <EditorContent editor={editor} />
      {placeholder && !editor.getHTML() && (
        <p className="absolute top-12 left-4 text-gray-400 pointer-events-none">{placeholder}</p>
      )}
    </div>
  )
}
