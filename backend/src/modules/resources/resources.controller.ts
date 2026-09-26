import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourceQueryDto } from './dto/resource-query.dto';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  async create(@Body() createResourceDto: CreateResourceDto) {
    const data = await this.resourcesService.create(createResourceDto);
    return {
      success: true,
      data,
      message: 'Resource created successfully',
    };
  }

  @Get()
  async findAll(@Query() query: ResourceQueryDto) {
    const result = await this.resourcesService.findAll(query);
    return {
      success: true,
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.resourcesService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    const data = await this.resourcesService.update(id, updateResourceDto);
    return {
      success: true,
      data,
      message: 'Resource updated successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.resourcesService.remove(id);
    return {
      success: true,
      ...result,
    };
  }
}
