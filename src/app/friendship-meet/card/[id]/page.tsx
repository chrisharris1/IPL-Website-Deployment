'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'

import { useTranslation } from '@/contexts/TranslationContext'

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

export default function FriendsDayCardDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { lang } = useTranslation()

    const [card, setCard] = useState<FriendsDayCard | null>(null)
    const [gallery, setGallery] = useState<GalleryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const [cardsRes, galleryRes] = await Promise.all([
                    fetch('/api/friends-day/events', { cache: 'no-store' }),
                    fetch(`/api/friends-day/${params.id}/gallery`, { cache: 'no-store' }),
                ])

                const [cardsData, galleryData] = await Promise.all([cardsRes.json(), galleryRes.json()])

                if (cardsData.success && Array.isArray(cardsData.data)) {
                    const found = cardsData.data.find((entry: FriendsDayCard) => entry.id === params.id)
                    if (found) setCard(found)
                }

                if (galleryData.success && Array.isArray(galleryData.data)) {
                    setGallery(galleryData.data)
                }
            } catch {
                // handled by fallback UI
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            load()
        }
    }, [params.id])

    const titleHtml = useMemo(() => {
        if (!card) return ''
        return lang === 'ta' ? (card.title_ta || card.title_en) : (card.title_en || card.title_ta)
    }, [card, lang])

    const descriptionHtml = useMemo(() => {
        if (!card) return ''
        return lang === 'ta' ? (card.description_ta || card.description_en) : (card.description_en || card.description_ta)
    }, [card, lang])

    const openImageModal = (item: GalleryItem) => {
        setSelectedItem(item)
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setSelectedItem(null)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        )
    }

    if (!card) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Card not found</h2>
                    <button onClick={() => router.push('/friendship-meet')} className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition">
                        Back to Friends Day
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <button onClick={() => router.back()} className="text-gray-700 hover:text-gray-900 mb-4 inline-flex items-center gap-2">
                    ← Back
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                    <div className="relative h-64 bg-gray-100">
                        {card.image?.url ? (
                            <Image src={card.image.url} alt="Friends Day" fill className="object-contain" sizes="(max-width: 1200px) 100vw, 1200px" />
                        ) : null}
                    </div>
                    <div className="p-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-3" dangerouslySetInnerHTML={{ __html: titleHtml || 'Friends Day' }} />
                        <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: descriptionHtml || '' }} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-5">Photo Gallery ({gallery.length})</h2>
                    {gallery.length === 0 ? (
                        <p className="text-gray-500">No gallery photos available.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {gallery.map((item) => {
                                const itemTitle = lang === 'ta' ? (item.title_ta || item.title_en) : (item.title_en || item.title_ta)
                                const itemDescription = lang === 'ta' ? (item.description_ta || item.description_en) : (item.description_en || item.description_ta)

                                return (
                                    <div
                                        key={item.id}
                                        className="border border-gray-200 rounded-xl overflow-hidden cursor-pointer group"
                                        onClick={() => openImageModal(item)}
                                    >
                                        <div className="h-48 bg-gray-100 overflow-hidden relative">
                                            {item.image?.url ? (
                                                <img src={item.image.url} alt="Gallery" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : null}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                                <svg
                                                    className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            {itemTitle ? <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: itemTitle }} /> : null}
                                            {itemDescription ? <div className="text-sm text-gray-600 line-clamp-3" dangerouslySetInnerHTML={{ __html: itemDescription }} /> : null}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {showModal && selectedItem && selectedItem.image?.url && (
                <div
                    className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 text-white hover:text-gray-200 transition z-10 bg-black/50 rounded-full p-2"
                        aria-label="Close preview"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                            <div className="relative w-full bg-gray-50">
                                <img
                                    src={selectedItem.image.url}
                                    alt={selectedItem.title_en || 'Gallery image'}
                                    className="w-full h-auto object-contain"
                                    style={{ maxHeight: '70vh' }}
                                />
                            </div>

                            <div className="p-4 sm:p-6">
                                {selectedItem.title_en || selectedItem.title_ta ? (
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 wrap-break-word" dangerouslySetInnerHTML={{ __html: lang === 'ta' && selectedItem.title_ta ? selectedItem.title_ta : selectedItem.title_en }} />
                                ) : null}

                                <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 text-xs sm:text-sm text-gray-600">
                                    {selectedItem.title_en || selectedItem.title_ta ? null : null}
                                </div>

                                {selectedItem.description_en || selectedItem.description_ta ? (
                                    <div
                                        className="max-w-none text-gray-700 wrap-break-word text-sm sm:text-base leading-relaxed [&_p]:my-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6"
                                        dangerouslySetInnerHTML={{
                                            __html: lang === 'ta' && selectedItem.description_ta ? selectedItem.description_ta : selectedItem.description_en
                                        }}
                                    />
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
