'use client'

import { useState, useEffect, useCallback, FormEvent, use } from 'react'
import RichTextEditor from '@/components/RichTextEditor'
import { locations, getCountries, getStates, getDistricts, getCities } from '@/data/locations'

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

interface FormData {
    title_en: string
    title_ta: string
    country: string
    state: string
    district: string
    city: string
    date: string
    description_en: string
    description_ta: string
}

export default function GalleryManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const meetId = resolvedParams.id

    const [items, setItems] = useState<GalleryItem[]>([])
    const [meet, setMeet] = useState<FriendshipMeet | null>(null)
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<GalleryItem | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [msg, setMsg] = useState({ text: '', type: 'success' as 'success' | 'error' })

    // Form state
    const [formData, setFormData] = useState<FormData>({
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

    // Image state
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>('')

    const fetchItems = useCallback(async () => {
        try {
            // Fetch meet details - using pagination with small limit and includeBanners=true for full data
            const meetRes = await fetch(`/api/admin/friendship-meets?limit=100&includeBanners=true`)
            const meetData = await meetRes.json()
            if (meetData.success) {
                const foundMeet = meetData.data.find((m: FriendshipMeet) => m.id === meetId)
                if (foundMeet) {
                    setMeet(foundMeet)
                }
            }

            // Fetch gallery items
            const res = await fetch(`/api/admin/friendship-meets/${meetId}/gallery`)
            const data = await res.json()
            if (data.success) {
                setItems(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch gallery items:', error)
        }
        setLoading(false)
    }, [meetId])

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
                fetch('/api/admin/custom-locations?type=city'),
            ])

            const [countriesData, statesData, districtsData, citiesData] = await Promise.all([
                countriesRes.json(),
                statesRes.json(),
                districtsRes.json(),
                citiesRes.json(),
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
        setImageFile(null)
        setImagePreview('')
        // Pre-fill location from meet if available
        setFormData({
            title_en: '',
            title_ta: '',
            country: meet?.country || '',
            state: meet?.state || '',
            district: meet?.district || '',
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

    const openEditModal = (item: GalleryItem) => {
        setEditing(item)
        setImageFile(null)
        setImagePreview('')
        setFormData({
            title_en: item.title_en,
            title_ta: item.title_ta,
            country: item.country,
            state: item.state,
            district: item.district,
            city: item.city,
            date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
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

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview('')
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)

        // Handle custom locations
        let finalCountry = formData.country
        if (showCountryInput && customCountryInput.trim()) {
            finalCountry = customCountryInput.trim()
            if (!customCountries.includes(finalCountry)) {
                try {
                    await fetch('/api/admin/custom-locations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'country', name: finalCountry, parent: {} }),
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
                        body: JSON.stringify({ type: 'state', name: finalState, parent: { country: finalCountry } }),
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
                        body: JSON.stringify({
                            type: 'district',
                            name: finalDistrict,
                            parent: { country: finalCountry, state: finalState },
                        }),
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
                        body: JSON.stringify({
                            type: 'city',
                            name: finalCity,
                            parent: { country: finalCountry, state: finalState, district: finalDistrict },
                        }),
                    })
                    setCustomCities([...customCities, finalCity])
                } catch (error) {
                    console.error('Failed to save custom city:', error)
                }
            }
        }

        // Convert image to base64
        let imageBase64 = ''
        if (imageFile) {
            imageBase64 = await new Promise<string>((resolve) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result as string)
                reader.readAsDataURL(imageFile)
            })
        }

        const submitData: {
            title_en: string
            title_ta: string
            country: string
            state: string
            district: string
            city: string
            date: string
            description_en: string
            description_ta: string
            item_id?: string
            new_image?: string
            image?: string
        } = {
            title_en: formData.title_en,
            title_ta: formData.title_ta,
            country: finalCountry,
            state: finalState,
            district: finalDistrict,
            city: finalCity,
            date: formData.date,
            description_en: formData.description_en,
            description_ta: formData.description_ta,
        }

        if (editing) {
            submitData.item_id = editing.id
            if (imageBase64) submitData.new_image = imageBase64
        } else {
            if (!imageBase64) {
                setMsg({ text: 'Image is required', type: 'error' })
                setSubmitting(false)
                return
            }
            submitData.image = imageBase64
        }

        try {
            const res = await fetch(`/api/admin/friendship-meets/${meetId}/gallery`, {
                method: editing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
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
        } catch {
            setMsg({ text: 'Failed', type: 'error' })
        }
        setSubmitting(false)
    }

    const handleDelete = async (itemId: string) => {
        if (!confirm('Delete this gallery item?')) return
        try {
            await fetch(`/api/admin/friendship-meets/${meetId}/gallery`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item_id: itemId }),
            })
            setMsg({ text: 'Item deleted', type: 'success' })
            fetchItems()
        } catch {
            setMsg({ text: 'Delete failed', type: 'error' })
        }
    }

    // Cascading dropdown logic
    const baseCountries = getCountries()
    const availableCountries = [...baseCountries, ...customCountries]

    const baseStates = !showCountryInput && formData.country ? getStates(formData.country) : []
    const availableStates = [...baseStates, ...customStates]

    const baseDistricts =
        !showCountryInput && !showStateInput && formData.country && formData.state
            ? getDistricts(formData.country, formData.state)
            : []
    const availableDistricts = [...baseDistricts, ...customDistricts]

    const baseCities =
        !showCountryInput && !showStateInput && !showDistrictInput && formData.country && formData.state && formData.district
            ? getCities(formData.country, formData.state, formData.district)
            : []
    const availableCities = [...baseCities, ...customCities]

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <button
                            onClick={() => (window.location.href = '/admin')}
                            className="text-sm text-gray-600 hover:text-gray-800 mb-2 flex items-center gap-1"
                        >
                            ← Back to Main Admin
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
                        <p className="text-gray-600 mt-1">Manage photos for this Friendship Meet section</p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold transition flex items-center gap-2"
                    >
                        <span className="text-xl">+</span> Add Gallery Item
                    </button>
                </div>

                {/* Meet Information Card */}
                {meet && (
                    <div className="bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">📍 Section Information</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Country</p>
                                <p className="text-sm font-semibold text-gray-900">{meet.country}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">State</p>
                                <p className="text-sm font-semibold text-gray-900">{meet.state}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">District</p>
                                <p className="text-sm font-semibold text-gray-900">{meet.district}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Year</p>
                                <p className="text-sm font-semibold text-gray-900">{meet.year}</p>
                            </div>
                        </div>
                        <div className="mt-4 bg-white rounded-lg p-3 text-sm text-gray-700">
                            <span className="font-medium">ℹ️ Note:</span> When you add gallery items, Country, State, and District are automatically pre-filled based on this section.
                        </div>
                    </div>
                )}

                {msg.text && (
                    <div
                        className={`mb-6 p-4 rounded-lg ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                    >
                        {msg.text}
                    </div>
                )}

                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : items.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-12 text-center">
                        <p className="text-gray-500 text-lg mb-4">No gallery items yet</p>
                        <button
                            onClick={openAddModal}
                            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold transition"
                        >
                            Add Your First Item
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition">
                                {item.image && (
                                    <img src={item.image.url} alt={item.title_en} className="w-full h-48 object-cover" />
                                )}
                                <div className="p-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title_en}</h3>
                                    {item.title_ta && <p className="text-sm text-gray-600 mb-2">{item.title_ta}</p>}
                                    <p className="text-sm text-gray-500 mb-2">
                                        📍 {item.city}, {item.district}, {item.state}, {item.country}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-3">
                                        📅 {new Date(item.date).toLocaleDateString()}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editing ? 'Edit Gallery Item' : 'Add Gallery Item'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowModal(false)
                                        setEditing(null)
                                    }}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                {/* Titles */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Title (English) *</label>
                                        <RichTextEditor
                                            value={formData.title_en}
                                            onChange={(value) => setFormData({ ...formData, title_en: value })}
                                            placeholder="Enter title"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Title (Tamil)</label>
                                        <RichTextEditor
                                            value={formData.title_ta}
                                            onChange={(value) => setFormData({ ...formData, title_ta: value })}
                                            placeholder="Enter title (Tamil)"
                                        />
                                    </div>
                                </div>

                                {/* Location - Row 1: Country, State */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
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
                                                className="w-full border border-gray-300 rounded-lg p-2.5"
                                            >
                                                <option value="">Select Country</option>
                                                {availableCountries.map((c) => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))}
                                                <option value="__other__" className="font-semibold text-blue-600">
                                                    + Others (Type Custom)
                                                </option>
                                            </select>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={customCountryInput}
                                                    onChange={(e) => setCustomCountryInput(e.target.value)}
                                                    placeholder="Enter country name"
                                                    className="flex-1 border border-gray-300 rounded-lg p-2.5"
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
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
                                                className="w-full border border-gray-300 rounded-lg p-2.5 disabled:bg-gray-100"
                                            >
                                                <option value="">Select State</option>
                                                {availableStates.map((s) => (
                                                    <option key={s} value={s}>
                                                        {s}
                                                    </option>
                                                ))}
                                                <option value="__other__" className="font-semibold text-blue-600">
                                                    + Others (Type Custom)
                                                </option>
                                            </select>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={customStateInput}
                                                    onChange={(e) => setCustomStateInput(e.target.value)}
                                                    placeholder="Enter state/province name"
                                                    className="flex-1 border border-gray-300 rounded-lg p-2.5"
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

                                {/* Location - Row 2: District, City */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
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
                                                required
                                                disabled={!formData.state && !showStateInput}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 disabled:bg-gray-100"
                                            >
                                                <option value="">Select District</option>
                                                {availableDistricts.map((d) => (
                                                    <option key={d} value={d}>
                                                        {d}
                                                    </option>
                                                ))}
                                                <option value="__other__" className="font-semibold text-blue-600">
                                                    + Others (Type Custom)
                                                </option>
                                            </select>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={customDistrictInput}
                                                    onChange={(e) => setCustomDistrictInput(e.target.value)}
                                                    placeholder="Enter district name"
                                                    className="flex-1 border border-gray-300 rounded-lg p-2.5"
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
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
                                                required
                                                disabled={!formData.district && !showDistrictInput}
                                                className="w-full border border-gray-300 rounded-lg p-2.5 disabled:bg-gray-100"
                                            >
                                                <option value="">Select City</option>
                                                {availableCities.map((c) => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))}
                                                <option value="__other__" className="font-semibold text-blue-600">
                                                    + Others (Type Custom)
                                                </option>
                                            </select>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={customCityInput}
                                                    onChange={(e) => setCustomCityInput(e.target.value)}
                                                    placeholder="Enter city name"
                                                    className="flex-1 border border-gray-300 rounded-lg p-2.5"
                                                    required
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

                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Date *</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                        className="w-full border border-gray-300 rounded-lg p-2.5"
                                    />
                                </div>

                                {/* Descriptions */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (English) *</label>
                                    <RichTextEditor
                                        value={formData.description_en}
                                        onChange={(value) => setFormData({ ...formData, description_en: value })}
                                        placeholder="Enter description in English..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Tamil)</label>
                                    <RichTextEditor
                                        value={formData.description_ta}
                                        onChange={(value) => setFormData({ ...formData, description_ta: value })}
                                        placeholder="Enter description in Tamil..."
                                    />
                                </div>

                                {/* Image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image *</label>
                                    {!imagePreview && !editing?.image ? (
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageSelect}
                                            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 transition cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                        />
                                    ) : (
                                        <div className="relative inline-block">
                                            <img
                                                src={imagePreview || editing?.image?.url}
                                                alt="Preview"
                                                className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-purple-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition text-sm"
                                            >
                                                Remove
                                            </button>
                                            {!imagePreview && editing?.image && (
                                                <p className="text-xs text-gray-500 mt-1">Existing image (upload new to replace)</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold transition disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : editing ? 'Update Item' : 'Add Item'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
