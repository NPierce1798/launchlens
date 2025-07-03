import axios from 'axios';

// Define types for Proxycurl API responses
interface ProxycurlDateObject {
    day: number;
    month: number;
    year: number;
}

interface ProxycurlInvestor {
    name: string;
    type: string;
    linkedin_profile_url?: string;
}

interface ProxycurlFundingData {
    announced_date?: ProxycurlDateObject;
    investor_list?: ProxycurlInvestor[];
    funding_stage?: string;
    money_raised?: string;
    [key: string]: unknown;
}

interface ProxycurlCompanyUpdate {
    posted_on?: ProxycurlDateObject;
    text: string;
    article_link?: string;
}

interface ProxycurlSimilarCompany {
    name: string;
    industry: string;
    location: string;
    link?: string;
}

interface ProxycurlHeadquarters {
    line_1?: string;
    city?: string;
    country?: string;
    postal_code?: string;
}

interface ProxycurlExtra {
    company_type?: string;
    [key: string]: unknown;
}

interface ProxycurlCompanyProfile {
    name: string;
    description?: string;
    industry?: string;
    company_size_on_linkedin?: string;
    company_type?: string;
    profile_pic_url?: string;
    hq?: ProxycurlHeadquarters;
    extra?: ProxycurlExtra;
    funding_data?: ProxycurlFundingData[];
    updates?: ProxycurlCompanyUpdate[];
    categories?: string[];
    specialties?: string[];
    similar_companies?: ProxycurlSimilarCompany[];
    [key: string]: unknown;
}

export default class Proxycurl {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    // Step 1: Resolve LinkedIn URL from domain
    async resolveCompany(domain: string): Promise<string | null> {
        try {
        const res = await axios.get('https://nubela.co/proxycurl/api/linkedin/company/resolve', {
            params: { company_domain: domain.replace(/^https?:\/\//, '') },
            headers: { Authorization: `Bearer ${this.apiKey}` }
        });
        return res.data.url; // e.g. "https://www.linkedin.com/company/stripe"
        } catch (e) {
        const errorMessage = axios.isAxiosError(e) ? (e.response?.data || e.message) : 'Unknown error occurred';
        console.log('❌ Error resolving domain:', errorMessage);
        return null;
        }
    }

    // Step 2: Enrich using the LinkedIn URL
    async enrichProfile(linkedInUrl: string): Promise<ProxycurlCompanyProfile | null> {
        try {
        const res = await axios.get('https://nubela.co/proxycurl/api/linkedin/company', {
            params: {
            url: linkedInUrl,
            resolve_numeric_id: 'true',
            categories: 'include',
            funding_data: 'include',
            extra: 'include',
            acquisitions: 'include',
            use_cache: 'if-present',
            fallback_to_cache: 'on-error'
            },
            headers: { Authorization: `Bearer ${this.apiKey}` }
        });
        return res.data;
        } catch (e) {
        const errorMessage = axios.isAxiosError(e) ? (e.response?.data || e.message) : 'Unknown error occurred';
        console.log('❌ Error enriching profile:', errorMessage);
        return null;
        }
    }

    // Combined
    async resolveAndEnrich(website: string): Promise<ProxycurlCompanyProfile | null> {
        const domain = website.replace(/^https?:\/\//, '').split('/')[0];
        const linkedInUrl = await this.resolveCompany(domain);
        if (!linkedInUrl) return null;
        return this.enrichProfile(linkedInUrl);
    }
}