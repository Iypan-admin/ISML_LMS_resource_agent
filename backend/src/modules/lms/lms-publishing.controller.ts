import { Controller, Post, Get, Param, Query, Body } from '@nestjs/common';
import { LmsPublishingService } from './lms-publishing.service';

@Controller('lms')
export class LmsPublishingController {
  constructor(private readonly lmsService: LmsPublishingService) {}

  @Get('scorm/:sessionId')
  async getScormManifest(@Param('sessionId') sessionId: string) {
    const data = await this.lmsService.generateScormManifest(sessionId);
    return {
      success: true,
      data,
    };
  }

  @Post('sync/session/:sessionId')
  async syncSession(
    @Param('sessionId') sessionId: string,
    @Body() body?: { targetLms?: string },
  ) {
    return this.lmsService.syncSessionToLms(sessionId, body?.targetLms || 'ISML_LMS');
  }

  @Post('sync/curriculum/:curriculumId')
  async syncCurriculum(
    @Param('curriculumId') curriculumId: string,
    @Body() body?: { targetLms?: string },
  ) {
    const data = await this.lmsService.syncCurriculumToLms(curriculumId, body?.targetLms || 'CANVAS');
    return {
      success: true,
      message: 'Master Curriculum exported and synchronized to LMS Common Cartridge format.',
      data,
    };
  }
}

