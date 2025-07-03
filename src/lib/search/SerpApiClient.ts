import axios from 'axios';


export class SerpApiClient {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async searchCompanies(keywords: string[]): Promise<any[]> {
        const query = keywords.join(' OR ') + ' startup ';

        const url = 'https://serpapi.com/search.json';
        const params = {
            engine: 'google',
            q: query,
            api_key: this.apiKey,
        };

        try {
            const { data } = await axios.get(url, { params });

            const results = data.organic_results?.map((result: any) => ({
                title: result.title,
                link: result.link,
                snippet: result.snippet,
            })) || [];

            return results;
        } catch (error: any) {
            console.error('SerpAPI error: ', error.message);
            throw new Error('Failed to search companies with SerpAPI.');
        }
    }
}