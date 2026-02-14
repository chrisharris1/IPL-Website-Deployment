export type HumanitarianEvent = {
  id: number
  title: string
  description: string
  fullDescription: string
  date: string
  location: string
  country: string
  state: string
  district: string
  image: string
  category: 'medical' | 'education' | 'relief' | 'shelter' | 'clothing' | 'other'
}

export const humanitarianEvents: HumanitarianEvent[] = [
  {
    id: 1,
    title: 'Medical Assistance, Mumbai',
    description: 'Free medical checkup and medicine distribution',
    fullDescription: 'IPL organized a comprehensive medical camp providing free health checkups, diagnostic tests, and essential medicines to underprivileged communities in Mumbai. Our team of volunteer doctors and nurses provided healthcare services to over 200 individuals.',
    date: 'Dec 26, 2024',
    location: 'Mumbai, Maharashtra, India',
    country: 'India',
    state: 'Maharashtra',
    district: 'Mumbai',
    image: '/Images/_Founder_President_Trustee-2.png',
    category: 'medical'
  },
  {
    id: 2,
    title: 'Chennai Admin Meeting & Medical Assistance',
    description: 'Medical support combined with administrative coordination',
    fullDescription: 'The Chennai chapter organized an administrative meeting combined with medical assistance outreach. We coordinated regional activities and provided medical support to local communities, ensuring better healthcare access.',
    date: 'Jan 11, 2024',
    location: 'Chennai, Tamil Nadu, India',
    country: 'India',
    state: 'Tamil Nadu',
    district: 'Chennai',
    image: '/Images/carousel-2.jpg',
    category: 'medical'
  },
  {
    id: 3,
    title: 'Education Fee Assistance, Bangalore',
    description: 'Scholarship and fee support for underprivileged students',
    fullDescription: 'IPL distributed education fee assistance to 50+ deserving students in Bangalore. This initiative helped ensure that talented but financially constrained children could continue their education without interruption.',
    date: 'Dec 2023',
    location: 'Bangalore, Karnataka, India',
    country: 'India',
    state: 'Karnataka',
    district: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1427504494785-cdaa41e4c5c0?auto=format&fit=crop&w=1200&q=60',
    category: 'education'
  },
  {
    id: 4,
    title: 'School Uniform Distribution - Delhi',
    description: 'Free uniforms for school children',
    fullDescription: 'Distributed school uniforms to 150 children from underprivileged families in Delhi. This helped improve school attendance and boost the confidence of children to attend school regularly.',
    date: 'Nov 2023',
    location: 'Delhi, India',
    country: 'India',
    state: 'Delhi',
    district: 'Central Delhi',
    image: 'https://images.unsplash.com/photo-1503454537688-e0c4feb565a2?auto=format&fit=crop&w=1200&q=60',
    category: 'clothing'
  },
  {
    id: 5,
    title: 'Relief Distribution - Flood Affected Areas',
    description: 'Emergency aid to flood victims',
    fullDescription: 'Provided emergency relief materials including food, water, blankets, and medical supplies to families affected by floods. Our team worked 24/7 to ensure affected families received immediate assistance.',
    date: 'Oct 2023',
    location: 'Pune, Maharashtra, India',
    country: 'India',
    state: 'Maharashtra',
    district: 'Pune',
    image: 'https://images.unsplash.com/photo-1532996122724-8f3c2cd83c5d?auto=format&fit=crop&w=1200&q=60',
    category: 'relief'
  },
  {
    id: 6,
    title: 'Community Shelter Program',
    description: 'Providing safe housing for homeless',
    fullDescription: 'Established temporary shelters for homeless individuals during winter months. Provided blankets, meals, and basic amenities to ensure dignity and safety for vulnerable populations.',
    date: 'Sep 2023',
    location: 'Coimbatore, Tamil Nadu, India',
    country: 'India',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    image: 'https://images.unsplash.com/photo-1559027615-cd2628902d4a?auto=format&fit=crop&w=1200&q=60',
    category: 'shelter'
  },
  {
    id: 7,
    title: 'Medical Camp - Tirunelveli',
    description: 'Health awareness and free checkups',
    fullDescription: 'Organized a full-day medical camp with specialty doctors providing free consultations and treatments. Conducted health awareness sessions on hygiene, nutrition, and disease prevention.',
    date: 'Aug 2023',
    location: 'Tirunelveli, Tamil Nadu, India',
    country: 'India',
    state: 'Tamil Nadu',
    district: 'Tirunelveli',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=60',
    category: 'medical'
  },
  {
    id: 8,
    title: 'Skill Training Program - Nashik',
    description: 'Vocational training for youth employment',
    fullDescription: 'Conducted skill development workshops training 100+ youth in various vocational skills including tailoring, computer basics, and entrepreneurship. Helped participants secure employment or start their own ventures.',
    date: 'Jul 2023',
    location: 'Nashik, Maharashtra, India',
    country: 'India',
    state: 'Maharashtra',
    district: 'Nashik',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=60',
    category: 'education'
  },
  {
    id: 9,
    title: 'Water & Sanitation Project',
    description: 'Clean water supply installation',
    fullDescription: 'Installed water purification systems and sanitation facilities in 5 villages. Educated communities on water conservation and proper hygiene practices. Over 1000 people benefited from this initiative.',
    date: 'Jun 2023',
    location: 'Krishnagiri, Tamil Nadu, India',
    country: 'India',
    state: 'Tamil Nadu',
    district: 'Krishnagiri',
    image: 'https://images.unsplash.com/photo-1532996122724-8f3c2cd83c5d?auto=format&fit=crop&w=1200&q=60',
    category: 'relief'
  },
  {
    id: 10,
    title: 'Orphanage Support Program',
    description: 'Monthly care packages for orphans',
    fullDescription: 'Provided regular support to local orphanages including food, educational materials, clothing, and medical care. Organized recreational activities and mentorship programs for children.',
    date: 'May 2023',
    location: 'Nagpur, Maharashtra, India',
    country: 'India',
    state: 'Maharashtra',
    district: 'Nagpur',
    image: 'https://images.unsplash.com/photo-1559027615-cd2628902d4a?auto=format&fit=crop&w=1200&q=60',
    category: 'relief'
  },
  {
    id: 11,
    title: 'Women Empowerment Workshop',
    description: 'Self-defense and business training',
    fullDescription: 'Conducted comprehensive workshops on self-defense, financial literacy, and small business development. Empowered 80 women to start their own micro-enterprises with initial capital support.',
    date: 'Apr 2023',
    location: 'Belagavi, Karnataka, India',
    country: 'India',
    state: 'Karnataka',
    district: 'Belagavi',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=60',
    category: 'education'
  },
  {
    id: 12,
    title: 'Health Awareness Campaign',
    description: 'Disease prevention and wellness education',
    fullDescription: 'Launched a comprehensive health awareness campaign covering topics like diabetes, hypertension, and reproductive health. Reached 5000+ people through seminars and door-to-door campaigns.',
    date: 'Mar 2023',
    location: 'Udupi, Karnataka, India',
    country: 'India',
    state: 'Karnataka',
    district: 'Udupi',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=60',
    category: 'medical'
  },
  {
    id: 13,
    title: 'Library & Reading Room Setup',
    description: 'Establishing learning centers in villages',
    fullDescription: 'Set up reading rooms and mini libraries in 8 villages with over 2000 books in local languages. Conducted reading sessions and mentoring programs to promote literacy among children.',
    date: 'Feb 2023',
    location: 'Tumakuru, Karnataka, India',
    country: 'India',
    state: 'Karnataka',
    district: 'Tumakuru',
    image: 'https://images.unsplash.com/photo-1507842217343-583f20270319?auto=format&fit=crop&w=1200&q=60',
    category: 'education'
  },
  {
    id: 14,
    title: 'Elder Care Support',
    description: 'Medical assistance and companionship for seniors',
    fullDescription: 'Provided comprehensive care support to elderly citizens including medical checkups, medication management, and regular home visits. Also organized recreational activities to combat loneliness.',
    date: 'Jan 2023',
    location: 'East Delhi, Delhi, India',
    country: 'India',
    state: 'Delhi',
    district: 'East Delhi',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=60',
    category: 'medical'
  },
  {
    id: 15,
    title: 'Environmental Cleanup Drive',
    description: 'Community cleanliness and tree planting',
    fullDescription: 'Organized environmental awareness campaign with community cleanup drives and tree planting initiatives. Planted 500+ trees and involved 300+ volunteers in making communities cleaner and greener.',
    date: 'Dec 2022',
    location: 'West Delhi, Delhi, India',
    country: 'India',
    state: 'Delhi',
    district: 'West Delhi',
    image: 'https://images.unsplash.com/photo-1532996122724-8f3c2cd83c5d?auto=format&fit=crop&w=1200&q=60',
    category: 'relief'
  },
  {
    id: 16,
    title: 'Disability Support Initiative',
    description: 'Assistive devices and rehabilitation',
    fullDescription: 'Distributed assistive devices to differently-abled individuals and provided rehabilitation services. Helped 40+ individuals gain mobility and independence through wheelchairs, crutches, and hearing aids.',
    date: 'Nov 2022',
    location: 'North Delhi, Delhi, India',
    country: 'India',
    state: 'Delhi',
    district: 'North Delhi',
    image: 'https://images.unsplash.com/photo-1559027615-cd2628902d4a?auto=format&fit=crop&w=1200&q=60',
    category: 'relief'
  },
  {
    id: 17,
    title: 'Mental Health Awareness Program',
    description: 'Counseling and psychological support',
    fullDescription: 'Conducted mental health awareness sessions and provided free counseling services to community members. Trained peer supporters to help reduce stigma around mental health issues.',
    date: 'Oct 2022',
    location: 'Mumbai, Maharashtra, India',
    country: 'India',
    state: 'Maharashtra',
    district: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=60',
    category: 'medical'
  },
  {
    id: 18,
    title: 'Food Security Program',
    description: 'Distribution of subsidized food items',
    fullDescription: 'Distributed essential food items including rice, pulses, and fortified flour to 200+ families below poverty line. Partnered with local vendors to ensure fresh and quality products.',
    date: 'Sep 2022',
    location: 'Pune, Maharashtra, India',
    country: 'India',
    state: 'Maharashtra',
    district: 'Pune',
    image: 'https://images.unsplash.com/photo-1532996122724-8f3c2cd83c5d?auto=format&fit=crop&w=1200&q=60',
    category: 'relief'
  },
  {
    id: 19,
    title: 'Sports Equipment Donation',
    description: 'Supporting youth sports development',
    fullDescription: 'Donated sports equipment and uniforms to 15 schools in rural areas. Sponsored coaching and organized inter-school sports tournaments to promote physical fitness and teamwork.',
    date: 'Aug 2022',
    location: 'Nagpur, Maharashtra, India',
    country: 'India',
    state: 'Maharashtra',
    district: 'Nagpur',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=60',
    category: 'education'
  },
  {
    id: 20,
    title: 'Digital Literacy Initiative',
    description: 'Computer training for rural communities',
    fullDescription: 'Conducted computer literacy classes for 150+ adults and children in rural areas. Provided basic training on internet usage, online safety, and digital payment systems for financial inclusion.',
    date: 'Jul 2022',
    location: 'Nashik, Maharashtra, India',
    country: 'India',
    state: 'Maharashtra',
    district: 'Nashik',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=60',
    category: 'education'
  }
]
