import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SourcesService } from './sources.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';

@Controller('sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Post()
  async create(@Body() createSourceDto: CreateSourceDto) {
    const data = await this.sourcesService.create(createSourceDto);
    return {
      success: true,
      data,
      message: 'Source created successfully',
    };
  }

  @Get()
  async findAll() {
    const data = await this.sourcesService.findAll();
    return {
      success: true,
      count: data.length,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.sourcesService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSourceDto: UpdateSourceDto,
  ) {
    const data = await this.sourcesService.update(id, updateSourceDto);
    return {
      success: true,
      data,
      message: 'Source updated successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.sourcesService.remove(id);
    return {
      success: true,
      ...result,
    };
  }
}
