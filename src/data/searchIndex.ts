import type { } from 'react'

export interface SearchEntry {
  title: string
  subtitle?: string
  href: string
  keywords: string[]
  score?: number
}

// Accent/diacritic normalization for robust matching
const normalize = (str: string) => str
  .toLowerCase()
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .replace(/[\u0300-\u036f]/g, '')

// Build global search index (can be expanded to load from JSON/data sources)
export function buildSearchIndex(): SearchEntry[] {
  // News/events (static subset; consider dynamic import later)
  const news: SearchEntry[] = [
    { id: 136, date: '22 DEC', year: '2024', title: 'Chennai Regional Branch Friends Meeting', location: 'Moovarasampettai, Chennai', description: 'Chennai Regional Branch Friends Meeting' },
    { id: 135, date: '25 MAY', year: '2024', title: '27th Friendship Meet', location: 'Kuttalam', description: '27th Friendship Meet at TMNS Hall, Kuttalam, Tenkasi District' },
    { id: 134, date: '03 MAR', year: '2024', title: 'IPL Chess Academy Festival', location: 'Pavoorchathiram', description: 'IPL Chess Academy - Chess Festival, Pavoorchathiram' },
    { id: 133, date: '24 FEB', year: '2024', title: 'Kanyakumari District Branch Friends Meeting', location: 'Kanyakumari', description: 'Kanyakumari District Branch Friends Meeting at Devadas Sweet Home Hall' },
    { id: 132, date: '11 FEB', year: '2024', title: "27th Friendship Meet - President's Announcement", location: 'India', description: "Indian Penpals' League, Mumbai" },
    { id: 131, date: '20 JAN', year: '2024', title: 'Krishnagiri Regional Branch Friends Meeting', location: 'Hosur', description: 'St. John Bosco Girls Higher Secondary School - Hosur' },
    { id: 130, date: '12 JAN', year: '2024', title: 'Tamil Nadu Government NRI Tamil Day Celebration', location: 'Tamil Nadu', description: 'Tamil Nadu Government NRI Tamil Day - Award to IPL President' },
    { id: 129, date: '30 DEC', year: '2023', title: 'IPL Chess Tournament', location: 'Mumbai', description: 'Chess tournament organized by IPL Chess Academy with Mumbai District Chess Association' },
    { id: 128, date: '17 DEC', year: '2023', title: 'Cash Prize for Tamil Nadu Kho-Kho Players', location: 'Tamil Nadu', description: 'National Kho-Kho Championship - Cash prizes for Tamil Nadu women players' },
    { id: 125, date: '19 DEC', year: '2023', title: 'Thiruvalluvar Statue Inauguration', location: 'Paris, France', description: 'Thiruvalluvar Statue Inauguration - Cergy, Paris, France' },
    { id: 127, date: '16 JUL', year: '2023', title: 'Chennai District Branch Friends Discussion', location: 'Chennai', description: 'Distribution of school uniforms and educational materials by Chennai District Branch' },
    { id: 124, date: '25 JUN', year: '2023', title: 'Thirukkural as Indian National Book - International Conference', location: 'New Delhi', description: 'International Conference on Thirukkural as Indian National Book - New Delhi' },
    { id: 126, date: '26 JUN', year: '2023', title: 'IPL Chess Academy Tournament', location: 'Pavoorchathiram, Tenkasi', description: 'IPL Chess Academy tournament, Pavoorchathiram, Tenkasi District' },
  ].map(n => ({
    title: n.title,
    subtitle: `${n.date} ${n.year} • ${n.location}`,
    href: `/news-events?highlight=${n.title.replace(/[^a-z0-9]+/gi, '-')}`,
    keywords: [n.description, n.location, n.date, n.year, 'news', 'event']
  }))

  const meets: SearchEntry[] = [
    { title: '28th Friendship Meet', subtitle: '2025 • Upcoming', href: '/friendship-meet', keywords: ['friendship', 'meet', 'upcoming', 'annual', '28th', 'நட்பு', 'சங்கமம்'] },
    { title: '27th Friendship Meet', subtitle: '2024 • Kuttalam', href: '/friendship-meet', keywords: ['friendship', 'meet', '2024', 'kuttalam', '27th'] },
    { title: '26th Friendship Meet', subtitle: '2023 • New Delhi', href: '/friendship-meet', keywords: ['friendship', 'meet', '2023', 'delhi', '26th'] },
    { title: 'International Friendship Day', subtitle: 'Friends Day Celebrations', href: '/friendship-meet', keywords: ['friends', 'day', 'international', 'august', 'celebration', 'நட்பு தினம்'] },
  ]

  const humanitarian: SearchEntry[] = [
    { title: 'Medical Assistance', subtitle: 'Humanitarian Service', href: '/humanitarian-services', keywords: ['medical', 'assistance', 'humanitarian', 'support', 'health'] },
    { title: 'Educational Support', subtitle: 'Humanitarian Service', href: '/humanitarian-services', keywords: ['education', 'students', 'scholarship', 'school'] },
    { title: 'Food & Clothing', subtitle: 'Humanitarian Service', href: '/humanitarian-services', keywords: ['food', 'clothing', 'donation', 'relief'] },
    { title: 'Livelihood Support', subtitle: 'Humanitarian Service', href: '/humanitarian-services', keywords: ['livelihood', 'support', 'family', 'employment'] },
    { title: 'Blood Donation', subtitle: 'Humanitarian Service', href: '/humanitarian-services', keywords: ['blood', 'donation', 'camp', 'lives'] },
    { title: 'Community Service', subtitle: 'Humanitarian Service', href: '/humanitarian-services', keywords: ['community', 'service', 'welfare', 'social'] },
  ]

  const staticPages: SearchEntry[] = [
    { title: 'About Us', subtitle: 'Organisation Info', href: '/about/ipl-profile', keywords: ['about', 'journey', 'values', 'mission', 'organization'] },
    { title: 'IPL Profile', subtitle: 'About Us', href: '/about/ipl-profile', keywords: ['profile', 'inception', 'league', 'achievements', 'பேரவை'] },
    { title: 'History', subtitle: 'Our Journey', href: '/about/history', keywords: ['history', 'milestones', 'journey', 'legacy', 'வரலாறு'] },
    { title: "IPL President's Blog", subtitle: 'Updates & Reflections', href: '/about/ipl-presidents-blog', keywords: ['president', 'blog', 'updates', 'achievements', 'தலைவர்'] },
    { title: 'Contact', subtitle: 'Reach Out', href: '/contact', keywords: ['contact', 'email', 'phone', 'mumbai', 'address'] },
    { title: 'Our Team', subtitle: 'Leadership & Volunteers', href: '/our-team', keywords: ['team', 'leadership', 'volunteers', 'trustees', 'committee'] },
    { title: 'Homepage', subtitle: 'Indian Penpals\' League', href: '/', keywords: ['home', 'league', 'indian', 'penpals', 'love', 'friendship', 'humanity'] },
    { title: 'News & Events', subtitle: 'Latest Updates', href: '/news-events', keywords: ['news', 'events', 'updates', 'activities', 'செய்திகள்'] },
    { title: 'Humanitarian Services', subtitle: 'Community Support', href: '/humanitarian-services', keywords: ['humanitarian', 'services', 'community', 'help', 'மனிதநேய சேவைகள்'] },
  ]

  return [...news, ...meets, ...humanitarian, ...staticPages]
}

export function scoreEntries(entries: SearchEntry[], query: string): SearchEntry[] {
  const qNorm = normalize(query)
  return entries
    .map(e => {
      const hay = normalize(e.title + ' ' + (e.subtitle || '') + ' ' + e.keywords.join(' '))
      let score = 0
      if (hay.includes(qNorm)) score += 5
      if (normalize(e.title).startsWith(qNorm)) score += 5
      if (normalize(e.title) === qNorm) score += 10
      // keyword weighting
      e.keywords.forEach(k => { if (normalize(k).includes(qNorm)) score += 2 })
      return { ...e, score }
    })
    .filter(e => e.score && e.score > 0)
    .sort((a, b) => (b.score! - a.score!))
}

export function searchSuggestions(query: string, limit = 8): SearchEntry[] {
  if (!query.trim()) return []
  return scoreEntries(buildSearchIndex(), query).slice(0, limit)
}
