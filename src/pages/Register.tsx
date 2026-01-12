import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, type UserRole, type Department } from '@/stores';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, User, Phone, Loader2 } from 'lucide-react';

// =============================================================================
// REGISTER PAGE
// =============================================================================

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student' as UserRole,
        department: 'CSE' as Department,
        rollNumber: '',
        phone: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { register, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await register(formData);
            navigate('/dashboard');
        } catch {
            setErrors({ email: 'Registration failed' });
        }
    };

    const inputClasses = (hasError: boolean) => `
        w-full pl-11 pr-4 py-3 rounded-xl border bg-white/5 text-white placeholder-slate-500 
        focus:outline-none focus:ring-2 transition-all
        ${hasError
            ? 'border-red-500 focus:ring-red-500/50'
            : 'border-white/10 focus:ring-cyan-500/50 focus:border-cyan-500'
        }
    `;

    const selectClasses = (hasError: boolean) => `
        w-full px-4 py-3 rounded-xl border bg-white/5 text-white 
        focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer
        ${hasError
            ? 'border-red-500 focus:ring-red-500/50'
            : 'border-white/10 focus:ring-cyan-500/50 focus:border-cyan-500'
        }
    `;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0f14]">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <Card className="relative z-10 w-full max-w-2xl bg-[#131b24]/80 backdrop-blur-xl border-white/10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg shadow-cyan-500/30">
                        K
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-slate-400">Join KingstonConnect</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                First Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className={inputClasses(!!errors.firstName)}
                                    placeholder="John"
                                />
                            </div>
                            {errors.firstName && (
                                <p className="text-sm text-red-400 mt-1">{errors.firstName}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Last Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className={inputClasses(!!errors.lastName)}
                                    placeholder="Doe"
                                />
                            </div>
                            {errors.lastName && (
                                <p className="text-sm text-red-400 mt-1">{errors.lastName}</p>
                            )}
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={inputClasses(!!errors.email)}
                                placeholder="your.email@example.com"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-red-400 mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Role & Department */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className={selectClasses(false)}
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="hod">HOD</option>
                                <option value="principal">Principal</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Department
                            </label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className={selectClasses(false)}
                            >
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="EEE">EEE</option>
                                <option value="MECH">MECH</option>
                                <option value="CIVIL">CIVIL</option>
                                <option value="IT">IT</option>
                            </select>
                        </div>
                    </div>

                    {/* Phone (optional) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Phone (optional)
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={inputClasses(false)}
                                placeholder="+91 9876543210"
                            />
                        </div>
                    </div>

                    {/* Password Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={inputClasses(!!errors.password)}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-400 mt-1">{errors.password}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={inputClasses(!!errors.confirmPassword)}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-400 mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default RegisterPage;
