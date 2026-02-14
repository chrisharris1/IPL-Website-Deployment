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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">IPL President&apos;s Blog</h2>
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
                        <div key={item.id} className="bg-white rounded-xl shadow overflow-hidden">
                            <img src={item.image_url} alt={item.title_en} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 mb-2">{item.title_en}</h3>
                                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{item.description_en?.replace(/<[^>]*>/g, '')}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(item)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition">Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 transition">Delete</button>
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
                            <button onClick={() => { setShowModal(false); setEditing(null) }} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
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
                                        <input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} placeholder="Enter title" className="w-full border rounded-lg p-2.5" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Title (Tamil)</label>
                                        <input value={formData.title_ta} onChange={(e) => setFormData({ ...formData, title_ta: e.target.value })} placeholder="Enter title (Tamil)" className="w-full border rounded-lg p-2.5" />
                                    </div>
                                </div>

                                <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Section 2</p>
                                    <h4 className="font-semibold text-gray-900">Featured Image</h4>
                                    <p className="text-xs text-gray-600">Upload one image for this post.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="file" name="image" accept="image/*" {...(!editing && { required: true })} className="border rounded-lg p-2.5" />
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
