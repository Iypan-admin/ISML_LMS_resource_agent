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

  @Post(':sessionId/chunks')
  async saveChunks(
    @Param('sessionId') sessionId: string,
    @Body('chunks') chunks: any[],
  ) {
    return this.sessionsService.saveChunks(sessionId, chunks);
  }

  @Get(':sessionId/chunks')
  async getChunks(
    @Param('sessionId') sessionId: string,
    @Query('query') query?: string,
  ) {
    if (query) {
      return this.sessionsService.searchChunks(sessionId, query);
    }
    return this.sessionsService.getChunks(sessionId);
  }

  @Post(':sessionId/export-lms')
  async exportToLms(@Param('sessionId') sessionId: string) {
    return this.sessionsService.syncToLms(sessionId);
  }
}
