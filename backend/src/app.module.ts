import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { validateEnvironment } from './config/environment';

import { AppController } from './app.controller';
import { ArticlesModule } from './articles/articles.module';
import { ChatModule } from './chat/chat.module';
import { ClusteringModule } from './clustering/clustering.module';
import { EmbeddingModule } from './embedding/embedding.module';
import { NewsGenerationModule } from './news-generation/news-generation.module';
import { NewsModule } from './news/news.module';
import { PrismaModule } from './prisma/prisma.module';
import { RssModule } from './rss/rss.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    ScheduleModule.forRoot(),
    PrismaModule,
    EmbeddingModule,
    ClusteringModule,
    NewsGenerationModule,
    ArticlesModule,
    ChatModule,
    RssModule,
    NewsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
