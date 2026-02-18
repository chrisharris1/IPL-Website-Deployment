'use client'

import { useState, useEffect, useCallback, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import RichTextEditor from '@/components/RichTextEditor'
import PresidentBlogSection from '@/components/admin/PresidentBlogSection'
import HistorySection from '@/components/admin/HistorySection'
import { locations, getCountries, getStates, getDistricts, getCities } from '@/data/locations'
import {
    LayoutDashboard,
    Image as ImageIcon,
    Info,
    History,
    HeartHandshake,
    Newspaper,
    PenTool,
    Users,
    Globe,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Upload,
    Trash2,
    CheckCircle,
    AlertTriangle,
    Plus,
    X,
    Edit,
    PartyPopper,
    Bell
} from 'lucide-react'
import { motion } from 'framer-motion'

// ─── Types ───────────────────────────────────────────────────────────────────
interface CarouselImage { id: string; image_url: string; title?: string; subtitle?: string; hide_text: boolean; active: boolean; created_at: string }
interface ServiceItem { id: string; title_en: string; title_ta: string; country: string; state: string; district: string; city: string; date: string; description_en: string; description_ta: string; image_url: string }
interface NewsItem { id: string; title_en: string; title_ta: string; country: string; state: string; district: string; city: string; date: string; time: string; description_en: string; description_ta: string; image_url: string }
interface AboutSection { id: string; section_title_en: string; section_title_ta: string; content_en: string; content_ta: string; order_index: number; is_deletable: boolean }
interface TeamMember { id: string; name: string; role: string; image_url: string; order_index: number; hierarchy_level?: number; email?: string; phone?: string }
interface FriendshipMeet {
    id: string;
    country: string;
    state: string;
    district: string;
    year: number;
    caption_en: string;
    caption_ta: string;
    banner_image: { url: string; public_id: string } | null;
}
interface JoinNowItem { id: string; title_en: string; title_ta: string; content_en: string; content_ta: string; google_form_url: string; order_index: number }
interface DashboardStats { carousel: number; services: number; news: number; about: number; history: number; team: number; friendship: number; presidentBlog: number; joinNow: number }

type Section = 'dashboard' | 'carousel' | 'about' | 'history' | 'services' | 'news' | 'team' | 'friendship' | 'presidentBlog' | 'joinNow'

// ─── Sidebar Config ──────────────────────────────────────────────────────────
const NAV_ITEMS: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { key: 'carousel', label: 'Home Carousel', icon: <ImageIcon size={20} /> },
    { key: 'about', label: 'About Us', icon: <Info size={20} /> },
    { key: 'history', label: 'History', icon: <History size={20} /> },
    { key: 'services', label: 'Services', icon: <HeartHandshake size={20} /> },
    { key: 'news', label: 'News & Events', icon: <Newspaper size={20} /> },
    { key: 'presidentBlog', label: "President's Blog", icon: <PenTool size={20} /> },
    { key: 'team', label: 'Our Team', icon: <Users size={20} /> },
    { key: 'friendship', label: 'Friendship Meet', icon: <Globe size={20} /> },
    { key: 'joinNow', label: 'Join Now', icon: <CheckCircle size={20} /> },
]
// ─── Main Admin Page ─────────────────────────────────────────────────────────
export default function AdminPage() {
    const router = useRouter()

    useEffect(() => { document.title = "Indian Penpals' League - Admin" }, [])

    const [activeSection, setActiveSection] = useState<Section>('dashboard')
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const handleLogout = async () => {
        await fetch('/api/admin/auth', { method: 'DELETE' })
        router.push('/admin/login')
        router.refresh()
    }

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar */}
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-fuchsia-950 text-white shadow-2xl transition-all duration-300 flex flex-col z-20`}>
                <div className="p-6 border-b border-fuchsia-900 flex items-center justify-between h-20">
                    {sidebarOpen && (
                        <div className="flex items-center gap-3 animate-fade-in">
                            <div className="bg-white p-1.5 rounded-lg shadow-sm">
                                <img src="/Images/1000185730.jpg" alt="IPL Logo" className="w-8 h-8 object-contain" />
                            </div>
                            <h2 className="text-xl font-bold tracking-wide">IPL Admin</h2>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-fuchsia-300 hover:text-white transition p-2 rounded-lg hover:bg-fuchsia-900">
                        {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                <nav className="flex-1 py-6 px-3 overflow-y-auto custom-scrollbar">
                    <div className="space-y-1">
                        {NAV_ITEMS.map(item => (
                            <button key={item.key} onClick={() => setActiveSection(item.key)}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-200 group relative overflow-hidden ${activeSection === item.key
                                    ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-lg shadow-fuchsia-500/30 font-medium'
                                    : 'text-fuchsia-200/70 hover:bg-fuchsia-900 hover:text-white'
                                    }`}>
                                <span className={`text-xl transition-transform duration-300 ${activeSection === item.key ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                                {sidebarOpen && (
                                    <span className="text-sm tracking-wide whitespace-nowrap animate-slide-in-right opacity-0 fill-mode-forwards" style={{ animationDelay: '50ms', animationDuration: '300ms' }}>
                                        {item.label}
                                    </span>
                                )}
                                {activeSection === item.key && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="p-4 border-t border-fuchsia-900 bg-fuchsia-950/50">
                    <button onClick={handleLogout}
                        className={`w-full flex items-center justify-center gap-3 bg-red-600/10 text-red-400 border border-red-600/20 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 group ${sidebarOpen ? 'py-3 px-4' : 'py-3 px-2'}`}>
                        <span className="text-lg group-hover:rotate-12 transition-transform"><LogOut size={20} /></span>
                        {sidebarOpen && <span className="font-medium">Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-screen overflow-y-auto bg-fuchsia-50 relative">
                {/* Header/Top Bar could go here if needed, keeping simple for now */}
                <div className="max-w-7xl mx-auto p-8">
                    <div className="animate-fade-in-up">
                        {activeSection === 'dashboard' && <DashboardSection onNavigate={setActiveSection} />}
                        {activeSection === 'carousel' && <CarouselSection />}
                        {activeSection === 'about' && <AboutSection_ />}
                        {activeSection === 'history' && <HistorySection />}
                        {activeSection === 'services' && <ServicesSection />}
                        {activeSection === 'news' && <NewsSection />}
                        {activeSection === 'presidentBlog' && <PresidentBlogSection />}
                        {activeSection === 'team' && <TeamSection />}
                        {activeSection === 'friendship' && <FriendshipSection />}
                        {activeSection === 'joinNow' && <JoinNowSection />}
                    </div>
                </div>
            </main>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function DashboardSection({ onNavigate }: { onNavigate: (s: Section) => void }) {
    const [stats, setStats] = useState<DashboardStats>({ carousel: 0, services: 0, news: 0, about: 0, history: 0, team: 0, friendship: 0, presidentBlog: 0, joinNow: 0 })
    const [loading, setLoading] = useState(true)
    const [sendingReminders, setSendingReminders] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const endpoints = ['carousel', 'services', 'news', 'about', 'history', 'team', 'friendship', 'president-blog', 'join-now']
                const results = await Promise.all(
                    endpoints.map(ep => fetch(`/api/admin/${ep}`).then(r => r.json()).catch(() => ({ data: [] })))
                )
                setStats({
                    carousel: Array.isArray(results[0]?.data) ? results[0].data.length : 0,
                    services: Array.isArray(results[1]?.data) ? results[1].data.length : 0,
                    news: Array.isArray(results[2]?.data) ? results[2].data.length : 0,
                    about: Array.isArray(results[3]?.data) ? results[3].data.length : 0,
                    history: Array.isArray(results[4]?.data) ? results[4].data.length : 0,
                    team: Array.isArray(results[5]?.data) ? results[5].data.length : 0,
                    friendship: Array.isArray(results[6]?.data) ? results[6].data.length : 0,
                    presidentBlog: Array.isArray(results[7]?.data) ? results[7].data.length : 0,
                    joinNow: Array.isArray(results[8]?.data) ? results[8].data.length : 0,
                })
            } catch { /* ignore */ }
            setLoading(false)
        }
        load()
    }, [])

    const handleSendReminders = async () => {
        if (!confirm('Are you sure you want to send event reminders now? This will email all subscribers for events happening in 24h or 6h.')) return

        setSendingReminders(true)
        try {
            const res = await fetch('/api/admin/reminders', { method: 'POST' })
            const data = await res.json()
            if (data.success) {
                alert(`Reminders sent!\n24h Reminders: ${data.processed['24h']}\n6h Reminders: ${data.processed['6h']}`)
            } else {
                alert('Failed to send reminders: ' + (data.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Error sending reminders:', error)
            alert('Error sending reminders')
        }
        setSendingReminders(false)
    }

    const cards: { key: Exclude<Section, 'dashboard'>; label: string; gradient: string; icon: React.ReactNode; delay: string }[] = [
        { key: 'carousel', label: 'Carousel Images', gradient: 'from-orange-500 to-pink-500', icon: <ImageIcon size={40} />, delay: '0ms' },
        { key: 'services', label: 'Humanitarian', gradient: 'from-blue-500 to-cyan-500', icon: <HeartHandshake size={40} />, delay: '50ms' },
        { key: 'news', label: 'News & Events', gradient: 'from-green-500 to-emerald-500', icon: <Newspaper size={40} />, delay: '100ms' },
        { key: 'presidentBlog', label: "President's Blog", gradient: 'from-violet-500 to-purple-500', icon: <PenTool size={40} />, delay: '150ms' },
        { key: 'about', label: 'About Pages', gradient: 'from-indigo-500 to-blue-600', icon: <Info size={40} />, delay: '200ms' },
        { key: 'history', label: 'History Events', gradient: 'from-amber-500 to-orange-600', icon: <History size={40} />, delay: '250ms' },
        { key: 'team', label: 'Team Members', gradient: 'from-red-500 to-rose-600', icon: <Users size={40} />, delay: '300ms' },
        { key: 'friendship', label: 'Friendship Meets', gradient: 'from-teal-500 to-emerald-600', icon: <Globe size={40} />, delay: '350ms' },
        { key: 'joinNow', label: 'Join Now', gradient: 'from-lime-500 to-green-600', icon: <CheckCircle size={40} />, delay: '400ms' },
    ]
    return (
        <div>
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h2>
                    <p className="text-slate-500 mt-2 text-lg">Quick access to manage your website content.</p>
                </div>
                <button
                    onClick={handleSendReminders}
                    disabled={sendingReminders}
                    className="bg-fuchsia-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-fuchsia-700 transition flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Bell size={20} />
                    {sendingReminders ? 'Sending...' : 'Send Reminders Now'}
                </button>
            </div>

            {loading ? <p className="text-slate-500 animate-pulse">Loading statistics...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {cards.map(card => (
                        <button key={card.key} onClick={() => onNavigate(card.key)}
                            // Removed opacity-0 to ensure visibility even if animation fails
                            className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-slate-100 text-left overflow-hidden hover:-translate-y-1 animate-fade-in-up`}
                            style={{ animationDelay: card.delay }}>
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform duration-500`} />

                            <div className="relative z-10">
                                <span className="text-4xl mb-4 block filter drop-shadow-sm">{card.icon}</span>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
                                <p className="text-4xl font-black text-slate-800 mt-1 count-up">{stats[card.key]}</p>
                            </div>

                            <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r ${card.gradient} transition-all duration-500 ease-out`} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!open) return null
    return (
        <div className="fixed inset-0 bg-fuchsia-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto flex flex-col animate-scale-in border border-fuchsia-100">
                <div className="flex justify-between items-center p-6 border-b border-fuchsia-100 bg-fuchsia-50/50 sticky top-0 z-10 backdrop-blur-md">
                    <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-gradient-to-b from-fuchsia-500 to-pink-600 rounded-full inline-block"></span>
                        {title}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-fuchsia-600 hover:bg-fuchsia-100 p-2 rounded-full transition-all">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    )
}

function StatusMessage({ message, type }: { message: string; type: 'success' | 'error' }) {
    if (!message) return null
    return (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm border animate-slide-in-top ${type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-red-50 text-red-800 border-red-200'
            }`}>
            <span className="text-2xl">{type === 'success' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}</span>
            <p className="font-medium">{message}</p>
        </div>
    )
}

function SectionHeader({ title, onAdd, addLabel }: { title: string; onAdd?: () => void; addLabel?: string }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="relative">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h2>
                <div className="h-1 w-20 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full mt-2"></div>
            </div>
            {onAdd && (
                <button onClick={onAdd} className="bg-fuchsia-900 text-white px-6 py-3 rounded-xl hover:bg-fuchsia-800 transition-all shadow-lg shadow-fuchsia-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 font-medium">
                    <Plus size={20} /> {addLabel || 'Add New'}
                </button>
            )}
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAROUSEL SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function CarouselSection() {
    const [images, setImages] = useState<CarouselImage[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [msg, setMsg] = useState({ text: '', type: 'success' as 'success' | 'error' })
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ title: '', subtitle: '' })

    const fetchImages = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/carousel')
            const data = await res.json()
            if (data.success) setImages(data.data)
        } catch { /* ignore */ }
        setLoading(false)
    }, [])

    useEffect(() => {
        let isMounted = true
        if (isMounted) {
            fetchImages()
        }
        return () => { isMounted = false }
    }, [fetchImages])

    const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setUploading(true)
        const form = e.currentTarget
        const formData = new FormData(form)
        try {
            const res = await fetch('/api/admin/carousel', { method: 'POST', body: formData })
            const data = await res.json()
            if (data.success) {
                setMsg({ text: 'Image uploaded successfully!', type: 'success' })
                form.reset()
                fetchImages()
            } else {
                setMsg({ text: data.error || 'Upload failed', type: 'error' })
            }
        } catch { setMsg({ text: 'Upload failed', type: 'error' }) }
        setUploading(false)
    }

    const toggleField = async (id: string, field: string) => {
        try {
            await fetch('/api/admin/carousel', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, field }),
            })
            fetchImages()
        } catch { /* ignore */ }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return
        try {
            await fetch('/api/admin/carousel', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })
            setMsg({ text: 'Image deleted', type: 'success' })
            fetchImages()
        } catch { setMsg({ text: 'Delete failed', type: 'error' }) }
    }

    const startEdit = (img: CarouselImage) => {
        setEditingId(img.id)
        setEditForm({ title: img.title || '', subtitle: img.subtitle || '' })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditForm({ title: '', subtitle: '' })
    }

    const handleEdit = async (id: string) => {
        try {
            const res = await fetch('/api/admin/carousel', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, title: editForm.title, subtitle: editForm.subtitle }),
            })
            const data = await res.json()
            if (data.success) {
                setMsg({ text: 'Caption updated successfully!', type: 'success' })
                setEditingId(null)
                fetchImages()
            } else {
                setMsg({ text: data.error || 'Update failed', type: 'error' })
            }
        } catch { setMsg({ text: 'Update failed', type: 'error' }) }
    }

    return (
        <div className="space-y-8">
            <SectionHeader title="Home Carousel" />
            <StatusMessage message={msg.text} type={msg.type} />

            {/* Upload Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
                        <Upload size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Upload New Slide</h3>
                </div>
                <form onSubmit={handleUpload} className="space-y-6">
                    <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Image File *</label>
                        <input type="file" name="image" accept="image/*" required className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer" />
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <Info size={16} /> Recommended: 1920x1080px (16:9 ratio) for best display.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Heading (Optional)</label>
                            <input type="text" name="title" placeholder="e.g. Welcome to IPL" className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Subheading (Optional)</label>
                            <input type="text" name="subtitle" placeholder="e.g. Building Friendships Worldwide" className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm" />
                        </div>
                    </div>
                    <div className="flex items-center">
                        <label className="flex items-center gap-3 text-sm font-medium text-slate-700 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                            <input type="checkbox" name="hide_text" value="true" className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                            <span>Hide text overlay on this slide</span>
                        </label>
                    </div>
                    <button type="submit" disabled={uploading}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-indigo-200">
                        {uploading ? 'Processing...' : 'Upload Slide'}
                    </button>
                </form>
            </div>

            {/* Images Grid */}
            {loading ? <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {images.map(img => (
                        <div key={img.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="relative h-56 overflow-hidden">
                                <img src={img.image_url} alt="Carousel" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
                                    {!img.hide_text && (
                                        <>
                                            <h4 className="font-bold text-white text-lg leading-tight line-clamp-1">{img.title || 'Untitled Slide'}</h4>
                                            <p className="text-white/80 text-sm mt-1 line-clamp-1">{img.subtitle || 'No subtitle'}</p>
                                        </>
                                    )}
                                </div>
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm border ${img.active ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-slate-500/90 text-white border-slate-400'}`}>
                                        {img.active ? 'Active' : 'Hidden'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5">
                                {editingId === img.id ? (
                                    /* Edit Mode */
                                    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={editForm.title}
                                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subtitle</label>
                                            <input
                                                type="text"
                                                value={editForm.subtitle}
                                                onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                                                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button onClick={() => handleEdit(img.id)} className="flex-1 bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700">Save</button>
                                            <button onClick={cancelEdit} className="flex-1 bg-white border border-slate-300 text-slate-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-50">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Control Actions */
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => toggleField(img.id, 'active')}
                                                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${img.active
                                                    ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                                    }`}>
                                                {img.active ? 'Hide Slide' : 'Make Active'}
                                            </button>
                                            <button onClick={() => toggleField(img.id, 'hide_text')}
                                                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${img.hide_text
                                                    ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                                    }`}>
                                                {img.hide_text ? 'Show Text' : 'Hide Text'}
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEdit(img)}
                                                className="flex-1 bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-2 rounded-lg text-xs font-bold hover:bg-indigo-100 transition">
                                                Edit Content
                                            </button>
                                            <button onClick={() => handleDelete(img.id)}
                                                className="bg-white text-red-500 border border-red-100 px-3 py-2 rounded-lg hover:bg-red-50 transition">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {!loading && images.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-400 text-lg">No slides found. Upload your first image above!</p>
                </div>
            )}
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABOUT US SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function AboutSection_() {
    const [sections, setSections] = useState<AboutSection[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<AboutSection | null>(null)
    const [msg, setMsg] = useState({ text: '', type: 'success' as 'success' | 'error' })
    const [contentEn, setContentEn] = useState('')
    const [contentTa, setContentTa] = useState('')

    const fetchSections = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/about')
            const data = await res.json()
            if (data.success) setSections(data.data)
        } catch { /* ignore */ }
        setLoading(false)
    }, [])

    useEffect(() => {
        let isMounted = true
        if (isMounted) {
            fetchSections()
        }
        return () => { isMounted = false }
    }, [fetchSections])

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        const fd = new FormData(form)
        const body: any = Object.fromEntries(fd)
        body.content_en = contentEn
        body.content_ta = contentTa
        if (editing) body.id = editing.id

        try {
            const res = await fetch('/api/admin/about', {
                method: editing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()
            if (data.success) {
                setMsg({ text: editing ? 'Section updated!' : 'Section added!', type: 'success' })
                setShowModal(false)
                setEditing(null)
                fetchSections()
            } else {
                setMsg({ text: data.error || 'Failed', type: 'error' })
            }
        } catch { setMsg({ text: 'Failed', type: 'error' }) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this section?')) return
        try {
            const res = await fetch('/api/admin/about', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })
            const data = await res.json()
            if (data.success) {
                setMsg({ text: 'Section deleted', type: 'success' })
                fetchSections()
            } else {
                setMsg({ text: data.error || 'Failed', type: 'error' })
            }
        } catch { setMsg({ text: 'Failed', type: 'error' }) }
    }

    return (
        <div>
            <SectionHeader title="About Us" onAdd={() => { setEditing(null); setContentEn(''); setContentTa(''); setShowModal(true) }} addLabel="Add Section" />
            <StatusMessage message={msg.text} type={msg.type} />

            {loading ? <p className="text-gray-500">Loading...</p> : (
                <div className="space-y-4">
                    {sections.map(s => (
                        <div key={s.id} className="bg-white rounded-xl shadow p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">{s.section_title_en}</h3>
                                        {s.section_title_ta && <span className="text-sm text-gray-500">| {s.section_title_ta}</span>}
                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">Order: {s.order_index}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2">{s.content_en?.replace(/<[^>]*>/g, '').substring(0, 200)}...</p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button onClick={() => { setEditing(s); setContentEn(s.content_en || ''); setContentTa(s.content_ta || ''); setShowModal(true) }}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">Edit</button>
                                    {s.is_deletable && (
                                        <button onClick={() => handleDelete(s.id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition">Delete</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {sections.length === 0 && <p className="text-gray-500 text-center py-8">No sections yet.</p>}
                </div>
            )}

            <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null) }} title={editing ? 'Edit Section' : 'Add Section'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-1">Paragraph Title (English) - Optional</label>
                            <input name="section_title_en" defaultValue={editing?.section_title_en} className="w-full border rounded-lg p-2.5" /></div>
                        <div><label className="block text-sm font-medium mb-1">Title (Tamil)</label>
                            <input name="section_title_ta" defaultValue={editing?.section_title_ta} className="w-full border rounded-lg p-2.5" /></div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Paragraph Content (English) *</label>
                        <RichTextEditor
                            value={contentEn}
                            onChange={setContentEn}
                            placeholder="Write paragraph content in English..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Paragraph Content (Tamil)</label>
                        <RichTextEditor
                            value={contentTa}
                            onChange={setContentTa}
                            placeholder="Write paragraph content in Tamil..."
                        />
                    </div>
                    <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold transition">
                        {editing ? 'Update Section' : 'Add Section'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICES SECTION (Image + bilingual + location + rich text)
// ═══════════════════════════════════════════════════════════════════════════════
function ServicesSection() {
    const [items, setItems] = useState<ServiceItem[]>([])
    const [filteredItems, setFilteredItems] = useState<ServiceItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<ServiceItem | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [msg, setMsg] = useState({ text: '', type: 'success' as 'success' | 'error' })

    // Form state for cascading dropdowns
    const [formData, setFormData] = useState({
        title_en: '',
        title_ta: '',
        country: '',
        state: '',
        district: '',
        city: '',
        date: '',
        description_en: '',
        description_ta: '',
    })

    // Custom location state
    const [customCountries, setCustomCountries] = useState<string[]>([])
    const [customStates, setCustomStates] = useState<string[]>([])
    const [customDistricts, setCustomDistricts] = useState<string[]>([])
    const [customCities, setCustomCities] = useState<string[]>([])
    const [showCountryInput, setShowCountryInput] = useState(false)
    const [showStateInput, setShowStateInput] = useState(false)
    const [showDistrictInput, setShowDistrictInput] = useState(false)
    const [showCityInput, setShowCityInput] = useState(false)
    const [customCountryInput, setCustomCountryInput] = useState('')
    const [customStateInput, setCustomStateInput] = useState('')
    const [customDistrictInput, setCustomDistrictInput] = useState('')
    const [customCityInput, setCustomCityInput] = useState('')

    // Filter state
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCountry, setFilterCountry] = useState('')
    const [filterState, setFilterState] = useState('')
    const [filterDate, setFilterDate] = useState('')

    // Image preview state
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const fetchItems = useCallback(async () => {
        try {
            const params = new URLSearchParams()
            if (searchTerm) params.append('search', searchTerm)
            if (filterCountry) params.append('country', filterCountry)
            if (filterState) params.append('state', filterState)
            if (filterDate) params.append('date', filterDate)

            const res = await fetch(`/api/admin/services?${params.toString()}`)
            const data = await res.json()
            if (data.success) {
                setItems(data.data)
                setFilteredItems(data.data)
            }
        } catch { /* ignore */ }
        setLoading(false)
    }, [searchTerm, filterCountry, filterState, filterDate])

    useEffect(() => {
        let isMounted = true
        if (isMounted) {
            fetchItems()
        }
        return () => { isMounted = false }
    }, [fetchItems])


    // Load custom locations from MongoDB (shared across all admins)
    const fetchCustomLocations = useCallback(async () => {
        try {
            // Fetch all custom location types in parallel
            const [countriesRes, statesRes, districtsRes, citiesRes] = await Promise.all([
                fetch('/api/admin/custom-locations?type=country'),
                fetch('/api/admin/custom-locations?type=state'),
                fetch('/api/admin/custom-locations?type=district'),
                fetch('/api/admin/custom-locations?type=city')
            ])

            const [countriesData, statesData, districtsData, citiesData] = await Promise.all([
                countriesRes.json(),
                statesRes.json(),
                districtsRes.json(),
                citiesRes.json()
            ])

            if (countriesData.success) setCustomCountries(countriesData.locations)
            if (statesData.success) setCustomStates(statesData.locations)
            if (districtsData.success) setCustomDistricts(districtsData.locations)
            if (citiesData.success) setCustomCities(citiesData.locations)
        } catch (error) {
            console.error('Failed to fetch custom locations:', error)
        }
    }, [])

    useEffect(() => {
        let isMounted = true
        if (isMounted) {
            fetchCustomLocations()
        }
        return () => { isMounted = false }
    }, [])

    const openAddModal = () => {
        setEditing(null)
        setImagePreview(null)
        setFormData({
            title_en: '',
            title_ta: '',
            country: '',
            state: '',
            district: '',
            city: '',
            date: '',
            description_en: '',
            description_ta: '',
        })
        setShowCountryInput(false)
        setShowStateInput(false)
        setShowDistrictInput(false)
        setShowCityInput(false)
        setCustomCountryInput('')
        setCustomStateInput('')
        setCustomDistrictInput('')
        setCustomCityInput('')
        setShowModal(true)
    }

    const openEditModal = (item: ServiceItem) => {
        setEditing(item)
        setImagePreview(null)
        setFormData({
            title_en: item.title_en,
            title_ta: item.title_ta,
            country: item.country,
            state: item.state,
            district: item.district,
            city: item.city,
            date: item.date,
            description_en: item.description_en,
            description_ta: item.description_ta,
        })
        setShowCountryInput(false)
        setShowStateInput(false)
        setShowDistrictInput(false)
        setShowCityInput(false)
        setCustomCountryInput('')
        setCustomStateInput('')
        setCustomDistrictInput('')
        setCustomCityInput('')
        setShowModal(true)
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)

        // Capture file input BEFORE async operations
        const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement
        const imageFile = fileInput?.files?.[0]

        // Handle custom country
        let finalCountry = formData.country
        if (showCountryInput && customCountryInput.trim()) {
            finalCountry = customCountryInput.trim()
            if (!customCountries.includes(finalCountry)) {
                try {
                    // Save to MongoDB
                    await fetch('/api/admin/custom-locations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'country',
                            name: finalCountry,
                            parent: {}
                        })
                    })
                    // Update local state
                    setCustomCountries([...customCountries, finalCountry])
                } catch (error) {
                    console.error('Failed to save custom country:', error)
                }
            }
        }

        // Handle custom state
        let finalState = formData.state
        if (showStateInput && customStateInput.trim()) {
            finalState = customStateInput.trim()
            if (!customStates.includes(finalState)) {
                try {
                    // Save to MongoDB
                    await fetch('/api/admin/custom-locations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'state',
                            name: finalState,
                            parent: { country: finalCountry }
                        })
                    })
                    // Update local state
                    setCustomStates([...customStates, finalState])
                } catch (error) {
                    console.error('Failed to save custom state:', error)
                }
            }
        }

        // Handle custom district
        let finalDistrict = formData.district
        if (showDistrictInput && customDistrictInput.trim()) {
            finalDistrict = customDistrictInput.trim()
            if (!customDistricts.includes(finalDistrict)) {
                try {
                    // Save to MongoDB
                    await fetch('/api/admin/custom-locations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'district',
                            name: finalDistrict,
                            parent: { country: finalCountry, state: finalState }
                        })
                    })
                    // Update local state
                    setCustomDistricts([...customDistricts, finalDistrict])
                } catch (error) {
                    console.error('Failed to save custom district:', error)
                }
            }
        }

        // Handle custom city
        let finalCity = formData.city
        if (showCityInput && customCityInput.trim()) {
            finalCity = customCityInput.trim()
            if (!customCities.includes(finalCity)) {
                try {
                    // Save to MongoDB
                    await fetch('/api/admin/custom-locations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'city',
                            name: finalCity,
                            parent: { country: finalCountry, state: finalState, district: finalDistrict }
                        })
                    })
                    // Update local state
                    setCustomCities([...customCities, finalCity])
                } catch (error) {
                    console.error('Failed to save custom city:', error)
                }
            }
        }

        const submitData = new FormData()

        Object.entries({ ...formData, country: finalCountry, state: finalState, district: finalDistrict, city: finalCity }).forEach(([key, value]) => {
            submitData.append(key, value)
        })

        if (imageFile) {
            submitData.append('image', imageFile)
        }

        if (editing) submitData.append('id', editing.id)

        try {
            const res = await fetch('/api/admin/services', { method: editing ? 'PUT' : 'POST', body: submitData })
            const data = await res.json()
            if (data.success) {
                setMsg({ text: editing ? 'Service updated!' : 'Service added!', type: 'success' })
                setShowModal(false)
                setEditing(null)
                fetchItems()
            } else {
                setMsg({ text: data.error || 'Failed', type: 'error' })
            }
        } catch { setMsg({ text: 'Failed', type: 'error' }) }
        setSubmitting(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this service?')) return
        try {
            await fetch('/api/admin/services', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })
            setMsg({ text: 'Service deleted', type: 'success' })
            fetchItems()
        } catch { setMsg({ text: 'Delete failed', type: 'error' }) }
    }

    // Cascading dropdown options with custom locations
    const baseCountries = getCountries()
    const availableCountries = [...baseCountries, ...customCountries]
    const baseStates = formData.country && !showCountryInput ? getStates(formData.country) : []
    const availableStates = [...baseStates, ...customStates]
    const baseDistricts = formData.country && formData.state && !showCountryInput && !showStateInput ? getDistricts(formData.country, formData.state) : []
    const availableDistricts = [...baseDistricts, ...customDistricts]
    const baseCities = formData.country && formData.state && !showCountryInput && !showStateInput && !showDistrictInput ? getCities(formData.country, formData.state, formData.district || undefined) : []
    const availableCities = [...baseCities, ...customCities]

    return (
        <div>
            <SectionHeader title="Humanitarian Services" onAdd={openAddModal} addLabel="Add Service" />
            <StatusMessage message={msg.text} type={msg.type} />

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border rounded-lg px-4 py-2"
                    />
                    <select
                        value={filterCountry}
                        onChange={(e) => { setFilterCountry(e.target.value); setFilterState('') }}
                        className="border rounded-lg px-4 py-2"
                    >
                        <option value="">All Countries</option>
                        {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                        value={filterState}
                        onChange={(e) => setFilterState(e.target.value)}
                        className="border rounded-lg px-4 py-2"
                        disabled={!filterCountry}
                    >
                        <option value="">All States</option>
                        {filterCountry && getStates(filterCountry).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input
                        type="month"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="border rounded-lg px-4 py-2"
                        placeholder="Filter by date"
                    />
                </div>
            </div>

            {loading ? <p className="text-gray-500">Loading...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                        <div key={item.id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition relative">
                            {new Date(item.date) >= new Date(new Date().setHours(0, 0, 0, 0)) && (
                                <div className="absolute top-2 right-2 z-10 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                    UPCOMING
                                </div>
                            )}
                            <img src={item.image_url} alt={item.title_en} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 mb-1">{item.title_en}</h3>
                                {item.title_ta && <p className="text-sm text-gray-500 mb-2">{item.title_ta}</p>}
                                <p className="text-xs text-gray-400 mb-1">📍 {[item.city, item.district, item.state, item.country].filter(Boolean).join(', ')}</p>
                                <p className="text-xs text-gray-400 mb-3">📅 {item.date}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(item)}
                                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs hover:bg-blue-700 transition">Edit</button>
                                    <button onClick={() => handleDelete(item.id)}
                                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-xs hover:bg-red-700 transition">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && <p className="text-gray-500 text-center py-8 col-span-3">No services found.</p>}
                </div>
            )}

            <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null); setImagePreview(null) }} title={editing ? 'Edit Service' : 'Add Service'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title (English) *</label>
                            <input
                                value={formData.title_en}
                                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                                required
                                className="w-full border rounded-lg p-2.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Title (Tamil)</label>
                            <input
                                value={formData.title_ta}
                                onChange={(e) => setFormData({ ...formData, title_ta: e.target.value })}
                                className="w-full border rounded-lg p-2.5"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Country</label>
                            {!showCountryInput ? (
                                <select
                                    value={formData.country}
                                    onChange={(e) => {
                                        if (e.target.value === '__other__') {
                                            setShowCountryInput(true)
                                            setFormData({ ...formData, country: '', state: '', district: '', city: '' })
                                        } else {
                                            setFormData({ ...formData, country: e.target.value, state: '', district: '', city: '' })
                                        }
                                    }}
                                    className="w-full border rounded-lg p-2.5"
                                >
                                    <option value="">Select Country</option>
                                    {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
                                    <option value="__other__" className="font-semibold text-blue-600">+ Others (Type Custom)</option>
                                </select>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customCountryInput}
                                        onChange={(e) => setCustomCountryInput(e.target.value)}
                                        placeholder="Enter country name"
                                        className="flex-1 border rounded-lg p-2.5"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCountryInput(false)
                                            setCustomCountryInput('')
                                        }}
                                        className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">State</label>
                            {!showStateInput ? (
                                <select
                                    value={formData.state}
                                    onChange={(e) => {
                                        if (e.target.value === '__other__') {
                                            setShowStateInput(true)
                                            setFormData({ ...formData, state: '', district: '', city: '' })
                                        } else {
                                            setFormData({ ...formData, state: e.target.value, district: '', city: '' })
                                        }
                                    }}
                                    disabled={!formData.country && !showCountryInput}
                                    className="w-full border rounded-lg p-2.5 disabled:bg-gray-100"
                                >
                                    <option value="">Select State</option>
                                    {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                                    <option value="__other__" className="font-semibold text-blue-600">+ Others (Type Custom)</option>
                                </select>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customStateInput}
                                        onChange={(e) => setCustomStateInput(e.target.value)}
                                        placeholder="Enter state/province name"
                                        className="flex-1 border rounded-lg p-2.5"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowStateInput(false)
                                            setCustomStateInput('')
                                        }}
                                        className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">District</label>
                            {!showDistrictInput ? (
                                <select
                                    value={formData.district}
                                    onChange={(e) => {
                                        if (e.target.value === '__other__') {
                                            setShowDistrictInput(true)
                                            setFormData({ ...formData, district: '', city: '' })
                                        } else {
                                            setFormData({ ...formData, district: e.target.value, city: '' })
                                        }
                                    }}
                                    disabled={!formData.state && !showStateInput}
                                    className="w-full border rounded-lg p-2.5 disabled:bg-gray-100"
                                >
                                    <option value="">Select District</option>
                                    {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                    <option value="__other__" className="font-semibold text-blue-600">+ Others (Type Custom)</option>
                                </select>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customDistrictInput}
                                        onChange={(e) => setCustomDistrictInput(e.target.value)}
                                        placeholder="Enter district name"
                                        className="flex-1 border rounded-lg p-2.5"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDistrictInput(false)
                                            setCustomDistrictInput('')
                                        }}
                                        className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">City</label>
                            {!showCityInput ? (
                                <select
                                    value={formData.city}
                                    onChange={(e) => {
                                        if (e.target.value === '__other__') {
                                            setShowCityInput(true)
                                            setFormData({ ...formData, city: '' })
                                        } else {
                                            setFormData({ ...formData, city: e.target.value })
                                        }
                                    }}
                                    disabled={!formData.state && !showStateInput}
                                    className="w-full border rounded-lg p-2.5 disabled:bg-gray-100"
                                >
                                    <option value="">Select City</option>
                                    {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                                    <option value="__other__" className="font-semibold text-blue-600">+ Others (Type Custom)</option>
                                </select>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customCityInput}
                                        onChange={(e) => setCustomCityInput(e.target.value)}
                                        placeholder="Enter city name"
                                        className="flex-1 border rounded-lg p-2.5"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCityInput(false)
                                            setCustomCityInput('')
                                        }}
                                        className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                            Event Date *
                            <span className="text-xs text-gray-500 ml-2">(When did this activity happen?)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                                className="w-full border-2 border-gray-300 rounded-lg p-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                placeholder="DD/MM/YYYY"
                            />
                            {!formData.date && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-sm">
                                    📅 Select Date
                                </div>
                            )}
                        </div>
                        {formData.date && (
                            <p className="text-xs text-green-600 mt-1">
                                ✓ Selected: {new Date(formData.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description (English)</label>
                        <RichTextEditor
                            value={formData.description_en}
                            onChange={(value) => setFormData({ ...formData, description_en: value })}
                            placeholder="Enter detailed description in English..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description (Tamil)</label>
                        <RichTextEditor
                            value={formData.description_ta}
                            onChange={(value) => setFormData({ ...formData, description_ta: value })}
                            placeholder="Enter detailed description in Tamil..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Image {editing ? '(leave empty to keep current)' : '*'}</label>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            {...(!editing && { required: true })}
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    const reader = new FileReader()
                                    reader.onloadend = () => {
                                        setImagePreview(reader.result as string)
                                    }
                                    reader.readAsDataURL(file)
                                }
                            }}
                            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                                <div className="relative group">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null)
                                            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
                                            if (fileInput) fileInput.value = ''
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Show current image for editing */}
                        {editing?.image_url && !imagePreview && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Current Image:</p>
                                <img src={editing.image_url} alt="Current" className="w-full h-48 object-cover rounded-lg border-2 border-gray-200" />
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={submitting}
                        className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold transition disabled:opacity-50">
                        {submitting ? 'Saving...' : editing ? 'Update Service' : 'Add Service'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEWS & EVENTS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function NewsSection() {
    const [items, setItems] = useState<NewsItem[]>([])
    const [filteredItems, setFilteredItems] = useState<NewsItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<NewsItem | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [msg, setMsg] = useState({ text: '', type: 'success' as 'success' | 'error' })

    // Form state for cascading dropdowns
    const [formData, setFormData] = useState({
        title_en: '',
        title_ta: '',
        country: '',
        state: '',
        district: '',
        city: '',
        date: '',
        time: '',
        description_en: '',
        description_ta: '',
    })

    // Custom location state
    const [customCountries, setCustomCountries] = useState<string[]>([])
    const [customStates, setCustomStates] = useState<string[]>([])
    const [customDistricts, setCustomDistricts] = useState<string[]>([])
    const [customCities, setCustomCities] = useState<string[]>([])
    const [showCountryInput, setShowCountryInput] = useState(false)
    const [showStateInput, setShowStateInput] = useState(false)
    const [showDistrictInput, setShowDistrictInput] = useState(false)
    const [showCityInput, setShowCityInput] = useState(false)
    const [customCountryInput, setCustomCountryInput] = useState('')
    const [customStateInput, setCustomStateInput] = useState('')
    const [customDistrictInput, setCustomDistrictInput] = useState('')
    const [customCityInput, setCustomCityInput] = useState('')

    // Image preview state
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const fetchItems = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/news')
            const data = await res.json()
            if (data.success) {
                setItems(data.data)
                setFilteredItems(data.data)
            }
        } catch { /* ignore */ }
        setLoading(false)
    }, [])

    useEffect(() => {
        let isMounted = true
        if (isMounted) {
            fetchItems()
        }
        return () => { isMounted = false }
    }, [fetchItems])


    // Load custom locations from MongoDB
    const fetchCustomLocations = useCallback(async () => {
        try {
            const [countriesRes, statesRes, districtsRes, citiesRes] = await Promise.all([
                fetch('/api/admin/custom-locations?type=country'),
                fetch('/api/admin/custom-locations?type=state'),
                fetch('/api/admin/custom-locations?type=district'),
                fetch('/api/admin/custom-locations?type=city')
            ])

            const [countriesData, statesData, districtsData, citiesData] = await Promise.all([
                countriesRes.json(),
                statesRes.json(),
                districtsRes.json(),
                citiesRes.json()
            ])

            if (countriesData.success) setCustomCountries(countriesData.locations)
            if (statesData.success) setCustomStates(statesData.locations)
            if (districtsData.success) setCustomDistricts(districtsData.locations)
            if (citiesData.success) setCustomCities(citiesData.locations)
        } catch (error) {
            console.error('Failed to fetch custom locations:', error)
        }
    }, [])

    useEffect(() => {
        let isMounted = true
        if (isMounted) {
            fetchCustomLocations()
        }
        return () => { isMounted = false }
    }, [fetchCustomLocations])


    const openAddModal = () => {
        setEditing(null)
        setImagePreview(null)
        setFormData({
            title_en: '',
            title_ta: '',
            country: '',
            state: '',
            district: '',
            city: '',
            date: '',
            time: '',
            description_en: '',
            description_ta: '',
        })
        setShowCountryInput(false)
        setShowStateInput(false)
        setShowDistrictInput(false)
        setShowCityInput(false)
        setCustomCountryInput('')
        setCustomStateInput('')
        setCustomDistrictInput('')
        setCustomCityInput('')
        setShowModal(true)
    }

    const openEditModal = (item: NewsItem) => {
        setEditing(item)
        setImagePreview(null)
        setFormData({
            title_en: item.title_en,
            title_ta: item.title_ta,
            country: item.country,
            state: item.state,
            district: item.district,
            city: item.city,
            date: item.date,
            time: item.time,
            description_en: item.description_en,
            description_ta: item.description_ta,
        })
        setShowCountryInput(false)
        setShowStateInput(false)
        setShowDistrictInput(false)
        setShowCityInput(false)
        setCustomCountryInput('')
        setCustomStateInput('')
        setCustomDistrictInput('')
        setCustomCityInput('')
        setShowModal(true)
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)

        // Capture file input BEFORE async operations (React synthetic events are pooled)
        const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement
        const imageFile = fileInput?.files?.[0]

        // Handle custom locations (same as Services)
        let finalCountry = formData.country
        if (showCountryInput && customCountryInput.trim()) {
            finalCountry = customCountryInput.trim()
            if (!customCountries.includes(finalCountry)) {
                try {
                    await fetch('/api/admin/custom-locations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'country', name: finalCountry, parent: {} })
                    })
                    setCustomCountries([...customCountries, finalCountry])
                } catch (error) {
                    console.error('Failed to save custom country:', error)
                }
            }
        }

        let finalState = formData.state
        if (showStateInput && customStateInput.trim()) {
            finalState = customStateInput.trim()
            if (!customStates.includes(finalState)) {
                try {
                    await fetch('/api/admin/custom-locations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'state', name: finalState, parent: { country: finalCountry } })
                    })
                    setCustomStates([...customStates, finalState])
                } catch (error) {
                    console.error('Failed to save custom state:', error)
                }
            }
        }

        let finalDistrict = formData.district
        if (showDistrictInput && customDistrictInput.trim()) {
            finalDistrict = customDistrictInput.trim()
            if (!customDistricts.includes(finalDistrict)) {
                try {
                    await fetch('/api/admin/custom-locations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'district', name: finalDistrict, parent: { country: finalCountry, state: finalState } })
                    })
                    setCustomDistricts([...customDistricts, finalDistrict])
                } catch (error) {
                    console.error('Failed to save custom district:', error)
                }
            }
        }

        let finalCity = formData.city
        if (showCityInput && customCityInput.trim()) {
            finalCity = customCityInput.trim()
            if (!customCities.includes(finalCity)) {
                try {
                    await fetch('/api/admin/custom-locations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'city', name: finalCity, parent: { country: finalCountry, state: finalState, district: finalDistrict } })
                    })
                    setCustomCities([...customCities, finalCity])
                } catch (error) {
                    console.error('Failed to save custom city:', error)
                }
            }
        }

        const submitData = new FormData()

        Object.entries({ ...formData, country: finalCountry, state: finalState, district: finalDistrict, city: finalCity }).forEach(([key, value]) => {
            submitData.append(key, value)
        })

        if (imageFile) {
            submitData.append('image', imageFile)
        }

        if (editing) submitData.append('id', editing.id)

        try {
            const res = await fetch('/api/admin/news', { method: editing ? 'PUT' : 'POST', body: submitData })
            const data = await res.json()
            if (data.success) {
                setMsg({ text: editing ? 'Event updated!' : 'Event added!', type: 'success' })
                setShowModal(false)
                setEditing(null)
                fetchItems()
            } else {
                setMsg({ text: data.error || 'Failed', type: 'error' })
            }
        } catch { setMsg({ text: 'Failed', type: 'error' }) }
        setSubmitting(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this event?')) return
        try {
            await fetch('/api/admin/news', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })
            setMsg({ text: 'Event deleted', type: 'success' })
            fetchItems()
        } catch { setMsg({ text: 'Delete failed', type: 'error' }) }
    }

    // Cascading dropdown logic
    const baseCountries = getCountries()
    const availableCountries = [...baseCountries, ...customCountries]

    const baseStates = !showCountryInput && formData.country ? getStates(formData.country) : []
    const availableStates = [...baseStates, ...customStates]

    const baseDistricts = !showCountryInput && !showStateInput && formData.country && formData.state ? getDistricts(formData.country, formData.state) : []
    const availableDistricts = [...baseDistricts, ...customDistricts]

    const baseCities = !showCountryInput && !showStateInput && !showDistrictInput && formData.country && formData.state ? getCities(formData.country, formData.state, formData.district || undefined) : []
    const availableCities = [...baseCities, ...customCities]

    return (
        <div>
            <SectionHeader title="News & Events" onAdd={openAddModal} addLabel="Add Event" />
            <StatusMessage message={msg.text} type={msg.type} />

            {loading ? <p className="text-gray-500">Loading...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => {
                        const eventDateTime = new Date(`${item.date}T${item.time || '00:00'}`)
                        const isUpcoming = eventDateTime > new Date()

                        return (
                            <div key={item.id} className="bg-white rounded-xl shadow overflow-hidden relative">
                                {isUpcoming && (
                                    <div className="absolute top-2 right-2 z-10 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                        UPCOMING
                                    </div>
                                )}
                                <img src={item.image_url} alt={item.title_en} className="w-full h-48 object-cover" />
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 mb-1">{item.title_en}</h3>
                                    {item.title_ta && <p className="text-sm text-gray-500 mb-2">{item.title_ta}</p>}
                                    <p className="text-xs text-gray-400 mb-1">📍 {[item.city, item.district, item.state, item.country].filter(Boolean).join(', ')}</p>
                                    <p className="text-xs text-gray-400 mb-3">
                                        📅 {item.date} {item.time && `⏰ ${item.time}`}
                                    </p>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEditModal(item)}
                                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs hover:bg-blue-700 transition">Edit</button>
                                        <button onClick={() => handleDelete(item.id)}
                                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-xs hover:bg-red-700 transition">Delete</button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    {filteredItems.length === 0 && <p className="text-gray-500 text-center py-8 col-span-3">No events yet.</p>}
                </div>
            )}

            <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null); setImagePreview(null) }} title={editing ? 'Edit Event' : 'Add Event'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title (English) *</label>
                            <input
                                value={formData.title_en}
                                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                                required
                                className="w-full border rounded-lg p-2.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Title (Tamil)</label>
                            <input
                                value={formData.title_ta}
                                onChange={(e) => setFormData({ ...formData, title_ta: e.target.value })}
                                className="w-full border rounded-lg p-2.5"
                            />
                        </div>
                    </div>

                    {/* LOCATION FIELDS */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Country *</label>
                            {!showCountryInput ? (
                                <select
                                    value={formData.country}
                                    onChange={(e) => {
                                        if (e.target.value === '__other__') {
                                            setShowCountryInput(true)
                                            setFormData({ ...formData, country: '', state: '', district: '', city: '' })
                                        } else {
                                            setFormData({ ...formData, country: e.target.value, state: '', district: '', city: '' })
                                        }
                                    }}
                                    required
                                    className="w-full border rounded-lg p-2.5"
                                >
                                    <option value="">Select Country</option>
                                    {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
                                    <option value="__other__" className="font-semibold text-blue-600">+ Others (Type Custom)</option>
                                </select>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customCountryInput}
                                        onChange={(e) => setCustomCountryInput(e.target.value)}
                                        placeholder="Enter country name"
                                        className="flex-1 border rounded-lg p-2.5"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCountryInput(false)
                                            setCustomCountryInput('')
                                        }}
                                        className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">State *</label>
                            {!showStateInput ? (
                                <select
                                    value={formData.state}
                                    onChange={(e) => {
                                        if (e.target.value === '__other__') {
                                            setShowStateInput(true)
                                            setFormData({ ...formData, state: '', district: '', city: '' })
                                        } else {
                                            setFormData({ ...formData, state: e.target.value, district: '', city: '' })
                                        }
                                    }}
                                    required
                                    disabled={!formData.country && !showCountryInput}
                                    className="w-full border rounded-lg p-2.5 disabled:bg-gray-100"
                                >
                                    <option value="">Select State</option>
                                    {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                                    <option value="__other__" className="font-semibold text-blue-600">+ Others (Type Custom)</option>
                                </select>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customStateInput}
                                        onChange={(e) => setCustomStateInput(e.target.value)}
                                        placeholder="Enter state/province name"
                                        className="flex-1 border rounded-lg p-2.5"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowStateInput(false)
                                            setCustomStateInput('')
                                        }}
                                        className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">District</label>
                            {!showDistrictInput ? (
                                <select
                                    value={formData.district}
                                    onChange={(e) => {
                                        if (e.target.value === '__other__') {
                                            setShowDistrictInput(true)
                                            setFormData({ ...formData, district: '', city: '' })
                                        } else {
                                            setFormData({ ...formData, district: e.target.value, city: '' })
                                        }
                                    }}
                                    disabled={!formData.state && !showStateInput}
                                    className="w-full border rounded-lg p-2.5 disabled:bg-gray-100"
                                >
                                    <option value="">Select District</option>
                                    {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                    <option value="__other__" className="font-semibold text-blue-600">+ Others (Type Custom)</option>
                                </select>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customDistrictInput}
                                        onChange={(e) => setCustomDistrictInput(e.target.value)}
                                        placeholder="Enter district name"
                                        className="flex-1 border rounded-lg p-2.5"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDistrictInput(false)
                                            setCustomDistrictInput('')
                                        }}
                                        className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">City</label>
                            {!showCityInput ? (
                                <select
                                    value={formData.city}
                                    onChange={(e) => {
                                        if (e.target.value === '__other__') {
                                            setShowCityInput(true)
                                            setFormData({ ...formData, city: '' })
                                        } else {
                                            setFormData({ ...formData, city: e.target.value })
                                        }
                                    }}
                                    disabled={!formData.state && !showStateInput}
                                    className="w-full border rounded-lg p-2.5 disabled:bg-gray-100"
                                >
                                    <option value="">Select City</option>
                                    {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                                    <option value="__other__" className="font-semibold text-blue-600">+ Others (Type Custom)</option>
                                </select>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customCityInput}
                                        onChange={(e) => setCustomCityInput(e.target.value)}
                                        placeholder="Enter city name"
                                        className="flex-1 border rounded-lg p-2.5"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCityInput(false)
                                            setCustomCityInput('')
                                        }}
                                        className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                                Event Date *
                                <span className="text-xs text-gray-500 ml-2">(When is/was this event?)</span>
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                                Event Time
                                <span className="text-xs text-gray-500 ml-2">(Optional)</span>
                            </label>
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description (English) *</label>
                        <RichTextEditor
                            value={formData.description_en}
                            onChange={(value) => setFormData({ ...formData, description_en: value })}
                            placeholder="Enter detailed description in English..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description (Tamil)</label>
                        <RichTextEditor
                            value={formData.description_ta}
                            onChange={(value) => setFormData({ ...formData, description_ta: value })}
                            placeholder="Enter detailed description in Tamil..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Image {editing ? '(leave empty to keep current)' : '*'}</label>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            {...(!editing && { required: true })}
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    const reader = new FileReader()
                                    reader.onloadend = () => {
                                        setImagePreview(reader.result as string)
                                    }
                                    reader.readAsDataURL(file)
                                }
                            }}
                            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />

                        {imagePreview && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                                <div className="relative group">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null)
                                            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
                                            if (fileInput) fileInput.value = ''
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}

                        {editing?.image_url && !imagePreview && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Current Image:</p>
                                <img src={editing.image_url} alt="Current" className="w-full h-48 object-cover rounded-lg border-2 border-gray-200" />
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={submitting}
                        className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold transition disabled:opacity-50">
                        {submitting ? 'Saving...' : editing ? 'Update Event' : 'Add Event'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEAM SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function TeamSection() {
    const [members, setMembers] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<TeamMember | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [msg, setMsg] = useState({ text: '', type: 'success' as 'success' | 'error' })
    const [roleHierarchy, setRoleHierarchy] = useState<any[]>([])
    const [migrationStatus, setMigrationStatus] = useState<any>(null)
    const [showMigrationModal, setShowMigrationModal] = useState(false)

    // Dynamic roles from DB
    const [roles, setRoles] = useState<{ id: string; name: string; level: number }[]>([])
    const [showRoleModal, setShowRoleModal] = useState(false)
    const [editingRole, setEditingRole] = useState<{ id: string; name: string; level: number } | null>(null)
    const [roleFormName, setRoleFormName] = useState('')
    const [roleFormLevel, setRoleFormLevel] = useState(1)
    const [roleSubmitting, setRoleSubmitting] = useState(false)
    const [draggedRoleId, setDraggedRoleId] = useState<string | null>(null)
    const [showConflictPopup, setShowConflictPopup] = useState(false)
    const [conflictRoles, setConflictRoles] = useState<string[]>([])
    const [draggedMemberId, setDraggedMemberId] = useState<string | null>(null)

    // Member Drag and Drop Handlers
    const handleMemberDragStart = (id: string) => {
        setDraggedMemberId(id)
    }

    const handleMemberDragEnter = (targetId: string) => {
        if (!draggedMemberId || draggedMemberId === targetId) return

        const draggedIndex = members.findIndex(m => m.id === draggedMemberId)
        const targetIndex = members.findIndex(m => m.id === targetId)

        if (draggedIndex === -1 || targetIndex === -1) return

        // Create new array and swap
        const newMembers = [...members]
        const [removed] = newMembers.splice(draggedIndex, 1)
        newMembers.splice(targetIndex, 0, removed)

        setMembers(newMembers)
    }

    const handleMemberDragEnd = async () => {
        setDraggedMemberId(null)
        // Save new order to backend
        try {
            await fetch('/api/admin/team', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderedIds: members.map(m => m.id) })
            })
            // Optional: Show success toast lightly? 
            // setMsg({ text: 'Order saved', type: 'success' }) // Might be too annoying
        } catch {
            setMsg({ text: 'Failed to save order', type: 'error' })
        }
    }

    const fetchRoles = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/team/roles')
            const data = await res.json()
            if (data.success) setRoles(data.data)
        } catch { /* ignore */ }
    }, [])

    const fetchMembers = useCallback(async () => {
        try {
            const [membersRes, migrationRes] = await Promise.all([
                fetch('/api/admin/team'),
                fetch('/api/admin/team/migrate')
            ])

            const membersData = await membersRes.json()
            const migrationData = await migrationRes.json()

            if (membersData.success) setMembers(membersData.data)
            if (migrationData.success) setMigrationStatus(migrationData)
        } catch { /* ignore */ }
        setLoading(false)
    }, [fetchRoles])

    const handleMigration = async () => {
        setSubmitting(true)
        try {
            const res = await fetch('/api/admin/team/migrate', { method: 'POST' })
            const data = await res.json()
            if (data.success) {
                setMsg({ text: `Migration completed! ${data.migrated_count} members updated`, type: 'success' })
                fetchMembers() // Refresh data
                setShowMigrationModal(false)
            } else {
                setMsg({ text: data.error || 'Migration failed', type: 'error' })
            }
        } catch {
            setMsg({ text: 'Migration failed', type: 'error' })
        }
        setSubmitting(false)
    }

    useEffect(() => {
        let isMounted = true
        if (isMounted) {
            fetchRoles().then(() => {
                if (isMounted) fetchMembers()
            })
        }
        return () => { isMounted = false }
    }, [fetchMembers, fetchRoles])

    const openRoleModal = (role?: { id: string; name: string; level: number }) => {
        if (role) {
            setEditingRole(role)
            setRoleFormName(role.name)
            setRoleFormLevel(role.level)
        } else {
            setEditingRole(null)
            setRoleFormName('')
            setRoleFormLevel(roles.length > 0 ? Math.max(...roles.map(r => r.level)) + 1 : 1)
        }
        setShowRoleModal(true)
    }

    // Check for power number conflict before submitting
    const handleRoleSubmit = async () => {
        // Find roles that already have this power number (excluding the role being edited)
        const conflicting = roles.filter(r =>
            r.level === roleFormLevel && (!editingRole || r.id !== editingRole.id)
        )
        if (conflicting.length > 0) {
            // Show the conflict popup with choices
            setConflictRoles(conflicting.map(r => r.name))
            setShowConflictPopup(true)
            return
        }
        // No conflict — submit normally (shift mode)
        await submitRole(false)
    }

    // Actually submit the role with skipShift flag
    const submitRole = async (groupMode: boolean) => {
        setShowConflictPopup(false)
        setRoleSubmitting(true)
        try {
            const body = editingRole
                ? { id: editingRole.id, name: roleFormName, level: roleFormLevel, skipShift: groupMode }
                : { name: roleFormName, level: roleFormLevel, skipShift: groupMode }
            const res = await fetch('/api/admin/team/roles', {
                method: editingRole ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()
            if (data.success) {
                setMsg({ text: editingRole ? 'Role updated!' : 'Role added!', type: 'success' })
                setShowRoleModal(false)
                fetchRoles()
                fetchMembers()
            } else {
                setMsg({ text: data.error || 'Failed', type: 'error' })
            }
        } catch { setMsg({ text: 'Failed to save role', type: 'error' }) }
        setRoleSubmitting(false)
    }

    const handleRoleDelete = async (role: { id: string; name: string }) => {
        if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return
        try {
            const res = await fetch('/api/admin/team/roles', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: role.id }),
            })
            const data = await res.json()
            if (data.success) {
                setMsg({ text: 'Role deleted', type: 'success' })
                fetchRoles()
            } else {
                setMsg({ text: data.error || 'Cannot delete role', type: 'error' })
            }
        } catch { setMsg({ text: 'Delete failed', type: 'error' }) }
    }

    // Drag and drop handlers for roles
    const handleRoleDragStart = (roleId: string) => {
        setDraggedRoleId(roleId)
    }

    const handleRoleDragOver = (e: React.DragEvent, targetRoleId: string) => {
        e.preventDefault()
        if (!draggedRoleId || draggedRoleId === targetRoleId) return
    }

    const handleRoleDrop = async (targetRoleId: string) => {
        if (!draggedRoleId || draggedRoleId === targetRoleId) return
        const draggedRole = roles.find(r => r.id === draggedRoleId)
        const targetRole = roles.find(r => r.id === targetRoleId)
        if (!draggedRole || !targetRole) return

        // Calculate new level: we want to insert 'before' or 'at' the target's position
        // If we dragged from below to above, we take target's level.
        // If we dragged from above to below, we take target's level (ignoring self).
        // The backend `recompactRoles` handles insertion at index `level-1`.
        const targetLevel = targetRole.level

        // Optimistic update: Move item and re-index sequentially to simulate backend
        const newRoles = roles.filter(r => r.id !== draggedRoleId)
        const targetIndex = newRoles.findIndex(r => r.id === targetRoleId)
        // Insert at target position (handling edge case of end of list?)
        // Actually targetRole is still in newRoles.
        // We want to insert *at* the position of targetRole?
        // Let's rely on standard splice insertion
        let insertIndex = targetIndex
        if (insertIndex === -1) insertIndex = newRoles.length

        // If dragging downwards, we might want to insert 'after'? 
        // Simple heuristic: If dragged level < target level, insert after?
        // Actually, simpler: Always insert *before* the target visually (standard sortable behavior usually)
        // But if I drop ON "Coordinator", I want to be above/below it?
        // Let's assume insert BEFORE.
        newRoles.splice(insertIndex, 0, draggedRole)

        // Renumber 1..N
        const optimisticallyUpdated = newRoles.map((r, i) => ({ ...r, level: i + 1 }))
        setRoles(optimisticallyUpdated)
        setDraggedRoleId(null)

        // Update in DB (trigger recompact)
        try {
            await fetch('/api/admin/team/roles', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                // Sending targetLevel ensures it gets inserted at that Level number
                // IMPORTANT: The backend uses `level` as the 1-based index to insert AT.
                // If we want to replace the target, we use targetLevel.
                body: JSON.stringify({ id: draggedRoleId, name: draggedRole.name, level: targetLevel }),
            })
            // Fetch strict data to ensure sync
            fetchRoles()
            fetchMembers()
        } catch {
            fetchRoles() // Revert on failure
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)
        const formData = new FormData(e.currentTarget)
        if (editing) formData.append('id', editing.id)

        try {
            const res = await fetch('/api/admin/team', { method: editing ? 'PUT' : 'POST', body: formData })
            const data = await res.json()
            if (data.success) {
                setMsg({ text: editing ? 'Member updated!' : 'Member added!', type: 'success' })
                setShowModal(false)
                setEditing(null)
                fetchMembers()
            } else {
                setMsg({ text: data.error || 'Failed', type: 'error' })
            }
        } catch { setMsg({ text: 'Failed', type: 'error' }) }
        setSubmitting(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this team member?')) return
        try {
            await fetch('/api/admin/team', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })
            setMsg({ text: 'Member deleted', type: 'success' })
            fetchMembers()
        } catch { setMsg({ text: 'Delete failed', type: 'error' }) }
    }

    // Group members by hierarchy level for better organization
    const groupedMembers = members.reduce((acc, member) => {
        const role = roles.find(r => r.name === member.role)
        const level = role ? role.level : 99 // Unknown roles go to end
        if (!acc[level]) acc[level] = []
        acc[level].push(member)
        return acc
    }, {} as Record<number, TeamMember[]>)

    const renderGroup = (level: number, group: TeamMember[]) => {
        // Find all role names at this level (same power = grouped)
        const rolesAtLevel = roles.filter(r => r.level === level)
        const title = rolesAtLevel.length > 0 ? rolesAtLevel.map(r => r.name).join(' / ') : `Level ${level}`
        return (
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-red-700">{title}</h3>                    </div>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                        {group.length} member{group.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {group.map(member => (
                        <motion.div
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            key={member.id}
                            draggable
                            onDragStart={() => handleMemberDragStart(member.id)}
                            onDragEnter={() => handleMemberDragEnter(member.id)}
                            onDragEnd={handleMemberDragEnd}
                            onDragOver={(e) => e.preventDefault()} // Valid drop target
                            className={`bg-white rounded-xl shadow overflow-hidden text-center cursor-move ${draggedMemberId === member.id ? 'opacity-50 ring-2 ring-purple-500 scale-95' : ''
                                }`}
                        >
                            <img src={member.image_url} alt={member.name} className="w-full h-48 object-cover pointer-events-none" />
                            <div className="p-4">
                                <h4 className="font-bold text-gray-900 text-sm">{member.name}</h4>
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="text-xs text-gray-500">{member.role}</p>
                                </div>
                                {member.email && <p className="text-xs text-blue-700 mb-1 break-all">{member.email}</p>}
                                {member.phone && <p className="text-xs text-gray-700 mb-2">{member.phone}</p>}
                                <div className="flex gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); setEditing(member); setShowModal(true) }}
                                        className="flex-1 bg-blue-600 text-white px-2 py-1.5 rounded text-xs hover:bg-blue-700 transition">Edit</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(member.id) }}
                                        className="flex-1 bg-red-600 text-white px-2 py-1.5 rounded text-xs hover:bg-red-700 transition">Del</button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
                {group.length === 0 && <p className="text-gray-400 text-sm">No {title.toLowerCase()} yet.</p>}
            </div>
        )
    }

    return (
        <div>
            {/* Header with Add Role + Add Member buttons */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Our Team</h2>
                <div className="flex gap-3">
                    <button onClick={() => openRoleModal()} className="bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 transition font-medium text-sm">
                        + Add Role
                    </button>
                    <button onClick={() => { setEditing(null); setShowModal(true) }} className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition font-medium text-sm">
                        + Add Member
                    </button>
                </div>
            </div>
            <StatusMessage message={msg.text} type={msg.type} />

            {loading ? <p className="text-gray-500">Loading...</p> : (
                <>
                    {/* Role Hierarchy Overview — Drag to Reorder */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-8 border border-purple-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-purple-800">Role Hierarchy</h3>
                            <span className="text-xs text-purple-500 font-medium">↕ Drag to reorder</span>
                        </div>
                        <div className="space-y-2">
                            {roles.map(role => {
                                const count = members.filter(m => m.role === role.name).length
                                const isDragging = draggedRoleId === role.id
                                return (
                                    <div
                                        key={role.id}
                                        draggable
                                        onDragStart={() => handleRoleDragStart(role.id)}
                                        onDragOver={(e) => handleRoleDragOver(e, role.id)}
                                        onDrop={() => handleRoleDrop(role.id)}
                                        onDragEnd={() => setDraggedRoleId(null)}
                                        className={`flex items-center justify-between p-3 rounded-lg transition-all cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 bg-purple-100 scale-95' : count > 0 ? 'bg-white shadow-sm hover:shadow-md' : 'bg-white/50 hover:bg-white'
                                            } border border-transparent hover:border-purple-200`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Drag handle */}
                                            <div className="text-gray-400 hover:text-purple-600 flex flex-col items-center gap-0.5" title="Drag to reorder">
                                                <span className="text-xs leading-none">⠿</span>
                                            </div>
                                            {/* Power badge */}
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                                                {role.level}
                                            </span>
                                            <span className="font-medium text-sm text-gray-800">{role.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${count > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                                }`}>{count} member{count !== 1 ? 's' : ''}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openRoleModal(role) }}
                                                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition"
                                            >Edit</button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRoleDelete(role) }}
                                                className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition"
                                            >Del</button>
                                        </div>
                                    </div>
                                )
                            })}
                            {roles.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No roles defined. Add your first role.</p>}
                        </div>
                    </div>

                    {/* Render groups by hierarchy level */}
                    {Object.keys(groupedMembers)
                        .map(Number)
                        .sort((a, b) => a - b)
                        .map(level => <div key={level}>{renderGroup(level, groupedMembers[level])}</div>)
                    }

                    {Object.keys(groupedMembers).length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-lg mb-2">No team members yet</div>
                            <p className="text-gray-500 text-sm">Start building your team by adding the first member</p>
                        </div>
                    )}
                </>
            )}

            <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null) }} title={editing ? 'Edit Member' : 'Add Member'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name *</label>
                        <input
                            name="name"
                            defaultValue={editing?.name}
                            required
                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Role *</label>
                        <select
                            name="role"
                            defaultValue={editing?.role || (roles.length > 0 ? roles[0].name : '')}
                            required
                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            {roles.map(role => (
                                <option key={role.id} value={role.name}>{role.name} (Power: {role.level})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email (Optional)</label>
                        <input
                            type="email"
                            name="email"
                            defaultValue={editing?.email || ''}
                            placeholder="name@example.com"
                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Phone Number (Optional)</label>
                        <input
                            type="tel"
                            name="phone"
                            defaultValue={editing?.phone || ''}
                            placeholder="+91 98765 43210"
                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-600 mt-1">If empty, phone will not be shown. Public page highlights phone for President.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Photo {editing ? '(leave empty to keep current)' : '*'}</label>
                        <input
                            type="file"
                            name="image"
                            accept="image/jpeg,image/png,image/webp"
                            {...(!editing && { required: true })}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                            Recommended: Square aspect ratio (1:1), minimum 400x400px, max 5MB
                        </p>
                    </div>

                    {editing?.image_url && (
                        <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">Current Photo:</p>
                            <img
                                src={editing.image_url}
                                alt="Current member photo"
                                className="h-32 w-32 rounded-lg object-cover border shadow-sm"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </span>
                        ) : (
                            editing ? 'Update Member' : 'Add Member'
                        )}
                    </button>
                </form>
            </Modal>

            {/* Add/Edit Role Modal */}
            <Modal open={showRoleModal} onClose={() => { setShowRoleModal(false); setEditingRole(null) }} title={editingRole ? 'Edit Role' : 'Add Role'}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Role Name *</label>
                        <input
                            value={roleFormName}
                            onChange={(e) => setRoleFormName(e.target.value)}
                            placeholder="e.g. Vice President"
                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Power Number *</label>
                        <input
                            type="number"
                            min="1"
                            value={roleFormLevel}
                            onChange={(e) => setRoleFormLevel(parseInt(e.target.value) || 1)}
                            className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Lower number = higher power. Roles with the same power number will be grouped together.
                        </p>

                        {/* Current hierarchy reference */}
                        {roles.length > 0 && (
                            <div className="mt-3 border border-purple-100 rounded-lg overflow-hidden">
                                <div className="bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700">
                                    Current Hierarchy (click to use)
                                </div>
                                <div className="max-h-40 overflow-y-auto divide-y divide-gray-100">
                                    {roles.map(r => (
                                        <button
                                            type="button"
                                            key={r.id}
                                            onClick={() => setRoleFormLevel(r.level)}
                                            className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-purple-50 transition ${roleFormLevel === r.level ? 'bg-purple-50 font-semibold' : ''
                                                }`}
                                        >
                                            <span className="text-gray-700">{r.name}</span>
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold">
                                                {r.level}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleRoleSubmit}
                        disabled={roleSubmitting || !roleFormName.trim()}
                        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {roleSubmitting ? 'Saving...' : editingRole ? 'Update Role' : 'Add Role'}
                    </button>
                </div>
            </Modal>

            {/* Conflict Resolution Popup */}
            {showConflictPopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <span className="text-amber-600 text-lg">⚠</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Power Number Conflict</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                            Power number <span className="font-bold text-purple-700">{roleFormLevel}</span> is already used by:
                        </p>
                        <div className="bg-gray-50 rounded-lg p-3 mb-5">
                            {conflictRoles.map((name, i) => (
                                <div key={i} className="flex items-center gap-2 py-1">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">{roleFormLevel}</span>
                                    <span className="font-medium text-sm text-gray-800">{name}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-gray-600 mb-4">How would you like to handle this?</p>
                        <div className="space-y-3">
                            <button
                                onClick={() => submitRole(false)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition text-left"
                            >
                                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 text-sm">↕</span>
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-gray-900">Shift & Insert</div>
                                    <div className="text-xs text-gray-500">Push existing role(s) down and take this position</div>
                                </div>
                            </button>
                            <button
                                onClick={() => submitRole(true)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition text-left"
                            >
                                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-purple-600 text-sm">⊕</span>
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-gray-900">Group Together</div>
                                    <div className="text-xs text-gray-500">Share the same power number (roles will be displayed side by side)</div>
                                </div>
                            </button>
                            <button
                                onClick={() => setShowConflictPopup(false)}
                                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


function FriendshipSection() {
    const [activeTab, setActiveTab] = useState<'meets' | 'content'>('meets')

    return (
        <div>
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('meets')}
                    className={`pb-2 px-4 font-semibold transition-colors ${activeTab === 'meets' ? 'text-fuchsia-700 border-b-2 border-fuchsia-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Friendship Meets
                </button>
                <button
                    onClick={() => setActiveTab('content')}
                    className={`pb-2 px-4 font-semibold transition-colors ${activeTab === 'content' ? 'text-fuchsia-700 border-b-2 border-fuchsia-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Friends Day Content
                </button>
            </div>

            {activeTab === 'meets' ? <FriendshipMeetsManager /> : <FriendshipContentManager />}
        </div>
    )
}

function FriendshipMeetsManager() {
    const [meets, setMeets] = useState<FriendshipMeet[]>([])
    const [filteredMeets, setFilteredMeets] = useState<FriendshipMeet[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<FriendshipMeet | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [msg, setMsg] = useState({ text: '', type: 'success' as 'success' | 'error' })

    const [formData, setFormData] = useState({
        country: '',
        state: '',
        district: '',
        year: '' as string | number,
        caption_en: '',
        caption_ta: '',
    })

    // Custom location state
    const [customCountries, setCustomCountries] = useState<string[]>([])
    const [customStates, setCustomStates] = useState<string[]>([])
    const [customDistricts, setCustomDistricts] = useState<string[]>([])
    const [showCountryInput, setShowCountryInput] = useState(false)
    const [showStateInput, setShowStateInput] = useState(false)
    const [showDistrictInput, setShowDistrictInput] = useState(false)
    const [customCountryInput, setCustomCountryInput] = useState('')
    const [customStateInput, setCustomStateInput] = useState('')
    const [customDistrictInput, setCustomDistrictInput] = useState('')

    const [bannerFile, setBannerFile] = useState<File | null>(null)
    const [bannerPreview, setBannerPreview] = useState<string>('')

    // Filters
    const [filterCountry, setFilterCountry] = useState('All')
    const [filterState, setFilterState] = useState('All')
    const [filterDistrict, setFilterDistrict] = useState('All')
    const [filterYear, setFilterYear] = useState('All')

    const fetchMeets = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/friendship-meets')
            const data = await res.json()
            if (data.success) {
                setMeets(data.data)
                setFilteredMeets(data.data)
            }

        } catch { /* ignore */ }
        setLoading(false)
    }, [])

    useEffect(() => {
        let isMounted = true
        if (isMounted) {
            fetchMeets()
        }
        return () => { isMounted = false }
    }, [fetchMeets])

    // Load custom locations
    const fetchCustomLocations = useCallback(async () => {
        try {
            const [countriesRes, statesRes, districtsRes] = await Promise.all([
                fetch('/api/admin/custom-locations?type=country'),
                fetch('/api/admin/custom-locations?type=state'),
                fetch('/api/admin/custom-locations?type=district')
            ])

            const [countriesData, statesData, districtsData] = await Promise.all([
                countriesRes.json(),
                statesRes.json(),
                districtsRes.json()
            ])

            if (countriesData.success) setCustomCountries(countriesData.locations)
            if (statesData.success) setCustomStates(statesData.locations)
            if (districtsData.success) setCustomDistricts(districtsData.locations)
        } catch (error) {
            console.error('Failed to fetch custom locations:', error)
        }
    }, [])

    useEffect(() => {
        let isMounted = true
        if (isMounted) {
            fetchCustomLocations()
        }
        return () => { isMounted = false }
    }, [fetchCustomLocations])


    // Filter logic
    useEffect(() => {
        let temp = [...meets]
        if (filterCountry !== 'All') temp = temp.filter(m => m.country === filterCountry)
        if (filterState !== 'All') temp = temp.filter(m => m.state === filterState)
        if (filterDistrict !== 'All') temp = temp.filter(m => m.district === filterDistrict)
        if (filterYear !== 'All') temp = temp.filter(m => String(m.year) === filterYear)
        setFilteredMeets(temp)
    }, [meets, filterCountry, filterState, filterDistrict, filterYear])

    const openAddModal = () => {
        setEditing(null)
        setFormData({ country: '', state: '', district: '', year: '', caption_en: '', caption_ta: '' })
        setBannerFile(null)
        setBannerPreview('')
        setShowCountryInput(false)
        setShowStateInput(false)
        setShowDistrictInput(false)
        setCustomCountryInput('')
        setCustomStateInput('')
        setCustomDistrictInput('')
        setShowModal(true)
    }

    const openEditModal = (meet: FriendshipMeet) => {
        setEditing(meet)
        setFormData({
            country: meet.country,
            state: meet.state,
            district: meet.district,
            year: meet.year,
            caption_en: meet.caption_en,
            caption_ta: meet.caption_ta,
        })
        setBannerFile(null)
        setBannerPreview('')
        setShowCountryInput(false)
        setShowStateInput(false)
        setShowDistrictInput(false)
        setCustomCountryInput('')
        setCustomStateInput('')
        setCustomDistrictInput('')
        setShowModal(true)
    }

    const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setBannerFile(file)
            setBannerPreview(URL.createObjectURL(file))
        }
    }

    const removeBannerImage = () => {
        setBannerFile(null)
        setBannerPreview('')
        if (editing) {
            // Logic to mark image for deletion if needed, but for now just UI
            // In a real app we might need a separate flag or API call
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)

        // Handle custom locations (same as ServicesSection logic)
        let finalCountry = formData.country
        if (showCountryInput && customCountryInput.trim()) {
            finalCountry = customCountryInput.trim()
            if (!customCountries.includes(finalCountry)) {
                await fetch('/api/admin/custom-locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'country', name: finalCountry, parent: {} }) })
                setCustomCountries(prev => [...prev, finalCountry])
            }
        }

        let finalState = formData.state
        if (showStateInput && customStateInput.trim()) {
            finalState = customStateInput.trim()
            if (!customStates.includes(finalState)) {
                await fetch('/api/admin/custom-locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'state', name: finalState, parent: { country: finalCountry } }) })
                setCustomStates(prev => [...prev, finalState])
            }
        }

        let finalDistrict = formData.district
        if (showDistrictInput && customDistrictInput.trim()) {
            finalDistrict = customDistrictInput.trim()
            if (!customDistricts.includes(finalDistrict)) {
                await fetch('/api/admin/custom-locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'district', name: finalDistrict, parent: { country: finalCountry, state: finalState } }) })
                setCustomDistricts(prev => [...prev, finalDistrict])
            }
        }


        const submitData = new FormData()
        submitData.append('country', finalCountry)
        submitData.append('state', finalState)
        submitData.append('district', finalDistrict)
        submitData.append('year', String(formData.year))
        submitData.append('caption_en', formData.caption_en)
        submitData.append('caption_ta', formData.caption_ta)

        if (bannerFile) {
            submitData.append('banner', bannerFile)
        }

        if (editing) submitData.append('id', editing.id)

        try {
            const res = await fetch('/api/admin/friendship-meets', {
                method: editing ? 'PUT' : 'POST',
                body: submitData
            })
            const data = await res.json()
            if (data.success) {
                setMsg({ text: editing ? 'Meet updated!' : 'Meet added!', type: 'success' })
                setShowModal(false)
                setEditing(null)
                fetchMeets()
            } else {
                setMsg({ text: data.error || 'Failed', type: 'error' })
            }
        } catch { setMsg({ text: 'Failed', type: 'error' }) }
        setSubmitting(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this meet?')) return
        try {
            await fetch('/api/admin/friendship-meets', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })
            setMsg({ text: 'Meet deleted', type: 'success' })
            fetchMeets()
        } catch { setMsg({ text: 'Delete failed', type: 'error' }) }
    }

    // Derived options for dropdowns
    const availableCountries = [...new Set([...locations.map(l => l.name), ...customCountries])].filter(Boolean).sort()
    const availableStates = [...new Set([
        ...(formData.country && !showCountryInput ? getStates(formData.country) : []),
        ...customStates
    ])].filter(Boolean).sort()
    const availableDistricts = [...new Set([
        ...(formData.state && !showStateInput ? getDistricts(formData.country, formData.state) : []),
        ...customDistricts
    ])].filter(Boolean).sort()

    // Filter Lists
    const uniqueCountries = [...new Set(meets.map(m => m.country).filter(Boolean))].sort()
    const uniqueStates = [...new Set(meets.map(m => m.state).filter(Boolean))].sort()
    const uniqueDistricts = [...new Set(meets.map(m => m.district).filter(Boolean))].sort()
    const uniqueYears = [...new Set(meets.map(m => m.year).filter(Boolean))].sort((a, b) => Number(b) - Number(a))

    // Generate year options (1996 to current year)
    const currentYear = new Date().getFullYear()
    const yearOptions = Array.from({ length: currentYear - 1995 }, (_, i) => (currentYear - i).toString())

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Friendship Meet Management</h2>
                <button onClick={openAddModal}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold transition flex items-center gap-2">
                    <span className="text-xl">+</span> Add Section
                </button>
            </div>

            <StatusMessage message={msg.text} type={msg.type} />

            {/* Filters */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2.5">
                            <option value="All">All Countries</option>
                            {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <select value={filterState} onChange={(e) => setFilterState(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2.5">
                            <option value="All">All States</option>
                            {uniqueStates.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                        <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2.5">
                            <option value="All">All Districts</option>
                            {uniqueDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2.5">
                            <option value="All">All Years</option>
                            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>
                {(filterCountry !== 'All' || filterState !== 'All' || filterDistrict !== 'All' || filterYear !== 'All') && (
                    <button
                        onClick={() => { setFilterCountry('All'); setFilterState('All'); setFilterDistrict('All'); setFilterYear('All') }}
                        className="mt-4 text-sm text-red-600 hover:text-red-700 font-medium">
                        Clear all filters
                    </button>
                )}
            </div>

            {loading ? <p className="text-gray-500">Loading...</p> : (
                <div className="space-y-6">
                    {filteredMeets.map(meet => (
                        <div key={meet.id} className="bg-white rounded-xl shadow overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {meet.caption_en || 'No Caption'} - {meet.district}, {meet.state}, {meet.country}
                                        </h3>
                                        <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                                            Year: {meet.year}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => window.location.href = `/admin/friendship-meet/${meet.id}`}
                                            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition">
                                            📷 Manage Gallery
                                        </button>
                                        <button onClick={() => openEditModal(meet)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(meet.id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition">
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {meet.caption_ta && (
                                    <p className="text-sm text-gray-600 mb-3">Tamil: {meet.caption_ta}</p>
                                )}

                                {meet.banner_image && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Banner Photo:</p>
                                        <img src={meet.banner_image.url} alt="Banner" className="w-full max-w-2xl h-20 object-cover rounded-lg" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredMeets.length === 0 && <p className="text-gray-500 text-center py-8">No friendship meets found.</p>}
                </div>
            )}

            <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null); setBannerFile(null); setBannerPreview('') }}
                title={editing ? 'Edit Friendship Meet Section' : 'Add Friendship Meet Section'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* STEP 1: LOCATION & YEAR */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-blue-900 mb-3">📍 Step 1: Select Location & Year (Required)</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Country *</label>
                                {!showCountryInput ? (
                                    <select
                                        value={formData.country}
                                        onChange={(e) => {
                                            if (e.target.value === '__other__') {
                                                setShowCountryInput(true)
                                                setFormData({ ...formData, country: '', state: '', district: '' })
                                            } else {
                                                setFormData({ ...formData, country: e.target.value, state: '', district: '' })
                                            }
                                        }}
                                        required
                                        className="w-full border rounded-lg p-2.5"
                                    >
                                        <option value="">Select Country</option>
                                        {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
                                        <option value="__other__" className="font-semibold text-blue-600">+ Others (Type Custom)</option>
                                    </select>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={customCountryInput}
                                            onChange={(e) => setCustomCountryInput(e.target.value)}
                                            placeholder="Enter country name"
                                            className="flex-1 border rounded-lg p-2.5"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCountryInput(false)
                                                setCustomCountryInput('')
                                            }}
                                            className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">State *</label>
                                {!showStateInput ? (
                                    <select
                                        value={formData.state}
                                        onChange={(e) => {
                                            if (e.target.value === '__other__') {
                                                setShowStateInput(true)
                                                setFormData({ ...formData, state: '', district: '' })
                                            } else {
                                                setFormData({ ...formData, state: e.target.value, district: '' })
                                            }
                                        }}
                                        required
                                        disabled={!formData.country && !showCountryInput}
                                        className="w-full border rounded-lg p-2.5 disabled:bg-gray-100"
                                    >
                                        <option value="">Select State</option>
                                        {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                                        <option value="__other__" className="font-semibold text-blue-600">+ Others (Type Custom)</option>
                                    </select>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={customStateInput}
                                            onChange={(e) => setCustomStateInput(e.target.value)}
                                            placeholder="Enter state/province name"
                                            className="flex-1 border rounded-lg p-2.5"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowStateInput(false)
                                                setCustomStateInput('')
                                            }}
                                            className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">District *</label>
                                {!showDistrictInput ? (
                                    <select
                                        value={formData.district}
                                        onChange={(e) => {
                                            if (e.target.value === '__other__') {
                                                setShowDistrictInput(true)
                                                setFormData({ ...formData, district: '' })
                                            } else {
                                                setFormData({ ...formData, district: e.target.value })
                                            }
                                        }}
                                        required
                                        disabled={!formData.state && !showStateInput}
                                        className="w-full border rounded-lg p-2.5 disabled:bg-gray-100"
                                    >
                                        <option value="">Select District</option>
                                        {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                        <option value="__other__" className="font-semibold text-blue-600">+ Others (Type Custom)</option>
                                    </select>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={customDistrictInput}
                                            onChange={(e) => setCustomDistrictInput(e.target.value)}
                                            placeholder="Enter district name"
                                            className="flex-1 border rounded-lg p-2.5"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowDistrictInput(false)
                                                setCustomDistrictInput('')
                                            }}
                                            className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Year *</label>
                                <select
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    required
                                    className="w-full border rounded-lg p-2.5"
                                >
                                    <option value="">Select Year</option>
                                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* STEP 2: CAPTION & BANNER */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-yellow-900 mb-3">📝 Step 2: Caption & Banner (Optional)</p>

                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">Caption (English)</label>
                            <input
                                type="text"
                                value={formData.caption_en}
                                onChange={(e) => setFormData({ ...formData, caption_en: e.target.value })}
                                placeholder="e.g., Annual International Gathering"
                                className="w-full border rounded-lg p-2.5"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Caption (Tamil)</label>
                            <input
                                type="text"
                                value={formData.caption_ta}
                                onChange={(e) => setFormData({ ...formData, caption_ta: e.target.value })}
                                placeholder="e.g., வருடாந்திர சர்வதேச கூட்டம்"
                                className="w-full border rounded-lg p-2.5"
                            />
                        </div>

                        {/* Banner Image */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Banner Image</label>
                            {!bannerPreview && !editing?.banner_image ? (
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBannerSelect}
                                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-yellow-400 transition cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                                />
                            ) : (
                                <div className="relative inline-block">
                                    <img
                                        src={bannerPreview || editing?.banner_image?.url}
                                        alt="Banner preview"
                                        className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-yellow-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeBannerImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition text-sm"
                                    >
                                        Remove
                                    </button>
                                    {!bannerPreview && editing?.banner_image && (
                                        <p className="text-xs text-gray-500 mt-1">Existing banner (upload new to replace)</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <button type="submit" disabled={submitting}
                        className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold transition disabled:opacity-50">
                        {submitting ? 'Saving...' : editing ? 'Update Section' : 'Add Section'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// FRIENDS DAY SECTION
// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// FRIENDS DAY CONTENT MANAGER (Sub-component)
// ═══════════════════════════════════════════════════════════════════════════════
function FriendshipContentManager() {
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [msg, setMsg] = useState({ text: '', type: 'success' as 'success' | 'error' })

    // Content state
    const [introTitleEn, setIntroTitleEn] = useState('')
    const [introTitleTa, setIntroTitleTa] = useState('')
    const [introContentEn, setIntroContentEn] = useState('')
    const [introContentTa, setIntroContentTa] = useState('')
    const [aboutTitleEn, setAboutTitleEn] = useState('')
    const [aboutTitleTa, setAboutTitleTa] = useState('')
    const [aboutContentEn, setAboutContentEn] = useState('')
    const [aboutContentTa, setAboutContentTa] = useState('')

    const fetchContent = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/friends-day')
            const data = await res.json()
            if (data.success && data.data) {
                const d = data.data
                setIntroTitleEn(d.intro_title_en || '')
                setIntroTitleTa(d.intro_title_ta || '')
                setIntroContentEn(d.intro_content_en || '')
                setIntroContentTa(d.intro_content_ta || '')
                setAboutTitleEn(d.about_title_en || '')
                setAboutTitleTa(d.about_title_ta || '')
                setAboutContentEn(d.about_content_en || '')
                setAboutContentTa(d.about_content_ta || '')
            }
        } catch { /* ignore */ }
        setLoading(false)
    }, [])

    useEffect(() => {
        let isMounted = true
        if (isMounted) {
            fetchContent()
        }
        return () => { isMounted = false }
    }, [fetchContent])

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)

        const body = {
            intro_title_en: introTitleEn,
            intro_title_ta: introTitleTa,
            intro_content_en: introContentEn,
            intro_content_ta: introContentTa,
            about_title_en: aboutTitleEn,
            about_title_ta: aboutTitleTa,
            about_content_en: aboutContentEn,
            about_content_ta: aboutContentTa,
        }

        try {
            const res = await fetch('/api/admin/friends-day', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()
            if (data.success) {
                setMsg({ text: 'Content updated successfully!', type: 'success' })
            } else {
                setMsg({ text: data.error || 'Failed to update', type: 'error' })
            }
        } catch { setMsg({ text: 'Failed to update', type: 'error' }) }
        setSubmitting(false)
    }

    if (loading) return <p className="text-gray-500">Loading...</p>

    return (
        <div>
            <SectionHeader title="Friends Day Content" />
            <StatusMessage message={msg.text} type={msg.type} />

            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                {/* Introduction Section */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Introduction Section</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title (English) *</label>
                            <input
                                value={introTitleEn}
                                onChange={(e) => setIntroTitleEn(e.target.value)}
                                required
                                className="w-full border rounded-lg p-2.5"
                                placeholder="e.g. Friends Day"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Title (Tamil)</label>
                            <input
                                value={introTitleTa}
                                onChange={(e) => setIntroTitleTa(e.target.value)}
                                className="w-full border rounded-lg p-2.5"
                                placeholder="e.g. நண்பர்கள் தினம்"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Content (English) *</label>
                        <RichTextEditor value={introContentEn} onChange={setIntroContentEn} placeholder="Main introduction text..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Content (Tamil)</label>
                        <RichTextEditor value={introContentTa} onChange={setIntroContentTa} placeholder="Tamil introduction text..." />
                    </div>
                </div>

                {/* About Section */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2">About Section</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">About Title (English)</label>
                            <input
                                value={aboutTitleEn}
                                onChange={(e) => setAboutTitleEn(e.target.value)}
                                className="w-full border rounded-lg p-2.5"
                                placeholder="e.g. About Friends Day"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">About Title (Tamil)</label>
                            <input
                                value={aboutTitleTa}
                                onChange={(e) => setAboutTitleTa(e.target.value)}
                                className="w-full border rounded-lg p-2.5"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">About Content (English)</label>
                        <RichTextEditor value={aboutContentEn} onChange={setAboutContentEn} placeholder="About section text..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">About Content (Tamil)</label>
                        <RichTextEditor value={aboutContentTa} onChange={setAboutContentTa} placeholder="Tamil about section text..." />
                    </div>
                </div>

                <div className="pt-4">
                    <button type="submit" disabled={submitting}
                        className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold transition disabled:opacity-50">
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// JOIN NOW SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function JoinNowSection() {
    const [items, setItems] = useState<JoinNowItem[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<JoinNowItem | null>(null)
    const [msg, setMsg] = useState({ text: '', type: 'success' as 'success' | 'error' })
    const [contentEn, setContentEn] = useState('')
    const [contentTa, setContentTa] = useState('')

    const fetchItems = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/join-now')
            const data = await res.json()
            if (data.success) setItems(data.data)
        } catch { /* ignore */ }
        setLoading(false)
    }, [])

    useEffect(() => {
        let isMounted = true
        if (isMounted) {
            fetchItems()
        }
        return () => { isMounted = false }
    }, [fetchItems])

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        const fd = new FormData(form)
        const body: Record<string, unknown> = Object.fromEntries(fd)
        body.content_en = contentEn
        body.content_ta = contentTa
        if (editing) body.id = editing.id

        try {
            const res = await fetch('/api/admin/join-now', {
                method: editing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()
            if (data.success) {
                setMsg({ text: editing ? 'Item updated!' : 'Item added!', type: 'success' })
                setShowModal(false)
                setEditing(null)
                fetchItems()
            } else {
                setMsg({ text: data.error || 'Failed', type: 'error' })
            }
        } catch { setMsg({ text: 'Failed', type: 'error' }) }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this item?')) return
        try {
            const res = await fetch('/api/admin/join-now', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })
            const data = await res.json()
            if (data.success) {
                setMsg({ text: 'Item deleted', type: 'success' })
                fetchItems()
            } else {
                setMsg({ text: data.error || 'Failed', type: 'error' })
            }
        } catch { setMsg({ text: 'Failed', type: 'error' }) }
    }

    return (
        <div>
            <SectionHeader title="Join Now Content" onAdd={() => { setEditing(null); setContentEn(''); setContentTa(''); setShowModal(true) }} addLabel="Add Content" />
            <StatusMessage message={msg.text} type={msg.type} />

            {loading ? <p className="text-gray-500">Loading...</p> : (
                <div className="space-y-4">
                    {items.map(item => (
                        <div key={item.id} className="bg-white rounded-xl shadow p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">{item.title_en}</h3>
                                        {item.title_ta && <span className="text-sm text-gray-500">| {item.title_ta}</span>}
                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">Order: {item.order_index}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2">{item.content_en?.replace(/<[^>]*>/g, '').substring(0, 200)}...</p>
                                    {item.google_form_url && (
                                        <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                                            <span className="font-semibold">Form URL:</span> {item.google_form_url}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button onClick={() => { setEditing(item); setContentEn(item.content_en || ''); setContentTa(item.content_ta || ''); setShowModal(true) }}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">Edit</button>
                                    <button onClick={() => handleDelete(item.id)}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && <p className="text-gray-500 text-center py-8">No content items found.</p>}
                </div>
            )}

            <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Join Now Content' : 'Add Join Now Content'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title (English)</label>
                            <input name="title_en" defaultValue={editing?.title_en} required className="w-full border rounded-lg p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Title (Tamil)</label>
                            <input name="title_ta" defaultValue={editing?.title_ta} className="w-full border rounded-lg p-2" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Content (English)</label>
                        <RichTextEditor value={contentEn} onChange={setContentEn} placeholder="Enter English content..." />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Content (Tamil)</label>
                        <RichTextEditor value={contentTa} onChange={setContentTa} placeholder="Enter Tamil content..." />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Google Form URL (Optional)</label>
                        <input name="google_form_url" defaultValue={editing?.google_form_url} placeholder="https://docs.google.com/forms/..." className="w-full border rounded-lg p-2" />
                        <p className="text-xs text-gray-500 mt-1">Paste the full URL of the Google Form. <strong>Make sure the form is set to &quot;Public&quot; or &quot;Anyone with the link&quot; so users can see it without signing in.</strong></p>
                    </div>

                    <div className="w-32">
                        <label className="block text-sm font-medium mb-1">Order Index</label>
                        <input type="number" name="order_index" defaultValue={editing?.order_index || 0} className="w-full border rounded-lg p-2" />
                    </div>

                    <button type="submit" className="w-full bg-fuchsia-900 text-white py-2 rounded-lg hover:bg-fuchsia-800 font-bold transition">
                        {editing ? 'Update Content' : 'Add Content'}
                    </button>
                </form>
            </Modal>
        </div>
    )
}



