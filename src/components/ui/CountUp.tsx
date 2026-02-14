'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

interface CountUpProps {
    end: string | number
    duration?: number
    className?: string
    prefix?: string
    suffix?: string
}

export default function CountUp({
    end,
    duration = 2000,
    className = '',
    prefix = '',
    suffix = ''
}: CountUpProps) {
    const [displayValue, setDisplayValue] = useState('')
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })

    // Parse the input to find the first number to animate
    // e.g. "1995" -> 1995
    // "1995-2000" -> 1995 (and we'll append "-2000")
    // "2000+" -> 2000 (and we'll append "+")
    const parseValue = (val: string | number) => {
        const stringVal = String(val)
        const match = stringVal.match(/(\d+)(.*)/)

        if (match) {
            return {
                number: parseInt(match[1], 10),
                rest: match[2] || '',
                fullString: stringVal
            }
        }

        return {
            number: 0,
            rest: stringVal,
            fullString: stringVal
        }
    }

    const parsed = useMemo(() => parseValue(end), [end])

    const [initialDisplay] = useState<string>(() => {
        if (parsed.number === 0 && parsed.rest === parsed.fullString && !/\d/.test(parsed.fullString)) {
            return parsed.fullString
        }
        return ''
    })

    useEffect(() => {
        if (isInView) {
            const { number, rest, fullString } = parsed

            // If no number found (e.g. just text), just show it
            if (number === 0 && rest === fullString && !/\d/.test(fullString)) return

            let startTime: number | null = null
            let animationFrame: number

            const animate = (timestamp: number) => {
                if (!startTime) startTime = timestamp
                const progress = timestamp - startTime

                if (progress < duration) {
                    const percentage = Math.min(progress / duration, 1)
                    // Ease out quart
                    const ease = 1 - Math.pow(1 - percentage, 4)

                    const currentCount = Math.floor(number * ease)
                    setDisplayValue(`${currentCount}${rest}`)

                    animationFrame = requestAnimationFrame(animate)
                } else {
                    setDisplayValue(`${number}${rest}`)
                }
            }

            animationFrame = requestAnimationFrame(animate)

            return () => cancelAnimationFrame(animationFrame)
        }
    }, [isInView, parsed, duration])

    return (
        <span ref={ref} className={className}>
            {prefix}{displayValue || (isInView ? initialDisplay || parsed.fullString : '0')}{suffix}
        </span>
    )
}
