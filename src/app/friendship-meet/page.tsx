'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, MapPin, Sparkles, Filter, X, Loader2, ImageIcon } from 'lucide-react'
import { useTranslation } from '@/contexts/TranslationContext'

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

interface FriendsDayContent {
    intro_title_en?: string
    intro_title_ta?: string
    intro_content_en?: string
    intro_content_ta?: string
    about_title_en?: string
    about_title_ta?: string
    about_content_en?: string
    about_content_ta?: string
}

export default function FriendshipMeetPage() {
    const { t, lang } = useTranslation()
    const isTamil = lang === 'ta'
    const [meets, setMeets] = useState<FriendshipMeet[]>([])
    const [loading, setLoading] = useState(true)

    // Filter States
    const [filterCountry, setFilterCountry] = useState('All')
    const [filterYear, setFilterYear] = useState('All')
    const [filterState, setFilterState] = useState('All')
    const [filterDistrict, setFilterDistrict] = useState('All')

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

    const fetchMeets = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (filterCountry !== 'All') params.append('country', filterCountry)
            if (filterState !== 'All') params.append('state', filterState)
            if (filterDistrict !== 'All') params.append('district', filterDistrict)
            if (filterYear !== 'All') params.append('year', filterYear)

            const res = await fetch(`/api/friendship-meets?${params.toString()}`)
            const data = await res.json()
            if (data.success) {
                setMeets(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch friendship meets:', error)
        } finally {
            setLoading(false)
        }
    }, [filterCountry, filterState, filterDistrict, filterYear])

    useEffect(() => {
        fetchMeets()
    }, [fetchMeets])

    // Extract Unique Options for Filters
    const allMeets = useState<FriendshipMeet[]>([])

    const [friendsDayContent, setFriendsDayContent] = useState<FriendsDayContent | null>(null)

    useEffect(() => {
        const loadAllForFilters = async () => {
            try {
                const res = await fetch('/api/friendship-meets')
                const data = await res.json()
                if (data.success) {
                    allMeets[1](data.data)
                }
            } catch (error) {
                console.error('Failed to load filter data:', error)
            }
        }
        loadAllForFilters()

        // Fetch Friends Day Content
        fetch('/api/admin/friends-day')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setFriendsDayContent(data.data)
                }
            })
            .catch(err => console.error('Failed to load friends day content', err))
    }, [])

    const uniqueCountries = useMemo(() => {
        const countries = Array.from(new Set(allMeets[0].map((m: FriendshipMeet) => m.country))).sort()
        return ['All', ...countries]
    }, [allMeets[0]])

    const uniqueYears = useMemo(() => {
        let filtered = allMeets[0]
        if (filterCountry !== 'All') {
            filtered = filtered.filter((m: FriendshipMeet) => m.country === filterCountry)
        }
        const years = Array.from(new Set(filtered.map((m: FriendshipMeet) => m.year.toString()))).sort((a, b) => parseInt(b) - parseInt(a))
        return ['All', ...years]
    }, [allMeets[0], filterCountry])

    const uniqueStates = useMemo(() => {
        let filtered = allMeets[0]
        if (filterCountry !== 'All') {
            filtered = filtered.filter((m: FriendshipMeet) => m.country === filterCountry)
        }
        const states = Array.from(new Set(filtered.map((m: FriendshipMeet) => m.state))).sort()
        return ['All', ...states]
    }, [allMeets[0], filterCountry])

    const uniqueDistricts = useMemo(() => {
        let filtered = allMeets[0]
        if (filterCountry !== 'All') {
            filtered = filtered.filter((m: FriendshipMeet) => m.country === filterCountry)
        }
        if (filterState !== 'All') {
            filtered = filtered.filter((m: FriendshipMeet) => m.state === filterState)
        }
        const districts = Array.from(new Set(filtered.map((m: FriendshipMeet) => m.district))).sort()
        return ['All', ...districts]
    }, [allMeets[0], filterCountry, filterState])

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Hero Section */}
            <section className="relative bg-transparent pt-12 sm:pt-14 md:pt-16 lg:pt-20 pb-6 sm:pb-8 overflow-hidden" style={{ minHeight: '280px' }}>
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <Image
                        src="/Images/iplbanner.png"
                        alt="Friendship Meet background"
                        fill
                        className="opacity-40 object-contain"
                        style={{ objectPosition: 'center' }}
                        priority
                    />
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.04)' }} />
                </div>
                <div className="relative z-10 container-custom mx-auto text-center px-4">
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-neutral-200 shadow-sm mb-6 sm:mb-8 animate-fade-in">
                        <Sparkles className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-semibold tracking-wider uppercase text-neutral-600">{t('meet.badge', 'Annual Celebration')}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-neutral-900 mb-4 sm:mb-6 animate-slide-up break-words">
                        {t('meet.title', 'Friendship Meet')}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8 animate-slide-up break-words" style={{ animationDelay: '0.1s' }}>
                        {t('meet.subtitle', 'Celebrating friendship across borders since decades. Join us in the spirit of international friendship and unity.')}
                    </p>
                </div>
            </section>

            {/* International Friendship Day Section */}
            <section className="container-custom mx-auto px-4 mb-16 sm:mb-24">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-50 border border-red-100 mb-6">
                        <Heart className="w-4 h-4 text-red-700" />
                        <span className="text-xs font-semibold tracking-wider uppercase text-red-800">{t('meet.friends_day_badge', isTamil ? 'சர்வதேச நண்பர்கள் தினம்' : 'International Friendship Day')}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 break-words">
                        {friendsDayContent
                            ? (lang === 'ta'
                                ? (friendsDayContent.intro_title_ta || 'நண்பர்கள் தினக் கொண்டாட்டங்கள்')
                                : (friendsDayContent.intro_title_en || 'Friends Day Celebrations'))
                            : (isTamil ? 'நண்பர்கள் தினக் கொண்டாட்டங்கள்' : 'Friends Day Celebrations')}
                    </h2>
                    <div className="text-base sm:text-lg text-neutral-600 max-w-3xl mx-auto break-words">
                        {friendsDayContent ? (
                            <div dangerouslySetInnerHTML={{ __html: lang === 'ta' ? (friendsDayContent.intro_content_ta || friendsDayContent.intro_content_en || '') : (friendsDayContent.intro_content_en || '') }} />
                        ) : (
                            <p>
                                {isTamil
                                    ? 'ஒவ்வோர் ஆண்டும் ஆகஸ்ட் முதல் ஞாயிற்றுக்கிழமை நண்பர்கள் தினமாகக் கொண்டாடப்படுகிறது. உலகம் முழுவதும் உள்ள பேனா நண்பர்களை ஒன்று சேர்த்து நட்பின் அழகான பந்தத்தை கொண்டாடும் நாளாக இது திகழ்கிறது.'
                                    : 'Celebrating the spirit of friendship every first Sunday of August. International Friendship Day is celebrated annually, bringing together pen friends from across the globe to honor the beautiful bonds of friendship.'}
                            </p>
                        )}
                    </div>
                </div>

                <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 shadow-lg border border-neutral-100">
                    <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-6 break-words">
                        {friendsDayContent
                            ? (lang === 'ta'
                                ? (friendsDayContent.about_title_ta || 'சர்வதேச நண்பர்கள் தினம் பற்றி')
                                : (friendsDayContent.about_title_en || 'About International Friendship Day'))
                            : (isTamil ? 'சர்வதேச நண்பர்கள் தினம் பற்றி' : 'About International Friendship Day')}
                    </h3>
                    <div className="prose prose-base sm:prose-lg max-w-none text-neutral-600 space-y-4 break-words">
                        {friendsDayContent ? (
                            <div dangerouslySetInnerHTML={{ __html: lang === 'ta' ? (friendsDayContent.about_content_ta || friendsDayContent.about_content_en || '') : (friendsDayContent.about_content_en || '') }} />
                        ) : (
                            <>
                                <p>
                                    {isTamil
                                        ? 'சர்வதேச நண்பர்கள் தினம் ஆண்டுதோறும் ஆகஸ்ட் மாதத்தின் முதல் ஞாயிற்றுக்கிழமையில் அனுசரிக்கப்படுகிறது. வாழ்க்கையின் பல துறைகளிலிருந்து வரும் மக்களை இணைக்கும் நட்புப் பந்தங்களை இது கொண்டாடுகிறது.'
                                        : 'International Friendship Day is observed every year on the first Sunday of August, celebrating the bonds that bring people together from all walks of life. It\'s a day dedicated to honoring friendships and the positive impact they have on our lives.'}
                                </p>
                                <p>
                                    {isTamil
                                        ? 'இந்த கொண்டாட்டம் IPL அமைப்பின் அன்பு, நட்பு, மனிதநேயம் என்ற அடிப்படை மதிப்புகளை எடுத்துக்காட்டுகிறது. புவியியல் எல்லைகள், பண்பாடு, பின்னணி என்பதனை மீறி மக்களை ஒன்றிணைக்கிறது.'
                                        : 'The celebration embodies IPL\'s core values of Love, Friendship, and Humanity, bringing people together regardless of geographical boundaries, cultures, or backgrounds.'}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Past Meets / Filter Section */}
            <section className="container-custom mx-auto px-4 mb-16">
                <div className="text-center mb-10">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 break-words">
                        {t('meet.past_title', isTamil ? 'ஆண்டுதோறும் நட்புச் சங்கமங்கள்' : 'Past Friendship Meets')}
                    </h2>
                    <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto break-words">
                        {t('meet.past_sub', isTamil ? 'ஆண்டாண்டு பயணத்தை ஆராயுங்கள்' : 'Explore our journey through the years')}
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-neutral-200 mb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-red-600" />
                            <h3 className="font-bold text-neutral-900">{t('meet.filter_title', isTamil ? 'சங்கமங்களை வடிகட்டு' : 'Filter Meets')}</h3>
                        </div>
                        {(filterCountry !== 'All' || filterYear !== 'All' || filterState !== 'All' || filterDistrict !== 'All') && (
                            <button
                                onClick={() => {
                                    setFilterCountry('All')
                                    setFilterYear('All')
                                    setFilterState('All')
                                    setFilterDistrict('All')
                                }}
                                className="text-sm text-red-600 font-medium hover:underline flex items-center gap-1"
                            >
                                <X className="w-4 h-4" />
                                {t('meet.clear_filters', isTamil ? 'வடிகட்டலை நீக்கு' : 'Clear Filters')}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">{t('meet.country', isTamil ? 'நாடு' : 'Country')}</label>
                            <select
                                value={filterCountry}
                                onChange={(e) => setFilterCountry(e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                {uniqueCountries.map(c => (
                                    <option key={c} value={c}>{c === 'All' ? t('meet.all_countries', isTamil ? 'அனைத்து நாடுகளும்' : 'All Countries') : c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">{t('meet.state', isTamil ? 'மாநிலம்' : 'State')}</label>
                            <select
                                value={filterState}
                                onChange={(e) => setFilterState(e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                {uniqueStates.map(s => (
                                    <option key={s} value={s}>{s === 'All' ? t('meet.all_states', isTamil ? 'அனைத்து மாநிலங்களும்' : 'All States') : s}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">{t('meet.district', isTamil ? 'மாவட்டம்' : 'District')}</label>
                            <select
                                value={filterDistrict}
                                onChange={(e) => setFilterDistrict(e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                {uniqueDistricts.map(d => (
                                    <option key={d} value={d}>{d === 'All' ? t('meet.all_districts', isTamil ? 'அனைத்து மாவட்டங்களும்' : 'All Districts') : d}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">{t('meet.year', isTamil ? 'ஆண்டு' : 'Year')}</label>
                            <select
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                {uniqueYears.map(y => (
                                    <option key={y} value={y}>{y === 'All' ? t('meet.all_years', isTamil ? 'அனைத்து ஆண்டுகளும்' : 'All Years') : y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="min-h-[300px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
                            <p className="text-neutral-500">{t('meet.loading', isTamil ? 'நட்புச் சங்கமங்கள் ஏற்றப்படுகின்றன...' : 'Loading friendship meets...')}</p>
                        </div>
                    ) : meets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {meets.map((meet) => {
                                const captionEn = cleanText(meet.caption_en)
                                const captionTa = cleanText(meet.caption_ta)
                                const preferredCaption = lang === 'ta'
                                    ? (captionTa || captionEn)
                                    : (captionEn || captionTa)
                                const locationParts = [meet.district, meet.state, meet.country]
                                    .map(part => cleanText(part))
                                    .filter(Boolean)
                                const locationText = locationParts.join(', ')
                                const safeFallbackTitle = `${meet.year} ${t('meet.title', 'Friendship Meet')}`
                                const titleCandidates = [preferredCaption, captionEn, captionTa, locationText, safeFallbackTitle]
                                const title = titleCandidates.find(candidate => hasVisibleContent(candidate)) || safeFallbackTitle
                                return (
                                    <Link
                                        key={meet.id}
                                        href={`/friendship-meet/${meet.id}`}
                                        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-neutral-200 transition-all duration-300 hover:-translate-y-1 block h-full"
                                    >
                                        <div className="relative h-48 overflow-hidden bg-linear-to-br from-red-100 to-purple-100">
                                            {meet.banner_image ? (
                                                <img
                                                    src={meet.banner_image.url}
                                                    alt={title || `${meet.district} ${meet.year}`}
                                                    className="w-full h-full object-cover"
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
                                        <div className="p-6 min-w-0">
                                            <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2 leading-snug break-words">
                                                {title}
                                            </h3>
                                            <p className="text-sm text-neutral-600 mb-3 flex items-start gap-1 break-words">
                                                <MapPin className="w-4 h-4 shrink-0 mt-0.5" /> {locationText || '-'}
                                            </p>
                                            <div className="flex items-center justify-end">
                                                <span className="text-red-600 font-medium text-xs sm:text-sm">{t('meet.view_details', isTamil ? 'விவரங்களைப் பார்க்க' : 'View Details')} &rarr;</span>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                            <ImageIcon className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
                            <p className="text-neutral-500 text-base sm:text-lg mb-2 break-words">{t('meet.no_events', isTamil ? 'நிகழ்வுகள் எதுவும் இல்லை' : 'No events available')}</p>
                            <p className="text-neutral-400 text-sm break-words">{t('meet.no_events_sub', isTamil ? 'வடிகட்டலை மாற்றிப் பாருங்கள் அல்லது பின்னர் மீண்டும் பார்க்கவும்' : 'Try adjusting your filters or check back later')}</p>
                            {(filterCountry !== 'All' || filterYear !== 'All' || filterState !== 'All' || filterDistrict !== 'All') && (
                                <button
                                    onClick={() => {
                                        setFilterCountry('All')
                                        setFilterYear('All')
                                        setFilterState('All')
                                        setFilterDistrict('All')
                                    }}
                                    className="mt-4 text-red-600 font-medium hover:underline"
                                >
                                    {t('meet.clear_all_filters', isTamil ? 'அனைத்து வடிகட்டல்களையும் நீக்கு' : 'Clear all filters')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
