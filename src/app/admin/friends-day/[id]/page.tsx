'use client'

import { use, useCallback, useEffect, useState } from 'react'
import RichTextEditor from '@/components/RichTextEditor'

interface FriendsDayCard {
    id: string
    title_en: string
    title_ta: string
    description_en: string
    description_ta: string
    image: { url: string; public_id?: string } | null
}

interface GalleryItem {
    id: string
    card_id: string
    title_en: string
    title_ta: string
    description_en: string
    description_ta: string
    image: { url: string; public_id: string } | null
    created_at: string
}

export default function FriendsDayGalleryManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const cardId = resolvedParams.id

    const [card, setCard] = useState<FriendsDayCard | null>(null)
    const [items, setItems] = useState<GalleryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [msg, setMsg] = useState({ text: '', type: 'success' as 'success' | 'error' })

    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<GalleryItem | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState('')

    const [formData, setFormData] = useState({
        title_en: '',
        title_ta: '',
        description_en: '',
        description_ta: '',
    })

    const fetchData = useCallback(async () => {
        try {
            const [cardRes, galleryRes] = await Promise.all([
                fetch('/api/admin/friends-day/events'),
                fetch(`/api/admin/friends-day/${cardId}/gallery`),
            ])

            const [cardData, galleryData] = await Promise.all([cardRes.json(), galleryRes.json()])

            if (cardData.success && Array.isArray(cardData.data)) {
                const found = cardData.data.find((entry: FriendsDayCard) => entry.id === cardId)
                if (found) setCard(found)
            }

            if (galleryData.success && Array.isArray(galleryData.data)) {
                setItems(galleryData.data)
            }
        } catch {
            setMsg({ text: 'Failed to load gallery data', type: 'error' })
        }

        setLoading(false)
    }, [cardId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const openAddModal = () => {
        setEditing(null)
        setImageFile(null)
        setImagePreview('')
        setFormData({ title_en: '', title_ta: '', description_en: '', description_ta: '' })
        setShowModal(true)
    }

    const openEditModal = (item: GalleryItem) => {
        setEditing(item)
        setImageFile(null)
        setImagePreview('')
        setFormData({
            title_en: item.title_en || '',
            title_ta: item.title_ta || '',
            description_en: item.description_en || '',
            description_ta: item.description_ta || '',
        })
        setShowModal(true)
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const toBase64 = (file: File) =>
        new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
        })

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)

        if (!editing && !imageFile) {
            setMsg({ text: 'Photo is required', type: 'error' })
            setSubmitting(false)
            return
        }

        let base64 = ''
        if (imageFile) {
            base64 = await toBase64(imageFile)
        }

        try {
            const res = await fetch(`/api/admin/friends-day/${cardId}/gallery`, {
                method: editing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...(editing ? { item_id: editing.id } : {}),
                    ...formData,
                    ...(editing
                        ? (base64 ? { new_image: base64 } : {})
                        : { image: base64 }),
                }),
            })

            const data = await res.json()
            if (data.success) {
                setMsg({ text: editing ? 'Gallery item updated' : 'Gallery item added', type: 'success' })
                setShowModal(false)
                setEditing(null)
                fetchData()
            } else {
                setMsg({ text: data.error || 'Failed to save gallery item', type: 'error' })
            }
        } catch {
            setMsg({ text: 'Failed to save gallery item', type: 'error' })
        }

        setSubmitting(false)
    }

    const handleDelete = async (itemId: string) => {
        if (!confirm('Delete this gallery item?')) return

        try {
            const res = await fetch(`/api/admin/friends-day/${cardId}/gallery`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_id: itemId }),
            })
            const data = await res.json()
            if (data.success) {
                setMsg({ text: 'Gallery item deleted', type: 'success' })
                fetchData()
            } else {
                setMsg({ text: data.error || 'Failed to delete gallery item', type: 'error' })
            }
        } catch {
            setMsg({ text: 'Failed to delete gallery item', type: 'error' })
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                    <div>
                        <button
                            onClick={() => (window.location.href = '/admin')}
                            className="text-sm text-gray-600 hover:text-gray-800 mb-2 flex items-center gap-1"
                        >
                            ← Back to Main Admin
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Friends Day Gallery Management</h1>
                        <p className="text-gray-600 mt-1">Manage multiple photos for this Friends Day card</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold transition"
                    >
                        + Add Gallery Item
                    </button>
                </div>

                {card && (
                    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Selected Card</p>
                        <div className="text-lg font-bold text-gray-900" dangerouslySetInnerHTML={{ __html: card.title_en || 'Untitled card' }} />
                    </div>
                )}

                {msg.text && (
                    <div className={`mb-6 p-4 rounded-lg ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {msg.text}
                    </div>
                )}

                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : items.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">No gallery items yet</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                                    {item.image?.url ? (
                                        <img src={item.image.url} alt="Gallery" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400">No image</span>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.title_en || 'Untitled' }} />
                                    <div className="text-sm text-gray-600 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.description_en || '' }} />
                                    <div className="mt-4 flex gap-2">
                                        <button onClick={() => openEditModal(item)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 transition">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
                            <div className="flex justify-between items-center p-6 border-b">
                                <h3 className="text-2xl font-bold text-gray-900">{editing ? 'Edit Gallery Item' : 'Add Gallery Item'}</h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title (English)</label>
                                    <RichTextEditor value={formData.title_en} onChange={(value) => setFormData(prev => ({ ...prev, title_en: value }))} placeholder="Optional title" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title (Tamil)</label>
                                    <RichTextEditor value={formData.title_ta} onChange={(value) => setFormData(prev => ({ ...prev, title_ta: value }))} placeholder="Optional Tamil title" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description (English)</label>
                                    <RichTextEditor value={formData.description_en} onChange={(value) => setFormData(prev => ({ ...prev, description_en: value }))} placeholder="Optional description" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description (Tamil)</label>
                                    <RichTextEditor value={formData.description_ta} onChange={(value) => setFormData(prev => ({ ...prev, description_ta: value }))} placeholder="Optional Tamil description" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Photo {editing ? '(optional to replace)' : '*'}</label>
                                    <input type="file" accept="image/*" onChange={handleImageSelect} className="w-full border border-gray-300 rounded-lg p-2.5" />
                                    {(imagePreview || editing?.image?.url) && (
                                        <img src={imagePreview || editing?.image?.url} alt="Preview" className="mt-3 h-40 w-full max-w-sm object-cover rounded-lg border" />
                                    )}
                                </div>
                                <button type="submit" disabled={submitting} className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold transition disabled:opacity-50">
                                    {submitting ? 'Saving...' : editing ? 'Update Item' : 'Add Item'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
