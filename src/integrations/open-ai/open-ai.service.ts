import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async analyseFeedback(message: string) {
    const prompt = `
    Проаналізуй цей відгук:
    "${message}"

    Відповідай у JSON:
    {
      "tone": "позитивна | нейтральна | негативна",
      "criticality": 1-5,
      "solution": "коротка порада"
    }
    `;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }
}
