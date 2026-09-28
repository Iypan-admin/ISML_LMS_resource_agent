import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.aiServiceUrl = (
      this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000'
    ).replace(/\/$/, '');
  }

  private async forwardRequest(endpoint: string, payload?: any, method: string = 'POST'): Promise<any> {
    const targetUrl = `${this.aiServiceUrl}/api/v1/ai/${endpoint.replace(/^\//, '')}`;
    try {
      const response = await fetch(targetUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload ? JSON.stringify(payload) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`AI Service HTTP ${response.status} from ${targetUrl}: ${errorText}`);
        throw new HttpException(
          {
            success: false,
            message: `AI Service Error (${response.status})`,
            error: errorText,
          },
          response.status || HttpStatus.BAD_GATEWAY,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to connect to AI Service at ${targetUrl}: ${error.message}`);
      throw new HttpException(
        {
          success: false,
          message: 'AI Service currently unavailable',
          error: error.message,
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async checkHealth(): Promise<any> {
    const targetUrl = `${this.aiServiceUrl}/health`;
    try {
      const response = await fetch(targetUrl);
      return await response.json();
    } catch (err) {
      return { status: 'offline', error: err.message };
    }
  }

  async analyzeResource(payload: any): Promise<any> {
    return this.forwardRequest('analyze', payload);
  }

  async discoverResources(payload: any): Promise<any> {
    return this.forwardRequest('discover', payload);
  }

  async generateResource(payload: any): Promise<any> {
    return this.forwardRequest('generate', payload);
  }

  async prepareReview(payload: any): Promise<any> {
    return this.forwardRequest('prepare-review', payload);
  }

  async scrapeAnalyze(payload: any): Promise<any> {
    return this.forwardRequest('scrape-analyze', payload);
  }
}
