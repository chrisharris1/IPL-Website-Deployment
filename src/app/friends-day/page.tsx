"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { Calendar, Heart, Users, Gift, Camera, Sparkles, Star, Globe, MapPin, Award } from 'lucide-react'
import { useTranslation } from '@/contexts/TranslationContext'

export default function FriendsDay() {
    const { t, lang } = useTranslation() // Assuming language is available in context
    const [selectedEvent, setSelectedEvent] = useState<number | null>(null)
    const [content, setContent] = useState<any>(null)

    React.useEffect(() => {
        fetch('/api/admin/friends-day')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setContent(data.data)
                }
            })
            .catch(err => console.error('Failed to load content', err))
    }, [])


    const friendsDayEvents = [
        {
            id: 1,
            year: '2024',
            date: 'August 4, 2024',
            title: 'International Friendship Day Celebration 2024',
            location: 'Multiple Locations across India',
            description: 'IPL members celebrated International Friendship Day with various cultural programs, gift exchanges, and community gatherings.',
            image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80',
            participants: '500+',
            activities: ['Cultural Programs', 'Gift Exchange', 'Community Gathering', 'Friendship Pledge']
        },
        {
            id: 2,
            year: '2023',
            date: 'August 6, 2023',
            title: 'International Friendship Day Celebration 2023',
            location: 'New Delhi & Regional Branches',
            description: 'A day dedicated to celebrating the bonds of friendship with pen pals from around the world.',
            image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
            participants: '450+',
            activities: ['Letter Writing', 'Cultural Exchange', 'Friendship Band Distribution', 'Group Photos']
        },
        {
            id: 3,
            year: '2022',
            date: 'August 7, 2022',
            title: 'International Friendship Day Celebration 2022',
            location: 'Mumbai & Regional Offices',
            description: 'IPL organized special friendship day events to honor the spirit of penpal friendships.',
            image: 'https://images.unsplash.com/photo-1522543558187-768b6df7c25c?w=800&q=80',
            participants: '400+',
            activities: ['Friendship Cards', 'Cultural Performances', 'Unity March', 'Social Gathering']
        }
    ]

    const highlights = [
        {
            icon: Heart,
            title: t('friendsday.highlight1.title', 'Celebrate Friendship'),
            description: t('friendsday.highlight1.desc', 'Honor the beautiful bonds formed through pen pal connections'),
            color: 'from-red-600 to-red-700'
        },
        {
            icon: Gift,
            title: t('friendsday.highlight2.title', 'Exchange Gifts'),
            description: t('friendsday.highlight2.desc', 'Share tokens of appreciation and friendship bands'),
            color: 'from-purple-600 to-purple-700'
        },
        {
            icon: Globe,
            title: t('friendsday.highlight3.title', 'Global Unity'),
            description: t('friendsday.highlight3.desc', 'Connect with friends across borders and cultures'),
            color: 'from-blue-600 to-blue-700'
        },
        {
            icon: Camera,
            title: t('friendsday.highlight4.title', 'Create Memories'),
            description: t('friendsday.highlight4.desc', 'Capture beautiful moments with your pen pals'),
            color: 'from-green-600 to-green-700'
        }
    ]

    const stats = [
        { number: '30+', label: t('friendsday.stats.years', 'Years'), icon: Calendar },
        { number: '10,000+', label: t('friendsday.stats.members', 'Members'), icon: Users },
        { number: '50+', label: t('friendsday.stats.branches', 'Branches'), icon: MapPin },
        { number: '100+', label: t('friendsday.stats.countries', 'Countries'), icon: Globe }
    ]

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Hero Section */}
            <section className="relative bg-transparent pt-12 md:pt-16 lg:pt-20 pb-8 overflow-hidden" style={{ minHeight: '320px' }}>
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <Image
                        src="/Images/iplbanner.png"
                        alt="Friends Day background"
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
                        <span className="text-xs font-semibold tracking-wider uppercase text-neutral-600">{t('friendsday.badge', 'International Friendship Day')}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-neutral-900 mb-4 sm:mb-6 animate-slide-up">
                        {t('friendsday.title', 'Friends Day')}
                    </h1>
                </div>
            </section>

            {/* Stats Section */}
            <section className="container-custom mx-auto mt-6 sm:mt-8 mb-16 sm:mb-24 px-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon
                        return (
                            <div key={index} className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neutral-200 hover:border-red-200 shadow-sm hover:shadow-xl transition-all duration-300 text-center">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-lg sm:rounded-xl bg-red-50 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-red-700" />
                                </div>
                                <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 mb-1">{stat.number}</div>
                                <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500">{stat.label}</div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* About Friends Day */}
            {content && (content.about_title_en || content.about_title_ta || content.about_content_en || content.about_content_ta) && (
                <section className="container-custom mx-auto px-4 mb-16 sm:mb-24">
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 shadow-lg border border-neutral-100">
                        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-50 border border-red-100 mb-6">
                            <Heart className="w-4 h-4 text-red-700" />
                            <span className="text-xs font-semibold tracking-wider uppercase text-red-800">{t('friendsday.about_badge', 'About the Celebration')}</span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-6" dangerouslySetInnerHTML={{ __html: lang === 'ta' ? content.about_title_ta : content.about_title_en }} />

                        <div className="prose prose-lg max-w-none text-neutral-600 space-y-4">
                            <div dangerouslySetInnerHTML={{ __html: lang === 'ta' ? (content.about_content_ta || content.about_content_en) : (content.about_content_en) }} />
                        </div>
                    </div>
                </section>
            )}

            {/* Highlights */}
            <section className="container-custom mx-auto px-4 mb-16 sm:mb-24">
                <div className="text-center mb-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                        {t('friendsday.highlights_title', 'Why We Celebrate')}
                    </h2>
                    <p className="text-neutral-600 max-w-2xl mx-auto">
                        {t('friendsday.highlights_desc', 'Every Friends Day celebration is filled with meaningful activities and joyful moments')}
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {highlights.map((highlight, index) => {
                        const Icon = highlight.icon
                        return (
                            <div key={index} className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${highlight.color} flex items-center justify-center mb-4`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-2">{highlight.title}</h3>
                                <p className="text-sm text-neutral-600">{highlight.description}</p>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Past Events */}
            <section className="container-custom mx-auto px-4 mb-16 sm:mb-24">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-neutral-200 shadow-sm mb-6">
                        <Award className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-semibold tracking-wider uppercase text-neutral-600">{t('friendsday.events_badge', 'Past Celebrations')}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                        {t('friendsday.events_title', 'Friends Day Events')}
                    </h2>
                    <p className="text-neutral-600 max-w-2xl mx-auto">
                        {t('friendsday.events_desc', 'A glimpse into our past Friends Day celebrations')}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {friendsDayEvents.map((event) => (
                        <div
                            key={event.id}
                            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-100 hover:-translate-y-1 cursor-pointer"
                            onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
                        >
                            <div className="relative h-48 overflow-hidden">
                                <Image
                                    src={event.image}
                                    alt={event.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full mb-2">
                                        {event.year}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-red-700 transition-colors">
                                    {event.title}
                                </h3>

                                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{event.date}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4">
                                    <MapPin className="w-4 h-4" />
                                    <span>{event.location}</span>
                                </div>

                                <p className="text-sm text-neutral-600 mb-4">
                                    {event.description}
                                </p>

                                {selectedEvent === event.id && (
                                    <div className="mt-4 pt-4 border-t border-neutral-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Users className="w-4 h-4 text-red-600" />
                                            <span className="text-sm font-semibold text-neutral-900">
                                                {event.participants} Participants
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">Activities:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {event.activities.map((activity, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                                                        {activity}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Call to Action */}
            <section className="container-custom mx-auto px-4 mb-16 sm:mb-24">
                <div className="bg-linear-to-br from-red-600 to-red-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl">
                    <Heart className="w-16 h-16 mx-auto mb-6 text-white/90" />
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                        {t('friendsday.cta_title', 'Join Our Next Friends Day Celebration')}
                    </h2>
                    <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                        {t('friendsday.cta_desc', 'Be part of our global friendship family. Celebrate love, friendship, and humanity with pen pals from around the world.')}
                    </p>
                    <a
                        href="/contact"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-700 rounded-full font-bold hover:bg-neutral-100 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        {t('friendsday.cta_button', 'Get in Touch')}
                        <Star className="w-5 h-5" />
                    </a>
                </div>
            </section>
        </div>
    )
}
