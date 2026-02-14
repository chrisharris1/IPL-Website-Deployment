/**
 * API Client for Next.js Backend
 * 
 * Centralized API calls with error handling and type safety
 */

import type {
    APIResponse,
    HomeResponse,
    AboutSection,
    ServicesAPIResponse,
    NewsResponse,
    TeamResponse,
    FriendshipResponse,
} from '@/types/api'

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<APIResponse<T>> {
    try {
        const response = await fetch(endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data as APIResponse<T>
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        }
    }
}


/**
 * Home API - Get carousel images and latest services
 */
export async function getHomeData(): Promise<APIResponse<HomeResponse>> {
    return apiFetch<HomeResponse>('/api/home')
}

/**
 * About Us API - Get all sections
 */
export async function getAboutSections(): Promise<APIResponse<AboutSection[]>> {
    return apiFetch<AboutSection[]>('/api/about')
}

/**
 * Humanitarian Services API - Get services with optional filters
 */
export async function getServices(params?: {
    country?: string
    state?: string
    district?: string
    limit?: number
    offset?: number
}): Promise<APIResponse<ServicesAPIResponse>> {
    const queryParams = new URLSearchParams()

    if (params?.country) queryParams.append('country', params.country)
    if (params?.state) queryParams.append('state', params.state)
    if (params?.district) queryParams.append('district', params.district)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())

    const query = queryParams.toString()
    const endpoint = `/api/services${query ? `?${query}` : ''}`

    return apiFetch<ServicesAPIResponse>(endpoint)
}

/**
 * News & Events API - Get upcoming and past events
 */
export async function getNewsEvents(search?: string): Promise<APIResponse<NewsResponse>> {
    const query = search ? `?search=${encodeURIComponent(search)}` : ''
    return apiFetch<NewsResponse>(`/api/news${query}`)
}

/**
 * Team API - Get presidents and trustees
 */
export async function getTeam(): Promise<APIResponse<TeamResponse>> {
    return apiFetch<TeamResponse>('/api/team')
}

/**
 * Friendship Meet API - Get locations and events
 */
export async function getFriendshipMeet(): Promise<APIResponse<FriendshipResponse>> {
    return apiFetch<FriendshipResponse>('/api/friendship')
}
