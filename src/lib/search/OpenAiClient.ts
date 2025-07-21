// src/lib/search/OpenAiClient.ts
import { OpenAI } from 'openai';

export class OpenAiClient {
    private openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({ apiKey });
    }

    async generateMVPInsights(mvpData: {
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
    }): Promise<{
        problemStatement: string;
        targetCustomer: string;
        solution: string;
        industry: string;
        features: string;
        userJourney: string;
        overallAssessment: string;
        riskFactors: string;
        recommendations: string;
        timelineEstimate: string;
        budgetEstimate: string;
    }> {
        const mustHaveFeatures = mvpData.features.filter(f => f.priority === 'must-have');
        const totalFeatures = mvpData.features.length;

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `
                        You are an expert startup advisor and product strategist with deep experience in MVP development, market analysis, and startup success factors.
                        
                        Analyze the provided MVP plan and generate actionable insights for each component. Your insights should be:
                        - Specific and actionable
                        - Based on startup best practices and market data
                        - Focused on identifying risks and opportunities
                        - Practical for founders to implement
                        - Estimates should be realistic for cost and time
                        
                        Respond ONLY with a JSON object containing insights for each key. Add a 'competitors' key and list the top 5 competitors, what they do well, and where they can improve.
                    `,
                },
                {
                    role: 'user',
                    content: `
                        Analyze this MVP plan and provide insights:
                        
                        Problem Statement: ${mvpData.problemStatement}
                        Target Customer: ${mvpData.targetCustomer}
                        Solution: ${mvpData.solution}
                        Industry: ${mvpData.industry}
                        Must-Have Features (${mustHaveFeatures.length}): ${mustHaveFeatures.map(f => f.name).join(', ')}
                        Total Features: ${totalFeatures}
                        User Journey Steps: ${mvpData.userJourney.map(step => step.step).join(' → ')}
                        
                        Provide insights for:
                        {
                            "problemStatement": "Analysis of problem clarity, market size, urgency, and validation suggestions",
                            "targetCustomer": "Customer segment analysis, market accessibility, and targeting recommendations",
                            "solution": "Solution-market fit assessment, differentiation analysis, and positioning insights",
                            "industry": "Industry trends, competitive landscape, and market timing analysis",
                            "features": "Feature complexity analysis, development prioritization insights, and scope recommendations",
                            "userJourney": "Journey flow analysis, friction points identification, and optimization suggestions",
                            "overallAssessment": "Overall MVP viability, strengths, and strategic assessment",
                            "riskFactors": "Key risks, potential failure points, and mitigation strategies",
                            "recommendations": "Top 3-5 immediate next steps and strategic recommendations",
                            "timelineEstimate": "Realistic development timeline estimate with factors and assumptions",
                            "budgetEstimate": "Development cost estimate range with key cost drivers and variables"
                        }
                    `,
                },
            ],
        temperature: 0.3, // Lower temperature for more consistent, analytical responses
    });

    const text = response.choices[0].message.content || '{}';
    return JSON.parse(text);
}

    async extractKeywords(context: {
        idea: string;
        targetCustomer: string;
        problem: string;
        industry: string;
    }): Promise<string[]> {
        const { idea, targetCustomer, problem, industry } = context;

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `
                        You are a startup analyst who extracts business-relevant keywords from product ideas.
                                            
                        You MUST extract 5–10 keywords that describe the **market**, **industry vertical**, **target customer**, **core feature**, or **problem space** of the idea.
                        Avoid any keywords about programming or general technologies.

                        Respond ONLY with a JSON array of strings.`,
                },
                {
                    role: 'user',
                    content: `Idea: ${idea}
                        Target Customer: ${targetCustomer}
                        Problem: ${problem}
                        Industry: ${industry}`,
                },
            ],
            temperature: 0.7,
        });

        const text = response.choices[0].message.content || '[]';
        return JSON.parse(text);
    }

    async findRelevantCompanies(context: {
        idea: string;
        targetCustomer: string;
        problem: string;
        industry: string;
    }): Promise<
        {
            name: string;
            description: string;
            focus?: string;
            founded?: string;
            website?: string;
        }[]
    > {
        const { idea, targetCustomer, problem, industry } = context;

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `
                        You are a startup market analyst.

                        Based on a startup idea and its context, list 5–10 companies (startups or established businesses) that have addressed a similar problem or industry.

                        Respond with a JSON array of objects, each containing:
                        - name
                        - description
                        - website
                        - focus
                        - founded
                        - success (why they are successful)
                        - pitfalls (where they can improve)

                        Respond ONLY with JSON. No explanation.`,
                },
                {
                    role: 'user',
                    content: `
                        Idea: ${idea}
                        Target Customer: ${targetCustomer}
                        Problem: ${problem}
                        Industry: ${industry}`,
                },
            ],
            temperature: 0.7,
        });

        const text = response.choices[0].message.content || '[]';
        return JSON.parse(text);
    }

    async summarize(text: string): Promise<string> {
        const res = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'user',
                    content: `Summarize the following article in 2-3 sentences:\n\n${text}`
                }
            ]
        });

        return res.choices[0]?.message?.content?.trim() || '';
    }

    async analyzeSentiment(text: string): Promise<number> {
        const res = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'user',
                    content:
                        `On a scale from 0 (completely negative) to 100 (completely positive), what is the sentiment of this article?\n\n${text}\n\nRespond ONLY with a number.`
                }
            ]
        });

        const raw = res.choices[0]?.message?.content?.trim() || '50';
        const score = parseInt(raw.match(/\d+/)?.[0] || '50', 10);
        return Math.min(Math.max(score, 0), 100); // Clamp between 0 and 100
    }
}
