import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';

import { RssCollectorService } from './rss-collector.service';

@Injectable()
export class RssSchedulerService {
  private readonly logger = new Logger(RssSchedulerService.name);
  private running = false;

  constructor(
    private readonly collector: RssCollectorService,
    private readonly config: ConfigService,
  ) {}

  @Cron('0 */10 * * * *')
  async collect() {
    if (!this.isEnabled() || this.running) return;
    this.running = true;
    try {
      await this.collector.collectAll();
    } catch (error) {
      this.logger.error(error instanceof Error ? error.stack : String(error));
    } finally {
      this.running = false;
    }
  }

  private isEnabled() {
    return (this.config.get<string>('RSS_SCHEDULER_ENABLED') ?? 'true').toLowerCase() === 'true';
  }
}
