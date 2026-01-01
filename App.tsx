
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, UserPreferences } from './types';
import { fetchUserProfile } from './services/mockApi';
import LexiconClarifierView from './components/LexiconClarifierView';
import Card from './components/Card';

const App: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProfile = useCallback(async () => {
        try {
            const profile = await fetchUserProfile();
            setUserProfile(profile);
        } catch (err) {
            setError("Failed to initialize enterprise session.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-cyan-500 font-mono tracking-widest text-sm uppercase">Initializing Lexicon Rails...</p>
                </div>
            </div>
        );
    }

    if (error || !userProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
                <Card className="max-w-md border-red-500/50 bg-red-950/20">
                    <h2 className="text-red-500 text-xl font-bold mb-2">Security Breach or Connection Error</h2>
                    <p className="text-slate-400 text-sm mb-4">{error || "Unauthorized access detected."}</p>
                    <button onClick={() => window.location.reload()} className="w-full py-2 bg-red-600 rounded text-white font-semibold">Retry Authentication</button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <span className="text-white font-bold text-lg">L</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent hidden sm:block">
                            LEXICON <span className="font-light text-cyan-400">CLARIFIER</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-4 text-xs font-mono">
                            <div className="flex flex-col items-end">
                                <span className="text-slate-500 uppercase">Tier</span>
                                <span className="text-cyan-400 font-bold">{userProfile.subscriptionTier.toUpperCase()}</span>
                            </div>
                            <div className="h-8 w-px bg-slate-800"></div>
                            <div className="flex flex-col items-end">
                                <span className="text-slate-500 uppercase">Balance</span>
                                <span className="text-emerald-400 font-bold">1,250.75 LCT</span>
                            </div>
                        </div>
                        
                        <button className="flex items-center gap-2 group">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-slate-100 leading-tight group-hover:text-cyan-400 transition-colors">{userProfile.username}</p>
                                <p className="text-xs text-slate-500 leading-tight">{userProfile.email}</p>
                            </div>
                            <img src={`https://picsum.photos/seed/${userProfile.id}/40/40`} className="w-10 h-10 rounded-full border-2 border-slate-800 group-hover:border-cyan-500 transition-all shadow-lg" alt="Profile" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <LexiconClarifierView userProfile={userProfile} onUpdateProfile={setUserProfile} />
            </main>

            {/* Global Footer */}
            <footer className="mt-20 py-10 border-t border-slate-800 bg-slate-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-500 text-sm font-mono">© 2024 LEXICON AI SYSTEMS. SECURE ENTERPRISE LAYER 111-B.</p>
                    <div className="flex gap-8 text-xs font-medium text-slate-400 uppercase tracking-widest">
                        <a href="#" className="hover:text-cyan-400 transition-colors">Documentation</a>
                        <a href="#" className="hover:text-cyan-400 transition-colors">API Keys</a>
                        <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Rail</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
