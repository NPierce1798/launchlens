'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { User, Building2, Calendar, Target, CheckCircle, AlertCircle, ExternalLink, FileText, TrendingUp, Users } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [tracked, setTracked] = useState<any[]>([]);
    const [existingReports, setExistingReports] = useState<string[]>([]);
    const [generating, setGenerating] = useState<{ [key: string]: Boolean }>({});

    useEffect(() => {
        const fetchUserAndData = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            setUser(user);

            const { data: trackedData } = await supabase
                .from('tracked')
                .select('*')
                .eq('user_id', user.id);

            setTracked(trackedData || []);

            const { data: reports } = await supabase
                .from('reports')
                .select('competitor_name')
                .eq('user_id', user.id);

            setExistingReports(reports?.map((r) => r.competitor_name) || []);
        };

        fetchUserAndData();
    }, []);

    const handleViewReport = (name: string) => {
        const encodeName = encodeURIComponent(name);
        router.push(`/report?name=${encodeName}`);
    }

    const handleGenerateReport = async (info: any) => {
        const name = info.name;

        try {
            setGenerating((prev) => ({ ...prev, [name]: true }));

            const {
                data: { session },
            } = await supabase.auth.getSession();

            const res = await fetch('/api/report/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token || ''}`
                },
                body: JSON.stringify([info]), // must be an array of competitors
            });

            const json = await res.json();
            console.log("Report generated:", json);

            const reports = json?.data || [];

            for (const report of reports) {
                console.log(`Saving for: ${report}`)
                const { data, error } = await supabase.from('reports').insert({
                    user_id: session?.user?.id,
                    competitor_name: report.original.name,
                    report_data: JSON.parse(JSON.stringify(report)),
                });
                if (error) {
                    console.log(`Supabase insert error: ${error}`)
                } else {
                    console.log('Saving for:', report);
                    setExistingReports((prev) => [...prev, report.original.name]);
                }
            }

        } catch (err) {
            console.error('Error generating or saving report:', err);
        } finally {
            setGenerating((prev) => ({ ...prev, [name]: false }));
        }
    };

    if (!user) return null;

    // Group by `idea`
    const grouped = tracked.reduce((acc, item) => {
        const idea = item.idea || 'Other';
        if (!acc[idea]) acc[idea] = [];
        acc[idea].push(item);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Header Section */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-full border border-blue-500/30">
                            <User size={24} className="text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                            <p className="text-gray-300">Welcome back, {user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-blue-400" />
                            <span className="text-gray-400">Tracked Companies:</span>
                            <span className="text-white font-semibold">{tracked.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText size={16} className="text-green-400" />
                            <span className="text-gray-400">Generated Reports:</span>
                            <span className="text-white font-semibold">{existingReports.length}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                {tracked.length > 0 ? (
                    <div className="space-y-8">
                        {Object.entries(grouped).map(([idea, comps]) => (
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
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 text-center">
                        <div className="p-4 bg-gray-700/30 rounded-full w-fit mx-auto mb-6">
                            <Users size={48} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Competitors Tracked</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            You haven't tracked any competitors yet. Start by adding companies to monitor and analyze their performance.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}