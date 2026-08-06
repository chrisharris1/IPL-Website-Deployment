'use client'

import React, { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { useTranslation } from '@/contexts/TranslationContext'
import FeedbackModal from './FeedbackModal'

export default function FloatingFeedbackButton() {
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 gap-2 px-3 sm:px-5 py-2.5 sm:py-3 rounded-full bg-red-700 hover:bg-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-200"
                title={t('feedback.title', 'Send Feedback')}
                aria-label={t('feedback.title', 'Send Feedback')}
            >
                <MessageSquare className="w-5 h-5 sm:w-5 sm:h-5 group-hover:animate-bounce shrink-0" />
                <span className="font-bold text-xs sm:text-sm whitespace-nowrap">{t('feedback.title', 'Send Feedback')}</span>
            </button>

            <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    )
}
