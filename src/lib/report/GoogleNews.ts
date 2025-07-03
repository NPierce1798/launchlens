import Parser from 'rss-parser';

const parser = new Parser();

export default class GoogleNewsRSS {
    async getNews(companyName: string) {
        const feed = await parser.parseURL(
        `https://news.google.com/rss/search?q=${encodeURIComponent(companyName)}`
        );
        return feed.items.slice(0, 5); // limit to 5 articles
    }
}
