import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth() {
    return this.healthService.checkComprehensiveHealth();
  }

  @Get('liveness')
  getLiveness() {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('readiness')
  async getReadiness() {
    const health = await this.healthService.checkComprehensiveHealth();
    return {
      status: health.status === 'HEALTHY' ? 'READY' : 'DEGRADED',
      database: health.database.connected,
      pgvector: Boolean(health.database.pgvectorVersion),
      storage: health.storage.status === 'READY',
      timestamp: health.timestamp,
    };
  }
}

