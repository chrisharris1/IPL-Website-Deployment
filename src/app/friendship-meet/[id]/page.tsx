'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from '@/contexts/TranslationContext'

interface GalleryItem {
    id: string
    meet_id: string
    title_en: string
    title_ta: string
    country: string
    state: string
    district: string
    city: string
    date: string
    description_en: string
    description_ta: string
    image: { url: string; public_id: string } | null
    created_at: string
}

interface FriendshipMeet {
    id: string
    country: string
    state: string
    district: string
    year: number
    caption_en: string
    caption_ta: string
    banner_image: { url: string; public_id: string } | null
}

export default function FriendshipMeetDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { lang, t } = useTranslation()
    const isTamil = lang === 'ta'
    const [meet, setMeet] = useState<FriendshipMeet | null>(null)
    const [gallery, setGallery] = useState<GalleryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        async function fetchMeetDetails() {
            try {
                const res = await fetch('/api/friendship-meets')
                const data = await res.json()

                if (data.success) {
                    const foundMeet = data.data.find((m: FriendshipMeet) => m.id === params.id)
                    if (foundMeet) {
                        setMeet(foundMeet)

                        const galleryRes = await fetch(`/api/friendship-meets/${params.id}/gallery`)
                        const galleryData = await galleryRes.json()
                        if (galleryData.success) {
                            setGallery(galleryData.data)
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch meet details:', error)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchMeetDetails()
        }
    }, [params.id])

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
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('loading', isTamil ? 'ஏற்றப்படுகிறது...' : 'Loading...')}</p>
                </div>
            </div>
        )
    }

    if (!meet) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center p-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{t('meet.meet_not_found', isTamil ? 'சங்கமம் கிடைக்கவில்லை' : 'Meet Not Found')}</h2>
                    <button
                        onClick={() => router.push('/friendship-meet')}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
                    >
                        {t('backToList', isTamil ? 'நட்புச் சங்கமப் பட்டியலுக்கு திரும்ப' : 'Back to Friendship Meets')}
                    </button>
                </div>
            </div>
        )
    }

    const caption = lang === 'ta' && meet.caption_ta ? meet.caption_ta : meet.caption_en

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-linear-to-r from-red-600 to-red-800 text-white py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <button
                        onClick={() => router.back()}
                        className="mb-4 flex items-center gap-2 text-white hover:text-gray-200 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {t('back', isTamil ? 'பின்னால்' : 'Back')}
                    </button>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 wrap-break-word px-2">{caption || t('meet.title', isTamil ? 'நட்புச் சங்கமம்' : 'Friendship Meet')}</h1>
                    <p className="text-sm sm:text-lg md:text-xl opacity-90 wrap-break-word">
                        {meet.district}, {meet.state}, {meet.country} - {meet.year}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
                {gallery && gallery.length > 0 && (
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 wrap-break-word">
                            {t('photoGallery', isTamil ? 'புகைப்படத் தொகுப்பு' : 'Photo Gallery')} ({gallery.length} {t('photos', isTamil ? 'புகைப்படங்கள்' : 'photos')})
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {gallery.map((item) => {
                                const itemTitle = lang === 'ta' && item.title_ta ? item.title_ta : item.title_en
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => openImageModal(item)}
                                        className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                    >
                                        {item.image && item.image.url && (
                                            <div className="relative w-full h-64 overflow-hidden">
                                                <img
                                                    src={item.image.url}
                                                    alt={itemTitle || t('galleryImage', isTamil ? 'புகைப்படம்' : 'Gallery image')}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="p-3 bg-white border-t border-gray-100 min-w-0">
                                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 wrap-break-word">{itemTitle}</h3>
                                            <p className="text-xs text-gray-600 line-clamp-2 wrap-break-word">
                                                {item.city}, {item.district}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(item.date).toLocaleDateString(isTamil ? 'ta-IN' : 'en-US')}
                                            </p>
                                        </div>
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
                                )
                            })}
                        </div>
                    </div>
                )}

                {gallery.length === 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm sm:text-base text-gray-500">{t('meet.no_events', isTamil ? 'புகைப்படங்கள் இல்லை' : 'No gallery images available')}</p>
                    </div>
                )}
            </div>

            {showModal && selectedItem && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={closeModal}
                >
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 text-white hover:text-gray-200 transition z-10 bg-black bg-opacity-50 rounded-full p-2"
                        aria-label={t('close', isTamil ? 'மூடு' : 'Close')}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                            {selectedItem.image && (
                                <div className="relative w-full bg-gray-50">
                                    <img
                                        src={selectedItem.image.url}
                                        alt={selectedItem.title_en || t('galleryImage', isTamil ? 'புகைப்படம்' : 'Gallery image')}
                                        className="w-full h-auto object-contain"
                                        style={{ maxHeight: '70vh' }}
                                    />
                                </div>
                            )}

                            <div className="p-4 sm:p-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 wrap-break-word" dangerouslySetInnerHTML={{ __html: lang === 'ta' && selectedItem.title_ta ? selectedItem.title_ta : selectedItem.title_en }} />

                                <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 text-xs sm:text-sm text-gray-600">
                                    <span className="flex items-start gap-1 wrap-break-word">
                                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {selectedItem.city}, {selectedItem.district}, {selectedItem.state}, {selectedItem.country}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {new Date(selectedItem.date).toLocaleDateString(isTamil ? 'ta-IN' : 'en-US')}
                                    </span>
                                </div>

                                {selectedItem.description_en || selectedItem.description_ta ? (
                                    <div
                                        className="prose prose-sm max-w-none text-gray-700 wrap-break-word"
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
