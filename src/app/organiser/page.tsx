'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { useTranslation } from '@/contexts/TranslationContext'
import { MapPin, Globe, Menu } from 'lucide-react'

type Organiser = {
  id: number
  name: string
  role?: string
  img: string
  country: string
  state: string
  district: string
}

const organisersData: Organiser[] = [
  { id: 1, name: 'D. Devadas', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'India', state: 'Tamil Nadu', district: 'Kanyakumari' },
  { id: 2, name: 'P. Manoharan', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'India', state: 'Tamil Nadu', district: 'Trichy' },
  { id: 3, name: 'T. Dharmaraj', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'India', state: 'Tamil Nadu', district: 'Covai' },
  { id: 4, name: 'V. Nagappan', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'India', state: 'Tamil Nadu', district: 'Krishnagiri' },
  { id: 5, name: 'R. Suresh', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'India', state: 'Tamil Nadu', district: 'Chennai' },
  { id: 6, name: 'A. Kanthan', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'India', state: 'Tamil Nadu', district: 'Pudukkottai' },
  { id: 7, name: 'C. Balasubramanian', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'India', state: 'Tamil Nadu', district: 'Tenkasi' },
  { id: 8, name: 'V. Chidambaram', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'India', state: 'Goa', district: 'Goa' },
  { id: 9, name: 'A. Piramanayagam', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'India', state: 'Delhi', district: 'New Delhi' },
  { id: 10, name: 'M. Elango', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'India', state: 'Rajasthan', district: 'Jaipur' },
  { id: 11, name: 'Paris Barthassarady', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'France', state: 'Ile-de-France', district: 'Paris' },
  { id: 12, name: 'M. Sivaram', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'Germany', state: 'Bavaria', district: 'Munich' },
  { id: 13, name: 'P. Premraj', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'United Kingdom', state: 'England', district: 'London' },
  { id: 14, name: 'O. Palanichamy', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'Australia', state: 'New South Wales', district: 'Sydney' },
  { id: 15, name: 'R. Vinoth', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'Singapore', state: 'Central', district: 'Singapore' },
  { id: 16, name: 'S. Sekar', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'Russia', state: 'Moscow Oblast', district: 'Moscow' },
  { id: 17, name: 'K. Kannadasan', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'Indonesia', state: 'Jakarta', district: 'Jakarta' },
  { id: 18, name: 'T. Senthil Kumar', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'UAE', state: 'Dubai', district: 'Dubai' },
  { id: 19, name: 'S. Bhaskara', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'Sri Lanka', state: 'Western Province', district: 'Colombo' },
  { id: 20, name: 'R. Vinoth (2)', role: 'Organiser', img: '/Images/bhaskar.jpg', country: 'India', state: 'Tamil Nadu', district: 'Tirunelveli' }
]

export default function OrganiserPage() {
  const { t } = useTranslation()
  const [country, setCountry] = useState('All')
  const [stateSel, setStateSel] = useState('All')
  const [district, setDistrict] = useState('All')

  const countries = useMemo(() => {
    const set = new Set(organisersData.map(o => o.country))
    return ['All', ...Array.from(set).sort()]
  }, [])

  const states = useMemo(() => {
    if (country === 'All') {
      const set = new Set(organisersData.map(o => o.state))
      return ['All', ...Array.from(set).sort()]
    }
    const set = new Set(organisersData.filter(o => o.country === country).map(o => o.state))
    return ['All', ...Array.from(set).sort()]
  }, [country])

  const districts = useMemo(() => {
    const pool = organisersData.filter(o => (country === 'All' || o.country === country) && (stateSel === 'All' || o.state === stateSel))
    const set = new Set(pool.map(o => o.district))
    return ['All', ...Array.from(set).sort()]
  }, [country, stateSel])

  const filtered = useMemo(() => {
    return organisersData.filter(o => {
      if (country !== 'All' && o.country !== country) return false
      if (stateSel !== 'All' && o.state !== stateSel) return false
      if (district !== 'All' && o.district !== district) return false
      return true
    })
  }, [country, stateSel, district])

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-transparent pt-12 md:pt-16 lg:pt-20 pb-8 overflow-hidden" style={{ minHeight: '320px' }}>
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image src="/Images/iplbanner.png" alt="Organiser background" fill className="opacity-40 object-contain" style={{ objectPosition: 'center' }} priority />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.04)' }} />
        </div>
        <div className="relative z-10 container-custom mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 shadow-sm mb-6">
            <Globe className="w-5 h-5 text-red-700" />
            <span className="text-xs font-semibold tracking-wider uppercase text-neutral-600">{t('organiser.badge', 'Organiser')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Organiser</h1>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">{t('organiser.subtitle', 'Our global organisers — filter by country, state and district')}</p>
        </div>
      </section>

      {/* Filters */}
      <section className="container-custom mx-auto mt-6 mb-8">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2 text-neutral-600 font-semibold mr-2"><Menu className="w-5 h-5" /> <span className="sr-only">Filters</span></div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="sr-only">Country</label>
            <select value={country} onChange={(e) => { setCountry(e.target.value); setStateSel('All'); setDistrict('All') }} className="rounded-lg border border-neutral-300 px-4 py-2 bg-white">
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label className="sr-only">State</label>
            <select value={stateSel} onChange={(e) => { setStateSel(e.target.value); setDistrict('All') }} className="rounded-lg border border-neutral-300 px-4 py-2 bg-white">
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <label className="sr-only">District</label>
            <select value={district} onChange={(e) => setDistrict(e.target.value)} className="rounded-lg border border-neutral-300 px-4 py-2 bg-white">
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="ml-auto text-sm text-neutral-600">Showing <span className="font-semibold text-neutral-900">{filtered.length}</span> of {organisersData.length}</div>
        </div>
      </section>

      {/* Grid */}
      <section className="container-custom mx-auto pb-24">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filtered.map(o => (
            <div key={o.id} className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-neutral-100 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-600 to-teal-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

              <div className="w-40 h-40 mx-auto mb-4 rounded-lg p-1 bg-linear-to-br from-emerald-100 to-teal-50 group-hover:from-emerald-600 group-hover:to-teal-800 transition-colors duration-300">
                <div className="w-full h-full rounded-lg overflow-hidden bg-white relative">
                  <Image
                    src={o.img}
                    alt={o.name}
                    width={320}
                    height={320}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>

              <h3 className="text-sm font-bold text-neutral-900 mb-2 uppercase">{o.name}</h3>
              <p className="text-emerald-700 font-semibold mb-3 text-xs">{o.role}</p>
              <div className="text-xs text-neutral-600 flex items-center justify-center gap-1"><MapPin className="w-3 h-3" /> <span>{o.district}, {o.state}, {o.country}</span></div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
