'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Sparkles } from 'lucide-react'
import { useTranslation } from '@/contexts/TranslationContext'

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
    const [friendsDayContent, setFriendsDayContent] = useState<FriendsDayContent | null>(null)

    useEffect(() => {
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
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold uppercase tracking-tight text-neutral-900 mb-4 sm:mb-6 animate-slide-up wrap-break-word">
                        {t('meet.title', 'FRIENDS DAY')}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8 animate-slide-up wrap-break-word" style={{ animationDelay: '0.1s' }}>
                        {t('meet.subtitle', 'Celebrating friendship across borders since decades. Join us in the spirit of international friendship and unity.')}
                    </p>
                </div>
            </section>

            {/* International Friendship Day Section */}
            <section className="container-custom mx-auto px-4 mb-16 sm:mb-24">
                <div className="text-center mb-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 wrap-break-word">
                        {friendsDayContent
                            ? (lang === 'ta'
                                ? (friendsDayContent.intro_title_ta || '')
                                : (friendsDayContent.intro_title_en || ''))
                            : ''}
                    </h2>
                    <div className="text-base sm:text-lg text-neutral-600 max-w-3xl mx-auto wrap-break-word">
                        {friendsDayContent ? (
                            <div dangerouslySetInnerHTML={{ __html: lang === 'ta' ? (friendsDayContent.intro_content_ta || friendsDayContent.intro_content_en || '') : (friendsDayContent.intro_content_en || '') }} />
                        ) : (
                            <></>
                        )}
                    </div>
                </div>

                <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 shadow-lg border border-neutral-100">
                    <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 mb-6 wrap-break-word tracking-tight text-center">
                        {friendsDayContent
                            ? (lang === 'ta'
                                ? (friendsDayContent.about_title_ta || 'சர்வதேச நண்பர்கள் தினம் பற்றி')
                                : (
                                    <>
                                        <span style={{ fontFamily: "'Britannic Bold', 'Impact', sans-serif" }}>
                                            {friendsDayContent.about_title_en || "IPL's FRIENDS DAY."}
                                        </span>
                                        {" "}
                                        <span style={{ fontFamily: "'Book Antiqua', 'Palatino', serif", fontWeight: 'bold' }}>
                                            12<sup className="text-[0.6em]">th</sup> MARCH.
                                        </span>
                                    </>
                                ))
                            : (isTamil ? 'சர்வதேச நண்பர்கள் தினம் பற்றி' : (
                                <>
                                    <span style={{ fontFamily: "'Britannic Bold', 'Impact', sans-serif" }}>
                                        IPL's FRIENDS DAY.
                                    </span>
                                    {" "}
                                    <span style={{ fontFamily: "'Book Antiqua', 'Palatino', serif", fontWeight: 'bold' }}>
                                        12<sup className="text-[0.6em]">th</sup> MARCH.
                                    </span>
                                </>
                            ))}
                    </h3>
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-neutral-900 mb-6 wrap-break-word text-center" style={{ fontFamily: "'David Libre', 'Times New Roman', serif", letterSpacing: '0.02em' }}>
                        INAUGURAL DAY OF <span className="text-[1.5em]">I</span>NDIAN <span className="text-[1.5em]">P</span>ENPALS<sup className="text-[0.6em]">'</sup> <span className="text-[1.5em]">L</span>EAGUE
                    </p>
                    <div className="prose prose-base sm:prose-lg max-w-none text-neutral-600 space-y-4 wrap-break-word">
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
        </div>
    )
}
