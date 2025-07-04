import { NextRequest, NextResponse } from 'next/server';
import { OpenAiClient } from '@/lib/search/OpenAiClient';


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { idea, targetCustomer, problem, industry } = body;

        const openai = new OpenAiClient(process.env.OPENAI_API_KEY!);
        const competitors = await openai.findRelevantCompanies({ idea, targetCustomer, problem, industry });

        console.log('Competitors: ',competitors);

        return NextResponse.json({ competitors });
    } catch (err: unknown) {
        console.error('Search error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unexpected error'
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
