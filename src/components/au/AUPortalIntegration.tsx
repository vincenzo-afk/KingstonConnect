import React, { useState, useEffect, useRef } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import {
    GraduationCap,
    Link2,
    RefreshCw,
    Calendar,
    Award,
    BookOpen,
    AlertTriangle,
    CheckCircle,
    Clock,
    Loader2,
    Shield,
    ChevronDown,
    ChevronUp,
    BarChart3,
    Target,
    Zap,
    Volume2,
    Play,
    RotateCcw,
    ArrowRight,
    ArrowLeft,
    Headphones,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import {
    fetchAndCacheStudentData,
    getCachedStudentData,
    storeAUCredentials,
    getAUCredentials,
    checkAUPortalHealth,
    calculateAttendanceMetrics,
    calculateCGPA,
    getUpcomingExams,
    generateStudyRecommendations,
    getMockStudentData,
    initAUSession,
    getCaptchaAudioUrl,
    fetchDataWithCaptcha,
    type AUStudentData,
    type AUAttendanceMetrics,
    type AUCGPACalculation,
    type AUSessionResponse,
} from '@/services/auportal.service';

interface AUPortalIntegrationProps {
    compact?: boolean;
}

// Collapsible Section Component
const CollapsibleSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    defaultOpen?: boolean;
    badge?: React.ReactNode;
    children: React.ReactNode;
}> = ({ title, icon, defaultOpen = true, badge, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <Card variant="glass" className="overflow-hidden p-0 border-white/5">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
                        {icon}
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{title}</h3>
                    {badge}
                </div>
                <div className="text-slate-400 group-hover:text-white transition-colors">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </button>
            <div
                className={cn(
                    "transition-all duration-300 ease-in-out overflow-hidden",
                    isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <div className="px-5 pb-5 pt-0 border-t border-white/5 mt-2">
                    <div className="pt-4">
                        {children}
                    </div>
                </div>
            </div>
        </Card>
    );
};

// Link Account Modal Step Type
type LinkStep = 'credentials' | 'captcha' | 'loading' | 'success';

const AUPortalIntegration: React.FC<AUPortalIntegrationProps> = ({ compact = false }) => {
    const { user } = useAuthStore();
    const [isLinked, setIsLinked] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [studentData, setStudentData] = useState<AUStudentData | null>(null);
    const [attendanceMetrics, setAttendanceMetrics] = useState<AUAttendanceMetrics | null>(null);
    const [cgpaData, setCgpaData] = useState<AUCGPACalculation | null>(null);
    const [isApiAvailable, setIsApiAvailable] = useState<boolean | null>(null);

    // Form state
    const [registerNo, setRegisterNo] = useState('');
    const [dob, setDob] = useState('');

    // Captcha flow state
    const [linkStep, setLinkStep] = useState<LinkStep>('credentials');
    const [sessionData, setSessionData] = useState<AUSessionResponse | null>(null);
    const [captchaSolution, setCaptchaSolution] = useState('');
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        checkApiAndLoadData();
    }, [user?.id]);

    const checkApiAndLoadData = async () => {
        if (!user?.id) return;

        // Check if API is available
        const apiAvailable = await checkAUPortalHealth();
        setIsApiAvailable(apiAvailable);

        // Check if user has linked AU account
        const credentials = await getAUCredentials(user.id);
        if (credentials) {
            setIsLinked(true);
            setRegisterNo(credentials.registerNo);

            // Try to load cached data
            const cached = await getCachedStudentData(user.id);
            if (cached) {
                loadStudentData(cached.data);
            }
        }
    };

    const loadStudentData = (data: AUStudentData) => {
        setStudentData(data);

        // Calculate metrics
        if (data.assessment) {
            setAttendanceMetrics(calculateAttendanceMetrics(data.assessment));
        }

        if (data.exam_result?.results) {
            setCgpaData(calculateCGPA(data.exam_result.results));
        }
    };

    // Step 1: Submit credentials and get captcha
    const handleCredentialsSubmit = async () => {
        if (!registerNo || !dob) {
            setError('Please enter both Register Number and Date of Birth');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Initialize session and get captcha
            const session = await initAUSession();
            setSessionData(session);

            if (session.has_audio_captcha) {
                setLinkStep('captcha');
            } else {
                // If no audio captcha, try direct fetch (fallback)
                setError('No captcha found. The portal structure may have changed.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect to AU Portal');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Submit captcha and fetch data
    const handleCaptchaSubmit = async () => {
        if (!user?.id || !sessionData || !captchaSolution) {
            setError('Please enter the captcha solution');
            return;
        }

        setLoading(true);
        setError(null);
        setLinkStep('loading');

        try {
            // Format DOB for API (DD-MM-YYYY)
            const dobFormatted = dob.split('-').reverse().join('-');

            // Fetch data with captcha
            const data = await fetchDataWithCaptcha(
                sessionData.session_id,
                registerNo,
                dobFormatted,
                captchaSolution
            );

            // Cache the data
            await fetchAndCacheStudentData(user.id, registerNo, dobFormatted);

            // Store credentials
            await storeAUCredentials(user.id, registerNo, dobFormatted);

            loadStudentData(data);
            setIsLinked(true);
            setLinkStep('success');

            // Close modal after brief success display
            setTimeout(() => {
                setShowLinkModal(false);
                resetLinkFlow();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data. Check your captcha.');
            setLinkStep('captcha');
        } finally {
            setLoading(false);
        }
    };

    const handlePlayAudio = () => {
        if (!sessionData) return;

        const audioUrl = getCaptchaAudioUrl(sessionData.session_id);

        if (audioRef.current) {
            audioRef.current.pause();
        }

        audioRef.current = new Audio(audioUrl);
        audioRef.current.onplay = () => setIsPlayingAudio(true);
        audioRef.current.onended = () => setIsPlayingAudio(false);
        audioRef.current.onerror = () => {
            setIsPlayingAudio(false);
            setError('Failed to play audio. Try refreshing the captcha.');
        };
        audioRef.current.play();
    };

    const handleRefreshCaptcha = async () => {
        setCaptchaSolution('');
        setLoading(true);
        setError(null);

        try {
            const session = await initAUSession();
            setSessionData(session);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refresh captcha');
        } finally {
            setLoading(false);
        }
    };

    const resetLinkFlow = () => {
        setLinkStep('credentials');
        setSessionData(null);
        setCaptchaSolution('');
        setError(null);
    };

    const openLinkModal = () => {
        resetLinkFlow();
        setShowLinkModal(true);
    };

    const handleRefresh = async () => {
        // For refresh, we need to go through captcha again
        openLinkModal();
    };

    const handleUseMockData = () => {
        const mockData = getMockStudentData();
        loadStudentData(mockData);
        setIsLinked(true);
        setShowLinkModal(false);
        resetLinkFlow();
    };

    // Render the multi-step link modal content
    const renderLinkModalContent = () => {
        switch (linkStep) {
            case 'credentials':
                return (
                    <div className="space-y-5">
                        {isApiAvailable === false && (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-yellow-400 font-medium">API Offline</p>
                                        <p className="text-xs text-yellow-400/70 mt-1">Use demo data to explore features</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 border border-white/5 shadow-lg shadow-cyan-500/10">
                                <GraduationCap className="w-8 h-8 text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Link Your AU Account</h3>
                            <p className="text-sm text-slate-400 mt-1">Enter your credentials to connect</p>
                        </div>

                        <Input
                            label="Register Number"
                            placeholder="e.g., 312419104001"
                            value={registerNo}
                            onChange={(e) => setRegisterNo(e.target.value)}
                        />
                        <Input
                            label="Date of Birth"
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                        />

                        {error && (
                            <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>
                        )}

                        <div className="flex flex-col gap-3 pt-2">
                            <Button
                                glow
                                icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                onClick={handleCredentialsSubmit}
                                disabled={loading || isApiAvailable === false}
                            >
                                {loading ? 'Connecting...' : 'Continue to Captcha'}
                            </Button>
                            <Button
                                variant="secondary"
                                icon={<Zap className="w-4 h-4" />}
                                onClick={handleUseMockData}
                            >
                                Use Demo Data
                            </Button>
                        </div>
                    </div>
                );

            case 'captcha':
                return (
                    <div className="space-y-5">
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4 border border-white/5 shadow-lg shadow-purple-500/10">
                                <Headphones className="w-8 h-8 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Solve Audio Captcha</h3>
                            <p className="text-sm text-slate-400 mt-1">Listen and enter the numbers you hear</p>
                        </div>

                        {/* Audio Player */}
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className={cn(
                                        "rounded-full w-16 h-16",
                                        isPlayingAudio ? "bg-purple-500/20 border-purple-500/50" : ""
                                    )}
                                    onClick={handlePlayAudio}
                                    disabled={loading}
                                >
                                    {isPlayingAudio ? (
                                        <Volume2 className="w-8 h-8 text-purple-400 animate-pulse" />
                                    ) : (
                                        <Play className="w-8 h-8 text-purple-400" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-center text-sm text-slate-400">
                                {isPlayingAudio ? 'Playing audio...' : 'Click to play captcha audio'}
                            </p>
                            <button
                                onClick={handleRefreshCaptcha}
                                disabled={loading}
                                className="flex items-center gap-2 mx-auto mt-3 text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Get new captcha
                            </button>
                        </div>

                        {/* Captcha Input */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Enter the numbers you heard
                            </label>
                            <input
                                type="text"
                                value={captchaSolution}
                                onChange={(e) => setCaptchaSolution(e.target.value)}
                                placeholder="e.g., 12345"
                                className="w-full px-4 py-4 text-center text-2xl font-mono bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 tracking-widest transition-all focus:bg-white/10"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="secondary"
                                icon={<ArrowLeft className="w-4 h-4" />}
                                onClick={() => setLinkStep('credentials')}
                            >
                                Back
                            </Button>
                            <Button
                                glow
                                className="flex-1"
                                icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                onClick={handleCaptchaSubmit}
                                disabled={loading || !captchaSolution}
                            >
                                {loading ? 'Verifying...' : 'Submit & Fetch Data'}
                            </Button>
                        </div>
                    </div>
                );

            case 'loading':
                return (
                    <div className="py-12 text-center">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-6 border border-white/5 shadow-lg shadow-cyan-500/10">
                            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Fetching Your Data</h3>
                        <p className="text-sm text-slate-400">Please wait while we retrieve your information...</p>
                    </div>
                );

            case 'success':
                return (
                    <div className="py-12 text-center">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-6 animate-pulse border border-white/5 shadow-lg shadow-green-500/10">
                            <CheckCircle className="w-10 h-10 text-green-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Account Linked Successfully!</h3>
                        <p className="text-sm text-slate-400">Your AU Portal data has been fetched.</p>
                    </div>
                );
        }
    };

    // Compact view for dashboard widgets
    if (compact) {
        return (
            <Card variant="gradient" hover className="relative overflow-hidden border-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

                <div className="flex items-center gap-3 mb-5 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg">AU Portal</h3>
                        <p className="text-xs text-slate-300 font-medium">Anna University</p>
                    </div>
                </div>

                {isLinked && studentData ? (
                    <div className="space-y-4 relative z-10">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10 backdrop-blur-sm">
                                <p className="text-2xl font-bold text-cyan-400">{cgpaData?.cgpa.toFixed(2) || 'N/A'}</p>
                                <p className="text-xs text-slate-300 mt-1 font-medium">CGPA</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10 backdrop-blur-sm">
                                <p className={`text-2xl font-bold ${attendanceMetrics && attendanceMetrics.overallPercentage >= 75 ? 'text-green-400' : 'text-red-400'}`}>
                                    {attendanceMetrics?.overallPercentage || 0}%
                                </p>
                                <p className="text-xs text-slate-300 mt-1 font-medium">Attendance</p>
                            </div>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="w-full bg-white/10 hover:bg-white/20 border-white/10 text-white backdrop-blur-sm"
                            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            {loading ? 'Refreshing...' : 'Sync Data'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3 relative z-10">
                        <p className="text-sm text-slate-200 font-medium">Connect to view your results & attendance</p>
                        <Button
                            className="w-full shadow-lg shadow-cyan-500/20"
                            glow
                            icon={<Link2 className="w-4 h-4" />}
                            onClick={openLinkModal}
                        >
                            Link Account
                        </Button>
                    </div>
                )}

                {/* Compact Link Modal */}
                <Modal isOpen={showLinkModal} onClose={() => setShowLinkModal(false)} title="Link AU Account" size="md">
                    {renderLinkModalContent()}
                </Modal>
            </Card>
        );
    }

    // Full page view
    const upcomingExams = studentData?.exam_schedule ? getUpcomingExams(studentData.exam_schedule) : [];
    const recommendations = studentData?.exam_result?.results && attendanceMetrics
        ? generateStudyRecommendations(studentData.exam_result.results, attendanceMetrics)
        : [];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Anna University Portal</h1>
                        <p className="text-slate-400 mt-1">Real-time academic data integration</p>
                    </div>
                </div>
                {isLinked ? (
                    <div className="flex items-center gap-4">
                        <Badge variant="success" glow className="px-4 py-2 text-sm">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Account Linked
                        </Badge>
                        <Button
                            variant="secondary"
                            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            {loading ? 'Syncing...' : 'Refresh Data'}
                        </Button>
                    </div>
                ) : (
                    <Button glow size="lg" icon={<Link2 className="w-5 h-5" />} onClick={openLinkModal}>
                        Connect AU Account
                    </Button>
                )}
            </div>

            {error && (
                <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl animate-fade-in">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-bold text-red-400">Error</p>
                            <p className="text-sm text-red-400/80 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {!isLinked ? (
                // Not linked - show info cards
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card variant="glass" className="p-8 border-white/5">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-white/5 shadow-lg shadow-cyan-500/10">
                                <Link2 className="w-7 h-7 text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Connect Your Account</h3>
                                <p className="text-sm text-slate-400">Link to view your data</p>
                            </div>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-slate-300">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                                </div>
                                <span className="font-medium">View real-time attendance</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                                </div>
                                <span className="font-medium">Check exam results & CGPA</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                                </div>
                                <span className="font-medium">Get exam schedule alerts</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                                </div>
                                <span className="font-medium">Track internal marks</span>
                            </li>
                        </ul>
                        <Button glow className="w-full" icon={<Link2 className="w-4 h-4" />} onClick={openLinkModal}>
                            Link AU Account
                        </Button>
                    </Card>

                    <Card variant="glass" className="p-8 border-white/5">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-white/5 shadow-lg shadow-purple-500/10">
                                <Shield className="w-7 h-7 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Secure & Private</h3>
                                <p className="text-sm text-slate-400">Your data is protected</p>
                            </div>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-slate-300">
                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                                </div>
                                <span className="font-medium">Credentials never stored</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                                </div>
                                <span className="font-medium">Data cached locally only</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                                </div>
                                <span className="font-medium">You solve the captcha yourself</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                                </div>
                                <span className="font-medium">Direct AU Portal connection</span>
                            </li>
                        </ul>
                        <Button variant="secondary" className="w-full" icon={<Zap className="w-4 h-4" />} onClick={handleUseMockData}>
                            Try Demo Mode
                        </Button>
                    </Card>
                </div>
            ) : studentData && (
                // Linked - show student data
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Overall CGPA"
                            value={cgpaData?.cgpa.toFixed(2) || 'N/A'}
                            subtitle="Cumulative GPA"
                            icon={<Award className="w-6 h-6" />}
                            color="primary"
                        />
                        <StatCard
                            title="Attendance"
                            value={`${attendanceMetrics?.overallPercentage || 0}%`}
                            subtitle="Overall attendance"
                            icon={<Calendar className="w-6 h-6" />}
                            color={attendanceMetrics && attendanceMetrics.overallPercentage >= 75 ? 'success' : 'error'}
                        />
                        <StatCard
                            title="Subjects"
                            value={studentData.assessment?.length || 0}
                            subtitle="Current semester"
                            icon={<BookOpen className="w-6 h-6" />}
                            color="accent"
                        />
                        <StatCard
                            title="Upcoming Exams"
                            value={upcomingExams.length}
                            subtitle="Scheduled exams"
                            icon={<Clock className="w-6 h-6" />}
                            color="warning"
                        />
                    </div>

                    {/* Profile Section */}
                    {studentData.profile && (
                        <CollapsibleSection
                            title="Student Profile"
                            icon={<GraduationCap className="w-5 h-5 text-cyan-400" />}
                            badge={
                                <Badge variant="success" size="sm" glow>Verified</Badge>
                            }
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(studentData.profile).map(([key, value]) => (
                                    <div key={key} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                                        <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">
                                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </p>
                                        <p className="text-white font-medium">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleSection>
                    )}

                    {/* Attendance Section */}
                    {attendanceMetrics && (
                        <CollapsibleSection
                            title="Attendance Details"
                            icon={<BarChart3 className="w-5 h-5 text-cyan-400" />}
                            badge={
                                <Badge
                                    variant={attendanceMetrics.overallPercentage >= 75 ? 'success' : 'error'}
                                    size="sm"
                                    glow
                                >
                                    {attendanceMetrics.overallPercentage}%
                                </Badge>
                            }
                        >
                            <div className="space-y-4">
                                {attendanceMetrics.subjectWise.map((subject, idx) => (
                                    <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-bold text-white">{subject.subjectCode}</span>
                                            <Badge
                                                variant={subject.status === 'safe' ? 'success' : subject.status === 'warning' ? 'warning' : 'error'}
                                                size="sm"
                                            >
                                                {subject.percentage}%
                                            </Badge>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    subject.status === 'safe' ? 'bg-green-500' :
                                                        subject.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                                )}
                                                style={{ width: `${subject.percentage}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2 font-medium">
                                            {subject.attended} / {subject.total} classes attended
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleSection>
                    )}

                    {/* Results Section */}
                    {studentData.exam_result && (
                        <CollapsibleSection
                            title="Exam Results"
                            icon={<Award className="w-5 h-5 text-cyan-400" />}
                            defaultOpen={false}
                        >
                            <p className="text-sm text-slate-400 mb-4 font-medium">{studentData.exam_result.meta}</p>
                            <div className="overflow-x-auto rounded-xl border border-white/5">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Subject</th>
                                            <th className="text-center py-4 px-6 text-sm font-medium text-slate-400">Grade</th>
                                            <th className="text-center py-4 px-6 text-sm font-medium text-slate-400">Result</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {studentData.exam_result.results.map((result, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-6 text-white font-medium">{result.subject_code}</td>
                                                <td className="py-4 px-6 text-center">
                                                    <Badge variant={result.result === 'PASS' ? 'success' : 'error'} glow={result.result === 'PASS'}>
                                                        {result.grade}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={cn(
                                                        "font-bold",
                                                        result.result === 'PASS' ? 'text-green-400' : 'text-red-400'
                                                    )}>
                                                        {result.result}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CollapsibleSection>
                    )}

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                        <CollapsibleSection
                            title="Study Recommendations"
                            icon={<Target className="w-5 h-5 text-cyan-400" />}
                            defaultOpen={true}
                        >
                            <div className="space-y-3">
                                {recommendations.map((rec, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                                            rec.priority === 'high' ? "bg-red-500/20 text-red-400" :
                                                rec.priority === 'medium' ? "bg-yellow-500/20 text-yellow-400" :
                                                    "bg-blue-500/20 text-blue-400"
                                        )}>
                                            <Target className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{rec.subject}</h4>
                                            <p className="text-sm text-slate-400 mt-1 leading-relaxed">{rec.recommendation}</p>
                                            <div className="mt-2 flex gap-2">
                                                <Badge size="sm" variant={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'info'}>
                                                    {rec.priority} Priority
                                                </Badge>
                                                <Badge size="sm" variant="outline">
                                                    {rec.reason}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleSection>
                    )}
                </>
            )}

            <Modal isOpen={showLinkModal} onClose={() => setShowLinkModal(false)} title="Link AU Account" size="md">
                {renderLinkModalContent()}
            </Modal>
        </div>
    );
};

export default AUPortalIntegration;
