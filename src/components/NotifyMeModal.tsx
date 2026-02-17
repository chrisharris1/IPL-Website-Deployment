
'use client'

import React, { useState } from 'react'
import { X, Bell, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface NotifyMeModalProps {
    isOpen: boolean
    onClose: () => void
    eventDetails: {
        id: string
        title: string
        date: string | Date
        location?: string
    }
}

export default function NotifyMeModal({ isOpen, onClose, eventDetails }: NotifyMeModalProps) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const res = await fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    eventId: eventDetails.id,
                    eventTitle: eventDetails.title,
                    eventDate: eventDetails.date,
                    eventLocation: eventDetails.location,
                }),
            })

            const data = await res.json()

            if (res.ok) {
                setMessage({ text: 'Reminder set successfully!', type: 'success' })
                setEmail('')
                setTimeout(() => {
                    onClose()
                    setMessage(null)
                }, 2000)
            } else {
                setMessage({ text: data.error || 'Failed to set reminder.', type: 'error' })
            }
        } catch (error) {
            setMessage({ text: 'Something went wrong. Please try again.', type: 'error' })
        }
        setLoading(false)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md pointer-events-auto overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-red-600 px-6 py-4 flex justify-between items-center text-white">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Bell className="w-5 h-5" />
                                    Get Notified
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <p className="text-gray-600 mb-4">
                                    Enter your email to receive reminders for:
                                    <br />
                                    <strong className="text-gray-900">{eventDetails.title}</strong>
                                </p>
                                <p className="text-xs text-gray-500 mb-6">
                                    We'll notify you 1 day before and a few hours before the event starts.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                                        />
                                    </div>

                                    {message && (
                                        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            {message.text}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Setting Reminder...
                                            </>
                                        ) : (
                                            'Notify Me'
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
