export interface FriendshipMeet {
    id: string;
    year: string;
    number: number;
    title: string;
    titleTa?: string;
    date: string;
    location: string;
    state: string;
    district: string;
    description: string;
    descriptionTa?: string;
    image: string;
    gallery?: string[];
    participants?: string;
    status: 'upcoming' | 'completed';
}

export const friendshipMeets: FriendshipMeet[] = [
    {
        id: 'meet-28',
        year: '2025',
        number: 28,
        title: '28th Friendship Meet',
        titleTa: '28வது நட்புச் சங்கமம்',
        date: '24 MAY 2025',
        location: 'To be announced',
        state: 'TBD',
        district: 'TBD',
        description: 'The 28th Annual Friendship Meet bringing together pen friends from across India and abroad.',
        descriptionTa: 'இந்தியா மற்றும் வெளிநாடுகளில் இருந்து பேனா நண்பர்களை ஒன்றிணைக்கும் 28வது ஆண்டு நட்புச் சங்கமம்.',
        image: '/Images/friendship-meet/2024.jpg', // Placeholder
        status: 'upcoming',
        participants: 'Expected 500+'
    },
    {
        id: 'meet-27',
        year: '2024',
        number: 27,
        title: '27th Friendship Meet',
        titleTa: '27வது நட்புச் சங்கமம்',
        date: '25 MAY 2024',
        location: 'Kuttalam, Tenkasi District',
        state: 'Tamil Nadu',
        district: 'Tenkasi',
        description: '27th Annual Friendship Meet held at TMNS Hall, Kuttalam. A grand gathering celebrating decades of friendship.',
        descriptionTa: 'குத்தாலம் டி.எம்.என்.எஸ் ஹாலில் நடைபெற்ற 27வது ஆண்டு நட்புச் சங்கமம். பல தசாப்தகால நட்பைக் கொண்டாடும் பிரமாண்டமான கூட்டம்.',
        image: '/Images/friendship-meet/2024.jpg', // Placeholder
        status: 'completed',
        participants: '400+'
    },
    {
        id: 'meet-26',
        year: '2023',
        number: 26,
        title: '26th Friendship Meet',
        titleTa: '26வது நட்புச் சங்கமம்',
        date: '20 MAY 2023',
        location: 'New Delhi',
        state: 'Delhi',
        district: 'New Delhi',
        description: 'Shri Vittal Mandir Hall, Ramakrishnapuram, New Delhi. Members from north and south India united for a memorable event.',
        descriptionTa: 'புதுதில்லி ராமகிருஷ்ணாபுரத்தில் உள்ள ஸ்ரீ விட்டல் மந்திர் ஹால். வடக்கு மற்றும் தென்னிந்தியாவைச் சேர்ந்த உறுப்பினர்கள் மறக்கமுடியாத நிகழ்வுக்காக ஒன்று கூடினர்.',
        image: '/Images/friendship-meet/2023.jpg', // Placeholder
        status: 'completed',
        participants: '350+'
    },
    {
        id: 'meet-1',
        year: '1996',
        number: 1,
        title: '1st Friendship Meet',
        titleTa: '1வது நட்புச் சங்கமம்',
        date: '1996',
        location: 'Chennai',
        state: 'Tamil Nadu',
        district: 'Chennai',
        description: 'The inaugural Friendship Meet that started it all.',
        descriptionTa: 'எல்லாவற்றையும் தொடங்கிய தொடக்க நட்புச் சங்கமம்.',
        image: '/Images/friendship-meet/1996.jpg', // Placeholder
        status: 'completed',
        participants: '50+'
    }
];
