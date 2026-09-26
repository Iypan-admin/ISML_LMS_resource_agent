import { Controller, Get, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('health')
  async health() {
    return this.aiService.checkHealth();
  }

  @Post('analyze')
  async analyze(@Body() body: any) {
    return this.aiService.analyzeResource(body);
  }

  @Post('discover')
  async discover(@Body() body: any) {
    return this.aiService.discoverResources(body);
  }

  @Post('generate')
  async generate(@Body() body: any) {
    return this.aiService.generateResource(body);
  }

  @Post('prepare-review')
  async prepareReview(@Body() body: any) {
    return this.aiService.prepareReview(body);
  }
}
