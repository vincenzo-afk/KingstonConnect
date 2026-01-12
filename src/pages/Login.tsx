import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { Card } from '@/components/ui/Card';

import { Button } from '@/components/ui/Button';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

// =============================================================================
// LOGIN PAGE
// =============================================================================

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: typeof errors = {};

        if (!email) newErrors.email = 'Email is required';
        else if (!validateEmail(email)) newErrors.email = 'Invalid email format';
        if (!password) newErrors.password = 'Password is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch {
            setErrors({ password: 'Invalid credentials' });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0f14]">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <Card className="relative z-10 w-full max-w-md bg-[#131b24]/80 backdrop-blur-xl border-white/10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-24 h-24 mx-auto mb-6">
                        <img src="/logo.png" alt="KingstonConnect Logo" className="w-full h-full object-contain drop-shadow-2xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-slate-400">Sign in to KingstonConnect</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors({ ...errors, email: undefined });
                                }}
                                className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${errors.email
                                    ? 'border-red-500 focus:ring-red-500/50'
                                    : 'border-white/10 focus:ring-cyan-500/50 focus:border-cyan-500'
                                    }`}
                                placeholder="your.email@example.com"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-sm text-red-400 mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors({ ...errors, password: undefined });
                                }}
                                className={`w-full pl-11 pr-12 py-3 rounded-xl border bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${errors.password
                                    ? 'border-red-500 focus:ring-red-500/50'
                                    : 'border-white/10 focus:ring-cyan-500/50 focus:border-cyan-500'
                                    }`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-sm text-red-400 mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Demo Credentials Note */}
                    <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <p className="text-sm text-cyan-400">
                            <strong>Demo:</strong> Enter any email/password to login
                        </p>
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
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </Button>
                </form>

                {/* Register Link */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                            Register
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;
