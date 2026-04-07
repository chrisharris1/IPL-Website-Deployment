'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import emailjs from '@emailjs/browser'
import { useTranslation } from '@/contexts/TranslationContext'
import { Mail, Phone, MapPin, Clock, ShieldCheck } from 'lucide-react'

type Errors = Record<string, string>

// Anti-spam configuration
const COOLDOWN_MS = 60000 // 60 seconds between submissions
const MAX_DAILY_SUBMISSIONS = 5
const MIN_FORM_FILL_TIME_MS = 3000 // Minimum 3 seconds to fill form (bots are faster)
const MAX_MESSAGE_LENGTH = 2000
const MAX_SUBJECT_LENGTH = 120
const MAX_NAME_LENGTH = 100

// Helper: Check for spam patterns in text
const containsSpamPatterns = (text: string): boolean => {
    // Check for excessive URLs
    const urlPattern = /(https?:\/\/|www\.)[^\s]+/gi
    const urls = text.match(urlPattern) || []
    if (urls.length > 2) return true

    // Check for common spam keywords
    const spamKeywords = [
        /\b(viagra|casino|lottery|winner|prize|click here|buy now|free money)\b/i,
        /\b(cryptocurrency|bitcoin|investment opportunity|make money fast)\b/i,
    ]
    return spamKeywords.some(pattern => pattern.test(text))
}

// Helper: Sanitize input (basic XSS prevention)
const sanitizeInput = (input: string): string => {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim()
}

// Helper: Get daily submission count from localStorage
const getDailySubmissions = (): { count: number; date: string } => {
    if (typeof window === 'undefined') return { count: 0, date: '' }
    try {
        const data = localStorage.getItem('contact_submissions')
        if (!data) return { count: 0, date: '' }
        return JSON.parse(data)
    } catch {
        return { count: 0, date: '' }
    }
}

// Helper: Set daily submission count
const incrementDailySubmissions = (): void => {
    if (typeof window === 'undefined') return
    const today = new Date().toISOString().split('T')[0]
    const current = getDailySubmissions()

    if (current.date === today) {
        localStorage.setItem('contact_submissions', JSON.stringify({
            count: current.count + 1,
            date: today
        }))
    } else {
        localStorage.setItem('contact_submissions', JSON.stringify({
            count: 1,
            date: today
        }))
    }
}

// Helper: Check if daily limit exceeded
const isDailyLimitExceeded = (): boolean => {
    const today = new Date().toISOString().split('T')[0]
    const current = getDailySubmissions()
    return current.date === today && current.count >= MAX_DAILY_SUBMISSIONS
}

// Helper: Get stored cooldown timestamp
const getStoredCooldown = (): number => {
    if (typeof window === 'undefined') return 0
    try {
        const stored = localStorage.getItem('contact_cooldown')
        return stored ? parseInt(stored, 10) : 0
    } catch {
        return 0
    }
}

// Helper: Set cooldown timestamp
const setStoredCooldown = (timestamp: number): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem('contact_cooldown', timestamp.toString())
}



export default function Contact() {
    const { t } = useTranslation()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [errors, setErrors] = useState<Errors>({})
    const [status, setStatus] = useState({ loading: false, success: false })
    const [honeypot, setHoneypot] = useState('')
    const [cooldownUntil, setCooldownUntil] = useState<number>(() => {
        const stored = getStoredCooldown()
        return stored > Date.now() ? stored : 0
    })
    const [now, setNow] = useState<number>(0)
    const [dailyLimitReached, setDailyLimitReached] = useState(() => isDailyLimitExceeded())

    // Track when user started interacting with the form
    const formLoadTime = useRef<number>(0)

    useEffect(() => {
        // Set form load time on client side
        formLoadTime.current = Date.now()

        const timer = setInterval(() => setNow(Date.now()), 1000)

        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        if (status.success) {
            const timer = setTimeout(() => setStatus(s => ({ ...s, success: false })), 5000)
            // Update daily limit check after successful submission
            return () => clearTimeout(timer)
        }
    }, [status.success])

    const validate = () => {
        const newErrors: Errors = {}

        // Name validation
        if (!name.trim()) {
            newErrors.name = t('contact.error_name_required', 'Please enter your name')
        } else if (name.trim().length > MAX_NAME_LENGTH) {
            newErrors.name = t('contact.error_name_long', 'Name is too long')
        }

        // Email validation with stricter pattern
        if (!email.trim()) {
            newErrors.email = t('contact.error_email_required', 'Please enter your email')
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            newErrors.email = t('contact.error_email_invalid', 'Please enter a valid email address')
        }

        // Subject validation
        if (!subject.trim()) {
            newErrors.subject = t('contact.error_subject_required', 'Please enter a subject')
        } else if (subject.trim().length < 3) {
            newErrors.subject = t('contact.error_subject_short', 'Subject is too short')
        } else if (subject.trim().length > MAX_SUBJECT_LENGTH) {
            newErrors.subject = t('contact.error_subject_long', 'Subject is too long (max 120 characters)')
        }

        // Message validation with spam check
        if (!message.trim()) {
            newErrors.message = t('contact.error_message_required', 'Please enter a message')
        } else if (message.trim().length < 10) {
            newErrors.message = t('contact.error_message_short', 'Message is too short (minimum 10 characters)')
        } else if (message.trim().length > MAX_MESSAGE_LENGTH) {
            newErrors.message = t('contact.error_message_long', 'Message is too long (max 2000 characters)')
        } else if (containsSpamPatterns(message)) {
            newErrors.message = t('contact.error_spam_detected', 'Your message contains content that looks like spam. Please revise it.')
        }

        // Check subject for spam patterns too
        if (subject.trim() && containsSpamPatterns(subject)) {
            newErrors.subject = t('contact.error_spam_detected', 'Your subject contains content that looks like spam. Please revise it.')
        }

        return newErrors
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        // Check cooldown
        if (cooldownUntil && now < cooldownUntil) {
            const secondsLeft = Math.ceil((cooldownUntil - now) / 1000)
            setErrors({ submit: t('contact.error_cooldown', `Please wait ${secondsLeft} seconds before sending another message.`) })
            return
        }

        setStatus({ loading: false, success: false })

        // Honeypot check (silent fail for bots)
        if (honeypot) {
            console.warn('Honeypot triggered; aborting send')
            // Fake success to confuse bots
            setStatus({ loading: false, success: true })
            return
        }

        // Check daily submission limit
        if (isDailyLimitExceeded()) {
            setDailyLimitReached(true)
            setErrors({ submit: t('contact.error_daily_limit', 'You have reached the maximum number of messages for today. Please try again tomorrow.') })
            return
        }

        // Timing check - bots submit too fast
        const timeSinceLoad = Date.now() - formLoadTime.current
        if (timeSinceLoad < MIN_FORM_FILL_TIME_MS) {
            console.warn('Form submitted too fast; potential bot')
            // Silent fail - fake success for bots
            await new Promise((r) => setTimeout(r, 1000))
            setStatus({ loading: false, success: true })
            return
        }

        const newErrors = validate()
        setErrors(newErrors)
        if (Object.keys(newErrors).length) {
            const summary = document.getElementById('form-error-summary') as HTMLDivElement | null
            if (summary) summary.focus()
            return
        }

        try {
            setStatus({ loading: true, success: false })
            const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string | undefined
            const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string | undefined
            const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string | undefined

            // Sanitize inputs before sending
            const sanitizedName = sanitizeInput(name)
            const sanitizedEmail = sanitizeInput(email)
            const sanitizedSubject = sanitizeInput(subject)
            const sanitizedMessage = sanitizeInput(message)

            if (!serviceId || !templateId || !publicKey) {
                console.warn('EmailJS env vars missing; skipping real send')
                await new Promise((r) => setTimeout(r, 500))
                setStatus({ loading: false, success: true })
                setName(''); setEmail(''); setSubject(''); setMessage('')
                setErrors({})
                incrementDailySubmissions()
                setDailyLimitReached(isDailyLimitExceeded())
                const newCooldown = Date.now() + COOLDOWN_MS
                setCooldownUntil(newCooldown)
                setStoredCooldown(newCooldown)
                formLoadTime.current = Date.now() // Reset form load time
                return
            }

            const templateParams = {
                name: sanitizedName,
                email: sanitizedEmail,
                subject: sanitizedSubject,
                message: sanitizedMessage,
            }

            await emailjs.send(serviceId, templateId, templateParams, publicKey)
            setStatus({ loading: false, success: true })
            setName(''); setEmail(''); setSubject(''); setMessage('')
            setErrors({})
            incrementDailySubmissions()
            setDailyLimitReached(isDailyLimitExceeded())
            const newCooldown = Date.now() + COOLDOWN_MS
            setCooldownUntil(newCooldown)
            setStoredCooldown(newCooldown)
            formLoadTime.current = Date.now() // Reset form load time
        } catch (err) {
            console.error(err)
            setStatus({ loading: false, success: false })
            setErrors({ submit: t('contact.error_submit', 'Something went wrong. Please try again later.') })
        }
    }

    const addressLines = (t('footer.address', `103, Starview Apts., Opp. Corporate Park,\nV.N.Purav Marg, Chembur,\nMumbai - 400071, India`) || '').split('\n')

    return (
        <div className="bg-neutral-50 text-neutral-900 min-h-screen">
            {/* Hero */}
            <section className="relative bg-transparent pt-12 md:pt-16 lg:pt-20 pb-8 overflow-hidden" style={{ minHeight: '320px' }}>
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <Image
                        src="/Images/iplbanner.png"
                        alt="Contact background"
                        fill
                        className="opacity-40 object-contain"
                        style={{ objectPosition: 'center' }}
                        priority
                    />
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.04)' }} />
                </div>
                <div className="relative z-10 container-custom mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-200 shadow-sm mb-6 animate-fade-in">
                        <Mail className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-semibold tracking-wider uppercase text-neutral-600">{t('contact.badge', 'Get In Touch')}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-4 animate-slide-up">
                        {t('nav.contact', 'Contact Us')}
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {t('contact.subtitle', 'We would love to hear from you. Reach out and we will respond soon.')}
                    </p>
                </div>
            </section>

            {/* Main Contact Area */}
            <section className="mt-8 pb-24">
                <div className="container-custom mx-auto">
                    <div className="grid lg:grid-cols-3 gap-10">
                        {/* Left: Form */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 md:p-10 animate-fade-in">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6">
                                {t('contact.send_message', 'Send Us a Message')}
                            </h2>
                            <p className="text-neutral-600 mb-8 max-w-xl leading-relaxed">
                                {t('contact.info_intro', 'We are happy to help. Use the form and we will get back to you promptly.')}
                            </p>

                            {status.success && (
                                <div role="status" className="rounded-md bg-green-50 border border-green-200 text-green-800 px-4 py-3 mb-6">
                                    {t('contact.success_message', 'Thanks — your message has been sent.')}
                                </div>
                            )}

                            {Object.keys(errors).length > 0 && (
                                <div id="form-error-summary" tabIndex={-1} className="mb-6 rounded-md bg-red-50 border border-red-200 text-red-800 px-4 py-3" aria-live="assertive">
                                    <p className="font-semibold">{t('contact.form_errors_heading', 'There are problems with your submission')}</p>
                                    <ul className="mt-1 list-disc pl-5">
                                        {Object.entries(errors).map(([k, v]) => v && <li key={k}>{v}</li>)}
                                    </ul>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                                <div className="hidden" aria-hidden="true">
                                    <label htmlFor="website">Website</label>
                                    <input
                                        id="website"
                                        name="website"
                                        type="text"
                                        value={honeypot}
                                        onChange={(e) => setHoneypot(e.target.value)}
                                        tabIndex={-1}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-semibold text-neutral-700">{t('contact.form_name', 'Your Name')}</label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={name}
                                            maxLength={MAX_NAME_LENGTH}
                                            onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(s => ({ ...s, name: '' })) }}
                                            placeholder={t('contact.form_name_placeholder', 'Enter your name')}
                                            required
                                            aria-required="true"
                                            aria-invalid={errors.name ? 'true' : 'false'}
                                            aria-describedby={errors.name ? 'name-error' : undefined}
                                            className="mt-2 block w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-4 py-2.5 shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-600"
                                            disabled={dailyLimitReached}
                                        />
                                        {errors.name && <p id="name-error" className="mt-1 text-sm text-red-700">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-neutral-700">{t('contact.form_email', 'Email Address')}</label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(s => ({ ...s, email: '' })) }}
                                            placeholder={t('contact.form_email_placeholder', 'Enter your email')}
                                            required
                                            aria-required="true"
                                            aria-invalid={errors.email ? 'true' : 'false'}
                                            aria-describedby={errors.email ? 'email-error' : undefined}
                                            className="mt-2 block w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-4 py-2.5 shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-600"
                                        />
                                        {errors.email && <p id="email-error" className="mt-1 text-sm text-red-700">{errors.email}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-semibold text-neutral-700">{t('contact.form_subject', 'Subject')}</label>
                                    <input
                                        id="subject"
                                        type="text"
                                        value={subject}
                                        maxLength={MAX_SUBJECT_LENGTH}
                                        onChange={(e) => { setSubject(e.target.value); if (errors.subject) setErrors(s => ({ ...s, subject: '' })) }}
                                        placeholder={t('contact.form_subject_placeholder', 'Enter subject')}
                                        required
                                        aria-required="true"
                                        aria-invalid={errors.subject ? 'true' : 'false'}
                                        aria-describedby={errors.subject ? 'subject-error' : undefined}
                                        className="mt-2 block w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-4 py-2.5 shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-600"
                                        disabled={dailyLimitReached}
                                    />
                                    {errors.subject && <p id="subject-error" className="mt-1 text-sm text-red-700">{errors.subject}</p>}
                                </div>

                                <div>
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="message" className="block text-sm font-semibold text-neutral-700">{t('contact.form_message', 'Message')}</label>
                                        <span className={`text-xs ${message.length > MAX_MESSAGE_LENGTH * 0.9 ? 'text-red-600 font-medium' : 'text-neutral-400'}`}>
                                            {message.length}/{MAX_MESSAGE_LENGTH}
                                        </span>
                                    </div>
                                    <textarea
                                        id="message"
                                        rows={6}
                                        value={message}
                                        maxLength={MAX_MESSAGE_LENGTH}
                                        onChange={(e) => { setMessage(e.target.value); if (errors.message) setErrors(s => ({ ...s, message: '' })) }}
                                        placeholder={t('contact.form_message_placeholder', 'Enter your message')}
                                        required
                                        aria-required="true"
                                        aria-invalid={errors.message ? 'true' : 'false'}
                                        aria-describedby={errors.message ? 'message-error' : undefined}
                                        className="mt-2 block w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-4 py-3 shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-red-600"
                                        disabled={dailyLimitReached}
                                    />
                                    {errors.message && <p id="message-error" className="mt-1 text-sm text-red-700">{errors.message}</p>}
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={status.loading || dailyLimitReached || (cooldownUntil ? now < cooldownUntil : false)}
                                        aria-disabled={status.loading || dailyLimitReached || (cooldownUntil ? now < cooldownUntil : false)}
                                        className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 font-semibold text-white transition ${(status.loading || dailyLimitReached || (cooldownUntil ? now < cooldownUntil : false)) ? 'opacity-80 cursor-not-allowed' : 'hover:-translate-y-0.5'} bg-red-700 hover:bg-red-800 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-200`}
                                    >
                                        {status.loading && (
                                            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                            </svg>
                                        )}
                                        {dailyLimitReached
                                            ? t('contact.daily_limit_reached', 'Daily limit reached')
                                            : (cooldownUntil && now < cooldownUntil)
                                                ? `${t('contact.cooldown', 'Please wait')} (${Math.ceil((cooldownUntil - now) / 1000)}s)`
                                                : status.loading
                                                    ? t('contact.sending', 'Sending...')
                                                    : t('contact.form_submit', 'Send Message')}
                                    </button>
                                    {errors.submit && <p className="mt-2 text-sm text-red-700">{errors.submit}</p>}
                                </div>

                                {/* Security Notice */}
                                <div className="flex items-center gap-2 pt-4 border-t border-neutral-100">
                                    <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                                    <p className="text-xs text-neutral-500">
                                        {t('contact.security_notice', 'This form is protected against spam and abuse. Your data is sent securely.')}
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Right: Contact Info */}
                        <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-red-600" /> {t('contact.address_title', 'Address')}</h3>
                                <address className="not-italic text-neutral-700 leading-relaxed mb-4">
                                    {addressLines.map((line, i) => <div key={i}>{line}</div>)}
                                </address>
                                <a
                                    href="https://maps.app.goo.gl/EfjFozQeVMFQEN9V8"
                                    target="_blank"
                                    rel="noopener noreferrer nofollow"
                                    className="inline-flex items-center gap-2 text-red-700 font-semibold text-sm hover:gap-3 transition"
                                >
                                    {t('contact.open_in_maps', 'Open in Maps')}
                                </a>
                            </div>
                            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-5">
                                <div className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-red-600 mt-1" />
                                    <div>
                                        <p className="text-xs uppercase font-semibold tracking-wider text-neutral-500 mb-1">{t('contact.phone_title', 'Phone')}</p>
                                        <a href="tel:+919892035187" className="text-neutral-800 font-medium">+91 9892035187</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-red-600 mt-1" />
                                    <div>
                                        <p className="text-xs uppercase font-semibold tracking-wider text-neutral-500 mb-1">{t('footer.email', 'Email')}</p>
                                        <a href="mailto:iplmumbai12395@gmail.com" className="text-neutral-800 font-medium">iplmumbai12395@gmail.com</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-red-600 mt-1" />
                                    <div>
                                        <p className="text-xs uppercase font-semibold tracking-wider text-neutral-500 mb-1">{t('contact.hours_title', 'Office Hours')}</p>
                                        <p className="text-neutral-700 text-sm">{t('contact.hours_detail', 'Monday - Saturday: 10:00 AM - 6:00 PM')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-neutral-200 shadow-sm h-64">
                                <iframe
                                    src="https://www.google.com/maps?q=103,+Starview+Apts,+Opp.+Corporate+Park,+V.N.Purav+Marg,+Chembur,+Mumbai+400071&output=embed"
                                    title={t('contact.map_title', 'Office location map')}
                                    width="100%"
                                    height="100%"
                                    loading="lazy"
                                    style={{ border: 0 }}
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
