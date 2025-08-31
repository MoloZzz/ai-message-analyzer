import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { AnalyseModule } from 'src/analyse/analyse.module';
import { GoogleSheetsModule } from 'src/integrations/google-sheets/google-sheets.module';

@Module({
  imports: [AnalyseModule, GoogleSheetsModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
