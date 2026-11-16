import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to PostgreSQL / Supabase database successfully.');
    } catch (error: any) {
      this.logger.warn(`Initial database connection failed: ${error?.message || error}. Queries will retry on demand.`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
