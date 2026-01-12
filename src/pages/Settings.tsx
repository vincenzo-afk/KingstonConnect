import React from 'react';
import { useUIStore } from '@/stores';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sun, Moon, Bell, Shield, Globe, Palette } from 'lucide-react';

const SettingsPage: React.FC = () => {
    const { theme, toggleTheme } = useUIStore();

    const SettingSection: React.FC<{
        title: string;
        description?: string;
        children: React.ReactNode
    }> = ({ title, description, children }) => (
        <div className="p-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="font-medium text-white">{title}</p>
                    {description && (
                        <p className="text-sm text-slate-400 mt-0.5">{description}</p>
                    )}
                </div>
                {children}
            </div>
        </div>
    );

    const ToggleSwitch: React.FC<{
        checked: boolean;
        onChange: () => void
    }> = ({ checked, onChange }) => (
        <button
            onClick={onChange}
            className={`
                relative w-14 h-7 rounded-full transition-colors
                ${checked
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    : 'bg-white/10'
                }
            `}
        >
            <div
                className={`
                    absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-transform
                    ${checked ? 'left-8' : 'left-1'}
                `}
            />
        </button>
    );

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Appearance */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                        <Palette className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Appearance</h2>
                </div>

                <div className="space-y-3">
                    <SettingSection
                        title="Theme"
                        description="Choose between light and dark mode"
                    >
                        <Button
                            variant="outline"
                            onClick={toggleTheme}
                            className="gap-2"
                        >
                            {theme === 'dark' ? (
                                <>
                                    <Sun className="w-4 h-4" />
                                    Light
                                </>
                            ) : (
                                <>
                                    <Moon className="w-4 h-4" />
                                    Dark
                                </>
                            )}
                        </Button>
                    </SettingSection>

                    <SettingSection
                        title="Compact Mode"
                        description="Reduce spacing and padding"
                    >
                        <ToggleSwitch checked={false} onChange={() => { }} />
                    </SettingSection>

                    <SettingSection
                        title="Animations"
                        description="Enable motion and transitions"
                    >
                        <ToggleSwitch checked={true} onChange={() => { }} />
                    </SettingSection>
                </div>
            </Card>

            {/* Notifications */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                        <Bell className="w-5 h-5 text-blue-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Notifications</h2>
                </div>

                <div className="space-y-3">
                    <SettingSection
                        title="Email Notifications"
                        description="Receive updates via email"
                    >
                        <ToggleSwitch checked={true} onChange={() => { }} />
                    </SettingSection>

                    <SettingSection
                        title="Push Notifications"
                        description="Receive browser notifications"
                    >
                        <ToggleSwitch checked={true} onChange={() => { }} />
                    </SettingSection>

                    <SettingSection
                        title="Assignment Reminders"
                        description="Get reminded about upcoming deadlines"
                    >
                        <ToggleSwitch checked={true} onChange={() => { }} />
                    </SettingSection>

                    <SettingSection
                        title="Announcement Alerts"
                        description="Notify about new announcements"
                    >
                        <ToggleSwitch checked={true} onChange={() => { }} />
                    </SettingSection>
                </div>
            </Card>

            {/* Privacy & Security */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-green-500/20">
                        <Shield className="w-5 h-5 text-green-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Privacy & Security</h2>
                </div>

                <div className="space-y-3">
                    <SettingSection
                        title="Profile Visibility"
                        description="Who can see your profile"
                    >
                        <select className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                            <option value="everyone">Everyone</option>
                            <option value="department">Department Only</option>
                            <option value="private">Private</option>
                        </select>
                    </SettingSection>

                    <SettingSection
                        title="Show Online Status"
                        description="Let others see when you're online"
                    >
                        <ToggleSwitch checked={true} onChange={() => { }} />
                    </SettingSection>

                    <SettingSection
                        title="Two-Factor Authentication"
                        description="Add an extra layer of security"
                    >
                        <Button variant="outline" size="sm">
                            Enable
                        </Button>
                    </SettingSection>
                </div>
            </Card>

            {/* Language & Region */}
            <Card>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-orange-500/20">
                        <Globe className="w-5 h-5 text-orange-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Language & Region</h2>
                </div>

                <div className="space-y-3">
                    <SettingSection
                        title="Language"
                        description="Select your preferred language"
                    >
                        <select className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                            <option value="en">English</option>
                            <option value="ta">Tamil</option>
                            <option value="hi">Hindi</option>
                        </select>
                    </SettingSection>

                    <SettingSection
                        title="Date Format"
                        description="How dates are displayed"
                    >
                        <select className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                            <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                            <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                            <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                        </select>
                    </SettingSection>

                    <SettingSection
                        title="Time Zone"
                        description="Your local time zone"
                    >
                        <select className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                            <option value="IST">IST (India)</option>
                            <option value="UTC">UTC</option>
                            <option value="EST">EST (US)</option>
                        </select>
                    </SettingSection>
                </div>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-500/20">
                <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>

                <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="font-medium text-white">Delete Account</p>
                                <p className="text-sm text-slate-400">
                                    Permanently delete your account and all data
                                </p>
                            </div>
                            <Button variant="danger" size="sm">
                                Delete Account
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SettingsPage;
