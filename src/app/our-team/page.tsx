'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useTranslation } from '@/contexts/TranslationContext'
import { Users, Shield, Loader2, Mail, Linkedin, Phone, MapPin } from 'lucide-react'
import { getTeam } from '@/lib/api'
import type { TeamMember } from '@/types/api'

type Person = {
    name: string
    role: string
    img: string
    email?: string
    linkedin?: string
    link?: string
    phone?: string
    location?: string
}

const Card: React.FC<{ person: Person }> = ({ person }) => {
    const handleClick = () => {
        if (person.link) {
            window.location.href = person.link
        }
    }

    return (
        <div
            className={`group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-neutral-100 text-center relative overflow-hidden ${person.link ? 'cursor-pointer' : ''}`}
            onClick={handleClick}
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-red-600 to-red-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

            <div className="w-56 h-56 mx-auto mb-4 rounded-xl p-1.5 bg-linear-to-br from-red-100 to-red-50 group-hover:from-red-600 group-hover:to-red-800 transition-colors duration-300">
                <div className="w-full h-full rounded-lg overflow-hidden bg-white relative">
                    <Image
                        src={person.img}
                        alt={`${person.name} photo`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="224px"
                    />
                </div>
            </div>

            <h3 className="text-lg font-bold text-neutral-900 mb-1">{person.name}</h3>
            <p className="text-red-700 font-medium text-sm">{person.role}</p>
            {person.location && (
                <div className="flex items-center justify-center gap-1.5 mb-4 mt-1">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <p className="text-gray-700 text-sm font-bold">{person.location}</p>
                </div>
            )}
            {!person.location && <div className="mb-4" />}

            <div className="flex items-center justify-center gap-3">
                {(person.linkedin || person.email || ((person.role === 'President' || person.role === 'Founder, President') && person.phone)) ? (
                    <>
                        {person.linkedin && (
                            <a
                                href={person.linkedin}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="w-10 h-10 rounded-full bg-neutral-50 hover:bg-blue-600 text-neutral-600 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-4 h-4" />
                            </a>
                        )}
                        {person.email && (
                            <a
                                href={
                                    `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                                        person.email
                                    )}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="w-10 h-10 rounded-full bg-neutral-50 hover:bg-red-700 text-neutral-600 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md"
                                aria-label="Email"
                            >
                                <Mail className="w-4 h-4" />
                            </a>
                        )}
                        {person.phone && (person.role === 'President' || person.role === 'Founder, President') && (
                            <a
                                href={`tel:${person.phone.replace(/\s+/g, '')}`}
                                onClick={(e) => e.stopPropagation()}
                                className="w-10 h-10 rounded-full bg-neutral-50 hover:bg-emerald-600 text-neutral-600 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md"
                                aria-label="Phone"
                            >
                                <Phone className="w-4 h-4" />
                            </a>
                        )}
                    </>
                ) : (
                    <span className="h-10" /> // Spacer to keep height consistent if no links
                )}
            </div>
            {person.phone && (person.role === 'President' || person.role === 'Founder, President') && (
                <p className="text-neutral-600 text-sm mt-2">{person.phone}</p>
            )}
        </div>
    )
}

export default function OurTeam() {
    const { t } = useTranslation()
    const [presidents, setPresidents] = useState<TeamMember[]>([])
    const [trustees, setTrustees] = useState<TeamMember[]>([])
    const [membersByLevel, setMembersByLevel] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadTeam() {
            try {
                const response = await getTeam()
                if (response.success && response.data) {
                    // Maintain backward compatibility
                    setPresidents(response.data.presidents)
                    setTrustees(response.data.trustees)

                    // Use new hierarchical structure
                    setMembersByLevel(response.data.membersByLevel || [])
                }
            } catch (error) {
                console.error('Failed to load team:', error)
            } finally {
                setLoading(false)
            }
        }
        loadTeam()
    }, [])

    // Convert API data to Person format
    const mapToPerson = (member: TeamMember): Person => ({
        name: member.name,
        role: member.role,
        img: member.image_url,
        email: member.email || '',
        phone: member.phone || '',
        location: member.location || '',
    })

    return (
        <div className="bg-neutral-50 min-h-screen">
            {/* Hero */}
            <section className="relative bg-transparent pt-12 md:pt-16 lg:pt-20 pb-8 border-b border-neutral-100 overflow-hidden" style={{ minHeight: '320px' }}>
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <Image
                        src="/Images/iplbanner.png"
                        alt="Our team background"
                        fill
                        className="opacity-40 object-contain"
                        style={{ objectPosition: 'center' }}
                        priority
                    />
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.04)' }} />
                </div>
                <div className="relative z-10 container-custom mx-auto text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 mb-6 animate-fade-in">
                        <Users className="w-4 h-4 text-red-700" />
                        <span className="text-sm font-semibold text-red-800">{t('ourteam.badge', 'Leadership & Volunteers')}</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 mb-6 animate-slide-up">
                        {t('ourteam.title', 'Our Team')}
                    </h1>

                    <p className="text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {t('ourteam.subtitle', 'The people who nurture the spirit of Love, Friendship, and Humanity')}
                    </p>
                </div>
            </section>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-red-700" />
                </div>
            ) : (
                <>
                    {/* Group Photo Section */}
                    <section className="py-12 border-b border-neutral-100 bg-white">
                        <div className="container-custom mx-auto px-4">
                            <div className="max-w-5xl mx-auto">
                                <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-neutral-100 bg-[#FFFACD]">
                                    <Image
                                        src="/Images/our-tea,m.jpg"
                                        alt="IPL Team Group Photo"
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Display members dynamically based on Hierarchy Level from Admin */}
                    {(() => {
                        // 1. Sort groups by level ensures we follow Admin Hierarchy
                        const sortedGroups = [...membersByLevel].sort((a, b) => a.level - b.level)

                        // Helper for pluralization
                        const getRoleTitle = (role: string, count: number) => {
                            if (count <= 1) {
                                if (role === 'Coordinator') return 'Co-ordinators'
                                if (role === 'Organiser' || role === 'Overseas Organiser') return role + 's'
                                return role
                            }
                            if (role === 'Coordinator') return 'Co-ordinators'
                            if (role.endsWith('y')) return role.slice(0, -1) + 'ies'
                            return role + 's'
                        }

                        // Helper: Normalize role names for matching
                        const isRole = (group: any, baseName: string) => {
                            if (!group) return false
                            const name = group.roleName || ''
                            if (baseName === 'President') return name === 'President' || name === 'Founder, President'
                            if (baseName === 'Board') return name === 'Board of Trustee' || name === 'Board of Trustees'
                            return name === baseName
                        }

                        // Helper to render a standard section
                        const renderStandardSection = (group: any) => {
                            const { roleName, members, level } = group
                            if (!members || members.length === 0) return null

                            const displayRole = getRoleTitle(roleName, members.length)
                            const isExecutive = level <= 3
                            // Board is usually Grid layout
                            const isBoard = isRole(group, 'Board')

                            return (
                                <section
                                    key={roleName}
                                    className="py-12 border-b border-neutral-100"
                                    style={{
                                        background: isExecutive
                                            ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%)'
                                            : 'transparent'
                                    }}
                                >
                                    <div className="container-custom mx-auto">
                                        <div className="text-center mb-10">
                                            <div className="flex items-center justify-center gap-3 mb-3">
                                                <Shield className={`w-6 h-6 ${isExecutive ? 'text-red-700' : 'text-red-600'}`} />
                                                <h2 className={`text-3xl font-bold ${isExecutive ? 'text-red-800' : 'text-neutral-900'}`}>
                                                    {displayRole}
                                                </h2>
                                            </div>
                                        </div>

                                        <div className={`grid gap-6 justify-items-center ${members.length === 1 ? 'sm:grid-cols-1 max-w-sm mx-auto' :
                                            isBoard ? 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' :
                                                members.length <= 2 ? 'sm:grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto' :
                                                    'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                                            }`}>
                                            {members.map((member: TeamMember, i: number) => (
                                                <div
                                                    key={member.id}
                                                    className="animate-slide-up"
                                                    style={{ animationDelay: `${i * 100}ms` }}
                                                >
                                                    <Card person={mapToPerson(member)} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )
                        }

                        // Helper for Side-by-Side Sections
                        const renderSideBySideSection = (group1: any, group2: any, bgColor: string) => {
                            // Identify which is which to enforce Left/Right alignment preference
                            // We prefer Gen Sec LEFT, Treasurer RIGHT
                            // We prefer VP LEFT, Joint Sec RIGHT

                            let leftGroup = group1
                            let rightGroup = group2

                            const isGenSec = (g: any) => isRole(g, 'General Secretary')
                            const isTreasurer = (g: any) => isRole(g, 'Treasurer')
                            const isVP = (g: any) => isRole(g, 'Vice President')

                            // Swap if needed to match visual preference
                            if (isTreasurer(leftGroup) && isGenSec(rightGroup)) { leftGroup = group2; rightGroup = group1 }
                            if (!isVP(leftGroup) && isVP(rightGroup)) { leftGroup = group2; rightGroup = group1 }

                            // Determine grid layout (Uneven for VP to allow side-by-side)
                            const hasVP = isVP(leftGroup) || isVP(rightGroup)
                            const gridCols = hasVP ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1 md:grid-cols-2'
                            const leftSpan = hasVP ? (isVP(leftGroup) ? 'lg:col-span-3' : 'lg:col-span-2') : ''
                            const rightSpan = hasVP ? (isVP(rightGroup) ? 'lg:col-span-3' : 'lg:col-span-2') : ''
                            const gap = hasVP ? 'gap-8' : 'gap-12 lg:gap-24'

                            return (
                                <section key={`${leftGroup.roleName}-${rightGroup.roleName}`} className={`py-12 border-b border-neutral-100 ${bgColor}`}>
                                    <div className="container-custom mx-auto">
                                        <div className={`grid ${gridCols} ${gap} items-start`}>
                                            {/* Left Column */}
                                            <div className={`flex flex-col items-center w-full ${leftSpan}`}>
                                                <div className="flex items-center justify-center gap-3 mb-8">
                                                    <Shield className="w-6 h-6 text-purple-700" />
                                                    <h2 className="text-3xl font-bold text-purple-900">{getRoleTitle(leftGroup.roleName, leftGroup.members.length)}</h2>
                                                </div>
                                                <div className={`w-full flex flex-wrap justify-center gap-6 ${!hasVP && leftGroup.members.length === 1 ? 'max-w-sm' : ''}`}>
                                                    {leftGroup.members.map((member: TeamMember) => (
                                                        <div key={member.id} className="flex justify-center">
                                                            <Card person={mapToPerson(member)} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Right Column */}
                                            <div className={`flex flex-col items-center w-full ${rightSpan}`}>
                                                <div className="flex items-center justify-center gap-3 mb-8">
                                                    <Shield className="w-6 h-6 text-purple-700" />
                                                    <h2 className="text-3xl font-bold text-purple-900">{getRoleTitle(rightGroup.roleName, rightGroup.members.length)}</h2>
                                                </div>
                                                <div className={`w-full flex flex-wrap justify-center gap-6 ${!hasVP && rightGroup.members.length === 1 ? 'max-w-sm' : ''}`}>
                                                    {rightGroup.members.map((member: TeamMember) => (
                                                        <div key={member.id} className="flex justify-center">
                                                            <Card person={mapToPerson(member)} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )
                        }

                        // Iteration Logic
                        const renderedSections = []
                        for (let i = 0; i < sortedGroups.length; i++) {
                            const group = sortedGroups[i]
                            const nextGroup = sortedGroups[i + 1]

                            // Check for Pair 1: Gen Sec + Treasurer
                            const isGenSecPair = (isRole(group, 'General Secretary') && nextGroup && isRole(nextGroup, 'Treasurer')) ||
                                (isRole(group, 'Treasurer') && nextGroup && isRole(nextGroup, 'General Secretary'))

                            // Check for Pair 2: Vice President + Joint Secretary - DISABLED for now to allow full width
                            /* const isVPPair = (isRole(group, 'Vice President') && nextGroup && isRole(nextGroup, 'Joint Secretary')) ||
                                (isRole(group, 'Joint Secretary') && nextGroup && isRole(nextGroup, 'Vice President')) */
                            const isVPPair = false

                            if (isGenSecPair) {
                                renderedSections.push(renderSideBySideSection(group, nextGroup, 'bg-linear-to-b from-red-50/30 to-white'))
                                i++ // Skip next
                            } else if (isVPPair) {
                                renderedSections.push(renderSideBySideSection(group, nextGroup, 'bg-white'))
                                i++ // Skip next
                            } else {
                                renderedSections.push(renderStandardSection(group))
                            }
                        }

                        return renderedSections
                    })()}

                    {/* Fallback to legacy display if no hierarchical data */}
                    {membersByLevel.length === 0 && (
                        <>
                            {/* President Section */}
                            {presidents.length > 0 && (
                                <section className="py-12 border-b border-neutral-100">
                                    <div className="container-custom mx-auto">
                                        <div className="text-center mb-10">
                                            <div className="flex items-center justify-center gap-3 mb-3">
                                                <Shield className="w-6 h-6 text-red-700" />
                                                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">{t('ourteam.founder_president', 'Founder, President')}</h2>
                                            </div>
                                        </div>

                                        <div className="grid gap-6 justify-items-center sm:grid-cols-1 max-w-sm mx-auto">
                                            {presidents.map((member, i) => (
                                                <div key={member.id} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                                                    <Card person={mapToPerson(member)} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Board of Trustee Section */}
                            {trustees.length > 0 && (
                                <section className="py-12 border-b border-neutral-100">
                                    <div className="container-custom mx-auto">
                                        <div className="text-center mb-10">
                                            <div className="flex items-center justify-center gap-3 mb-3">
                                                <Shield className="w-6 h-6 text-red-700" />
                                                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">{t('ourteam.board_of_trustee', 'Board of Trustee')}</h2>
                                            </div>
                                        </div>

                                        <div className="grid gap-6 justify-items-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                            {trustees.map((member, i) => (
                                                <div key={member.id} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                                                    <Card person={mapToPerson(member)} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}
                        </>
                    )}

                    {/* Empty State */}
                    {membersByLevel.length === 0 && presidents.length === 0 && trustees.length === 0 && (
                        <section className="py-20 text-center px-4">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">{t('ourteam.team_coming_soon', 'Team Coming Soon')}</h3>
                            <p className="text-sm sm:text-base text-gray-500">{t('ourteam.team_coming_soon_desc', "We're assembling our team of dedicated volunteers.")}</p>
                        </section>
                    )}
                </>
            )}
        </div>
    )
}


