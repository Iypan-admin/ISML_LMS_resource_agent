import { Controller, Get, Param } from '@nestjs/common';
import { ResourceTypesService } from './resource-types.service';

@Controller('resource-types')
export class ResourceTypesController {
  constructor(private readonly resourceTypesService: ResourceTypesService) {}

  @Get()
  findAll() {
    const data = this.resourceTypesService.findAll();
    return {
      success: true,
      count: data.length,
      data,
    };
  }

  @Get(':type')
  findOne(@Param('type') type: string) {
    const data = this.resourceTypesService.findOne(type);
    return {
      success: true,
      data,
    };
  }
}
