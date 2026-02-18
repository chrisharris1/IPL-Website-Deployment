'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import RichTextEditor from '@/components/RichTextEditor'

interface HistorySectionItem {
    id: string
    section_title_en: string
    section_title_ta: string
    content_en: string
    content_ta: string
    order_index: number
    is_deletable: boolean
}

export default function HistorySection() {
    const [items, setItems] = useState<HistorySectionItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<HistorySectionItem | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' }>({ text: '', type: 'success' })

    const [formData, setFormData] = useState({
        section_title_en: '',
        section_title_ta: '',
        content_en: '',
        content_ta: '',
    })

    const fetchItems = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/history')
            const data = await res.json()
            if (data.success) setItems(data.data)
        } catch {
            setMessage({ text: 'Failed to load history sections', type: 'error' })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchItems() }, [fetchItems])

    const openAddModal = () => {
        setEditing(null)
        setFormData({
            section_title_en: '',
            section_title_ta: '',
            content_en: '',
            content_ta: '',
        })
        setShowModal(true)
    }

    const openEditModal = (item: HistorySectionItem) => {
        setEditing(item)
        setFormData({
            section_title_en: item.section_title_en || '',
            section_title_ta: item.section_title_ta || '',
            content_en: item.content_en || '',
            content_ta: item.content_ta || '',
        })
        setShowModal(true)
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const payload = {
                ...formData,
                ...(editing ? { id: editing.id } : {}),
            }
            const res = await fetch('/api/admin/history', {
                method: editing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (data.success) {
                setMessage({ text: editing ? 'History section updated!' : 'History section added!', type: 'success' })
                setShowModal(false)
                setEditing(null)
                fetchItems()
            } else {
                setMessage({ text: data.error || 'Failed', type: 'error' })
            }
        } catch {
            setMessage({ text: 'Failed', type: 'error' })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this history section?')) return
        try {
            const res = await fetch('/api/admin/history', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })
            const data = await res.json()
            if (!data.success) throw new Error(data.error || 'Delete failed')
            setMessage({ text: 'History section deleted', type: 'success' })
            fetchItems()
        } catch {
            setMessage({ text: 'Delete failed', type: 'error' })
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">History Page</h2>
                <button onClick={openAddModal} className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition font-medium text-sm">
                    + Add Section
                </button>
            </div>

            {!!message.text && (
                <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {loading ? <p className="text-gray-500">Loading...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {items.map(item => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    {item.section_title_en ? (
                                        <h3 className="text-lg font-bold text-gray-900" dangerouslySetInnerHTML={{ __html: item.section_title_en }} />
                                    ) : (
                                        <h3 className="text-lg font-bold text-gray-900">Untitled Section</h3>
                                    )}
                                    {item.section_title_ta && (
                                        <div className="text-sm text-gray-500 mt-1" dangerouslySetInnerHTML={{ __html: item.section_title_ta }} />
                                    )}
                                </div>
                                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">#{item.order_index}</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-3 mb-4">{item.content_en?.replace(/<[^>]*>/g, '').substring(0, 220)}...</p>
                            <div className="flex gap-2">
                                <button onClick={() => openEditModal(item)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition">Edit</button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    disabled={item.is_deletable === false}
                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && <p className="text-gray-500 text-center py-8 col-span-full">No history sections yet.</p>}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 pb-4 border-b">
                            <h3 className="text-xl font-bold text-gray-900">{editing ? 'Edit History Section' : 'Add History Section'}</h3>
                            <button onClick={() => { setShowModal(false); setEditing(null) }} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>
                        <div className="p-6 pt-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Paragraph Title (English) - Optional</label>
                                        <RichTextEditor
                                            value={formData.section_title_en}
                                            onChange={(value) => setFormData({ ...formData, section_title_en: value })}
                                            placeholder="Enter title"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Title (Tamil)</label>
                                        <RichTextEditor
                                            value={formData.section_title_ta}
                                            onChange={(value) => setFormData({ ...formData, section_title_ta: value })}
                                            placeholder="Enter title (Tamil)"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Paragraph Content (English) *</label>
                                    <RichTextEditor
                                        value={formData.content_en}
                                        onChange={(value) => setFormData({ ...formData, content_en: value })}
                                        placeholder="Write history paragraph in English..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Paragraph Content (Tamil)</label>
                                    <RichTextEditor
                                        value={formData.content_ta}
                                        onChange={(value) => setFormData({ ...formData, content_ta: value })}
                                        placeholder="Write history paragraph in Tamil..."
                                    />
                                </div>

                                <button type="submit" disabled={submitting} className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold transition disabled:opacity-50">
                                    {submitting ? 'Saving...' : editing ? 'Update Section' : 'Add Section'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

