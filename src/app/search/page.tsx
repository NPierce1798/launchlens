'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Search, Building2, Calendar, Target, CheckCircle, AlertCircle, ExternalLink, Plus, Minus, Eye, TrendingUp } from 'lucide-react';

type Competitor = {
    name: string;
    description: string;
    website?: string;
    focus?: string;
    founded?: string;
    success?: string;
    pitfalls?: string;
};

export default function SearchPage() {
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) {
                router.push('/login');
            } else {
                setUser(data.user);
            }
        });
    }, []);

    const [idea, setIdea] = useState('');
    const [targetCustomer, setTargetCustomer] = useState('');
    const [problem, setProblem] = useState('');
    const [industry, setIndustry] = useState('');
    const [loading, setLoading] = useState(false);
    const [competitors, setCompetitors] = useState<any[]>([]);
    const [selectedCompetitors, setSelectedCompetitors] = useState<Competitor[]>([]);
    const [user, setUser] = useState<any>(null);
    const [trackedCompetitors, setTrackedCompetitors] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setCompetitors([]);

        const res = await fetch('/api/extract-keywords', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idea, targetCustomer, problem, industry }),
        });

        if (!res.ok) {
            const { error } = await res.json();
            setError(error || 'Something went wrong');
        } else {
            const data = await res.json();
            setCompetitors(data.competitors?.slice(0, 5) || []);
        }

        setLoading(false);
    };

    const handleAdd = (comp: any) => {
        const isAdded = selectedCompetitors.some((c) => c.name === comp.name);
        if (isAdded) {
            console.log(`Removing ${comp.name}`);
            setSelectedCompetitors(selectedCompetitors.filter((c) => c.name !== comp.name));
        } else {
            console.log(`Adding ${comp.name}`);
            setSelectedCompetitors([...selectedCompetitors, comp])
        }
    };

    const handleTrack = async (comp: Competitor) => {
        if (!user) return;
    
        const isTracked = trackedCompetitors.includes(comp.name);
    
        if (isTracked) {
            // Untrack
            console.log(`Un-tracking ${comp.name}`);
            const { data: existing } = await supabase
                .from('tracked')
                .select('id')
                .eq('user_id', user.id)
                .eq('info->>name', comp.name) // JSON field match
                .single();
    
            if (existing) {
                await supabase.from('tracked').delete().eq('id', existing.id);
            }
    
            setTrackedCompetitors(trackedCompetitors.filter((name) => name !== comp.name));
        } else {
            // Track
            console.log(`Tracking ${comp.name}`);
            await supabase.from('tracked').insert({
                user_id: user.id,
                idea,
                info: comp,
            });
    
            setTrackedCompetitors([...trackedCompetitors, comp.name]);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
            <div className="max-w-4xl mx-auto px-6 py-10">
                {/* Header Section */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-full border border-blue-500/30">
                            <Search size={24} className="text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">LaunchLens Finder</h1>
                    </div>
                    <p className="text-gray-300">
                        Enter your business idea and we'll identify similar companies and competitors for you.
                    </p>
                </div>

                {/* Search Form */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    What are you building?
                                </label>
                                <input
                                    type="text"
                                    value={idea}
                                    onChange={(e) => setIdea(e.target.value)}
                                    className="w-full p-3 rounded-lg bg-gray-900/50 border border-gray-600/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-200"
                                    placeholder="e.g. AI assistant for contract review"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Who is your ideal customer?
                                </label>
                                <input
                                    type="text"
                                    value={targetCustomer}
                                    onChange={(e) => setTargetCustomer(e.target.value)}
                                    className="w-full p-3 rounded-lg bg-gray-900/50 border border-gray-600/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-200"
                                    placeholder="e.g. Solo attorneys or small law firms"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    What problem does it solve?
                                </label>
                                <input
                                    type="text"
                                    value={problem}
                                    onChange={(e) => setProblem(e.target.value)}
                                    className="w-full p-3 rounded-lg bg-gray-900/50 border border-gray-600/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-200"
                                    placeholder="e.g. Reviewing contracts takes too long"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Industry or sector?
                                </label>
                                <input
                                    type="text"
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    className="w-full p-3 rounded-lg bg-gray-900/50 border border-gray-600/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-200"
                                    placeholder="e.g. LegalTech"
                                />
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <Search size={16} />
                                    Find Similar Companies
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-900/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-red-700/50">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={20} className="text-red-400" />
                            <p className="text-red-300">{error}</p>
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {competitors.length > 0 && (
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                                <TrendingUp size={20} className="text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-blue-400">Suggested Competitors</h2>
                            <span className="px-3 py-1 bg-gray-700/50 text-gray-300 text-sm rounded-full border border-gray-600/50">
                                {competitors.length} {competitors.length === 1 ? 'company' : 'companies'}
                            </span>
                        </div>
                        
                        <div className="space-y-6">
                            {competitors.map((comp, i) => (
                                <div
                                    key={i}
                                    className="bg-gray-900/50 rounded-xl p-6 border border-gray-600/30 hover:border-blue-500/30 transition-all duration-200 group"
                                >
                                    {/* Company Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Building2 size={18} className="text-blue-400" />
                                                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                                                    {comp.website ? (
                                                        <a
                                                            href={comp.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:underline flex items-center gap-2"
                                                        >
                                                            {comp.name}
                                                            <ExternalLink size={14} className="text-gray-400" />
                                                        </a>
                                                    ) : (
                                                        comp.name
                                                    )}
                                                </h3>
                                            </div>
                                            {comp.founded && (
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    <span className="text-sm text-gray-400">
                                                        Founded {comp.founded}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Company Description */}
                                    <p className="text-gray-300 mb-4 leading-relaxed">
                                        {comp.description}
                                    </p>

                                    {/* Company Details */}
                                    <div className="space-y-3 mb-6">
                                        {comp.focus && (
                                            <div className="flex items-start gap-2">
                                                <Target size={14} className="text-blue-400 mt-1" />
                                                <div>
                                                    <span className="text-sm font-medium text-gray-300">Focus:</span>
                                                    <p className="text-sm text-gray-400">{comp.focus}</p>
                                                </div>
                                            </div>
                                        )}
                                        {comp.success && (
                                            <div className="flex items-start gap-2">
                                                <CheckCircle size={14} className="text-green-400 mt-1" />
                                                <div>
                                                    <span className="text-sm font-medium text-green-300">Success:</span>
                                                    <p className="text-sm text-green-200/80">{comp.success}</p>
                                                </div>
                                            </div>
                                        )}
                                        {comp.pitfalls && (
                                            <div className="flex items-start gap-2">
                                                <AlertCircle size={14} className="text-red-400 mt-1" />
                                                <div>
                                                    <span className="text-sm font-medium text-red-300">Challenges:</span>
                                                    <p className="text-sm text-red-200/80">{comp.pitfalls}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-4 border-t border-gray-600/30 flex gap-3">
                                        <button
                                            className={`flex-1 font-medium px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                                                selectedCompetitors.some((r) => r.name === comp.name)
                                                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:shadow-red-500/25'
                                                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-blue-500/25'
                                            }`}
                                            onClick={() => handleAdd(comp)}
                                        >
                                            {selectedCompetitors.some((r) => r.name === comp.name) ? (
                                                <>
                                                    <Minus size={16} />
                                                    Remove from Report
                                                </>
                                            ) : (
                                                <>
                                                    <Plus size={16} />
                                                    Add to Report
                                                </>
                                            )}
                                        </button>

                                        <button
                                            className={`flex-1 font-medium px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                                                trackedCompetitors.includes(comp.name)
                                                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:shadow-red-500/25'
                                                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-green-500/25'
                                            }`}
                                            onClick={() => handleTrack(comp)}
                                        >
                                            {trackedCompetitors.includes(comp.name) ? (
                                                <>
                                                    <Minus size={16} />
                                                    Un-track
                                                </>
                                            ) : (
                                                <>
                                                    <Eye size={16} />
                                                    Track
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}