import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LevelsService } from './levels.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';

@Controller('levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Post()
  async create(@Body() createLevelDto: CreateLevelDto) {
    const data = await this.levelsService.create(createLevelDto);
    return {
      success: true,
      data,
      message: 'Level created successfully',
    };
  }

  @Get()
  async findAll() {
    const data = await this.levelsService.findAll();
    return {
      success: true,
      count: data.length,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.levelsService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLevelDto: UpdateLevelDto,
  ) {
    const data = await this.levelsService.update(id, updateLevelDto);
    return {
      success: true,
      data,
      message: 'Level updated successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.levelsService.remove(id);
    return {
      success: true,
      ...result,
    };
  }
}
