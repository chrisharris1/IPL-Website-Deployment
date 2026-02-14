import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

type SearchItem = {
  title: string
  subtitle?: string
  href: string
  keywords: string[]
  score?: number
}

const normalize = (str: string) =>
  (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

const stripHtml = (html: string) => (html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim()

function scoreEntries(entries: SearchItem[], query: string): SearchItem[] {
  const q = normalize(query)
  if (!q) return entries

  return entries
    .map((e) => {
      const title = normalize(e.title)
      const subtitle = normalize(e.subtitle || '')
      let score = 0

      if (title === q) score += 80
      if (title.startsWith(q)) score += 50
      if (title.includes(q)) score += 30
      if (subtitle.includes(q)) score += 15

      for (const k of e.keywords) {
        const nk = normalize(k)
        if (!nk) continue
        if (nk === q) score += 25
        else if (nk.startsWith(q)) score += 18
        else if (nk.includes(q)) score += 10
      }

      return { ...e, score }
    })
    .filter((e) => (e.score || 0) > 0)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
}

export async function GET(request: NextRequest) {
  try {
    const q = (request.nextUrl.searchParams.get('q') || '').trim()
    const limit = Math.max(1, Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '8', 10), 25))
    const db = await getDb()

    const staticPages: SearchItem[] = [
      { title: 'Home', subtitle: 'Main page', href: '/', keywords: ['home', 'ipl', 'indian penpals league'] },
      { title: 'About Us', subtitle: 'Organisation information', href: '/about', keywords: ['about', 'profile', 'history', 'values'] },
      { title: 'History', subtitle: 'About > History', href: '/about/history', keywords: ['history', 'journey', 'timeline'] },
      { title: "IPL President's Blog", subtitle: 'About > President Blog', href: '/about/ipl-presidents-blog', keywords: ['president', 'blog', 'updates'] },
      { title: 'Our Team', subtitle: 'Team and leadership', href: '/our-team', keywords: ['team', 'leadership', 'trustee', 'committee'] },
      { title: 'Humanitarian Services', subtitle: 'Community support activities', href: '/humanitarian-services', keywords: ['humanitarian', 'services', 'help'] },
      { title: 'News & Events', subtitle: 'Latest updates', href: '/news-events', keywords: ['news', 'events', 'updates'] },
      { title: 'Friendship Meet', subtitle: 'Friendship meet sections', href: '/friendship-meet', keywords: ['friendship', 'meet'] },
      { title: 'Contact', subtitle: 'Reach us', href: '/contact', keywords: ['contact', 'phone', 'email'] },
    ]

    const [news, services, meets, blogs, aboutSections, team] = await Promise.all([
      db.collection('news_events').find({}, { projection: { title_en: 1, title_ta: 1, city: 1, district: 1, date: 1, description_en: 1, description_ta: 1 } }).limit(200).toArray(),
      db.collection('humanitarian_services').find({}, { projection: { _id: 1, title_en: 1, title_ta: 1, city: 1, district: 1, state: 1, description_en: 1, description_ta: 1 } }).limit(200).toArray(),
      db.collection('friendship_meets').find({}, { projection: { slug: 1, district: 1, state: 1, country: 1, year: 1, caption_en: 1, caption_ta: 1 } }).limit(200).toArray(),
      db.collection('president_blog').find({}, { projection: { title_en: 1, title_ta: 1, description_en: 1, description_ta: 1 } }).limit(200).toArray(),
      db.collection('about_us').find({}, { projection: { section_title_en: 1, section_title_ta: 1, content_en: 1, content_ta: 1 } }).limit(200).toArray(),
      db.collection('our_team').find({}, { projection: { name: 1, role: 1 } }).limit(200).toArray(),
    ])

    const dynamicEntries: SearchItem[] = [
      ...news.map((n: any) => ({
        title: n.title_en || n.title_ta || 'News Event',
        subtitle: [n.city, n.district, n.date].filter(Boolean).join(', '),
        href: `/news-events?search=${encodeURIComponent(n.title_en || n.title_ta || '')}`,
        keywords: [n.title_ta || '', stripHtml(n.description_en || ''), stripHtml(n.description_ta || ''), n.city || '', n.district || '', n.date || ''],
      })),
      ...services.map((s: any) => ({
        title: s.title_en || s.title_ta || 'Service',
        subtitle: [s.city, s.district, s.state].filter(Boolean).join(', '),
        href: `/humanitarian-services/${s._id.toString()}`,
        keywords: [s.title_ta || '', stripHtml(s.description_en || ''), stripHtml(s.description_ta || ''), s.city || '', s.district || '', s.state || ''],
      })),
      ...meets.map((m: any) => ({
        title: m.caption_en || m.caption_ta || `${m.district || ''} ${m.year || ''}`.trim(),
        subtitle: [m.district, m.state, m.country, m.year].filter(Boolean).join(', '),
        href: `/friendship-meet/${m.slug || ''}`,
        keywords: [m.caption_ta || '', m.district || '', m.state || '', m.country || '', String(m.year || '')],
      })),
      ...blogs.map((b: any) => ({
        title: b.title_en || b.title_ta || "President's Blog",
        subtitle: "IPL President's Blog",
        href: '/about/ipl-presidents-blog',
        keywords: [b.title_ta || '', stripHtml(b.description_en || ''), stripHtml(b.description_ta || ''), 'president', 'blog'],
      })),
      ...aboutSections.map((a: any) => ({
        title: a.section_title_en || a.section_title_ta || 'About Section',
        subtitle: 'About Us',
        href: '/about',
        keywords: [a.section_title_ta || '', stripHtml(a.content_en || ''), stripHtml(a.content_ta || ''), 'about'],
      })),
      ...team.map((m: any) => ({
        title: m.name || 'Team Member',
        subtitle: m.role || 'Our Team',
        href: '/our-team',
        keywords: [m.name || '', m.role || '', 'team', 'leadership'],
      })),
    ]

    const all = [...staticPages, ...dynamicEntries]
    const scored = q ? scoreEntries(all, q) : all
    return NextResponse.json({ success: true, data: scored.slice(0, limit) })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to search' }, { status: 500 })
  }
}

