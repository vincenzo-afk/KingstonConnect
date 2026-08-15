import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { Card } from '@/components/ui/Card';

import { Button } from '@/components/ui/Button';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

// =============================================================================
// LOGIN PAGE (real Firebase Auth: email/password + Google)
// =============================================================================

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const { login, loginWithGoogle, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const validateEmail = (em: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);

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
            // Real Firebase error is surfaced via the store's `error` state
        }
    };

    const handleGoogle = async () => {
        try {
            await loginWithGoogle();
            navigate('/dashboard');
        } catch {
            // Real Firebase error surfaced via the store's `error` state
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

                {/* Firebase error banner (auth/invalid-credential etc.) */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-300 flex-1">{error}</p>
                        <button
                            type="button"
                            onClick={clearError}
                            className="text-red-400 hover:text-white text-sm shrink-0"
                        >
                            ×
                        </button>
                    </div>
                )}

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

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-xs text-slate-500">or</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Google Sign In */}
                    <button
                        type="button"
                        onClick={handleGoogle}
                        disabled={isLoading}
                        className="w-full py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        Continue with Google
                    </button>
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
