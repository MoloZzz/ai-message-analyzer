import { Module } from '@nestjs/common';
import { AnalyseService } from './analyse.service';
import { OpenAiModule } from 'src/integrations/open-ai/open-ai.module';

@Module({
  imports:[OpenAiModule],
  providers: [AnalyseService],
  exports: [AnalyseService],
})
export class AnalyseModule {}
