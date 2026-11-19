import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { DeliverablesService } from './deliverables.service';

@Controller('deliverables')
export class DeliverablesController {
  constructor(private readonly deliverablesService: DeliverablesService) {}

  @Post(':sessionId/generate')
  async generateDeliverables(@Param('sessionId') sessionId: string) {
    const data = await this.deliverablesService.generateDeliverables(sessionId);
    return {
      success: true,
      message: 'Segregated deliverables (Teacher, Student, Assessment) generated successfully.',
      data,
    };
  }

  @Get(':sessionId')
  async getDeliverables(@Param('sessionId') sessionId: string) {
    const data = await this.deliverablesService.generateDeliverables(sessionId);
    return {
      success: true,
      data,
    };
  }

  @Get(':sessionId/export')
  async exportMarkdown(
    @Param('sessionId') sessionId: string,
    @Query('target') target: 'TEACHER' | 'STUDENT' | 'ASSESSMENT',
  ) {
    const markdown = await this.deliverablesService.exportMarkdown(sessionId, target || 'STUDENT');
    return {
      success: true,
      target,
      markdown,
    };
  }
}

