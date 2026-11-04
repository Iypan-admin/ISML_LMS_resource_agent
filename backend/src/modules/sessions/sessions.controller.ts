import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('save')
  async savePackage(@Body() body: any) {
    return this.sessionsService.savePackage(body);
  }

  @Get()
  async listPackages(
    @Query('language') language?: string,
    @Query('level') level?: string,
    @Query('trackMode') trackMode?: string,
  ) {
    return this.sessionsService.listPackages(language, level, trackMode);
  }

  @Get(':sessionId')
  async getPackage(@Param('sessionId') sessionId: string) {
    return this.sessionsService.getPackageBySessionId(sessionId);
  }

  @Delete(':sessionId')
  async deletePackage(@Param('sessionId') sessionId: string) {
    return this.sessionsService.deletePackage(sessionId);
  }

  @Post(':sessionId/export-lms')
  async exportToLms(@Param('sessionId') sessionId: string) {
    return this.sessionsService.syncToLms(sessionId);
  }
}
