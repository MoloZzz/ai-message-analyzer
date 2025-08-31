import * as dotenv from 'dotenv';
dotenv.config();
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenAiModule } from './integrations/open-ai/open-ai.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AnalyseModule } from './analyse/analyse.module';
import { GoogleSheetsModule } from './integrations/google-sheets/google-sheets.module';
import { TelegramBotModule } from './integrations/telegram-bot/telegram-bot.module';

@Module({
  imports: [OpenAiModule, FeedbackModule, AnalyseModule, GoogleSheetsModule, TelegramBotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
