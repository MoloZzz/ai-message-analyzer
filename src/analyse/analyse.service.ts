import { Injectable } from '@nestjs/common';
import { OpenAiService } from '../integrations/open-ai/open-ai.service';

@Injectable()
export class AnalyseService {
  constructor(private readonly openAiService: OpenAiService) {}

  async analyseMessage(message: string) {
    return this.openAiService.analyseFeedback(message);
  }
}
