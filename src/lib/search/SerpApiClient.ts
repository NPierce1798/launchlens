import axios from 'axios';

// Define types for SerpAPI response
interface SerpApiOrganicResult {
    title: string;
    link: string;
    snippet: string;
    [key: string]: unknown;
}

interface SerpApiResponse {
    organic_results?: SerpApiOrganicResult[];
    [key: string]: unknown;
}

interface CompanySearchResult {
    title: string;
    link: string;
    snippet: string;
}

export class SerpApiClient {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async searchCompanies(keywords: string[]): Promise<CompanySearchResult[]> {
        const query = keywords.join(' OR ') + ' startup ';

        const url = 'https://serpapi.com/search.json';
        const params = {
            engine: 'google',
            q: query,
            api_key: this.apiKey,
        };

        try {
            const { data } = await axios.get<SerpApiResponse>(url, { params });

            const results = data.organic_results?.map((result: SerpApiOrganicResult) => ({
                title: result.title,
                link: result.link,
                snippet: result.snippet,
            })) || [];

            return results;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('SerpAPI error: ', errorMessage);
            throw new Error('Failed to search companies with SerpAPI.');
        }
    }
}