import { Module } from '@nestjs/common';

import { NewsGenerationService } from './news-generation.service';

@Module({
  providers: [NewsGenerationService],
  exports: [NewsGenerationService],
})
export class NewsGenerationModule {}
