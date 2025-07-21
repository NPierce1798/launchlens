'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { 
    User, Building2, Calendar, Target, CheckCircle, AlertCircle, ExternalLink, 
    FileText, TrendingUp, Users, Plus, Rocket, Lightbulb, BarChart3, 
    Clock, Eye, Trash2 
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Define types for better type safety
interface CompetitorInfo {
    name: string;
    website?: string;
    founded?: string;
    description?: string;
    focus?: string;
    success?: string;
    pitfalls?: string;
}

interface TrackedCompetitor {
    id: string;
    user_id: string;
    idea: string;
    info: CompetitorInfo;
}

interface MVPPlan {
    id: string;
    user: string;
    data: {
        problemStatement: string;
        targetCustomer: string;
        solution: string;
        industry: string;
        features: Array<{
            id: number;
            name: string;
            priority: string;
        }>;
        generatedAt: string;
    };
    insights?: Record<string, unknown>;
    created_at: string;
}

interface Report {
    id: string;
    user_id: string;
    competitor_name: string;
    report_data: Record<string, unknown>;
    created_at: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [tracked, setTracked] = useState<TrackedCompetitor[]>([]);
    const [mvpPlans, setMvpPlans] = useState<MVPPlan[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [generating, setGenerating] = useState<{ [key: string]: boolean }>({});
    const [activeTab, setActiveTab] = useState<'overview' | 'mvps' | 'competitors' | 'reports'>('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserAndData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push('/login');
                    return;
                }

                setUser(user);

                // Fetch all user data in parallel
                const [trackedData, mvpData, reportsData] = await Promise.all([
                    supabase.from('tracked').select('*').eq('user_id', user.id),
                    supabase.from('mvps').select('*').eq('user', user.id).order('created_at', { ascending: false }),
                    supabase.from('reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
                ]);

                setTracked(trackedData.data || []);
                setMvpPlans(mvpData.data || []);
                setReports(reportsData.data || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndData();
    }, [router]);

    const handleViewReport = (name: string) => {
        const encodeName = encodeURIComponent(name);
        router.push(`/report?name=${encodeName}`);
    };

    const handleViewMVP = (id: string) => {
        router.push(`/report/${id}`);
    };

    const handleDeleteMVP = async (id: string) => {
        if (!confirm('Are you sure you want to delete this MVP plan?')) return;
        
        const { error } = await supabase.from('mvps').delete().eq('id', id).eq('user', user?.id);
        if (!error) {
            setMvpPlans(prev => prev.filter(mvp => mvp.id !== id));
        } else {
            console.error('Error deleting MVP:', error);
            alert('Failed to delete MVP plan. Please try again.');
        }
    };

    const handleGenerateReport = async (info: CompetitorInfo) => {
        const name = info.name;

        try {
            setGenerating((prev) => ({ ...prev, [name]: true }));

            const { data: { session } } = await supabase.auth.getSession();

            const res = await fetch('/api/report/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token || ''}`
                },
                body: JSON.stringify([info]),
            });

            const json = await res.json();
            const reportData = json?.data || [];

            for (const report of reportData) {
                const { error } = await supabase.from('reports').insert({
                    user_id: session?.user?.id,
                    competitor_name: report.original.name,
                    report_data: JSON.parse(JSON.stringify(report)),
                });
                
                if (!error) {
                    // Refresh reports data
                    const { data: updatedReports } = await supabase
                        .from('reports')
                        .select('*')
                        .eq('user_id', user?.id)
                        .order('created_at', { ascending: false });
                    setReports(updatedReports || []);
                }
            }

        } catch (err) {
            console.error('Error generating or saving report:', err);
        } finally {
            setGenerating((prev) => ({ ...prev, [name]: false }));
        }
    };

    const formatIndustry = (industry: string) => {
        const industryMap: { [key: string]: string } = {
            'ecommerce': 'E-commerce',
            'saas': 'SaaS',
            'fintech': 'FinTech',
            'healthcare': 'Healthcare',
            'education': 'Education',
            'real-estate': 'Real Estate',
            'food-delivery': 'Food & Delivery',
            'travel': 'Travel',
            'fitness': 'Fitness',
            'productivity': 'Productivity',
            'social': 'Social Media',
            'gaming': 'Gaming',
            'other': 'Other'
        };
        return industryMap[industry] || industry;
    };

    const getMustHaveFeatures = (mvp: MVPPlan) => {
        return mvp.data.features?.filter(f => f.priority === 'must-have') || [];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    // Group competitors by idea
    const groupedCompetitors = tracked.reduce((acc, item) => {
        const idea = item.idea || 'Other';
        if (!acc[idea]) acc[idea] = [];
        acc[idea].push(item);
        return acc;
    }, {} as Record<string, TrackedCompetitor[]>);

    const existingReports = reports.map(r => r.competitor_name);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Header Section */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-500/20 rounded-full border border-blue-500/30">
                            <User size={24} className="text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                            <p className="text-gray-300">Welcome back, {user.email}</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-600/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <Rocket size={20} className="text-green-400" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">MVP Plans</p>
                                    <p className="text-white text-2xl font-bold">{mvpPlans.length}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-600/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Building2 size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Tracked Companies</p>
                                    <p className="text-white text-2xl font-bold">{tracked.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-600/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <FileText size={20} className="text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Generated Reports</p>
                                    <p className="text-white text-2xl font-bold">{reports.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-600/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-500/20 rounded-lg">
                                    <BarChart3 size={20} className="text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Total Features</p>
                                    <p className="text-white text-2xl font-bold">
                                        {mvpPlans.reduce((sum, mvp) => sum + (mvp.data.features?.length || 0), 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'mvps', label: 'MVP Plans', icon: Rocket },
                            { id: 'competitors', label: 'Competitors', icon: Building2 },
                            { id: 'reports', label: 'Reports', icon: FileText }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as 'overview' | 'mvps' | 'competitors' | 'reports')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                                }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Recent MVP Plans */}
                        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Rocket size={20} className="text-green-400" />
                                    Recent MVP Plans
                                </h2>
                                <button
                                    onClick={() => router.push('/mvp-builder')}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    <Plus size={16} />
                                    New MVP Plan
                                </button>
                            </div>
                            
                            {mvpPlans.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {mvpPlans.slice(0, 4).map((mvp) => (
                                        <div key={mvp.id} className="bg-gray-900/50 rounded-xl p-4 border border-gray-600/30">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-white mb-1">
                                                        {formatIndustry(mvp.data.industry)} MVP
                                                    </h3>
                                                    <p className="text-sm text-gray-400 flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {new Date(mvp.data.generatedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full border border-green-600/30">
                                                    {getMustHaveFeatures(mvp).length} core features
                                                </span>
                                            </div>
                                            <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                                                {mvp.data.problemStatement}
                                            </p>
                                            <button
                                                onClick={() => handleViewMVP(mvp.id)}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                View Plan
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Lightbulb size={48} className="text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-400">No MVP plans yet. Create your first one!</p>
                                </div>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <TrendingUp size={20} className="text-blue-400" />
                                Recent Activity
                            </h2>
                            
                            <div className="space-y-3">
                                {/* Combine and sort recent activities */}
                                {[
                                    ...mvpPlans.slice(0, 3).map(mvp => ({
                                        type: 'mvp',
                                        title: `Created ${formatIndustry(mvp.data.industry)} MVP Plan`,
                                        date: mvp.created_at,
                                        icon: Rocket,
                                        color: 'text-green-400'
                                    })),
                                    ...reports.slice(0, 3).map(report => ({
                                        type: 'report',
                                        title: `Generated report for ${report.competitor_name}`,
                                        date: report.created_at,
                                        icon: FileText,
                                        color: 'text-purple-400'
                                    }))
                                ]
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .slice(0, 5)
                                .map((activity, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg">
                                        <activity.icon size={16} className={activity.color} />
                                        <div className="flex-1">
                                            <p className="text-white text-sm">{activity.title}</p>
                                            <p className="text-gray-400 text-xs">
                                                {new Date(activity.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                
                                {mvpPlans.length === 0 && reports.length === 0 && (
                                    <p className="text-gray-400 text-center py-4">No recent activity</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'mvps' && (
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Rocket size={24} className="text-green-400" />
                                MVP Plans
                            </h2>
                            <button
                                onClick={() => router.push('/mvp-builder')}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                                <Plus size={16} />
                                Create New MVP Plan
                            </button>
                        </div>

                        {mvpPlans.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {mvpPlans.map((mvp) => (
                                    <div key={mvp.id} className="bg-gray-900/50 rounded-xl p-6 border border-gray-600/30">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-2">
                                                    {formatIndustry(mvp.data.industry)} MVP
                                                </h3>
                                                <p className="text-sm text-gray-400 flex items-center gap-1 mb-3">
                                                    <Clock size={12} />
                                                    Created {new Date(mvp.data.generatedAt).toLocaleDateString()}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs">
                                                    <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full border border-green-600/30">
                                                        {getMustHaveFeatures(mvp).length} must-have features
                                                    </span>
                                                    <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full border border-blue-600/30">
                                                        {mvp.data.features?.length || 0} total features
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewMVP(mvp.id)}
                                                    className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                                                    title="View MVP Plan"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMVP(mvp.id)}
                                                    className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                                                    title="Delete MVP Plan"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <div>
                                                <span className="text-sm font-medium text-gray-300">Problem:</span>
                                                <p className="text-sm text-gray-400 line-clamp-2">{mvp.data.problemStatement}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-300">Solution:</span>
                                                <p className="text-sm text-gray-400 line-clamp-2">{mvp.data.solution}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-300">Target Customer:</span>
                                                <p className="text-sm text-gray-400 line-clamp-1">{mvp.data.targetCustomer}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleViewMVP(mvp.id)}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Eye size={16} />
                                            View Full Plan
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Lightbulb size={64} className="text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">No MVP Plans Yet</h3>
                                <p className="text-gray-400 mb-6">Start building your startup with our MVP planning tool</p>
                                <button
                                    onClick={() => router.push('/mvp-builder')}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                >
                                    Create Your First MVP Plan
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'competitors' && (
                    <div className="space-y-8">
                        {tracked.length > 0 ? (
                            Object.entries(groupedCompetitors).map(([idea, comps]) => (
                                <div key={idea} className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                                            <Target size={20} className="text-blue-400" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-blue-400">{idea}</h2>
                                        <span className="px-3 py-1 bg-gray-700/50 text-gray-300 text-sm rounded-full border border-gray-600/50">
                                            {comps.length} {comps.length === 1 ? 'company' : 'companies'}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {comps.map((comp, i) => (
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
                                                                {comp.info?.website ? (
                                                                    <a
                                                                        href={comp.info.website}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="hover:underline flex items-center gap-2"
                                                                    >
                                                                        {comp.info.name}
                                                                        <ExternalLink size={14} className="text-gray-400" />
                                                                    </a>
                                                                ) : (
                                                                    comp.info?.name
                                                                )}
                                                            </h3>
                                                        </div>
                                                        {comp.info?.founded && (
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Calendar size={14} className="text-gray-400" />
                                                                <span className="text-sm text-gray-400">
                                                                    Founded {comp.info.founded}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Company Description */}
                                                <p className="text-gray-300 mb-4 leading-relaxed">
                                                    {comp.info?.description}
                                                </p>

                                                {/* Company Details */}
                                                <div className="space-y-3 mb-6">
                                                    {comp.info?.focus && (
                                                        <div className="flex items-start gap-2">
                                                            <Target size={14} className="text-blue-400 mt-1" />
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-300">Focus:</span>
                                                                <p className="text-sm text-gray-400">{comp.info.focus}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {comp.info?.success && (
                                                        <div className="flex items-start gap-2">
                                                            <CheckCircle size={14} className="text-green-400 mt-1" />
                                                            <div>
                                                                <span className="text-sm font-medium text-green-300">Success:</span>
                                                                <p className="text-sm text-green-200/80">{comp.info.success}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {comp.info?.pitfalls && (
                                                        <div className="flex items-start gap-2">
                                                            <AlertCircle size={14} className="text-red-400 mt-1" />
                                                            <div>
                                                                <span className="text-sm font-medium text-red-300">Challenges:</span>
                                                                <p className="text-sm text-red-200/80">{comp.info.pitfalls}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Button */}
                                                <div className="pt-4 border-t border-gray-600/30">
                                                    {generating[comp.info.name] ? (
                                                        <button
                                                            disabled
                                                            className="w-full bg-blue-600/50 text-white font-medium px-4 py-3 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                                                        >
                                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                            Generating Report...
                                                        </button>
                                                    ) : existingReports.includes(comp.info.name) ? (
                                                        <button
                                                            onClick={() => handleViewReport(comp.info.name)}
                                                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/25"
                                                        >
                                                            <FileText size={16} />
                                                            View Report
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleGenerateReport(comp.info)}
                                                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25"
                                                        >
                                                            <TrendingUp size={16} />
                                                            Generate Report
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 text-center">
                                <div className="p-4 bg-gray-700/30 rounded-full w-fit mx-auto mb-6">
                                    <Users size={48} className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">No Competitors Tracked</h3>
                                <p className="text-gray-400 max-w-md mx-auto">
                                    You haven&apos;t tracked any competitors yet. Start by adding companies to monitor and analyze their performance.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <FileText size={24} className="text-purple-400" />
                                Generated Reports
                            </h2>
                        </div>

                        {reports.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {reports.map((report) => (
                                    <div key={report.id} className="bg-gray-900/50 rounded-xl p-6 border border-gray-600/30 hover:border-purple-500/30 transition-all duration-200 group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors mb-2">
                                                    {report.competitor_name}
                                                </h3>
                                                <p className="text-sm text-gray-400 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    Generated {new Date(report.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                                <FileText size={16} className="text-purple-400" />
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-gray-300 text-sm">
                                                Comprehensive analysis report including market position, strengths, weaknesses, and strategic insights.
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleViewReport(report.competitor_name)}
                                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/25"
                                        >
                                            <Eye size={16} />
                                            View Report
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <BarChart3 size={64} className="text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">No Reports Generated</h3>
                                <p className="text-gray-400 mb-6">
                                    Generate detailed competitor analysis reports to gain insights into market positioning and strategies.
                                </p>
                                <p className="text-gray-500 text-sm">
                                    Add competitors in the Competitors tab to start generating reports.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}