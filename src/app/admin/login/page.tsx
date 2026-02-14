'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')
    const [loggingIn, setLoggingIn] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => { document.title = "Login - IPL Admin" }, [])

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault()
        setLoginError('')
        setLoggingIn(true)
        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })
            const data = await res.json()
            if (res.ok && data.success) {
                router.push('/admin')
                router.refresh()
            } else {
                setLoginError(data.error || 'Invalid credentials')
            }
        } catch {
            setLoginError('Unable to connect to server')
        }
        setLoggingIn(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50">
            <div className="w-full max-w-sm">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-8">
                    {/* Logo / Brand */}
                    <div className="text-center mb-8">
                        {/* Use next/image for optimized images */}
                        <img src="/Images/1000185730.jpg" alt="IPL Logo" className="w-32 h-32 object-contain mb-4 mx-auto" />
                        <h1 className="text-2xl font-bold text-neutral-900">IPL Admin</h1>
                    </div>

                    {/* Error Message */}
                    {loginError && (
                        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            {loginError}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Username</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username"
                                    className="w-full border border-neutral-200 rounded-lg pl-10 pr-4 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full border border-neutral-200 rounded-lg pl-10 pr-10 py-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loggingIn}
                            className="w-full bg-red-700 text-white py-3 rounded-lg font-semibold hover:bg-red-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loggingIn ? (
                                <span className="inline-flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    {/* Footer */}
                </div>
                <p className="text-center text-xs text-neutral-400 mt-5">IPL · International Pattina League</p>
            </div>
        </div>
    )
}
