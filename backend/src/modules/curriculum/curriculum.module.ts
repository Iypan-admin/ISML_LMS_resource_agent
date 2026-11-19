import { Module } from '@nestjs/common';
import { CurriculumController } from './curriculum.controller';
import { CurriculumService } from './curriculum.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ResourcesModule } from '../resources/resources.module';

@Module({
  imports: [PrismaModule, ResourcesModule],
  controllers: [CurriculumController],
  providers: [CurriculumService],
  exports: [CurriculumService],
})
export class CurriculumModule {}

