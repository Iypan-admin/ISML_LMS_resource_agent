import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CurriculumService } from './curriculum.service';
import { CreateCurriculumDto, GroundResourceDto, LockCurriculumDto } from './dto/create-curriculum.dto';

@Controller('curriculums')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Post()
  async createCurriculum(@Body() dto: CreateCurriculumDto) {
    return this.curriculumService.createCurriculum(dto);
  }

  @Get()
  async findAll(@Query('tenantId') tenantId?: string, @Query() query?: any) {
    const data = await this.curriculumService.findAll(tenantId, query);
    return {
      success: true,
      count: data.length,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('tenantId') tenantId?: string) {
    const data = await this.curriculumService.findOne(id, tenantId);
    return {
      success: true,
      data,
    };
  }

  @Post(':id/lock')
  async lockCurriculum(
    @Param('id') id: string,
    @Body() dto: LockCurriculumDto,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.curriculumService.lockCurriculum(id, dto, tenantId);
  }

  @Post(':id/branch')
  async branchCurriculum(
    @Param('id') id: string,
    @Body() body: { title?: string },
    @Query('tenantId') tenantId?: string,
  ) {
    return this.curriculumService.branchCurriculum(id, body?.title, tenantId);
  }

  @Post(':id/periods/:periodId/ground-resource')
  async groundResourceToPeriod(
    @Param('id') id: string,
    @Param('periodId') periodId: string,
    @Body() dto: GroundResourceDto,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.curriculumService.groundResourceToPeriod(periodId, dto, tenantId);
  }

  @Post(':id/generate-ai-syllabus')
  async generateAISyllabus(
    @Param('id') id: string,
    @Body() body?: { autoGroundWithVault?: boolean },
  ) {
    return this.curriculumService.generateAISyllabus(id, body);
  }

  @Get(':id/grounding-audit')
  async getGroundingAudit(@Param('id') id: string) {
    const data = await this.curriculumService.getGroundingAudit(id);
    return {
      success: true,
      data,
    };
  }

  @Post('periods/:periodId/generate-session')
  async generateSessionPackage(
    @Param('periodId') periodId: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.curriculumService.generateSessionPackage(periodId, tenantId);
  }
}

