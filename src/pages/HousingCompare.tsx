import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { properties } from '@/data/properties';
import { useHousingStore } from '@/stores/housingStore';
import {
    GitCompareArrows,
    MapPin,
    Minus,
    Plus,
    ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// HOUSING COMPARE — side-by-side comparison of up to 3 listings
// =============================================================================

const FALLBACK_IMAGE = '/assets/housing/fallback.jpg';

const formatRent = (rent: number) => `₹${rent.toLocaleString('en-IN')}`;

interface CompareRow {
    label: string;
    render: (p: Property) => React.ReactNode;
    highlight?: (p: Property, all: Property[]) => "best" | "worst" | undefined;
}

const compareRows: CompareRow[] = [
    { label: 'Monthly Rent', render: (p) => formatRent(p.monthlyRent), highlight: (p, all) => (p.monthlyRent === Math.min(...all.map((a) => a.monthlyRent)) ? 'best' : undefined) },
    { label: 'Security Deposit', render: (p) => formatRent(p.securityDeposit) },
    { label: 'Property Type', render: (p) => p.type },
    { label: 'Area', render: (p) => `${p.area} (${p.distanceKm} km from campus)` },
    { label: 'Beds', render: (p) => `${p.beds} ${p.beds === 1 ? 'Bed' : 'Beds'}` },
    { label: 'Baths', render: (p) => `${p.baths}` },
    { label: 'Max Occupants', render: (p) => p.maxOccupants },
    { label: 'Furnishing', render: (p) => p.furnishing },
    { label: 'Food Included', render: (p) => (p.foodIncluded ? 'Yes' : 'No') },
    { label: 'Gender Preference', render: (p) => p.genderPreference },
    { label: 'Rating', render: (p) => `${p.rating} (${p.reviews} reviews)`, highlight: (p, all) => (p.rating === Math.max(...all.map((a) => a.rating)) ? 'best' : undefined) },
    { label: 'Verified', render: (p) => (p.verified ? 'Yes' : 'No') },
    { label: 'Available From', render: (p) => p.availableFrom },
    { label: 'Amenities', render: (p) => p.amenities.length, highlight: (p, all) => (p.amenities.length === Math.max(...all.map((a) => a.amenities.length)) ? 'best' : undefined) },
    { label: 'Owner', render: (p) => p.ownerName },
    { label: 'Contact', render: (p) => p.ownerPhone },
];

type Property = typeof properties[number];

const HousingComparePage: React.FC = () => {
    const [searchParams] = useSearchParams();

    const { compare, toggleCompare } = useHousingStore();

    const paramIds = searchParams.get('ids')?.split(',') ?? [];
    // Union of url ids and store compare list, preserving order
    const ids = Array.from(new Set([...paramIds, ...compare])).filter((id) =>
        properties.some((p) => p.id === id)
    ).slice(0, 3);

    const selected = ids
        .map((id) => properties.find((p) => p.id === id))
        .filter((p): p is Property => Boolean(p));

    const best = (row: CompareRow, p: Property) => {
        if (!row.highlight) return false;
        return row.highlight(p, selected) === 'best';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <GitCompareArrows className="w-6 h-6 text-cyan-400" /> Compare Properties
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Side-by-side comparison of up to 3 listings ({selected.length} selected)
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link to="/housing">
                        <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
                            Back to Listings
                        </Button>
                    </Link>
                </div>
            </div>

            {selected.length === 0 ? (
                <Card variant="glass" className="p-10 text-center">
                    <GitCompareArrows className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <p className="text-white font-medium mb-1">No properties selected for comparison</p>
                    <p className="text-sm text-slate-400 mb-4">
                        Add up to 3 properties to compare from the listings page
                    </p>
                    <Link to="/housing">
                        <Button variant="primary">Browse Listings</Button>
                    </Link>
                </Card>
            ) : (
                <>
                    {/* Comparison table */}
                    <Card className="overflow-x-auto p-0">
                        <table className="w-full min-w-[640px]">
                            <tbody>
                                <tr className="border-b border-white/10">
                                    <th className="text-left p-4 text-slate-400 font-medium w-40 align-top">Property</th>
                                    {selected.map((p) => (
                                        <th key={p.id} className="p-3 w-64 align-top">
                                            <div className="relative h-36 rounded-xl overflow-hidden mb-3">
                                                <img
                                                    src={p.images[0]}
                                                    alt={p.title}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                                                    }}
                                                />
                                                <button
                                                    onClick={() => toggleCompare(p.id)}
                                                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/80 backdrop-blur border border-white/10 flex items-center justify-center text-slate-300 hover:text-red-400 transition-colors"
                                                    aria-label="Remove from compare"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <p className="font-semibold text-white text-sm leading-snug">{p.title}</p>
                                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {p.area}
                                            </p>
                                            <div className="flex gap-1.5 mt-2">
                                                <Badge
                                                    variant={p.type === 'PG' || p.type === 'Shared Hostel' ? 'success' : 'info'}
                                                    size="sm"
                                                >
                                                    {p.type}
                                                </Badge>
                                                {p.verified && (
                                                    <Badge variant="success" size="sm">Verified</Badge>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                    {Array.from({ length: 3 - selected.length }).map((_, i) => (
                                        <th key={`empty-${i}`} className="p-3 w-64 align-top">
                                            <div className="h-36 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center mb-3">
                                                <span className="text-xs text-slate-500">Empty slot</span>
                                            </div>
                                            <p className="text-sm text-slate-500">Add another property</p>
                                            <Link to="/housing" className="inline-block mt-2">
                                                <Button variant="outline" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                                                    Browse
                                                </Button>
                                            </Link>
                                        </th>
                                    ))}
                                </tr>
                                {compareRows.map((row, ri) => (
                                    <tr key={row.label} className={cn('border-b border-white/5', ri % 2 && 'bg-white/[0.02]')}>
                                        <td className="p-4 text-sm text-slate-400 font-medium align-top">{row.label}</td>
                                        {selected.map((p) => (
                                            <td
                                                key={p.id}
                                                className={cn(
                                                    'p-4 text-sm align-top',
                                                    best(row, p) ? 'text-cyan-300 font-semibold' : 'text-white'
                                                )}
                                            >
                                                {row.render(p)}
                                                {best(row, p) && (
                                                    <span className="block text-[10px] text-cyan-400 uppercase tracking-wide mt-0.5">Best</span>
                                                )}
                                            </td>
                                        ))}
                                        {Array.from({ length: 3 - selected.length }).map((_, i) => (
                                            <td key={`e-${i}`} className="p-4 align-top">
                                                <span className="text-slate-600 text-sm">—</span>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                <tr className="border-b border-white/5">
                                    <td className="p-4 text-sm text-slate-400 font-medium align-top">Actions</td>
                                    {selected.map((p) => (
                                        <td key={p.id} className="p-4 align-top">
                                            <Link to={`/housing?detail=${p.id}`}>
                                                <Button variant="primary" size="sm">
                                                    View Details
                                                </Button>
                                            </Link>
                                        </td>
                                    ))}
                                    {Array.from({ length: 3 - selected.length }).map((_, i) => (
                                        <td key={`a-${i}`} className="p-4 align-top">
                                            <span className="text-slate-600 text-sm">—</span>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </Card>

                    <p className="text-xs text-slate-500">
                        Cyan highlights indicate the best value in each category among the compared listings.
                    </p>
                </>
            )}
        </div>
    );
};

export default HousingComparePage;
