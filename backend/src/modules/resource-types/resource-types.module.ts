import { Module } from '@nestjs/common';
import { ResourceTypesService } from './resource-types.service';
import { ResourceTypesController } from './resource-types.controller';

@Module({
  controllers: [ResourceTypesController],
  providers: [ResourceTypesService],
  exports: [ResourceTypesService],
})
export class ResourceTypesModule {}
