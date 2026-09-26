import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  async create(@Body() createSkillDto: CreateSkillDto) {
    const data = await this.skillsService.create(createSkillDto);
    return {
      success: true,
      data,
      message: 'Skill created successfully',
    };
  }

  @Get()
  async findAll() {
    const data = await this.skillsService.findAll();
    return {
      success: true,
      count: data.length,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.skillsService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    const data = await this.skillsService.update(id, updateSkillDto);
    return {
      success: true,
      data,
      message: 'Skill updated successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.skillsService.remove(id);
    return {
      success: true,
      ...result,
    };
  }
}
