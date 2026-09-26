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
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  async create(@Body() createTopicDto: CreateTopicDto) {
    const data = await this.topicsService.create(createTopicDto);
    return {
      success: true,
      data,
      message: 'Topic created successfully',
    };
  }

  @Get()
  async findAll(@Query('languageId') languageId?: string) {
    const data = await this.topicsService.findAll(languageId);
    return {
      success: true,
      count: data.length,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.topicsService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTopicDto: UpdateTopicDto,
  ) {
    const data = await this.topicsService.update(id, updateTopicDto);
    return {
      success: true,
      data,
      message: 'Topic updated successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.topicsService.remove(id);
    return {
      success: true,
      ...result,
    };
  }
}
