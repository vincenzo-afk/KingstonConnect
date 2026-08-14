import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
    BedDouble,
    Bath,
    MapPin,
    Phone,
    Mail,
    ShieldCheck,
    Star,
    Users,
    Wifi,
    X,
    ChevronLeft,
    ChevronRight,
    Search,
    SlidersHorizontal,
    MessageCircle,
    IndianRupee,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    properties,
    propertyTypes,
    furnishingOptions,
    priceRanges,
    genderOptions,
    type Property,
    type PropertyType,
} from '@/data/properties';

// =============================================================================
// SORT OPTIONS
// =============================================================================

type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'distance' | 'rating';

const sortOptions: { value: SortKey; label: string }[] = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'distance', label: 'Nearest to Campus' },
    { value: 'rating', label: 'Top Rated' },
];

// =============================================================================
// HELPER RENDERERS
// =============================================================================

const formatRent = (rent: number) => `₹${rent.toLocaleString('en-IN')}`;

const StarRating: React.FC<{ rating: number; reviews: number }> = ({ rating, reviews }) => (
    <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded-lg px-1.5 py-0.5">
            <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300">{rating.toFixed(1)}</span>
        </div>
        <span className="text-xs text-slate-500">({reviews} reviews)</span>
    </div>
);

const FALLBACK_IMAGE = '/assets/housing/fallback.jpg';

// =============================================================================
// PROPERTY CARD
// =============================================================================

interface PropertyCardProps {
    property: Property;
    onClick: (p: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => (
    <button
        type="button"
        onClick={() => onClick(property)}
        className="group w-full text-left rounded-2xl overflow-hidden bg-[#131b24] border border-white/5 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10"
    >
        <div className="relative h-44 overflow-hidden">
            <img
                src={property.images[0]}
                alt={property.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
            />
            <div className="absolute top-3 left-3 flex gap-2">
                <Badge
                    variant={property.type === 'PG' || property.type === 'Shared Hostel' ? 'success' : 'info'}
                    className="bg-slate-900/70 backdrop-blur border-white/10"
                >
                    {property.type}
                </Badge>
                {property.verified && (
                    <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 backdrop-blur gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                    </Badge>
                )}
            </div>
            <div className="absolute bottom-3 right-3 bg-slate-900/75 backdrop-blur rounded-lg px-2.5 py-1 border border-white/10">
                <span className="text-sm font-bold text-white">
                    {formatRent(property.monthlyRent)}
                    <span className="text-[11px] font-normal text-slate-400">/month</span>
                </span>
            </div>
        </div>

        <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-white leading-snug group-hover:text-cyan-400 transition-colors">
                    {property.title}
                </h3>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                <MapPin className="w-3.5 h-3.5" />
                {property.area} · {property.distanceKm} km from campus
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-300 mb-3">
                <span className="flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4 text-cyan-400" />
                    {property.beds} {property.beds === 1 ? 'Bed' : 'Beds'}
                </span>
                <span className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4 text-cyan-400" />
                    {property.baths} {property.baths === 1 ? 'Bath' : 'Baths'}
                </span>
                <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-cyan-400" />
                    Max {property.maxOccupants}
                </span>
            </div>

            <div className="flex items-center justify-between">
                <StarRating rating={property.rating} reviews={property.reviews} />
                <span className="text-[11px] text-slate-500">{property.furnishing}</span>
            </div>
        </div>
    </button>
);

// =============================================================================
// PROPERTY DETAIL MODAL
// =============================================================================

interface PropertyDetailModalProps {
    property: Property;
    onClose: () => void;
}

const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({ property, onClose }) => {
    const [imageIndex, setImageIndex] = useState(0);

    const nextImage = () => setImageIndex((i) => (i + 1) % property.images.length);
    const prevImage = () =>
        setImageIndex((i) => (i - 1 + property.images.length) % property.images.length);

    const whatsappLink = `https://wa.me/${property.ownerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        `Hi ${property.ownerName}, I found your listing "${property.title}" (${property.id}) on KingstonConnect. Is it still available?`
    )}`;
    const mailtoLink = `mailto:${property.ownerEmail}?subject=${encodeURIComponent(
        `Inquiry: ${property.title}`
    )}&body=${encodeURIComponent(
        `Hi ${property.ownerName},\n\nI found your listing "${property.title}" (${property.id}) on KingstonConnect and would like to know more about availability and visit timings.\n\nThank you.`
    )}`;

    return (
        <Modal isOpen={true} onClose={onClose}>
            <div className="max-h-[78vh] overflow-y-auto -m-6 px-6">
                {/* Image gallery */}
                <div className="relative rounded-2xl overflow-hidden bg-[#0a0f14]">
                    <img
                        src={property.images[imageIndex]}
                        alt={property.title}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                        }}
                    />
                    {property.images.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={prevImage}
                                aria-label="Previous image"
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/70 border border-white/10 flex items-center justify-center text-white hover:bg-slate-800 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={nextImage}
                                aria-label="Next image"
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/70 border border-white/10 flex items-center justify-center text-white hover:bg-slate-800 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {property.images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setImageIndex(idx)}
                                        aria-label={`Go to image ${idx + 1}`}
                                        className={cn(
                                            'w-2 h-2 rounded-full transition-colors',
                                            idx === imageIndex ? 'bg-cyan-400' : 'bg-white/30'
                                        )}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close details"
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-900/70 border border-white/10 flex items-center justify-center text-white hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Header */}
                <div className="mt-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30">
                            {property.type}
                        </Badge>
                        {property.verified && (
                            <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                Verified Listing
                            </Badge>
                        )}
                        <StarRating rating={property.rating} reviews={property.reviews} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{property.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-slate-400 mt-1">
                        <MapPin className="w-4 h-4" />
                        {property.area} · {property.distanceKm} km from campus
                    </div>
                </div>

                {/* Key stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                    <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
                        <IndianRupee className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                        <p className="text-white font-bold">{formatRent(property.monthlyRent)}</p>
                        <p className="text-[11px] text-slate-400">monthly rent</p>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
                        <IndianRupee className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                        <p className="text-white font-bold">{formatRent(property.securityDeposit)}</p>
                        <p className="text-[11px] text-slate-400">deposit (one-time)</p>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
                        <BedDouble className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                        <p className="text-white font-bold">
                            {property.beds} Bed · {property.baths} Bath
                        </p>
                        <p className="text-[11px] text-slate-400">up to {property.maxOccupants} occupants</p>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center">
                        <Users className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                        <p className="text-white font-bold">{property.furnishing}</p>
                        <p className="text-[11px] text-slate-400">available {property.availableFrom}</p>
                    </div>
                </div>

                {/* Description */}
                <div className="mt-5">
                    <h4 className="text-sm font-semibold text-white mb-2">About this property</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{property.description}</p>
                </div>

                {/* Quick facts */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-white/10 text-slate-300">
                        Preference: {property.genderPreference === 'Any' ? 'No preference' : property.genderPreference}
                    </Badge>
                    {property.foodIncluded && (
                        <Badge variant="outline" className="border-white/10 text-slate-300">
                            Meals included
                        </Badge>
                    )}
                </div>

                {/* Amenities */}
                <div className="mt-5">
                    <h4 className="text-sm font-semibold text-white mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                        {property.amenities.map((amenity) => (
                            <span
                                key={amenity}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 px-3 py-1.5 text-xs text-cyan-200"
                            >
                                <Wifi className="w-3 h-3" />
                                {amenity}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Contact owner */}
                <div className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/25 p-5">
                    <h4 className="text-sm font-semibold text-white mb-1">Contact Owner</h4>
                    <p className="text-sm text-slate-400 mb-4">
                        {property.ownerName} · Available from {property.availableFrom}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                            variant="primary"
                            icon={<MessageCircle className="w-4 h-4" />}
                            onClick={() => window.open(whatsappLink, '_blank')}
                        >
                            WhatsApp
                        </Button>
                        <Button
                            variant="secondary"
                            icon={<Mail className="w-4 h-4" />}
                            onClick={() => (window.location.href = mailtoLink)}
                        >
                            Send Email
                        </Button>
                        <Button
                            variant="secondary"
                            icon={<Phone className="w-4 h-4" />}
                            onClick={() => (window.location.href = `tel:${property.ownerPhone}`)}
                        >
                            {property.ownerPhone}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

// =============================================================================
// HOUSING PAGE
// =============================================================================

const HousingPage: React.FC = () => {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<PropertyType | 'All'>('All');
    const [furnishingFilter, setFurnishingFilter] = useState<string>('All');
    const [priceFilter, setPriceFilter] = useState<string>('All');
    const [genderFilter, setGenderFilter] = useState<string>('Any');
    const [sortKey, setSortKey] = useState<SortKey>('recommended');
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    const filtered = useMemo(() => {
        let list = properties.filter((p) => {
            const matchesSearch =
                search.trim() === '' ||
                p.title.toLowerCase().includes(search.toLowerCase()) ||
                p.area.toLowerCase().includes(search.toLowerCase()) ||
                p.amenities.some((a) => a.toLowerCase().includes(search.toLowerCase()));

            const matchesType = typeFilter === 'All' || p.type === typeFilter;
            const matchesFurnishing =
                furnishingFilter === 'All' || p.furnishing === furnishingFilter;
            const range = priceRanges.find((r) => r.label === priceFilter);
            const matchesPrice = range
                ? p.monthlyRent >= range.min && p.monthlyRent < range.max
                : true;
            const matchesGender =
                genderFilter === 'Any' ||
                p.genderPreference === genderFilter ||
                p.genderPreference === 'Any';

            return matchesSearch && matchesType && matchesFurnishing && matchesPrice && matchesGender;
        });

        switch (sortKey) {
            case 'price-asc':
                list = [...list].sort((a, b) => a.monthlyRent - b.monthlyRent);
                break;
            case 'price-desc':
                list = [...list].sort((a, b) => b.monthlyRent - a.monthlyRent);
                break;
            case 'distance':
                list = [...list].sort((a, b) => a.distanceKm - b.distanceKm);
                break;
            case 'rating':
                list = [...list].sort((a, b) => b.rating - a.rating);
                break;
            default:
                list = [...list].sort((a, b) => b.rating + b.reviews * 0.05 - (a.rating + a.reviews * 0.05));
        }

        return list;
    }, [search, typeFilter, furnishingFilter, priceFilter, genderFilter, sortKey]);

    const hasActiveFilters =
        search !== '' ||
        typeFilter !== 'All' ||
        furnishingFilter !== 'All' ||
        priceFilter !== 'All' ||
        genderFilter !== 'Any' ||
        sortKey !== 'recommended';

    const clearFilters = () => {
        setSearch('');
        setTypeFilter('All');
        setFurnishingFilter('All');
        setPriceFilter('All');
        setGenderFilter('Any');
        setSortKey('recommended');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-white/5 p-6 md:p-8">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl opacity-30" />
                <div className="relative">
                    <h2 className="text-2xl font-bold text-white">Student Housing</h2>
                    <p className="text-slate-400 mt-1">
                        Verified PGs, hostels and apartments near Kingston Engineering College
                    </p>
                    <div className="mt-4 max-w-xl">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, area or amenity..."
                            className="bg-slate-900/60 border-white/10 text-white placeholder:text-slate-500"
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card variant="glass" className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SlidersHorizontal className="w-4 h-4 text-slate-400" />

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as PropertyType | 'All')}
                        aria-label="Property type"
                        className="rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                    >
                        <option value="All">All Types</option>
                        {propertyTypes.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>

                    <select
                        value={furnishingFilter}
                        onChange={(e) => setFurnishingFilter(e.target.value)}
                        aria-label="Furnishing"
                        className="rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                    >
                        <option value="All">Any Furnishing</option>
                        {furnishingOptions.map((f) => (
                            <option key={f} value={f}>
                                {f}
                            </option>
                        ))}
                    </select>

                    <select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        aria-label="Price range"
                        className="rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                    >
                        <option value="All">Any Price</option>
                        {priceRanges.map((r) => (
                            <option key={r.label} value={r.label}>
                                {r.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={genderFilter}
                        onChange={(e) => setGenderFilter(e.target.value)}
                        aria-label="Gender preference"
                        className="rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                    >
                        {genderOptions.map((g) => (
                            <option key={g} value={g}>
                                {g === 'Any' ? 'Any Preference' : `${g} Only`}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value as SortKey)}
                        aria-label="Sort listings"
                        className="rounded-lg bg-slate-900/60 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                    >
                        {sortOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </Card>

            {/* Results */}
            <div>
                <p className="text-sm text-slate-400 mb-4">
                    {filtered.length} {filtered.length === 1 ? 'property' : 'properties'} found
                </p>

                {filtered.length === 0 ? (
                    <Card variant="glass" className="p-10 text-center">
                        <Search className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                        <p className="text-white font-medium mb-1">No properties match your filters</p>
                        <p className="text-sm text-slate-400 mb-4">
                            Try adjusting your search or clearing filters
                        </p>
                        <Button variant="secondary" onClick={clearFilters}>
                            Clear filters
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map((p) => (
                            <PropertyCard key={p.id} property={p} onClick={setSelectedProperty} />
                        ))}
                    </div>
                )}
            </div>

            {/* Detail modal */}
            {selectedProperty && (
                <PropertyDetailModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
            )}
        </div>
    );
};

export default HousingPage;
