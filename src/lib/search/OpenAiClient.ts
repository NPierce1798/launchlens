// src/lib/search/OpenAiClient.ts
import { OpenAI } from 'openai';

export class OpenAiClient {
    private openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({ apiKey });
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
