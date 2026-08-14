import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { properties, type Property } from '@/data/properties';
import { useHousingStore } from '@/stores/housingStore';
import {
    Heart,
    HeartOff,
    MapPin,
    BedDouble,
    Bath,
    Users,
    Star,
    GitCompareArrows,
    ArrowLeft,
    ShieldCheck,
} from 'lucide-react';

// =============================================================================
// HOUSING WISHLIST — saved listings
// =============================================================================

const FALLBACK_IMAGE = '/assets/housing/fallback.jpg';

const formatRent = (rent: number) => `₹${rent.toLocaleString('en-IN')}/month`;

const HousingWishlistPage: React.FC = () => {
    const { wishlist, toggleWishlist, toggleCompare, isInCompare } = useHousingStore();
    const [selected, setSelected] = useState<Property | null>(null);

    const saved = wishlist
        .map((id) => properties.find((p) => p.id === id))
        .filter((p): p is Property => Boolean(p));

    const totalMinRent = saved.reduce((sum, p) => sum + p.monthlyRent, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Heart className="w-6 h-6 text-rose-400" /> My Wishlist
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        {saved.length} {saved.length === 1 ? 'property' : 'properties'} saved ·{' '}
                        estimated total {formatRent(totalMinRent)} if renting all
                    </p>
                </div>
                <Link to="/housing">
                    <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
                        Back to Listings
                    </Button>
                </Link>
            </div>

            {saved.length === 0 ? (
                <Card variant="glass" className="p-10 text-center">
                    <Heart className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <p className="text-white font-medium mb-1">Your wishlist is empty</p>
                    <p className="text-sm text-slate-400 mb-4">
                        Tap the heart icon on any listing to save it here
                    </p>
                    <Link to="/housing">
                        <Button variant="primary">Browse Listings</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {saved.map((p) => (
                        <div
                            key={p.id}
                            className="group rounded-2xl overflow-hidden bg-[#131b24] border border-white/5 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10"
                        >
                            <div className="relative h-44 overflow-hidden cursor-pointer" onClick={() => setSelected(p)}>
                                <img
                                    src={p.images[0]}
                                    alt={p.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                                    }}
                                />
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <Badge
                                        variant={p.type === 'PG' || p.type === 'Shared Hostel' ? 'success' : 'info'}
                                        className="bg-slate-900/70 backdrop-blur border-white/10"
                                    >
                                        {p.type}
                                    </Badge>
                                    {p.verified && (
                                        <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 backdrop-blur gap-1">
                                            <ShieldCheck className="w-3 h-3" /> Verified
                                        </Badge>
                                    )}
                                </div>
                                <div className="absolute bottom-3 right-3 bg-slate-900/75 backdrop-blur rounded-lg px-2.5 py-1 border border-white/10">
                                    <span className="text-sm font-bold text-white">{formatRent(p.monthlyRent)}</span>
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="font-semibold text-white leading-snug mb-1 cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => setSelected(p)}>
                                    {p.title}
                                </h3>
                                <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {p.area} · {p.distanceKm} km from campus
                                </div>

                                <div className="flex items-center gap-4 text-xs text-slate-300 mb-3">
                                    <span className="flex items-center gap-1.5">
                                        <BedDouble className="w-4 h-4 text-cyan-400" /> {p.beds} Bed{p.beds === 1 ? '' : 's'}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Bath className="w-4 h-4 text-cyan-400" /> {p.baths} Bath{p.baths === 1 ? '' : 's'}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4 text-cyan-400" /> Max {p.maxOccupants}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-1 text-sm">
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        <span className="text-white font-medium">{p.rating}</span>
                                        <span className="text-xs text-slate-500">({p.reviews})</span>
                                    </div>
                                    <span className="text-[11px] text-slate-500">{p.furnishing}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        icon={isInCompare(p.id) ? <Heart className="w-3.5 h-3.5 text-cyan-300" /> : <GitCompareArrows className="w-3.5 h-3.5" />}
                                        onClick={() => toggleCompare(p.id)}
                                        className={isInCompare(p.id) ? 'border-cyan-500/40 text-cyan-300' : ''}
                                    >
                                        {isInCompare(p.id) ? 'In Compare' : 'Compare'}
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        icon={<HeartOff className="w-3.5 h-3.5" />}
                                        onClick={() => toggleWishlist(p.id)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail modal (reuse same layout as listings) */}
            {selected && (
                <Modal isOpen onClose={() => setSelected(null)} size="lg" title={selected.title}>
                    <div className="space-y-4">
                        <div className="h-52 rounded-xl overflow-hidden bg-white/5">
                            <img
                                src={selected.images[0]}
                                alt={selected.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-slate-400 text-xs">Rent</p>
                                <p className="text-white font-semibold">{formatRent(selected.monthlyRent)}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs">Deposit</p>
                                <p className="text-white font-semibold">{formatRent(selected.securityDeposit)}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs">Location</p>
                                <p className="text-white font-semibold">{selected.area} ({selected.distanceKm} km)</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs">Available from</p>
                                <p className="text-white font-semibold">{selected.availableFrom}</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-300">{selected.description}</p>
                        <p className="text-xs text-slate-400">
                            Contact: {selected.ownerName} · {selected.ownerPhone}
                        </p>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                icon={<GitCompareArrows className="w-4 h-4" />}
                                onClick={() => {
                                    toggleCompare(selected.id);
                                    setSelected(null);
                                    window.location.href = '/housing-compare';
                                }}
                            >
                                Add to Compare
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                icon={<Heart className="w-4 h-4" />}
                                onClick={() => toggleWishlist(selected.id)}
                            >
                                Remove from Wishlist
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default HousingWishlistPage;
