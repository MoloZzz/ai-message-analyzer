import { Module } from '@nestjs/common';
import { TelegramBotService } from './telegram-bot.service';
import { FeedbackModule } from '../../feedback/feedback.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, FeedbackModule],
  providers: [TelegramBotService]
})
export class TelegramBotModule {}
