import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import Proxycurl from '@/lib/report/Proxycurl';
import GoogleNewsRSS from '@/lib/report/GoogleNews';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const proxycurl = new Proxycurl(process.env.PROXYCURL_API_KEY!);
const newsScraper = new GoogleNewsRSS();

export const dynamic = 'force-dynamic';

// Define the competitor type based on your usage
interface Competitor {
    name: string;
    website: string;
    // Add other properties if your competitor objects have them
}

export async function POST(req: NextRequest) {
    try {
        console.log('✅ /api/report hit');
        const competitors: Competitor[] = await req.json();
        console.log('📦 Parsed body:', competitors);

        const enriched = await Promise.all(
            competitors.map(async (comp: Competitor) => {
                const proxyData = await proxycurl.resolveAndEnrich(comp.website);
                const news = await newsScraper.getNews(comp.name);

                // Combine all content for summarization
                const contentToSummarize = news.map((item) =>
                    `${item.title} - ${item.content ?? ''}`
                ).join('\n\n');

                // OpenAI summarization + sentiment
                const chatResponse = await openai.chat.completions.create({
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a business analyst summarizing news articles and rating their overall sentiment from 0 (very negative) to 100 (very positive).',
                        },
                        {
                            role: 'user',
                            content: `Summarize the following news and give a sentiment score from 0 to 100:\n\n${contentToSummarize}`,
                        },
                    ],
                });

                const summaryResponse = chatResponse.choices[0]?.message?.content ?? '';
                const match = summaryResponse.match(/Sentiment\s*Score\s*[:\-]?\s*(\d{1,3})/i);
                const sentiment = match ? parseInt(match[1], 10) : null;

                const fullResponse = {
                    original: comp,
                    proxyData,
                    news,
                    summary: summaryResponse,
                    sentiment,
                }
                console.log(`Returning response: \n ${JSON.stringify(fullResponse, null, 2)}`);
                return {
                    original: comp,
                    proxyData,
                    news,
                    summary: summaryResponse,
                    sentiment,
                };
            })
        );

        return NextResponse.json({ data: enriched });
    } catch (err) {
        console.error('❌ Error during report processing:', err);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}