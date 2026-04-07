'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Sparkles, Loader2, ImageIcon } from 'lucide-react'
import { useTranslation } from '@/contexts/TranslationContext'

interface FriendshipMeet {
    id: string
    country: string
    state: string
    district: string
    year: number
    hero_title_en: string
    hero_title_ta: string
    description_en: string
    description_ta: string
    caption_en: string
    caption_ta: string
    banner_image: { url: string; public_id: string } | null
}

export default function FriendshipMeetsPage() {
    const { t, lang } = useTranslation()
    const isTamil = lang === 'ta'
    const [meets, setMeets] = useState<FriendshipMeet[]>([])
    const [loading, setLoading] = useState(true)

    // Content for intro section
    const [introContent, setIntroContent] = useState({
        intro_title_en: '',
        intro_title_ta: '',
        intro_content_en: '',
        intro_content_ta: ''
    })

    const cleanText = (text?: string) => {
        if (!text) return ''
        return text
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/&#\d+;/g, ' ')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
    }

    const hasVisibleContent = (text?: string) => {
        if (!text) return false
        return /[A-Za-z0-9\u0B80-\u0BFF]/.test(text)
    }

    useEffect(() => {
        const fetchMeets = async () => {
            try {
                setLoading(true)
                const res = await fetch(`/api/friendship-meets`, { cache: 'no-store' })
                const data = await res.json()
                if (data.success) {
                    // Sort by year in ascending order (oldest first)
                    const sortedMeets = data.data.sort((a: FriendshipMeet, b: FriendshipMeet) => a.year - b.year)
                    setMeets(sortedMeets)
                }
            } catch (error) {
                console.error('Failed to fetch friendship meets:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchMeets()
    }, [])

    // Fetch intro content
    useEffect(() => {
        const fetchIntroContent = async () => {
            try {
                const res = await fetch('/api/friendship-meets-content')
                const data = await res.json()
                if (data.success && data.data) {
                    setIntroContent(data.data)
                }
            } catch (error) {
                console.error('Failed to fetch intro content:', error)
            }
        }
        fetchIntroContent()
    }, [])

    return (
        <div className="min-h-screen bg-neutral-50 pt-8 sm:pt-10">
            {/* Hero Section */}
            <section className="relative bg-transparent pt-12 sm:pt-14 md:pt-16 lg:pt-20 pb-12 sm:pb-16 overflow-hidden" style={{ minHeight: '280px' }}>
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <Image
                        src="/Images/iplbanner.png"
                        alt="IPL Banner"
                        fill
                        className="object-cover opacity-20"
                        priority
                    />
                </div>
                <div className="container-custom mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-neutral-200 shadow-sm mb-6 sm:mb-8 animate-fade-in">
                        <Sparkles className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-semibold tracking-wider uppercase text-neutral-600">{t('friendshipMeets.badge', 'Annual Celebration')}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold uppercase tracking-tight text-neutral-900 mb-4 sm:mb-6 animate-slide-up">
                        {t('friendshipMeets.title', 'Friendship Meets')}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {t('friendshipMeets.subtitle', 'Celebrating friendship across borders since decades. Join us in the spirit of international friendship and unity.')}
                    </p>
                </div>
            </section>

            {/* Intro Section */}
            {(introContent.intro_title_en || introContent.intro_title_ta || introContent.intro_content_en || introContent.intro_content_ta) && (
                <section className="container-custom mx-auto px-4 mb-12">
                    <div className="bg-white rounded-2xl p-8 shadow-md border border-neutral-200">
                        {(introContent.intro_title_en || introContent.intro_title_ta) && (
                            <h2 
                                className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4"
                                dangerouslySetInnerHTML={{ __html: isTamil ? (introContent.intro_title_ta || introContent.intro_title_en) : (introContent.intro_title_en || introContent.intro_title_ta) }}
                            />
                        )}
                        {(introContent.intro_content_en || introContent.intro_content_ta) && (
                            <div 
                                className="text-neutral-700 leading-relaxed max-w-none text-base sm:text-lg [&_p]:my-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6"
                                dangerouslySetInnerHTML={{ __html: isTamil ? (introContent.intro_content_ta || introContent.intro_content_en) : (introContent.intro_content_en || introContent.intro_content_ta) }}
                            />
                        )}
                    </div>
                </section>
            )}

            {/* Past Meets Section */}
            <section className="container-custom mx-auto px-4 mb-16">
                {/* Results */}
                <div className="min-h-[300px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
                            <p className="text-neutral-500">{t('friendshipMeets.loading', isTamil ? 'நட்புச் சங்கமங்கள் ஏற்றப்படுகின்றன...' : 'Loading friendship meets...')}</p>
                        </div>
                    ) : meets.length > 0 ? (
                        <div className="flex flex-col gap-8 items-center">
                            {meets.map((meet) => {
                                const heroTitleEnHtml = meet.hero_title_en || meet.caption_en || ''
                                const heroTitleTaHtml = meet.hero_title_ta || meet.caption_ta || ''
                                const preferredTitleHtml = lang === 'ta'
                                    ? (heroTitleTaHtml || heroTitleEnHtml)
                                    : (heroTitleEnHtml || heroTitleTaHtml)
                                const descriptionEnHtml = meet.description_en || ''
                                const descriptionTaHtml = meet.description_ta || ''
                                const preferredDescriptionHtml = lang === 'ta'
                                    ? (descriptionTaHtml || descriptionEnHtml)
                                    : (descriptionEnHtml || descriptionTaHtml)
                                const locationParts = [meet.district, meet.state, meet.country]
                                    .map(part => cleanText(part))
                                    .filter(Boolean)
                                const locationText = locationParts.join(', ')
                                const safeFallbackTitle = `${meet.year} ${t('friendshipMeets.title', 'Friendship Meets')}`
                                const titleCandidates = [preferredTitleHtml, heroTitleEnHtml, heroTitleTaHtml, locationText, safeFallbackTitle]
                                const titleHtml = titleCandidates.find(candidate => hasVisibleContent(cleanText(candidate))) || safeFallbackTitle
                                const titleText = cleanText(titleHtml)
                                return (
                                    <Link
                                        key={meet.id}
                                        href={`/friendship-meet/${meet.id}`}
                                        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-neutral-200 transition-all duration-300 hover:-translate-y-1 block h-full w-full max-w-sm"
                                    >
                                        <div className="relative h-48 overflow-hidden bg-linear-to-br from-red-100 to-purple-100">
                                            {meet.banner_image ? (
                                                <img
                                                    src={meet.banner_image.url}
                                                    alt={titleText || `${meet.district} ${meet.year}`}
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon className="w-16 h-16 text-neutral-300" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                {meet.year}
                                            </div>
                                        </div>
                                        <div className="p-6 sm:p-7 min-w-0">
                                            <h3
                                                className="text-xl sm:text-2xl font-bold text-neutral-900 mb-3 leading-snug"
                                                dangerouslySetInnerHTML={{ __html: titleHtml }}
                                            />
                                            {preferredDescriptionHtml ? (
                                                <div
                                                    className="max-w-none text-neutral-700 mb-4 line-clamp-3 text-base leading-relaxed"
                                                    dangerouslySetInnerHTML={{ __html: preferredDescriptionHtml }}
                                                />
                                            ) : null}
                                            <p className="text-base text-neutral-700 mb-4 flex items-start gap-1.5">
                                                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                                <span className="min-w-0">{locationText || 'Location not specified'}</span>
                                            </p>
                                            <div className="text-red-600 font-semibold text-base hover:underline">
                                                {t('friendshipMeets.view_details', isTamil ? 'விவரங்களைக் காண்க →' : 'View Details →')}
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                            <ImageIcon className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                            <p className="text-neutral-500 text-base sm:text-lg mb-2">{t('friendshipMeets.no_events', isTamil ? 'நிகழ்வுகள் எதுவும் இல்லை' : 'No events available')}</p>
                            <p className="text-neutral-400 text-sm">{t('friendshipMeets.no_events_sub', isTamil ? 'சில நேரங்களில் திரும்பவும் பார்க்கவும்' : 'Check back later for updates')}</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
