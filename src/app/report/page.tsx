'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import { Calendar, MapPin, Building2, Users, DollarSign, TrendingUp, ExternalLink, Globe, Briefcase } from 'lucide-react';

export default function ReportContent() {
  const [name, setName] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get search params from window.location instead of useSearchParams
    const urlParams = new URLSearchParams(window.location.search);
    const nameParam = urlParams.get('name');
    setName(nameParam);
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !name) return;

      setUser(user);

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .eq('competitor_name', name)
        .single();

      if (error) {
        console.error('❌ Report fetch error:', error);
      } else {
        setReport(data.report_data);
      }

      setLoading(false);
    };

    fetchReport();
  }, [name]);

  // Prepare keywords data for word cloud
  const prepareKeywordsData = (proxyData: any) => {
    try {
      const categories = Array.isArray(proxyData?.categories) ? proxyData.categories : [];
      const specialties = Array.isArray(proxyData?.specialties) ? proxyData.specialties : [];
      
      const allWords = [...categories, ...specialties]
        .filter(word => word && typeof word === 'string' && word.trim().length > 0)
        .map(word => word.trim());

      const uniqueWords = [...new Set(allWords.map(word => word.toLowerCase()))]
        .map(word => allWords.find(w => w.toLowerCase() === word) || word);

      return uniqueWords;
    } catch (error) {
      console.error('Error preparing keywords data:', error);
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading competitive analysis...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
          <p className="text-white text-xl">No report found for "{name}"</p>
          <p className="text-gray-400 mt-2">Try generating a new report or check the company name.</p>
        </div>
      </div>
    );
  }

  const { original, proxyData, news, sentimentScore } = report;
  const keywords = prepareKeywordsData(proxyData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700/50">
          <div className="flex items-start gap-6">
            {proxyData?.profile_pic_url && (
              <div className="flex-shrink-0">
                <Image
                  src={proxyData.profile_pic_url}
                  alt={`${original?.name || 'Company'} logo`}
                  width={120}
                  height={120}
                  className="rounded-2xl border-4 border-blue-400/50 shadow-2xl"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-3">
                {original?.name || 'Company Analysis'}
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                {proxyData?.description || 'No description available.'}
              </p>
              {sentimentScore !== undefined && (
                <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full border border-green-500/30">
                  <TrendingUp size={16} />
                  <span className="font-semibold">Sentiment Score: {sentimentScore}/100</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Overview */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2">
                <Building2 size={24} />
                Company Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Briefcase size={18} className="text-blue-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Industry</p>
                      <p className="text-white font-medium">{proxyData?.industry || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-blue-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Team Size</p>
                      <p className="text-white font-medium">{proxyData?.company_size_on_linkedin || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-blue-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Company Type</p>
                      <p className="text-white font-medium">
                        {proxyData?.company_type || 'N/A'}
                        {proxyData?.extra?.company_type && `, ${proxyData.extra.company_type}`}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-blue-400 mt-1" />
                    <div>
                      <p className="text-gray-400 text-sm">Headquarters</p>
                      <div className="text-white font-medium">
                        <p className="text-sm text-gray-300">
                          {proxyData?.hq?.line_1 && `${proxyData.hq.line_1}, `}
                          {proxyData?.hq?.city || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-300">
                          {proxyData?.hq?.country || 'N/A'}
                          {proxyData?.hq?.postal_code && ` - ${proxyData.hq.postal_code}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Funding History */}
            {proxyData?.funding_data && proxyData.funding_data.length > 0 && (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2">
                  <DollarSign size={24} />
                  Funding History
                </h2>
                <div className="space-y-4">
                  {proxyData.funding_data.map((item: any, index: number) => (
                    <div key={index} className="bg-gray-900/50 rounded-xl p-5 border border-gray-600/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(item).map(([key, value]: [string, any]) => {
                          if (key === 'announced_date' && typeof value === 'object' && value !== null) {
                            const dateStr = `${value.month}/${value.day}/${value.year}`;
                            return (
                              <div key={key} className="flex items-center gap-2">
                                <Calendar size={16} className="text-blue-400" />
                                <div>
                                  <p className="text-gray-400 text-sm">Announced Date</p>
                                  <p className="text-white font-medium">{dateStr}</p>
                                </div>
                              </div>
                            );
                          }

                          if (key === 'investor_list' && Array.isArray(value) && value.length > 0) {
                            return (
                              <div key={key} className="md:col-span-2">
                                <p className="text-gray-400 text-sm mb-2">Investors</p>
                                <div className="flex flex-wrap gap-2">
                                  {value.map((inv: any, i: number) => (
                                    <div key={i} className="bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-1">
                                      <span className="text-blue-300 text-sm font-medium">{inv.name}</span>
                                      <span className="text-gray-400 text-xs ml-1">({inv.type})</span>
                                      {inv.linkedin_profile_url && (
                                        <a
                                          href={inv.linkedin_profile_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="ml-2 text-blue-400 hover:text-blue-300"
                                        >
                                          <ExternalLink size={12} className="inline" />
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          if (key !== 'investor_list' && key !== 'announced_date') {
                            return (
                              <div key={key}>
                                <p className="text-gray-400 text-sm">{key.replace(/_/g, ' ')}</p>
                                <p className="text-white font-medium">{value?.toString() || 'Undisclosed'}</p>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Company Updates */}
            {proxyData?.updates && proxyData.updates.length > 0 && (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-2xl font-bold text-blue-400 mb-6">Company Updates</h2>
                <div className="space-y-4">
                  {proxyData.updates.map((update: any, index: number) => (
                    <div key={index} className="bg-gray-900/50 rounded-xl p-5 border border-gray-600/30">
                      <div className="flex items-start gap-3">
                        <Calendar size={16} className="text-blue-400 mt-1" />
                        <div className="flex-1">
                          {update.posted_on && (
                            <p className="text-gray-400 text-sm mb-2">
                              {update.posted_on.month}/{update.posted_on.day}/{update.posted_on.year}
                            </p>
                          )}
                          <p className="text-white leading-relaxed">{update.text}</p>
                          {update.article_link && (
                            <a
                              href={update.article_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 mt-2 text-sm"
                            >
                              Read more <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent News */}
            {news && news.length > 0 && (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-2xl font-bold text-blue-400 mb-6">Recent News</h2>
                <div className="space-y-4">
                  {news.map((item: any, i: number) => (
                    <div key={i} className="bg-gray-900/50 rounded-xl p-5 border border-gray-600/30 hover:border-blue-500/30 transition-colors">
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 font-semibold hover:text-blue-300 text-lg block mb-2"
                      >
                        {item.title}
                      </a>
                      <p className="text-gray-300 leading-relaxed">{item.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Keywords/Specialties Word Cloud */}
            {keywords.length > 0 && (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold text-blue-400 mb-4">Key Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-gradient-to-r from-blue-600/80 to-blue-700/80 text-white rounded-full text-sm font-medium shadow-lg hover:shadow-blue-500/25 transition-shadow duration-200 border border-blue-500/30"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Similar Companies */}
            {proxyData?.similar_companies && proxyData.similar_companies.length > 0 && (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold text-blue-400 mb-4">Similar Companies</h2>
                <div className="space-y-3">
                  {proxyData.similar_companies.map((company: any, index: number) => (
                    <div key={index} className="bg-gray-900/50 rounded-lg p-4 border border-gray-600/30">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{company.name}</h3>
                          <p className="text-gray-400 text-sm mb-1">{company.industry}</p>
                          <p className="text-gray-500 text-xs flex items-center gap-1">
                            <MapPin size={12} />
                            {company.location}
                          </p>
                        </div>
                        {company.link && (
                          <a
                            href={company.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 p-1"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}