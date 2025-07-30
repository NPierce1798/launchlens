'use client';

import { useState, useEffect, use, useCallback  } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Target, Users, Zap, CheckCircle, List, MapPin, ArrowDown, Presentation, Calendar, TrendingUp, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

interface InsightsData {
    insights: {
        problemStatement: { insights: string };
        solution: { insights: string };
        targetCustomer: { insights: string };
        features: { insights: string };
        userJourney: { insights: string };
        timelineEstimate: { insights: string };
        budgetEstimate: { insights: string };
        riskFactors: { insights: string };
        recommendations: { insights: string };
        overallAssessment: { insights: string };
    };
}

interface MVPData {
    problemStatement: string;
    targetCustomer: string;
    solution: string;
    industry: string;
    features: Array<{
        id: number;
        name: string;
        priority: string;
    }>;
    userJourney: Array<{
        id: number;
        step: string;
        features: Array<{
            id: number;
            name: string;
        }>;
        isDefault?: boolean;
    }>;
    includePitchDeck: boolean;
    generatedAt: string;
}

export default function ReportPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [mvpData, setMvpData] = useState<MVPData | null>(null);
    const [editedMvpData, setEditedMvpData] = useState<MVPData | null>(null);
    const [insights, setInsights] = useState<InsightsData | null>(null);
    const [insightsError, setInsightsError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isRegeneratingInsights, setIsRegeneratingInsights] = useState(false);

    const generateInsights = useCallback(async (mvpDataToUse: MVPData) => {
        setInsightsError(null);
        console.log('Generating insights for: ', mvpDataToUse)

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                throw new Error('No valid session found');
            }

            const response = await fetch('/api/mvp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    mvp: mvpDataToUse,
                    mvpId: id
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate insights');
            }

            const results = await response.json();
            console.log('Insights: ', results);
            setInsights(results);

            console.log('About to save insights to database...');
            console.log('ID:', id);
            console.log('User ID:', user?.id); // Add optional chaining here
            console.log('Results to save:', results);
            
            // Add a check to ensure user exists before saving
            if (!user?.id) {
                throw new Error('User not found');
            }
            
            const { error: updateError } = await supabase
                .from('mvps')
                .update({ insights: results })
                .eq('id', id)
                .eq('user', user.id);

            if (updateError) {
                console.error('Database update failed:', updateError);
            } else {
                console.log('Database update successful:');
            }
            
        } catch (err: unknown) {
            console.error('Error generating insights:', err);
            setInsightsError(err instanceof Error ? err.message : 'Failed to generate insights');
        }
    }, [id, user?.id]);

    useEffect(() => {
        console.log('Getting user...')

        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            console.log('User set: ', user);
        }

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user || null);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        console.log('useEffect start...')

        const fetchMVPPlan = async () => {
            try {
                console.log('Fetching mvp from supabase...')
                const { data, error: fetchError } = await supabase
                    .from('mvps')
                    .select('*')
                    .eq('id', id)
                    .eq('user', user.id)
                    .single();

                if (fetchError) {
                    throw fetchError;
                }

                if (!data) {
                    throw new Error('MVP plan not found');
                }

                console.log('~ Mvp data found: ', data.data)
                setMvpData(data.data);
                setEditedMvpData(data.data);

                

                if (data.insights) {
                    console.log('Insights found: ', data.insights);
                    setInsights(data.insights)
                } else {
                    console.log('Getting insights...')
                    await generateInsights(data.data);
                }

            } catch (err: unknown) {
                console.error('Error fetching MVP plan:', err);
                setError(err instanceof Error ? err.message : 'Failed to load MVP plan');
            } finally {
                setLoading(false);
            }
        };

        fetchMVPPlan();
    }, [id, user, generateInsights]);

    const handleEdit = () => {
        setIsEditing(true);
        setSaveSuccess(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedMvpData(mvpData);
        setSaveSuccess(false);
    };

    const handleRegenInsights = async () => {
        if (!editedMvpData) return;
        
        setIsRegeneratingInsights(true);
        console.log('Getting insights...')
        await generateInsights(editedMvpData);
        setIsRegeneratingInsights(false);
    }

    const handleSave = async () => {
        if (!user || !editedMvpData) return;

        setIsSaving(true);
        setSaveSuccess(false);

        try {
            console.log('Saving: \n')
            console.log(editedMvpData)
            console.log(insights)
            const { error: updateError } = await supabase
                .from('mvps')
                .update({ data: editedMvpData })
                .eq('id', id)
                .eq('user', user.id);

            if (updateError) {
                throw updateError;
            }

            setMvpData(editedMvpData);
            setIsEditing(false);
            setSaveSuccess(true);
            
            // Hide success message after 3 seconds
            setTimeout(() => setSaveSuccess(false), 3000);
            } catch (err: unknown) {
                console.error('Error saving MVP plan:', err);
                alert('Failed to save changes: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = (field: keyof MVPData, value: unknown) => {
        if (!editedMvpData) return;
        setEditedMvpData({ ...editedMvpData, [field]: value });
    };

    const updateFeature = (index: number, field: 'name' | 'priority', value: string) => {
        if (!editedMvpData) return;
        const newFeatures = [...editedMvpData.features];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setEditedMvpData({ ...editedMvpData, features: newFeatures });
    };

    const addFeature = () => {
        if (!editedMvpData) return;
        const newFeature = {
            id: Date.now(),
            name: 'New Feature',
            priority: 'must-have'
        };
        setEditedMvpData({ ...editedMvpData, features: [...editedMvpData.features, newFeature] });
    };

    const removeFeature = (index: number) => {
        if (!editedMvpData) return;
        const newFeatures = editedMvpData.features.filter((_, i) => i !== index);
        setEditedMvpData({ ...editedMvpData, features: newFeatures });
    };

    const updateUserJourneyStep = (index: number, value: string) => {
        if (!editedMvpData) return;
        const newJourney = [...editedMvpData.userJourney];
        newJourney[index] = { ...newJourney[index], step: value };
        setEditedMvpData({ ...editedMvpData, userJourney: newJourney });
    };

    const addUserJourneyStep = () => {
        if (!editedMvpData) return;
        const newStep = {
            id: Date.now(),
            step: 'New Step',
            features: []
        };
        setEditedMvpData({ ...editedMvpData, userJourney: [...editedMvpData.userJourney, newStep] });
    };

    const removeUserJourneyStep = (index: number) => {
        if (!editedMvpData) return;
        const newJourney = editedMvpData.userJourney.filter((_, i) => i !== index);
        setEditedMvpData({ ...editedMvpData, userJourney: newJourney });
    };

    const getFeaturesByPriority = (priority: string) => {
        const data = isEditing ? editedMvpData : mvpData;
        return data?.features.filter(f => f.priority === priority) || [];
    };

    const formatIndustry = (industry: string) => {
        const industryMap: { [key: string]: string } = {
            'ecommerce': 'E-commerce & Retail',
            'saas': 'Software as a Service (SaaS)',
            'fintech': 'Financial Technology',
            'healthcare': 'Healthcare',
            'education': 'Education',
            'real-estate': 'Real Estate',
            'food-delivery': 'Food & Delivery',
            'travel': 'Travel & Hospitality',
            'fitness': 'Fitness & Wellness',
            'productivity': 'Productivity Tools',
            'social': 'Social Media & Communication',
            'gaming': 'Gaming & Entertainment',
            'other': 'Other'
        };
        return industryMap[industry] || industry;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading your MVP plan...</p>
                </div>
            </div>
        );
    }

    if (error || !mvpData || !editedMvpData) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#121212] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="text-red-500 mb-4">
                        <FileText size={48} className="mx-auto" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Report Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/mvp-builder')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Create New MVP Plan
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-white">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-gradient-to-r from-green-600 to-green-700 rounded-lg">
                                    <FileText size={24} className="text-white" />
                                </div>
                                <h1 className="text-3xl font-bold">MVP Plan Report</h1>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-lg">
                                Your comprehensive MVP development plan and strategy
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Generated on {new Date(mvpData.generatedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/mvp-builder')}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <ArrowLeft size={16} />
                            New MVP Plan
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="space-y-8">

                    {/* Dev Firm CTA */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 text-center">
                        <h3 className="text-xl font-bold mb-3 text-emerald-800 dark:text-emerald-200">
                            Ready to Build Your MVP?
                        </h3>
                        
                        <p className="text-emerald-700 dark:text-emerald-300 mb-4">
                            Schedule a free consultation with our friends at <span className="font-semibold">MehaLabs.ai</span> and 
                            share this report to get your MVP built by startup specialists.
                        </p>
                        
                        <a
                            href="https://mehalabs.ai"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Visit MehaLabs.ai
                        </a>
                    </div>

                    {/* Insights Error Display */}
                        {insightsError && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
                                <div className="flex items-center gap-2">
                                    <div className="text-red-500">⚠️</div>
                                    <div>
                                        <h3 className="text-red-800 dark:text-red-200 font-semibold">Insights Generation Error</h3>
                                        <p className="text-red-700 dark:text-red-300 text-sm">{insightsError}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                    {/* Combined MVP Data Card with Edit Controls */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 relative">
                        
                        {/* Edit/Save Controls */}
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                            <button
                                onClick={handleRegenInsights}
                                disabled={isRegeneratingInsights}
                                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isRegeneratingInsights ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Regenerating...
                                    </>
                                ) : (
                                    <>
                                        🔄 Regenerate Insights
                                    </>
                                )}
                            </button>
                            {saveSuccess && (
                                <span className="text-green-600 dark:text-green-400 text-sm font-medium mr-2">
                                    ✓ Saved successfully
                                </span>
                            )}
                            {!isEditing ? (
                                <button
                                    onClick={handleEdit}
                                    className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                                >
                                    <Edit2 size={16} />
                                    Edit
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm"
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save size={16} />
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Executive Summary */}
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold mb-6 text-blue-600 dark:text-blue-400">Executive Summary</h2>
                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <TrendingUp size={16} className="text-blue-500" />
                                        Industry
                                    </h3>
                                    {isEditing ? (
                                        <select
                                            value={editedMvpData.industry}
                                            onChange={(e) => updateField('industry', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                                        >
                                            <option value="ecommerce">E-commerce & Retail</option>
                                            <option value="saas">Software as a Service (SaaS)</option>
                                            <option value="fintech">Financial Technology</option>
                                            <option value="healthcare">Healthcare</option>
                                            <option value="education">Education</option>
                                            <option value="real-estate">Real Estate</option>
                                            <option value="food-delivery">Food & Delivery</option>
                                            <option value="travel">Travel & Hospitality</option>
                                            <option value="fitness">Fitness & Wellness</option>
                                            <option value="productivity">Productivity Tools</option>
                                            <option value="social">Social Media & Communication</option>
                                            <option value="gaming">Gaming & Entertainment</option>
                                            <option value="other">Other</option>
                                        </select>
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-300">{formatIndustry(mvpData.industry)}</p>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <CheckCircle size={16} className="text-green-500" />
                                        MVP Core Features
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {getFeaturesByPriority('must-have').length} must-have features identified
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <Calendar size={16} className="text-purple-500" />
                                        Total Features
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {(isEditing ? editedMvpData : mvpData).features.length} features across all priorities
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Problem & Solution */}
                        <div className="mb-10">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-6 text-red-600 dark:text-red-400 flex items-center gap-3">
                                    <Target size={24} />
                                    Problem Statement
                                </h2>
                                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 pl-6 py-4 rounded-r-lg">
                                    {isEditing ? (
                                        <textarea
                                            value={editedMvpData.problemStatement}
                                            onChange={(e) => updateField('problemStatement', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white resize-none"
                                            rows={3}
                                        />
                                    ) : (
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{mvpData.problemStatement}</p>
                                    )}
                                </div>
                                {insights && (
                                    <p className='text-red-200 my-2'><strong>Suggestion: </strong>{insights.insights.problemStatement.insights}</p>
                                )}
                            </div>
                            
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-6 text-green-600 dark:text-green-400 flex items-center gap-3">
                                    <Zap size={24} />
                                    Solution
                                </h2>
                                <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 pl-6 py-4 rounded-r-lg">
                                    {isEditing ? (
                                        <textarea
                                            value={editedMvpData.solution}
                                            onChange={(e) => updateField('solution', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white resize-none"
                                            rows={3}
                                        />
                                    ) : (
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{mvpData.solution}</p>
                                    )}
                                </div>
                                {insights && (
                                    <p className='text-red-200 my-2'><strong>Suggestion: </strong>{insights.insights.solution.insights}</p>
                                )}
                            </div>
                        </div>

                        {/* Target Customer */}
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold mb-6 text-purple-600 dark:text-purple-400 flex items-center gap-3">
                                <Users size={24} />
                                Target Customer
                            </h2>
                            <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 pl-6 py-4 rounded-r-lg">
                                {isEditing ? (
                                    <textarea
                                        value={editedMvpData.targetCustomer}
                                        onChange={(e) => updateField('targetCustomer', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white resize-none"
                                        rows={2}
                                    />
                                ) : (
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{mvpData.targetCustomer}</p>
                                )}
                            </div>
                            {insights && (
                                <p className='text-red-200 my-2'><strong>Suggestion: </strong>{insights.insights.targetCustomer.insights}</p>
                            )}
                        </div>

                        {/* Feature Prioritization */}
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold mb-6 text-orange-600 dark:text-orange-400 flex items-center gap-3">
                                <List size={24} />
                                Feature Prioritization
                                {isEditing && (
                                    <button
                                        onClick={addFeature}
                                        className="ml-auto text-sm bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1"
                                    >
                                        <Plus size={14} />
                                        Add Feature
                                    </button>
                                )}
                            </h2>
                            
                            {isEditing ? (
                                <div className="space-y-4">
                                    {editedMvpData.features.map((feature, index) => (
                                        <div key={feature.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                            <input
                                                type="text"
                                                value={feature.name}
                                                onChange={(e) => updateFeature(index, 'name', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                                            />
                                            <select
                                                value={feature.priority}
                                                onChange={(e) => updateFeature(index, 'priority', e.target.value)}
                                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                                            >
                                                <option value="must-have">Must Have</option>
                                                <option value="should-have">Should Have</option>
                                                <option value="could-have">Could Have</option>
                                                <option value="future">Future</option>
                                            </select>
                                            <button
                                                onClick={() => removeFeature(index)}
                                                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { priority: 'must-have', title: 'Must Have (MVP Core)', color: 'red', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-800' },
                                        { priority: 'should-have', title: 'Should Have (Phase 2)', color: 'yellow', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', borderColor: 'border-yellow-200 dark:border-yellow-800' },
                                        { priority: 'could-have', title: 'Could Have (Phase 3)', color: 'green', bgColor: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-200 dark:border-green-800' },
                                        { priority: 'future', title: 'Future Features', color: 'blue', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-200 dark:border-blue-800' }
                                    ].map((category) => (
                                        <div key={category.priority} className={`${category.bgColor} ${category.borderColor} border rounded-lg p-4`}>
                                            <h3 className="font-semibold mb-3 text-sm">{category.title}</h3>
                                            <div className="space-y-2">
                                                {getFeaturesByPriority(category.priority).map((feature) => (
                                                    <div key={feature.id} className="bg-white dark:bg-gray-700 rounded-md p-3 text-sm shadow-sm">
                                                        {feature.name}
                                                    </div>
                                                ))}
                                                {getFeaturesByPriority(category.priority).length === 0 && (
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">No features assigned</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {insights && (
                            <p className='text-red-200 my-2'><strong>Suggestion: </strong>{insights.insights.features.insights}</p>
                        )}

                        {/* User Journey */}
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold mb-6 text-indigo-600 dark:text-indigo-400 flex items-center gap-3">
                                <MapPin size={24} />
                                User Journey & Feature Mapping
                                {isEditing && (
                                    <button
                                        onClick={addUserJourneyStep}
                                        className="ml-auto text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1"
                                    >
                                        <Plus size={14} />
                                        Add Step
                                    </button>
                                )}
                            </h2>
                            
                            <div className="space-y-6">
                                {(isEditing ? editedMvpData : mvpData).userJourney.map((step, index) => (
                                    <div key={step.id} className="relative">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-1">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                {isEditing ? (
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <input
                                                            type="text"
                                                            value={step.step}
                                                            onChange={(e) => updateUserJourneyStep(index, e.target.value)}
                                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-semibold text-lg"
                                                        />
                                                        <button
                                                            onClick={() => removeUserJourneyStep(index)}
                                                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <h3 className="font-semibold text-lg mb-3">{step.step}</h3>
                                                )}
                                                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                                                    <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium mb-2">Required Features:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {step.features.map((feature) => (
                                                            <span
                                                                key={feature.id}
                                                                className="inline-flex items-center bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-medium"
                                                            >
                                                                {feature.name}
                                                            </span>
                                                        ))}
                                                        {step.features.length === 0 && (
                                                            <span className="text-gray-500 dark:text-gray-400 text-sm italic">No features specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {index < (isEditing ? editedMvpData : mvpData).userJourney.length - 1 && (
                                            <div className="flex justify-start ml-5 py-3">
                                                <ArrowDown className="text-indigo-400 dark:text-indigo-500" size={20} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {insights && (
                                <p className='text-red-200 my-2'><strong>Suggestion: </strong>{insights.insights.userJourney.insights}</p>
                            )}
                            
                        </div>

                        {/* Development Roadmap */}
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold mb-6 text-teal-600 dark:text-teal-400">Development Roadmap & Estimates</h2>
                            
                            <div className="space-y-6">
                                <div className="border-l-4 border-red-500 pl-6 py-4 bg-red-50 dark:bg-red-900/20 rounded-r-lg">
                                    <h3 className="font-semibold text-lg mb-2 text-red-700 dark:text-red-300">Phase 1: MVP (Must-Have Features)</h3>
                                    <p className="text-red-600 dark:text-red-400 mb-3 text-sm">Core functionality to validate product-market fit</p>
                                    <div className="space-y-2">
                                        {getFeaturesByPriority('must-have').map((feature) => (
                                            <div key={feature.id} className="flex items-center gap-2">
                                                <CheckCircle size={16} className="text-red-500" />
                                                <span className="text-sm">{feature.name}</span>
                                            </div>
                                        ))}
                                        {getFeaturesByPriority('must-have').length === 0 && (
                                            <p className="text-red-600 dark:text-red-400 text-sm italic">No must-have features defined</p>
                                        )}
                                    </div>
                                </div>

                                {getFeaturesByPriority('should-have').length > 0 && (
                                    <div className="border-l-4 border-yellow-500 pl-6 py-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-r-lg">
                                        <h3 className="font-semibold text-lg mb-2 text-yellow-700 dark:text-yellow-300">Phase 2: Enhancement (Should-Have Features)</h3>
                                        <p className="text-yellow-600 dark:text-yellow-400 mb-3 text-sm">Improve user experience and add value</p>
                                        <div className="space-y-2">
                                            {getFeaturesByPriority('should-have').map((feature) => (
                                                <div key={feature.id} className="flex items-center gap-2">
                                                    <CheckCircle size={16} className="text-yellow-500" />
                                                    <span className="text-sm">{feature.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {getFeaturesByPriority('could-have').length > 0 && (
                                    <div className="border-l-4 border-green-500 pl-6 py-4 bg-green-50 dark:bg-green-900/20 rounded-r-lg">
                                        <h3 className="font-semibold text-lg mb-2 text-green-700 dark:text-green-300">Phase 3: Expansion (Could-Have Features)</h3>
                                        <p className="text-green-600 dark:text-green-400 mb-3 text-sm">Scale and differentiate from competitors</p>
                                        <div className="space-y-2">
                                            {getFeaturesByPriority('could-have').map((feature) => (
                                                <div key={feature.id} className="flex items-center gap-2">
                                                    <CheckCircle size={16} className="text-green-500" />
                                                    <span className="text-sm">{feature.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {getFeaturesByPriority('future').length > 0 && (
                                    <div className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
                                        <h3 className="font-semibold text-lg mb-2 text-blue-700 dark:text-blue-300">Future Considerations</h3>
                                        <p className="text-blue-600 dark:text-blue-400 mb-3 text-sm">Long-term vision and advanced features</p>
                                        <div className="space-y-2">
                                            {getFeaturesByPriority('future').map((feature) => (
                                                <div key={feature.id} className="flex items-center gap-2">
                                                    <CheckCircle size={16} className="text-blue-500" />
                                                    <span className="text-sm">{feature.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6 my-6">
                            {/* Timeline and Budget - Side by Side */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-800/50 rounded-lg p-6 border-b-4 border-green-400">
                                <h3 className="text-green-300 font-semibold text-lg mb-2">Timeline Estimate</h3>
                                {insights && (
                                    <p className="text-gray-300 leading-relaxed">{insights.insights.timelineEstimate.insights}</p>
                                )}
                                
                                </div>

                                <div className="bg-gray-800/50 rounded-lg p-6 border-b-4 border-blue-400">
                                <h3 className="text-blue-300 font-semibold text-lg mb-2">Budget Estimate</h3>
                                {insights && (
                                    <p className="text-gray-300 leading-relaxed">{insights.insights.budgetEstimate.insights}</p>
                                )}
                                
                                </div>
                            </div>

                            {/* Risk Factors - Full Width */}
                            <div className="bg-gray-800/50 rounded-lg p-6 border-b-4 border-red-400">
                                <h3 className="text-red-300 font-semibold text-lg mb-2">Risk Factors</h3>
                                {insights && (
                                    <p className="text-gray-300 leading-relaxed">{insights.insights.riskFactors.insights}</p>
                                )}
                                
                            </div>

                            {/* Recommendations and Overall Assessment - Side by Side */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-800/50 rounded-lg p-6 border-b-4 border-purple-400">
                                <h3 className="text-purple-300 font-semibold text-lg mb-2">Recommendations</h3>
                                {insights && (
                                    <p className="text-gray-300 leading-relaxed">{insights.insights.recommendations.insights}</p>
                                )}
                                
                                </div>

                                <div className="bg-gray-800/50 rounded-lg p-6 border-b-4 border-yellow-400">
                                <h3 className="text-yellow-300 font-semibold text-lg mb-2">Overall Assessment</h3>
                                {insights && (
                                    <p className="text-gray-300 leading-relaxed">{insights.insights.overallAssessment.insights}</p>
                                )}
                                
                                </div>
                            </div>
                            </div>
                            
                        </div>

                        {/* Pitch Deck Status */}
                        {(isEditing ? editedMvpData : mvpData).includePitchDeck && (
                            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Presentation className="text-purple-600 dark:text-purple-400" size={24} />
                                    <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-200">Pitch Deck Integration (Coming Soon)</h2>
                                </div>
                                <p className="text-purple-700 dark:text-purple-300 mb-4">
                                    Pitch deck builder tool has been requested and will be integrated with your MVP plan data automatically when feature is available.
                                </p>
                                <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        The pitch deck will include slides for: Problem Statement, Solution, Target Market, 
                                        Product Features, User Journey, Development Roadmap, and Business Model.
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Next Steps */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-8">
                        <h2 className="text-2xl font-bold mb-6 text-blue-800 dark:text-blue-200">Recommended Next Steps</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-3 text-blue-700 dark:text-blue-300">Immediate Actions</h3>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">•</span>
                                        <span>Create wireframes for must-have features</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">•</span>
                                        <span>Validate assumptions with target customers</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">•</span>
                                        <span>Define technical architecture</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">•</span>
                                        <span>Set up project management and development workflow</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-3 text-blue-700 dark:text-blue-300">Success Metrics</h3>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">•</span>
                                        <span>User acquisition and activation rates</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">•</span>
                                        <span>Feature usage analytics</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">•</span>
                                        <span>Customer feedback and satisfaction</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">•</span>
                                        <span>Revenue and growth indicators</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 pt-8">
                        <button
                            onClick={() => router.push('/mvp-builder')}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Create New MVP Plan
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <FileText size={16} />
                            Print Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}