// =============================================================================
// STUDENT HOUSING DATA
// Curated listings near Kingston Engineering College campus
// =============================================================================

export type PropertyType = 'PG' | 'Apartment' | 'Flat' | 'Shared Hostel' | 'Villa';
export type Furnishing = 'Fully Furnished' | 'Semi Furnished' | 'Unfurnished';

export interface Property {
    id: string;
    title: string;
    type: PropertyType;
    area: string;
    monthlyRent: number;
    securityDeposit: number;
    beds: number;
    baths: number;
    maxOccupants: number;
    furnishing: Furnishing;
    distanceKm: number;
    rating: number;
    reviews: number;
    verified: boolean;
    images: string[];
    amenities: string[];
    description: string;
    ownerName: string;
    ownerPhone: string;
    ownerEmail: string;
    availableFrom: string;
    genderPreference: 'Boys' | 'Girls' | 'Any';
    foodIncluded: boolean;
}

export const properties: Property[] = [
    {
        id: 'kc-101',
        title: 'Sunrise PG for Boys',
        type: 'PG',
        area: 'Anna Nagar',
        monthlyRent: 6500,
        securityDeposit: 6500,
        beds: 1,
        baths: 2,
        maxOccupants: 12,
        furnishing: 'Fully Furnished',
        distanceKm: 1.2,
        rating: 4.6,
        reviews: 38,
        verified: true,
        images: [
            '/assets/housing/sunrise-pg-exterior.jpg',
            '/assets/housing/sunrise-pg-room.jpg',
            '/assets/housing/sunrise-pg-kitchen.jpg',
        ],
        amenities: ['Wi-Fi', 'Hot Water', 'Laundry', 'Mess', 'CCTV', 'Power Backup', 'Housekeeping'],
        description:
            'Well-maintained paying guest accommodation with homely food, disciplined environment and 24/7 security. Walking distance to campus with evening snacks and weekly room cleaning included.',
        ownerName: 'Mr. Ramesh Kumar',
        ownerPhone: '+91 98765 43210',
        ownerEmail: 'sunrisepg@example.com',
        availableFrom: 'Immediately',
        genderPreference: 'Boys',
        foodIncluded: true,
    },
    {
        id: 'kc-102',
        title: 'Green Valley Girls Hostel',
        type: 'Shared Hostel',
        area: 'T. Nagar',
        monthlyRent: 7200,
        securityDeposit: 7200,
        beds: 2,
        baths: 3,
        maxOccupants: 20,
        furnishing: 'Fully Furnished',
        distanceKm: 2.4,
        rating: 4.8,
        reviews: 52,
        verified: true,
        images: [
            '/assets/housing/greenvalley-exterior.jpg',
            '/assets/housing/greenvalley-room.jpg',
            '/assets/housing/sunrise-pg-room.jpg',
        ],
        amenities: ['Wi-Fi', 'Meals', 'Study Room', 'CCTV', 'Guard', 'Gym Access', 'First Aid'],
        description:
            'Secure girls-only hostel with biometric entry, warden on duty round the clock, nutritious veg meals and a dedicated study hall. Ideal for first-year students new to the city.',
        ownerName: 'Mrs. Lakshmi Venkatesh',
        ownerPhone: '+91 91234 56780',
        ownerEmail: 'greenvalleyhostel@example.com',
        availableFrom: '1 September 2026',
        genderPreference: 'Girls',
        foodIncluded: true,
    },
    {
        id: 'kc-103',
        title: 'Metro View 2BHK Apartment',
        type: 'Apartment',
        area: 'Koyambedu',
        monthlyRent: 14500,
        securityDeposit: 43500,
        beds: 2,
        baths: 2,
        maxOccupants: 4,
        furnishing: 'Semi Furnished',
        distanceKm: 3.1,
        rating: 4.4,
        reviews: 17,
        verified: true,
        images: [
            '/assets/housing/metroview-living.jpg',
            '/assets/housing/metroview-bedroom.jpg',
            '/assets/housing/campusedge-studio.jpg',
        ],
        amenities: ['Wi-Fi Ready', 'Lift', 'Parking', 'Water Supply', 'Balcony', 'Gated Community'],
        description:
            'Spacious 2BHK in a gated community 5 minutes from Koyambedu metro. Perfect for two students sharing. Recently painted with new fans, geysers and kitchen fittings.',
        ownerName: 'Mr. Senthil Babu',
        ownerPhone: '+91 99887 76655',
        ownerEmail: 'senthilb@example.com',
        availableFrom: '15 August 2026',
        genderPreference: 'Any',
        foodIncluded: false,
    },
    {
        id: 'kc-104',
        title: 'Campus Edge Studio Flat',
        type: 'Flat',
        area: 'Vadapalani',
        monthlyRent: 9800,
        securityDeposit: 19600,
        beds: 1,
        baths: 1,
        maxOccupants: 2,
        furnishing: 'Fully Furnished',
        distanceKm: 1.8,
        rating: 4.3,
        reviews: 24,
        verified: true,
        images: [
            '/assets/housing/campusedge-studio.jpg',
            '/assets/housing/sunrise-pg-room.jpg',
            '/assets/housing/greenvalley-room.jpg',
        ],
        amenities: ['Wi-Fi', 'AC', 'Washing Machine', 'Fridge', 'Security', 'Water Tank'],
        description:
            'Compact fully furnished studio ideal for focused students. AC bedroom, attached bathroom, and a common terrace for drying clothes. Owner stays on the ground floor.',
        ownerName: 'Mr. Arun Prakash',
        ownerPhone: '+91 98111 22233',
        ownerEmail: 'arunprakash@example.com',
        availableFrom: 'Immediately',
        genderPreference: 'Any',
        foodIncluded: false,
    },
    {
        id: 'kc-105',
        title: 'Scholar Residency PG',
        type: 'PG',
        area: 'Ashok Nagar',
        monthlyRent: 5800,
        securityDeposit: 5800,
        beds: 1,
        baths: 2,
        maxOccupants: 16,
        furnishing: 'Fully Furnished',
        distanceKm: 2.9,
        rating: 4.1,
        reviews: 61,
        verified: false,
        images: [
            '/assets/housing/sunrise-pg-exterior.jpg',
            '/assets/housing/sunrise-pg-kitchen.jpg',
            '/assets/housing/sunrise-pg-room.jpg',
        ],
        amenities: ['Wi-Fi', 'Mess', 'Laundry', 'Rooftop', 'Power Backup', 'Bicycle Parking'],
        description:
            'Budget-friendly PG popular with engineering students. Includes three meals a day, laundry twice a week and a rooftop hangout space. Rooms are shared by two.',
        ownerName: 'Mr. Gopal Iyer',
        ownerPhone: '+91 94444 55566',
        ownerEmail: 'scholarresidency@example.com',
        availableFrom: 'Immediately',
        genderPreference: 'Boys',
        foodIncluded: true,
    },
    {
        id: 'kc-106',
        title: 'Pearl Towers 3BHK Villa Suite',
        type: 'Villa',
        area: 'Alwarpet',
        monthlyRent: 22000,
        securityDeposit: 66000,
        beds: 3,
        baths: 3,
        maxOccupants: 6,
        furnishing: 'Fully Furnished',
        distanceKm: 4.5,
        rating: 4.7,
        reviews: 9,
        verified: true,
        images: [
            '/assets/housing/pearltowers-living.jpg',
            '/assets/housing/pearltowers-bedroom.jpg',
            '/assets/housing/metroview-living.jpg',
        ],
        amenities: ['Wi-Fi', 'AC', 'Parking', 'Servant Room', 'Terrace Garden', 'Swimming Pool'],
        description:
            'Premium villa suite with modern interiors, ideal for a group of three students who want hotel-like comfort. Each bedroom has its own bathroom and wardrobe.',
        ownerName: 'Mrs. Deepa Rajan',
        ownerPhone: '+91 97777 88899',
        ownerEmail: 'deeparajan@example.com',
        availableFrom: '1 October 2026',
        genderPreference: 'Any',
        foodIncluded: false,
    },
    {
        id: 'kc-107',
        title: 'Hostel Horizon - Boys Wing',
        type: 'Shared Hostel',
        area: 'Kodambakkam',
        monthlyRent: 6900,
        securityDeposit: 6900,
        beds: 1,
        baths: 2,
        maxOccupants: 24,
        furnishing: 'Semi Furnished',
        distanceKm: 3.6,
        rating: 4.0,
        reviews: 73,
        verified: true,
        images: [
            '/assets/housing/greenvalley-exterior.jpg',
            '/assets/housing/sunrise-pg-exterior.jpg',
            '/assets/housing/sunrise-pg-kitchen.jpg',
        ],
        amenities: ['Wi-Fi', 'Mess', 'Gym', 'Library', 'CCTV', 'Ambulance Tie-up', 'Cricket Net'],
        description:
            'Large professional hostel with a library, small gym and cricket net. Mess serves south Indian breakfast and rotating north Indian dinners. Bus stop right outside.',
        ownerName: 'Mr. Vinod Menon',
        ownerPhone: '+91 93333 11122',
        ownerEmail: 'hostelhorizon@example.com',
        availableFrom: 'Immediately',
        genderPreference: 'Boys',
        foodIncluded: true,
    },
    {
        id: 'kc-108',
        title: 'Lake Breeze 1BHK Flat',
        type: 'Flat',
        area: 'Nungambakkam',
        monthlyRent: 12500,
        securityDeposit: 25000,
        beds: 1,
        baths: 1,
        maxOccupants: 2,
        furnishing: 'Semi Furnished',
        distanceKm: 5.2,
        rating: 4.5,
        reviews: 12,
        verified: true,
        images: [
            '/assets/housing/metroview-living.jpg',
            '/assets/housing/greenvalley-room.jpg',
            '/assets/housing/pearltowers-living.jpg',
        ],
        amenities: ['Parking', 'Water Supply', 'Balcony', 'Near Market', 'Quiet Area', 'Pet Allowed'],
        description:
            'Peaceful 1BHK overlooking the lake. Semi furnished with modular kitchen and cupboards. Quiet neighborhood perfect for students who prefer cooking their own meals.',
        ownerName: 'Mr. Karthik Raghavan',
        ownerPhone: '+91 96666 44455',
        ownerEmail: 'karthikr@example.com',
        availableFrom: '1 September 2026',
        genderPreference: 'Any',
        foodIncluded: false,
    },
    {
        id: 'kc-109',
        title: 'Nivaa Girls PG Deluxe',
        type: 'PG',
        area: 'Saidapet',
        monthlyRent: 8200,
        securityDeposit: 8200,
        beds: 1,
        baths: 1,
        maxOccupants: 10,
        furnishing: 'Fully Furnished',
        distanceKm: 2.1,
        rating: 4.7,
        reviews: 31,
        verified: true,
        images: [
            '/assets/housing/greenvalley-room.jpg',
            '/assets/housing/pearltowers-bedroom.jpg',
            '/assets/housing/sunrise-pg-room.jpg',
        ],
        amenities: ['Wi-Fi', 'AC', 'Meals', 'Laundry', 'CCTV', 'Guard', 'Milk & Snacks'],
        description:
            'Deluxe single-occupancy rooms for girls with AC, attached bathroom and a common dining area. Monthly outings and festival celebrations organized by management.',
        ownerName: 'Mrs. Kavitha Sundaram',
        ownerPhone: '+91 95555 33344',
        ownerEmail: 'nivaapg@example.com',
        availableFrom: 'Immediately',
        genderPreference: 'Girls',
        foodIncluded: true,
    },
    {
        id: 'kc-110',
        title: 'Transit Hub 2BHK Near Bus Stand',
        type: 'Apartment',
        area: 'Guindy',
        monthlyRent: 13200,
        securityDeposit: 39600,
        beds: 2,
        baths: 2,
        maxOccupants: 4,
        furnishing: 'Unfurnished',
        distanceKm: 3.8,
        rating: 3.9,
        reviews: 8,
        verified: false,
        images: [
            '/assets/housing/metroview-bedroom.jpg',
            '/assets/housing/metroview-living.jpg',
            '/assets/housing/campusedge-studio.jpg',
        ],
        amenities: ['Water Supply', 'Parking', 'Lift', 'Near Metro', 'Near Hospital', 'Market Nearby'],
        description:
            'Unfurnished 2BHK in a low-maintenance building next to Guindy bus stand and metro. Students furnish it as they like. Rent negotiable for 11-month agreements.',
        ownerName: 'Mr. Farooq Ahmed',
        ownerPhone: '+91 92222 77788',
        ownerEmail: 'farooqa@example.com',
        availableFrom: '15 September 2026',
        genderPreference: 'Any',
        foodIncluded: false,
    },
    {
        id: 'kc-111',
        title: 'Oakwood Shared Hostel Unisex',
        type: 'Shared Hostel',
        area: 'Ekkaduthangal',
        monthlyRent: 7800,
        securityDeposit: 15600,
        beds: 1,
        baths: 2,
        maxOccupants: 18,
        furnishing: 'Fully Furnished',
        distanceKm: 2.7,
        rating: 4.2,
        reviews: 44,
        verified: true,
        images: [
            '/assets/housing/pearltowers-living.jpg',
            '/assets/housing/greenvalley-room.jpg',
            '/assets/housing/greenvalley-exterior.jpg',
        ],
        amenities: ['Wi-Fi', 'Meals', 'Common Room', 'TV Lounge', 'CCTV', 'Vending Machines', 'Housekeeping'],
        description:
            'Modern co-living hostel with single and double rooms, biometric access and a lively common lounge. Weekly events help newcomers make friends fast.',
        ownerName: 'Mr. Daniel Thomas',
        ownerPhone: '+91 90000 12345',
        ownerEmail: 'oakwoodhostel@example.com',
        availableFrom: 'Immediately',
        genderPreference: 'Any',
        foodIncluded: true,
    },
    {
        id: 'kc-112',
        title: 'Riverside Villa 4BHK',
        type: 'Villa',
        area: 'Adyar',
        monthlyRent: 26500,
        securityDeposit: 79500,
        beds: 4,
        baths: 4,
        maxOccupants: 8,
        furnishing: 'Fully Furnished',
        distanceKm: 5.8,
        rating: 4.8,
        reviews: 6,
        verified: true,
        images: [
            '/assets/housing/pearltowers-bedroom.jpg',
            '/assets/housing/pearltowers-living.jpg',
            '/assets/housing/metroview-bedroom.jpg',
        ],
        amenities: ['Wi-Fi', 'AC', 'Parking', 'Garden', 'Terrace', 'Servant Quarter', 'Power Backup'],
        description:
            'Beautiful riverside villa for senior students preparing for placements together. Spacious bedrooms, large dining table and a garden for weekend get-togethers.',
        ownerName: 'Mrs. Meenakshi Iyer',
        ownerPhone: '+91 98888 99900',
        ownerEmail: 'meenakshiiyer@example.com',
        availableFrom: '1 October 2026',
        genderPreference: 'Any',
        foodIncluded: false,
    },
];

// =============================================================================
// FILTER OPTIONS DERIVED FROM DATA
// =============================================================================

export const propertyTypes: PropertyType[] = ['PG', 'Apartment', 'Flat', 'Shared Hostel', 'Villa'];

export const furnishingOptions: Furnishing[] = ['Fully Furnished', 'Semi Furnished', 'Unfurnished'];

export const priceRanges = [
    { label: 'Under ₹7,000', min: 0, max: 7000 },
    { label: '₹7,000 – ₹12,000', min: 7000, max: 12000 },
    { label: '₹12,000 – ₹20,000', min: 12000, max: 20000 },
    { label: 'Above ₹20,000', min: 20000, max: Infinity },
];

export const genderOptions = ['Any', 'Boys', 'Girls'] as const;
