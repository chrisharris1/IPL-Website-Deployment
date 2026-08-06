'use client'

import React, { useState, useRef } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'
import { X } from 'lucide-react'

type Errors = Record<string, string>

const MAX_MESSAGE_LENGTH = 2000
const MAX_NAME_LENGTH = 100

interface FeedbackModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
    const { t } = useTranslation()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [category, setCategory] = useState('suggestion')
    const [message, setMessage] = useState('')
    const [errors, setErrors] = useState<Errors>({})
    const [status, setStatus] = useState({ loading: false, success: false })

    const formLoadTime = useRef<number>(0)

    const validate = () => {
        const newErrors: Errors = {}

        if (!name.trim()) {
            newErrors.name = t('feedback.error_name_required', 'Please enter your name')
        } else if (name.trim().length > MAX_NAME_LENGTH) {
            newErrors.name = t('feedback.error_name_long', 'Name is too long')
        }

        if (email.trim() && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            newErrors.email = t('feedback.error_email_invalid', 'Please enter a valid email address')
        }

        if (!message.trim()) {
            newErrors.message = t('feedback.error_message_required', 'Please enter your message')
        } else if (message.trim().length < 10) {
            newErrors.message = t('feedback.error_message_short', 'Message is too short (minimum 10 characters)')
        } else if (message.trim().length > MAX_MESSAGE_LENGTH) {
            newErrors.message = t('feedback.error_message_long', 'Message is too long (max 2000 characters)')
        }

        return newErrors
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        setStatus({ loading: false, success: false })
        const newErrors = validate()
        setErrors(newErrors)

        if (Object.keys(newErrors).length) {
            return
        }

        try {
            setStatus({ loading: true, success: false })

            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim() || undefined,
                    category,
                    message: message.trim(),
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to submit feedback')
            }

            setStatus({ loading: false, success: true })
            setName('')
            setEmail('')
            setCategory('suggestion')
            setMessage('')
            setErrors({})

            setTimeout(() => {
                setStatus({ loading: false, success: false })
                onClose()
            }, 2000)
        } catch (err) {
            console.error(err)
            setStatus({ loading: false, success: false })
            setErrors({ submit: t('feedback.error_submit', 'Something went wrong. Please try again later.') })
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-neutral-900">
                        {t('feedback.title', 'Send Feedback')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-neutral-100 rounded-lg transition"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {status.success && (
                        <div className="rounded-lg bg-green-50 border border-green-200 text-green-800 px-4 py-3">
                            {t('feedback.success_message', 'Thank you! Your feedback has been sent.')}
                        </div>
                    )}

                    {errors.submit && (
                        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 px-4 py-3">
                            {errors.submit}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label htmlFor="feedback-name" className="block text-sm font-semibold text-neutral-700 mb-1.5">
                                {t('feedback.name', 'Your Name')} <span className="text-red-600">*</span>
                            </label>
                            <input
                                id="feedback-name"
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value)
                                    if (errors.name) setErrors(s => ({ ...s, name: '' }))
                                }}
                                placeholder={t('feedback.name_placeholder', 'Enter your name')}
                                maxLength={MAX_NAME_LENGTH}
                                disabled={status.success}
                                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        {/* Email (Optional) */}
                        <div>
                            <label htmlFor="feedback-email" className="block text-sm font-semibold text-neutral-700 mb-1.5">
                                {t('feedback.email', 'Email Address')} <span className="text-neutral-400 text-xs">{t('feedback.optional', '(Optional)')}</span>
                            </label>
                            <input
                                id="feedback-email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    if (errors.email) setErrors(s => ({ ...s, email: '' }))
                                }}
                                placeholder={t('feedback.email_placeholder', 'your@email.com')}
                                disabled={status.success}
                                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                        </div>

                        {/* Category (Optional) */}
                        <div>
                            <label htmlFor="feedback-category" className="block text-sm font-semibold text-neutral-700 mb-1.5">
                                {t('feedback.category', 'Category')} <span className="text-neutral-400 text-xs">{t('feedback.optional', '(Optional)')}</span>
                            </label>
                            <select
                                id="feedback-category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled={status.success}
                                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                                <option value="suggestion">{t('feedback.category_suggestion', 'Suggestion')}</option>
                                <option value="issue">{t('feedback.category_issue', 'Website Issue')}</option>
                                <option value="correction">{t('feedback.category_correction', 'Content Correction')}</option>
                                <option value="other">{t('feedback.category_other', 'Other')}</option>
                            </select>
                        </div>

                        {/* Message */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label htmlFor="feedback-message" className="block text-sm font-semibold text-neutral-700">
                                    {t('feedback.message', 'Message')} <span className="text-red-600">*</span>
                                </label>
                                <span className={`text-xs ${message.length > MAX_MESSAGE_LENGTH * 0.9 ? 'text-red-600 font-medium' : 'text-neutral-400'}`}>
                                    {message.length}/{MAX_MESSAGE_LENGTH}
                                </span>
                            </div>
                            <textarea
                                id="feedback-message"
                                rows={5}
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value)
                                    if (errors.message) setErrors(s => ({ ...s, message: '' }))
                                }}
                                placeholder={t('feedback.message_placeholder', 'Please share your feedback, suggestion, or issue...')}
                                maxLength={MAX_MESSAGE_LENGTH}
                                disabled={status.success}
                                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                            />
                            {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={status.loading || status.success}
                            className="w-full py-2.5 px-4 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {status.loading && (
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                            )}
                            {status.loading
                                ? t('feedback.sending', 'Sending...')
                                : status.success
                                    ? t('feedback.sent', 'Sent!')
                                    : t('feedback.submit', 'Send Feedback')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
