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
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  async create(@Body() createCourseDto: CreateCourseDto) {
    const data = await this.coursesService.create(createCourseDto);
    return {
      success: true,
      data,
      message: 'Course created successfully',
    };
  }

  @Get()
  async findAll(
    @Query('languageId') languageId?: string,
    @Query('active') active?: string,
  ) {
    const activeOnly = active === 'true';
    const data = await this.coursesService.findAll(languageId, activeOnly);
    return {
      success: true,
      count: data.length,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.coursesService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    const data = await this.coursesService.update(id, updateCourseDto);
    return {
      success: true,
      data,
      message: 'Course updated successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.coursesService.remove(id);
    return {
      success: true,
      ...result,
    };
  }
}
