import axios from 'axios';

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
        console.log('❌ Error resolving domain:', e.response?.data || e.message);
        return null;
        }
    }

    // Step 2: Enrich using the LinkedIn URL
    async enrichProfile(linkedInUrl: string): Promise<any | null> {
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
        console.log('❌ Error enriching profile:', e.response?.data || e.message);
        return null;
        }
    }

    // Combined
    async resolveAndEnrich(website: string): Promise<any | null> {
        const domain = website.replace(/^https?:\/\//, '').split('/')[0];
        const linkedInUrl = await this.resolveCompany(domain);
        if (!linkedInUrl) return null;
        return this.enrichProfile(linkedInUrl);
    }
}
