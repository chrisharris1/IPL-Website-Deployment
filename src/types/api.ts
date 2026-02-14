// API Response Types matching PHP backend structure

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Carousel
export interface CarouselImage {
  image_url: string
  title?: string
  subtitle?: string
  hide_text: boolean
}

// Humanitarian Services
export interface HumanitarianService {
  id: number
  title_en: string
  title_ta: string
  country: string
  state: string
  district: string
  city: string
  date: string
  description_en: string
  description_ta: string
  image_url: string
}

export interface ServicesAPIResponse {
  data: HumanitarianService[]
  meta: {
    total: number
    limit: number
    offset: number
  }
}

// About Us
export interface AboutSection {
  id: number
  section_title_en: string
  section_title_ta: string
  content_en: string
  content_ta: string
  order_index: number
}

// News & Events
export interface NewsEvent {
  id: number
  title_en: string
  title_ta: string
  country: string
  state: string
  district: string
  city: string
  date: string
  time: string
  description_en: string
  description_ta: string
  image_url: string
}

export interface NewsResponse {
  upcoming: NewsEvent[]
  past: NewsEvent[]
  meta: {
    today: string
    upcoming_count: number
    past_count: number
  }
}

// Team
export interface TeamMember {
  id: number | string
  name: string
  role: string
  hierarchy_level?: number
  image_url: string
  order_index: number
  email?: string
  phone?: string
}

export interface RoleHierarchy {
  id: number
  name: string
  level: number
  description?: string
  target_count?: number
}

export interface TeamLevelGroup {
  level: number
  roleName: string
  description: string
  members: TeamMember[]
}

export interface TeamResponse {
  presidents: TeamMember[]
  trustees: TeamMember[]
  hierarchy: Record<string, TeamMember[]>
  roleHierarchy: RoleHierarchy[]
  membersByLevel: TeamLevelGroup[]
}

// Friendship Meet
export interface FriendshipEvent {
  id: number
  details_en: string
  details_ta: string
  image_url: string
  created_at: string
}

export interface FriendshipLocation {
  id: number
  country: string
  state: string
  district: string
  year: number
}

export interface FriendshipLocationWithEvents {
  location: FriendshipLocation
  events: FriendshipEvent[]
}

export interface FriendshipResponse {
  flat: FriendshipLocationWithEvents[]
  hierarchical: {
    [country: string]: {
      [state: string]: {
        [district: string]: {
          [year: string]: FriendshipEvent[]
        }
      }
    }
  }
  meta: {
    total_locations: number
  }
}

// Home Page Combined Response
export interface HomeResponse {
  carousel: CarouselImage[]
  services: HumanitarianService[]
}
