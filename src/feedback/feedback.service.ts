import { Injectable, Logger } from '@nestjs/common';
import { AnalyseService } from '../analyse/analyse.service';
import { GoogleSheetsService } from '../integrations/google-sheets/google-sheets.service';

export interface FeedbackDto {
  role: string;
  branch: string;
  message: string;
}

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    private readonly analyseService: AnalyseService,
    private readonly googleSheetsService: GoogleSheetsService,
  ) {}

  async processFeedback({ role, branch, message }: FeedbackDto) {
    this.logger.log(`New feedback from role=${role}, branch=${branch}`);
    // OpenAI
    const analysis = await this.analyseService.analyseMessage(message);

    //Google Sheets
    await this.googleSheetsService.appendFeedbackRow({
      date: new Date().toISOString(),
      role,
      branch,
      message,
      ...analysis,
    });

    return {
      success: true,
      analysis,
    };
  }
}
