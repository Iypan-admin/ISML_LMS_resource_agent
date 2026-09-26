import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Post()
  async create(@Body() createLanguageDto: CreateLanguageDto) {
    const data = await this.languagesService.create(createLanguageDto);
    return {
      success: true,
      data,
      message: 'Language created successfully',
    };
  }

  @Get()
  async findAll(@Query('active') active?: string) {
    const activeOnly = active === 'true';
    const data = await this.languagesService.findAll(activeOnly);
    return {
      success: true,
      count: data.length,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.languagesService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ) {
    const data = await this.languagesService.update(id, updateLanguageDto);
    return {
      success: true,
      data,
      message: 'Language updated successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.languagesService.remove(id);
    return {
      success: true,
      ...result,
    };
  }
}
