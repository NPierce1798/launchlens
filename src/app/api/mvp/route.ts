import { NextRequest, NextResponse } from 'next/server';
import { OpenAiClient } from '@/lib/search/OpenAiClient';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
    try {
        // Get the request body
        const body = await request.json();
        const { mvp, mvpId } = body;

        console.log('Getting insights for: ', mvp);
        console.log('ID: ', mvpId);

        // Get the current user from Supabase auth
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
        return NextResponse.json(
            { error: 'Authorization header required' },
            { status: 401 }
        );
        }

        // Extract token from "Bearer <token>"
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
        return NextResponse.json(
            { error: 'Invalid authentication' },
            { status: 401 }
        );
        }

        // Initialize OpenAI client
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
        return NextResponse.json(
            { error: 'OpenAI API key not configured' },
            { status: 500 }
        );
        }

        const openaiClient = new OpenAiClient(openaiApiKey);

        // Generate insights using the MVP data
        const stringifiedMvp = JSON.stringify(mvp, null, 2);
        console.log('Getting insights for: ', mvp);
        const insights = await openaiClient.generateMVPInsights(mvp);
        console.log('Insights returned: ', insights);

        // Optionally save the insights back to the database
        console.log('Saving insights...');
        const { error: updateError } = await supabase
        .from('mvps')
        .update({ 
            insights: insights,
            insights_generated_at: new Date().toISOString()
        })
        .eq('id', mvpId)
        .eq('user', user.id);

        if (updateError) {
        console.error('Failed to save insights:', updateError);
        // Continue anyway - we'll still return the insights
        }

        return NextResponse.json({
        success: true,
        insights
        });

    } catch (error) {
        console.error('Error generating MVP insights:', error);
        
        return NextResponse.json(
        { error: 'Failed to generate insights' },
        { status: 500 }
        );
    }
    }

    // Optional: GET endpoint to retrieve cached insights
    export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const mvpId = searchParams.get('mvpId');

        if (!mvpId) {
        return NextResponse.json(
            { error: 'MVP ID is required' },
            { status: 400 }
        );
        }

        // Get the current user from Supabase auth
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
        return NextResponse.json(
            { error: 'Authorization header required' },
            { status: 401 }
        );
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
        return NextResponse.json(
            { error: 'Invalid authentication' },
            { status: 401 }
        );
        }

        // Fetch the MVP plan with insights
        const { data: mvpPlan, error: fetchError } = await supabase
        .from('mvps')
        .select('insights, insights_generated_at')
        .eq('id', mvpId)
        .eq('user', user.id)
        .single();

        if (fetchError || !mvpPlan) {
        return NextResponse.json(
            { error: 'MVP plan not found or access denied' },
            { status: 404 }
        );
        }

        return NextResponse.json({
        success: true,
        insights: mvpPlan.insights,
        generatedAt: mvpPlan.insights_generated_at
        });

    } catch (error) {
        console.error('Error fetching MVP insights:', error);
        
        return NextResponse.json(
        { error: 'Failed to fetch insights' },
        { status: 500 }
        );
    }
}