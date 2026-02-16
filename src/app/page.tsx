'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Heart,
  Users,
  HandHeart,
  Calendar,
  ArrowRight,
  Mail,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Quote
} from 'lucide-react'
import { useTranslation } from '@/contexts/TranslationContext'
import { getHomeData } from '@/lib/api'
import type { CarouselImage, HumanitarianService } from '@/types/api'

type ImageItem = { src: string; title?: string; subtitle?: string; hideText?: boolean }

const ImageCarousel: React.FC = () => {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false)
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch carousel images from API
  useEffect(() => {
    async function loadCarouselImages() {
      try {
        const response = await getHomeData()
        if (response.success && response.data) {
          // Map API data to ImageItem format
          const carouselImages: ImageItem[] = response.data.carousel.map((item: CarouselImage) => ({
            src: item.image_url,
            title: item.title || '',
            subtitle: item.subtitle || '',
            hideText: !!Number(item.hide_text)
          }))
          setImages(carouselImages)
        }
      } catch (error) {
        console.error('Failed to load carousel:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCarouselImages()
  }, [])

  const changeIndex = (nextIndex: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(nextIndex)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToPrevious = () => {
    const next = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    changeIndex(next)
  }

  const goToNext = () => {
    const next = currentIndex === images.length - 1 ? 0 : currentIndex + 1
    changeIndex(next)
  }

  // Auto-advance carousel
  useEffect(() => {
    if (images.length === 0) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }, 2000)
    return () => clearInterval(timer)
  }, [images.length])

  if (loading || images.length === 0) {
    return (
      <div className="relative h-[280px] sm:h-[360px] md:h-[420px] lg:h-[520px] w-full overflow-hidden rounded-xl md:rounded-2xl shadow-2xl bg-neutral-200 animate-pulse" />
    )
  }

  return (
    <div className="relative h-[280px] sm:h-[360px] md:h-[420px] lg:h-[520px] w-full overflow-hidden rounded-xl md:rounded-2xl shadow-2xl group bg-[#FFFACD]">
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
        >

          <Image
            src={img.src}
            alt={img.title || 'IPL Carousel'}
            fill
            sizes="100vw"
            className="object-contain"
            priority={index === 0}
          />
          {!img.hideText && (img.title || img.subtitle) && (
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 z-20 text-neutral-900 transform transition-all duration-500 translate-y-0">
              {img.title && (
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 drop-shadow-sm">
                  {img.title}
                </h3>
              )}
              {img.subtitle && (
                <p className="text-sm sm:text-base md:text-lg text-neutral-700 max-w-2xl drop-shadow-sm line-clamp-2 sm:line-clamp-none">
                  {img.subtitle}
                </p>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/10 backdrop-blur-md text-neutral-800 border border-black/10 hover:bg-black hover:text-white transition-all opacity-50 sm:opacity-0 group-hover:opacity-100 sm:-translate-x-4 sm:group-hover:translate-x-0"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/10 backdrop-blur-md text-neutral-800 border border-black/10 hover:bg-black hover:text-white transition-all opacity-50 sm:opacity-0 group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 right-6 z-30 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => changeIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-red-600' : 'w-2 bg-neutral-300 hover:bg-neutral-500'
              }`}
          />
        ))}
      </div>
    </div>
  )
}

const RecentActivitiesCarousel: React.FC = () => {
  const { lang, t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(3)
  const [services, setServices] = useState<HumanitarianService[]>([])
  const [loading, setLoading] = useState(true)

  // Helper to strip HTML tags for preview
  const stripHtml = (html: string) => {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '').substring(0, 150)
  }

  // Fetch latest services from API
  useEffect(() => {
    async function loadServices() {
      try {
        const response = await getHomeData()
        if (response.success && response.data) {
          setServices(response.data.services)
        }
      } catch (error) {
        console.error('Failed to load services:', error)
      } finally {
        setLoading(false)
      }
    }
    loadServices()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsPerPage(1)
      else if (window.innerWidth < 1024) setItemsPerPage(2)
      else setItemsPerPage(3)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-slide functionality
  useEffect(() => {
    if (services.length === 0) return
    const timer = setInterval(() => {
      setCurrentIndex(prev => {
        const maxIndex = Math.max(0, services.length - itemsPerPage)
        return prev >= maxIndex ? 0 : prev + 1
      })
    }, 5000)
    return () => clearInterval(timer)
  }, [itemsPerPage, services.length])

  const maxIndex = Math.max(0, services.length - itemsPerPage)

  const nextSlide = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex(prev => (prev === 0 ? maxIndex : prev - 1))
  }

  if (loading) {
    return <div className="animate-pulse bg-neutral-200 h-64 rounded-2xl" />
  }

  return (
    <div className="relative group/carousel">
      {/* Controls - Left Button */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white shadow-lg border border-neutral-100 text-neutral-700 hover:bg-neutral-50 hover:text-red-700 transition-all opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100 md:-translate-x-4 md:group-hover/carousel:translate-x-0"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Controls - Right Button */}
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white shadow-lg border border-neutral-100 text-neutral-700 hover:bg-neutral-50 hover:text-red-700 transition-all opacity-100 md:opacity-0 md:group-hover/carousel:opacity-100 md:translate-x-4 md:group-hover/carousel:translate-x-0"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="overflow-hidden -mx-4 px-4 py-4">
        <div
          className="flex gap-8 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
        >
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/humanitarian-services/${service.id}`}
              className="flex-none w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-21.33px)] group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block"
            >
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                <Image
                  src={service.image_url}
                  alt={lang === 'ta' ? service.title_ta : service.title_en}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain bg-neutral-100"
                />
                <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-red-700 uppercase tracking-wider shadow-sm">
                  {new Date(service.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-red-700 transition-colors line-clamp-2">
                  {lang === 'ta' ? service.title_ta : service.title_en}
                </h3>
                <div className="flex items-center gap-1.5 text-neutral-500 text-sm mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {[service.city, service.district, service.state, service.country].filter(Boolean).join(', ')}
                </div>
                <p className="text-neutral-600 text-sm leading-relaxed line-clamp-3 mb-4">
                  {stripHtml(lang === 'ta' ? service.description_ta : service.description_en)}
                </p>
                <div className="flex items-center justify-start mt-auto">
                  <span className="text-red-700 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    {String(t('home.read_more', 'Read more'))} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { t, lang } = useTranslation()

  const features = [
    { icon: HandHeart, link: '/humanitarian-services', titleKey: 'home.feature1_title', descKey: 'home.feature1_desc', color: 'bg-rose-50 text-rose-600' },
    { icon: Users, link: '/friendship-meet', titleKey: 'home.feature2_title', descKey: 'home.feature2_desc', color: 'bg-blue-50 text-blue-600' },
    { icon: Calendar, link: '/news-events', titleKey: 'home.feature3_title', descKey: 'home.feature3_desc', color: 'bg-amber-50 text-amber-600' },
  ] as const

  return (
    <div className="bg-neutral-50">
      {/* Hero Section */}
      <section className="relative pt-4 pb-16 lg:pt-8 lg:pb-28 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-red-100/50 blur-3xl" />
          <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl" />
        </div>

        <div className="container-custom mx-auto relative z-10">
          <div className="flex flex-col items-center">
            {/* Carousel - Now on top */}
            <div className="w-full mb-10 lg:mb-14">
              <ImageCarousel />
            </div>

            {/* Text Content - Now below carousel */}
            <div className="w-full text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 shadow-sm mb-6 animate-fade-in">
                <Sparkles className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-neutral-600 tracking-wide uppercase">
                  {String(t('home.established', 'Est. 1995'))}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-neutral-900 leading-tight mb-4 sm:mb-6 tracking-tight animate-slide-up px-2">
                {String(t('home.hero_title', "Indian Penpals' League"))}
              </h1>

              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-600 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto animate-slide-up px-4" style={{ animationDelay: '0.1s' }}>
                {String(t('home.hero_sub', 'Love, Friendship & Humanity'))}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Link
                  href="/about"
                  className="w-full sm:w-auto px-8 py-4 bg-red-700 text-white rounded-full font-bold text-lg shadow-lg shadow-red-700/30 hover:bg-red-800 hover:shadow-red-800/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {String(t('nav.about', 'About Us'))}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-neutral-700 border border-neutral-200 rounded-full font-bold text-lg hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  {String(t('nav.contact', 'Contact'))}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              {String(t('home.our_activities', 'Our Activities'))}
            </h2>
            <p className="text-lg text-neutral-600">
              {String(t('home.activities_subtitle', 'We bring people together through various initiatives aimed at fostering friendship and serving society.'))}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Link
                  href={feature.link}
                  key={index}
                  className="group relative bg-red-800 rounded-2xl p-8 hover:bg-red-900 hover:shadow-xl transition-all duration-300 border border-red-700/50"
                >
                  <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-white">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 transition-colors">
                    {String(t(feature.titleKey))}
                  </h3>
                  <p className="text-white/70 mb-6 leading-relaxed">
                    {String(t(feature.descKey))}
                  </p>
                  <div className="flex items-center text-yellow-400 font-semibold group-hover:gap-2 transition-all">
                    {String(t('home.learn_more', 'Learn more'))}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Welcome / About Preview */}
      <section className="py-20 bg-neutral-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-red-900/20 to-transparent" />

        <div className="container-custom mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -top-10 -left-10 text-red-700/20">
                  <Quote className="w-32 h-32" />
                </div>
                <blockquote className="text-3xl lg:text-4xl font-medium leading-tight mb-8 relative z-10">
                  "{String(t('home.founder_quote', 'Our founder quote'))}"
                </blockquote>
                <cite className="text-lg text-red-400 font-style-normal block mb-12">
                  - {String(t('home.founder_name', 'Founder'))}
                </cite>
              </div>
            </div>

            <div className="lg:w-1/2 bg-white/5 backdrop-blur-sm rounded-2xl p-8 lg:p-12 border border-white/10">
              <h2 className="text-2xl font-bold mb-6">{String(t('home.welcome_title', 'Welcome to IPL'))}</h2>
              <p className="text-neutral-300 mb-6 leading-relaxed">
                {String(t('home.about_intro', 'About intro text'))}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                  <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">
                    {String(t('home.registration_label', lang === 'ta' ? 'பதிவு' : 'Registration'))}
                  </p>
                  <p className="font-mono font-bold text-primary-400">
                    {String(t('home.registration_value', '#F23778'))}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                  <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">
                    {String(t('home.tax_benefit_label', lang === 'ta' ? 'வரி சலுகை' : 'Tax Benefit'))}
                  </p>
                  <p className="font-mono font-bold text-primary-400">
                    {String(t('home.tax_benefit_value', lang === 'ta' ? '80G சான்றளிப்பு' : '80G Certified'))}
                  </p>
                </div>
              </div>

              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-white font-semibold hover:text-red-400 transition-colors"
              >
                {String(t('home.read_more', 'Read full story'))}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activities */}
      <section className="py-20 bg-neutral-50">
        <div className="container-custom mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                {String(t('home.recent_activities', 'Recent Humanitarian Activities'))}
              </h2>
              <p className="text-neutral-600">
                {String(t('home.recent_subtitle', 'Our latest efforts in serving the community'))}
              </p>
            </div>
            <Link
              href="/humanitarian-services"
              className="px-6 py-2 bg-white border border-neutral-200 rounded-full text-neutral-700 font-medium hover:bg-neutral-50 hover:border-neutral-300 transition-all"
            >
              {String(t('home.view_all', 'View All'))}
            </Link>
          </div>

          <RecentActivitiesCarousel />
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 bg-white border-t border-neutral-100">
        <div className="container-custom mx-auto text-center max-w-4xl">
          <Heart className="w-12 h-12 text-red-600 mx-auto mb-6 animate-pulse" />
          <blockquote className="text-2xl md:text-4xl font-serif italic text-neutral-800 mb-8 leading-tight">
            "{String(t('home.mother_teresa_quote', 'Spread love everywhere you go. Let no one ever come to you without leaving happier.'))}"
          </blockquote>
          <cite className="text-lg font-semibold text-neutral-500 not-italic">
            - {String(t('home.mother_teresa', 'Mother Teresa'))}
          </cite>
        </div>
      </section>
    </div>
  )
}


