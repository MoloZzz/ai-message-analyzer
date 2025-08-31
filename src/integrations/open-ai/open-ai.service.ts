import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private client: OpenAI;
  private readonly logger = new Logger(OpenAiService.name);

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }else{
      this.logger.warn(
        'OPENAI_API_KEY is missing 🚫 — OpenAiService will run in mock mode',
      );
    }
    
  }

  async analyseFeedback(message: string) {
    if (!this.client) {
      return {
        tone: this.mockTone(message),
        criticality: Math.floor(Math.random() * 5) + 1,
        solution: 'Це тестова порада (мок-дані).',
      };
    }

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

   private mockTone(message: string) {
    const lower = message.toLowerCase();
    if (lower.includes('погано') || lower.includes('жахливо')) return 'негативна';
    if (lower.includes('добре') || lower.includes('чудово')) return 'позитивна';
    return 'нейтральна';
  }
}
