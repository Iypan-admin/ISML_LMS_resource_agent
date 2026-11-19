import { Module } from '@nestjs/common';
import { LmsPublishingController } from './lms-publishing.controller';
import { LmsPublishingService } from './lms-publishing.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { DeliverablesModule } from '../deliverables/deliverables.module';

@Module({
  imports: [PrismaModule, DeliverablesModule],
  controllers: [LmsPublishingController],
  providers: [LmsPublishingService],
  exports: [LmsPublishingService],
})
export class LmsPublishingModule {}

