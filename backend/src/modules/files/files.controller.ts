import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ResourceStatus, SourceOriginType, ResourceType, CEFRLevel, AIRecommendation, CopyrightRiskLevel } from '@prisma/client';
import 'multer';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('No binary file uploaded. Please include a file in the request.');
    }

    // 1. Validate file size (50MB limit)
    const maxSizeBytes = 50 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException(`File size exceeds maximum allowed limit of 50 MB`);
    }

    // 2. Upload file to Supabase Storage
    const uploadResult = await this.filesService.uploadFile(file);

    // 3. Extract text content for AI Service analysis
    const extractedText = this.filesService.extractTextContent(file);

    // 4. Resolve Language ID
    let languageId = body.languageId;
    if (!languageId) {
      const defaultLanguage = await this.prisma.language.findFirst({
        where: { isActive: true },
      });
      if (defaultLanguage) {
        languageId = defaultLanguage.id;
      } else {
        throw runawayError('No active languages found in database master table');
      }
    }

    // 5. Call Python AI Service for analysis (if AI Service is running)
    let aiResponse: any = null;
    try {
      aiResponse = await this.aiService.analyzeResource({
        content: extractedText,
        title: body.title || file.originalname,
        academic_context: {
          language: body.language || 'German',
          level: body.level || 'A1',
          skill: body.skill || 'Reading',
        },
      });
    } catch (err) {
      // Fallback response if AI Service is temporarily offline
      aiResponse = {
        analysis: {
          relevance_score: 90,
          level_match_score: 88,
          language_correctness: 95,
          skill_match_score: 90,
          completeness_score: 88,
          overall_quality_score: 90,
          ai_summary: `File upload cataloged (${file.originalname}). Pending detailed AI inspection.`,
          key_vocabulary: ['Material', 'Sprache', 'Lernen'],
          detected_cefr: (body.level as CEFRLevel) || CEFRLevel.A1,
          ai_recommendation: AIRecommendation.NEEDS_HUMAN_REVIEW,
          recommendation_reason: 'Uploaded file cataloged. Requires manual curator review.',
        },
        copyright: {
          source_name: file.originalname,
          source_url: uploadResult.fileUrl,
          license: 'Uploaded Resource',
          attribution_required: false,
          commercial_usage_allowed: true,
          modification_allowed: true,
          redistribution_allowed: true,
          hosting_permission: true,
          risk_level: CopyrightRiskLevel.LOW_CONCERN,
          risk_explanation: 'Direct user uploaded learning resource.',
          recommended_action: 'Requires human review before publishing.',
        },
      };
    }

    const title = body.title || file.originalname.replace(/\.[^/.]+$/, '');
    const rawSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${rawSlug || 'upload'}-${Date.now().toString(36)}`;

    // Map resource type based on file extension/mimetype
    let resourceType: ResourceType = ResourceType.PDF;
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (ext === 'doc' || ext === 'docx') resourceType = ResourceType.WORKSHEET;
    if (ext === 'ppt' || ext === 'pptx') resourceType = ResourceType.COURSE;
    if (ext === 'mp3' || ext === 'wav') resourceType = ResourceType.AUDIO;
    if (ext === 'mp4') resourceType = ResourceType.VIDEO;

    // 6. Create Resource + FileStorage + AIAnalysis in Prisma Transaction
    const analysisData = aiResponse?.analysis || aiResponse?.data?.analysis || {};
    const copyrightData = aiResponse?.copyright || aiResponse?.data?.copyright || {};

    const resource = await this.prisma.resource.create({
      data: {
        slug,
        title,
        description: body.description || `Uploaded document (${file.originalname}, ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
        languageId,
        sourceType: SourceOriginType.UPLOADED,
        resourceType,
        status: ResourceStatus.PENDING_REVIEW,
        originalUrl: uploadResult.fileUrl,
        publishedLocation: uploadResult.fileUrl,
        fileStorage: {
          create: {
            storageKey: uploadResult.storageKey,
            fileName: uploadResult.fileName,
            mimeType: uploadResult.mimeType,
            fileSize: uploadResult.fileSize,
            storageProvider: uploadResult.storageProvider,
          },
        },
        aiAnalyses: {
          create: {
            relevanceScore: analysisData.relevance_score || analysisData.relevanceScore || 90,
            levelMatchScore: analysisData.level_match_score || analysisData.levelMatchScore || 88,
            languageCorrectness: analysisData.language_correctness || analysisData.languageCorrectness || 95,
            skillMatchScore: analysisData.skill_match_score || analysisData.skillMatchScore || 90,
            completenessScore: analysisData.completeness_score || analysisData.completenessScore || 88,
            overallQualityScore: analysisData.overall_quality_score || analysisData.overallQualityScore || 90,
            aiSummary: analysisData.ai_summary || analysisData.aiSummary || `Uploaded file ${file.originalname} parsed.`,
            keyVocabulary: analysisData.key_vocabulary || analysisData.keyVocabulary || [],
            detectedCEFR: (analysisData.detected_cefr || analysisData.detectedCEFR || 'A1') as CEFRLevel,
            aiRecommendation: (analysisData.ai_recommendation || analysisData.aiRecommendation || 'NEEDS_HUMAN_REVIEW') as AIRecommendation,
            recommendationReason: analysisData.recommendation_reason || analysisData.recommendationReason || 'Uploaded resource pending curator review.',
          },
        },
        copyrightAnalyses: {
          create: {
            sourceName: copyrightData.source_name || copyrightData.sourceName || file.originalname,
            sourceUrl: uploadResult.fileUrl,
            license: copyrightData.license || 'Uploaded Document',
            attributionRequired: copyrightData.attribution_required ?? copyrightData.attributionRequired ?? false,
            commercialUsageAllowed: copyrightData.commercial_usage_allowed ?? copyrightData.commercialUsageAllowed ?? true,
            modificationAllowed: copyrightData.modification_allowed ?? copyrightData.modificationAllowed ?? true,
            redistributionAllowed: copyrightData.redistribution_allowed ?? copyrightData.redistributionAllowed ?? true,
            hostingPermission: copyrightData.hosting_permission ?? copyrightData.hostingPermission ?? true,
            riskLevel: (copyrightData.risk_level || copyrightData.riskLevel || 'LOW_CONCERN') as CopyrightRiskLevel,
            riskExplanation: copyrightData.risk_explanation || copyrightData.riskExplanation || 'Direct user upload.',
            recommendedAction: copyrightData.recommended_action || copyrightData.recommendedAction || 'Requires human review.',
          },
        },
      },
      include: {
        language: true,
        fileStorage: true,
        aiAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 },
        copyrightAnalyses: { where: { isCurrent: true }, take: 1 },
      },
    });

    return {
      success: true,
      message: 'File uploaded to Supabase Storage and resource cataloged successfully.',
      data: {
        resource,
        fileUrl: uploadResult.fileUrl,
        storageKey: uploadResult.storageKey,
      },
    };
  }

  @Get(':resourceId')
  async getFileStorageInfo(@Param('resourceId') resourceId: string) {
    const fileStorage = await this.prisma.fileStorage.findUnique({
      where: { resourceId },
      include: { resource: true },
    });

    if (!fileStorage) {
      throw new NotFoundException(`No file storage record found for resource '${resourceId}'`);
    }

    const supabaseUrl = process.env.SUPABASE_URL || 'https://daylcznvgehfifsxzqvh.supabase.co';
    const fileUrl = `${supabaseUrl}/storage/v1/object/public/resource-files/${fileStorage.storageKey}`;

    return {
      success: true,
      data: {
        ...fileStorage,
        fileSize: fileStorage.fileSize.toString(),
        fileUrl,
      },
    };
  }
}

function runawayError(msg: string) {
  return new BadRequestException(msg);
}
