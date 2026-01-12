import React, { useState } from 'react';
import { useAuthStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Edit, Save, Camera, Mail, Phone, Building2, Hash, Calendar } from 'lucide-react';

// =============================================================================
// PROFILE PAGE
// =============================================================================

const ProfilePage: React.FC = () => {
    const { user, updateProfile } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
    });

    const handleSave = () => {
        updateProfile(formData);
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const inputClasses = (disabled: boolean) => `
        w-full px-4 py-3 rounded-xl border bg-white/5 text-white placeholder-slate-500 
        focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all
        ${disabled ? 'border-white/5 cursor-not-allowed opacity-60' : 'border-white/10'}
    `;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Profile Header Card */}
            <Card className="relative overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-cyan-500/20 to-blue-500/20" />

                <div className="relative pt-8 px-6 pb-6">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <Avatar
                                src={user?.avatar}
                                alt={`${user?.firstName} ${user?.lastName}`}
                                size="xl"
                                className="w-28 h-28 border-4 border-[#131b24]"
                            />
                            <button className="absolute bottom-0 right-0 p-2 bg-cyan-500 rounded-full text-white hover:bg-cyan-600 transition-colors shadow-lg">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl font-bold text-white mb-1">
                                {user?.firstName} {user?.lastName}
                            </h1>
                            <p className="text-slate-400 mb-2">{user?.email}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                <Badge variant="primary" className="capitalize">{user?.role}</Badge>
                                <Badge variant="secondary">{user?.department}</Badge>
                                {user?.semester && (
                                    <Badge variant="default">Semester {user.semester}</Badge>
                                )}
                            </div>
                        </div>

                        {/* Edit Button */}
                        <Button
                            variant={isEditing ? 'primary' : 'outline'}
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className="gap-2"
                        >
                            {isEditing ? (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            ) : (
                                <>
                                    <Edit className="w-4 h-4" />
                                    Edit Profile
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Personal Information */}
            <Card>
                <h2 className="text-lg font-semibold text-white mb-6">Personal Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            First Name
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={inputClasses(!isEditing)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Last Name
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className={inputClasses(!isEditing)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className={`${inputClasses(true)} pl-11`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Phone
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className={`${inputClasses(!isEditing)} pl-11`}
                                placeholder="+91 9876543210"
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Academic Information */}
            <Card>
                <h2 className="text-lg font-semibold text-white mb-6">Academic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Department
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={user?.department || ''}
                                disabled
                                className={`${inputClasses(true)} pl-11`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            {user?.role === 'student' ? 'Roll Number' : 'Employee ID'}
                        </label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={user?.rollNumber || user?.employeeId || ''}
                                disabled
                                className={`${inputClasses(true)} pl-11`}
                            />
                        </div>
                    </div>

                    {user?.role === 'student' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Section
                                </label>
                                <input
                                    type="text"
                                    value={user?.section || ''}
                                    disabled
                                    className={inputClasses(true)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Semester
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        value={user?.semester || ''}
                                        disabled
                                        className={`${inputClasses(true)} pl-11`}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* Academic Stats (Students Only) */}
            {user?.role === 'student' && (
                <Card>
                    <h2 className="text-lg font-semibold text-white mb-6">Academic Statistics</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
                            <p className="text-sm text-slate-400 mb-1">CGPA</p>
                            <p className="text-3xl font-bold text-white">{user?.cgpa?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20">
                            <p className="text-sm text-slate-400 mb-1">Credits Earned</p>
                            <p className="text-3xl font-bold text-white">{user?.credits || 0}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
                            <p className="text-sm text-slate-400 mb-1">Class Rank</p>
                            <p className="text-3xl font-bold text-white">#{user?.rank || 0}</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ProfilePage;
