import { Controller, Post, Body, Param } from '@nestjs/common';
import { AgentEcosystemService } from './agent-ecosystem.service';

@Controller('agents')
export class AgentEcosystemController {
  constructor(private readonly agentService: AgentEcosystemService) {}

  @Post('speaking-coach/evaluate')
  async evaluatePronunciation(
    @Body() body: { sessionId: string; spokenTranscript: string; referenceOverride?: string; durationSeconds?: number },
  ) {
    const result = await this.agentService.evaluatePronunciation(
      body.sessionId,
      body.spokenTranscript,
      body.referenceOverride,
      body.durationSeconds || 10,
    );
    return {
      success: true,
      message: 'Oral fluency & phonemic evaluation completed by Speaking Coach Agent.',
      data: result,
    };
  }

  @Post('evaluator/evaluate-writing')
  async evaluateWriting(
    @Body() body: { sessionId: string; submissionText: string; promptOverride?: string },
  ) {
    const result = await this.agentService.evaluateWritingSubmission(
      body.sessionId,
      body.submissionText,
      body.promptOverride,
    );
    return {
      success: true,
      message: 'Communicative writing evaluation completed by Academic Evaluation Agent.',
      data: result,
    };
  }
}

