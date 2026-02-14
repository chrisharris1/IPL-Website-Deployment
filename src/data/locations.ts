// Location data for India with states, districts, and cities
export interface City {
  name: string
}

export interface District {
  name: string
  cities: City[]
}

export interface State {
  name: string
  districts: District[]
}

export interface Country {
  name: string
  states: State[]
}

export const locations: Country[] = [
  {
    name: 'India',
    states: [
      {
        name: 'Tamil Nadu',
        districts: [
          {
            name: 'Chennai',
            cities: [
              { name: 'Mylapore' },
              { name: 'T Nagar' },
              { name: 'Adyar' },
              { name: 'Velachery' },
              { name: 'Anna Nagar' },
            ],
          },
          {
            name: 'Coimbatore',
            cities: [
              { name: 'RS Puram' },
              { name: 'Gandhipuram' },
              { name: 'Saibaba Colony' },
            ],
          },
          {
            name: 'Madurai',
            cities: [{ name: 'Madurai City' }, { name: 'Pasumalai' }],
          },
        ],
      },
      {
        name: 'Maharashtra',
        districts: [
          {
            name: 'Mumbai',
            cities: [
              { name: 'Andheri' },
              { name: 'Bandra' },
              { name: 'Borivali' },
              { name: 'Dadar' },
            ],
          },
          {
            name: 'Pune',
            cities: [{ name: 'Pune City' }, { name: 'Pimpri-Chinchwad' }],
          },
          {
            name: 'Nagpur',
            cities: [{ name: 'Nagpur City' }],
          },
        ],
      },
      {
        name: 'Karnataka',
        districts: [
          {
            name: 'Bangalore Urban',
            cities: [
              { name: 'Bangalore' },
              { name: 'Jayanagar' },
              { name: 'Whitefield' },
            ],
          },
          {
            name: 'Mysore',
            cities: [{ name: 'Mysore City' }],
          },
        ],
      },
      {
        name: 'Kerala',
        districts: [
          {
            name: 'Thiruvananthapuram',
            cities: [{ name: 'Trivandrum' }],
          },
          {
            name: 'Ernakulam',
            cities: [{ name: 'Kochi' }, { name: 'Ernakulam' }],
          },
        ],
      },
      {
        name: 'West Bengal',
        districts: [
          {
            name: 'Kolkata',
            cities: [{ name: 'Kolkata City' }, { name: 'Howrah' }],
          },
        ],
      },
      {
        name: 'Andhra Pradesh',
        districts: [
          {
            name: 'Visakhapatnam',
            cities: [{ name: 'Visakhapatnam' }],
          },
          {
            name: 'Guntur',
            cities: [{ name: 'Guntur' }],
          },
        ],
      },
      {
        name: 'Telangana',
        districts: [
          {
            name: 'Hyderabad',
            cities: [{ name: 'Hyderabad' }, { name: 'Secunderabad' }],
          },
        ],
      },
      {
        name: 'Gujarat',
        districts: [
          {
            name: 'Ahmedabad',
            cities: [{ name: 'Ahmedabad' }],
          },
          {
            name: 'Surat',
            cities: [{ name: 'Surat' }],
          },
        ],
      },
      {
        name: 'Rajasthan',
        districts: [
          {
            name: 'Jaipur',
            cities: [{ name: 'Jaipur' }],
          },
        ],
      },
      {
        name: 'Delhi',
        districts: [
          {
            name: 'Central Delhi',
            cities: [{ name: 'Connaught Place' }, { name: 'Karol Bagh' }],
          },
          {
            name: 'South Delhi',
            cities: [{ name: 'Hauz Khas' }, { name: 'Saket' }],
          },
        ],
      },
    ],
  },
]

// Helper functions
export function getCountries(): string[] {
  return locations.map((country) => country.name)
}

export function getStates(countryName: string): string[] {
  const country = locations.find((c) => c.name === countryName)
  return country ? country.states.map((state) => state.name) : []
}

export function getDistricts(countryName: string, stateName: string): string[] {
  const country = locations.find((c) => c.name === countryName)
  if (!country) return []
  const state = country.states.find((s) => s.name === stateName)
  return state ? state.districts.map((district) => district.name) : []
}

export function getCities(countryName: string, stateName: string, districtName: string): string[] {
  const country = locations.find((c) => c.name === countryName)
  if (!country) return []
  const state = country.states.find((s) => s.name === stateName)
  if (!state) return []
  const district = state.districts.find((d) => d.name === districtName)
  return district ? district.cities.map((city) => city.name) : []
}
