'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import RichTextEditor from '@/components/RichTextEditor'

interface PresidentBlogItem {
    id: string
    title_en: string
    title_ta: string
    description_en: string
    description_ta: string
    image_url: string
}

export default function PresidentBlogSection() {
    const [items, setItems] = useState<PresidentBlogItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<PresidentBlogItem | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' }>({ text: '', type: 'success' })

    const [formData, setFormData] = useState({
        title_en: '',
        title_ta: '',
        description_en: '',
        description_ta: '',
    })
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const fetchItems = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/president-blog')
            const data = await res.json()
            if (data.success) setItems(data.data)
        } catch {
            setMessage({ text: 'Failed to load blog posts', type: 'error' })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchItems() }, [fetchItems])

    const openAddModal = () => {
        setEditing(null)
        setImagePreview(null)
        setFormData({
            title_en: '',
            title_ta: '',
            description_en: '',
            description_ta: '',
        })
        setShowModal(true)
    }

    const openEditModal = (item: PresidentBlogItem) => {
        setEditing(item)
        setImagePreview(null)
        setFormData({
            title_en: item.title_en || '',
            title_ta: item.title_ta || '',
            description_en: item.description_en || '',
            description_ta: item.description_ta || '',
        })
        setShowModal(true)
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)

        const submitData = new FormData()
        Object.entries(formData).forEach(([key, value]) => submitData.append(key, value))
        const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput?.files?.[0]) submitData.append('image', fileInput.files[0])
        if (editing) submitData.append('id', editing.id)

        try {
            const res = await fetch('/api/admin/president-blog', { method: editing ? 'PUT' : 'POST', body: submitData })
            const data = await res.json()
            if (data.success) {
                setMessage({ text: editing ? 'Blog updated!' : 'Blog added!', type: 'success' })
                setShowModal(false)
                setEditing(null)
                fetchItems()
            } else {
                // Show detailed validation error if available
                let errorMessage = data.error
                if (data.details) {
                    const fieldErrors = Object.entries(data.details)
                        .filter(([key]) => key !== '_errors')
                        .map(([key, val]: [string, any]) => val._errors && val._errors.length > 0 ? `${key}: ${val._errors.join(', ')}` : null)
                        .filter(Boolean)
                    if (fieldErrors.length > 0) errorMessage = fieldErrors.join(' | ')
                }
                setMessage({ text: errorMessage || 'Failed', type: 'error' })
            }
        } catch {
            setMessage({ text: 'Failed', type: 'error' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this blog post?')) return
        try {
            await fetch('/api/admin/president-blog', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })
            setMessage({ text: 'Blog deleted', type: 'success' })
            fetchItems()
        } catch {
            setMessage({ text: 'Delete failed', type: 'error' })
        }
    }

    // ─── Drag and Drop Handlers ──────────────────────────────────────────────────
    const [draggedId, setDraggedId] = useState<string | null>(null)

    const handleDragStart = (id: string) => {
        setDraggedId(id)
    }

    const handleDragEnter = (targetId: string) => {
        if (!draggedId || draggedId === targetId) return

        const draggedIndex = items.findIndex(item => item.id === draggedId)
        const targetIndex = items.findIndex(item => item.id === targetId)

        if (draggedIndex === -1 || targetIndex === -1) return

        const newItems = [...items]
        const [removed] = newItems.splice(draggedIndex, 1)
        newItems.splice(targetIndex, 0, removed)

        setItems(newItems)
    }

    const handleDragEnd = async () => {
        setDraggedId(null)
        try {
            await fetch('/api/admin/president-blog', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderedIds: items.map(i => i.id) })
            })
            setMessage({ text: 'Order saved', type: 'success' })
        } catch {
            setMessage({ text: 'Failed to save order', type: 'error' })
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">IPL President&apos;s Blog</h2>
                    <p className="text-sm text-gray-500 mt-1">↕ Drag cards to reorder posts</p>
                </div>
                <button onClick={openAddModal} className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition font-medium text-sm">
                    + Add Blog
                </button>
            </div>

            {!!message.text && (
                <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {loading ? <p className="text-gray-500">Loading...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {items.map(item => (
                        <div
                            key={item.id}
                            className={`bg-white rounded-xl shadow overflow-hidden transition-all duration-200 cursor-move ${draggedId === item.id ? 'opacity-50 scale-95 ring-2 ring-red-500' : 'hover:-translate-y-1 hover:shadow-lg'}`}
                            draggable
                            onDragStart={() => handleDragStart(item.id)}
                            onDragEnter={() => handleDragEnter(item.id)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <img src={item.image_url} alt={item.title_en} className="w-full h-48 object-cover pointer-events-none" />
                            <div className="p-4">
                                {item.title_en ? (
                                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-1" dangerouslySetInnerHTML={{ __html: item.title_en }} />
                                ) : (
                                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">Untitled Post</h3>
                                )}
                                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{item.description_en?.replace(/<[^>]*>/g, '')}</p>
                                <div className="flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); openEditModal(item) }} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition">Edit</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 transition">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && <p className="text-gray-500 text-center py-8 col-span-full">No blog posts yet.</p>}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 pb-4 border-b">
                            <h3 className="text-xl font-bold text-gray-900">{editing ? 'Edit Blog Post' : 'Add Blog Post'}</h3>
                            <button onClick={() => { setShowModal(false); setEditing(null); setImagePreview(null) }} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>
                        <div className="p-6 pt-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Section 1</p>
                                    <h4 className="font-semibold text-gray-900">Post Titles</h4>
                                    <p className="text-xs text-gray-600">Add title in English and Tamil (Tamil optional).</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Title (English)</label>
                                        <RichTextEditor
                                            value={formData.title_en}
                                            onChange={(value) => setFormData({ ...formData, title_en: value })}
                                            placeholder="Enter title"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Title (Tamil)</label>
                                        <RichTextEditor
                                            value={formData.title_ta}
                                            onChange={(value) => setFormData({ ...formData, title_ta: value })}
                                            placeholder="Enter title (Tamil)"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Section 2</p>
                                    <h4 className="font-semibold text-gray-900">Featured Image</h4>
                                    <p className="text-xs text-gray-600">Upload one image for this post.</p>
                                </div>
                                <div>
                                    <input 
                                        type="file" 
                                        name="image" 
                                        accept="image/*" 
                                        {...(!editing && { required: true })} 
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                const reader = new FileReader()
                                                reader.onloadend = () => {
                                                    setImagePreview(reader.result as string)
                                                }
                                                reader.readAsDataURL(file)
                                            }
                                        }}
                                        className="border rounded-lg p-2.5 w-full" 
                                    />
                                    {imagePreview && (
                                        <div className="mt-3 relative inline-block">
                                            <p className="text-sm text-gray-600 mb-2">New Image Preview:</p>
                                            <div className="relative">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-48 object-cover rounded-lg border shadow-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImagePreview(null)
                                                        const fileInput = document.querySelector('input[name="image"]') as HTMLInputElement
                                                        if (fileInput) fileInput.value = ''
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {editing?.image_url && !imagePreview && (
                                        <div className="mt-3">
                                            <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                                            <img
                                                src={editing.image_url}
                                                alt="Current"
                                                className="w-full h-48 object-cover rounded-lg border shadow-sm"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Section 3</p>
                                    <h4 className="font-semibold text-gray-900">Post Description</h4>
                                    <p className="text-xs text-gray-600">Use formatting tools for bold, italic, color, font, headings, and font size.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description (English)</label>
                                    <RichTextEditor
                                        value={formData.description_en}
                                        onChange={(value) => setFormData({ ...formData, description_en: value })}
                                        placeholder="Write blog description in English..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description (Tamil)</label>
                                    <RichTextEditor
                                        value={formData.description_ta}
                                        onChange={(value) => setFormData({ ...formData, description_ta: value })}
                                        placeholder="Write blog description in Tamil..."
                                    />
                                </div>
                                <button type="submit" disabled={submitting} className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold transition disabled:opacity-50">
                                    {submitting ? 'Saving...' : editing ? 'Update Blog Post' : 'Add Blog Post'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
