import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourceQueryDto } from './dto/resource-query.dto';
import { VaultSearchDto } from './dto/vault-search.dto';
import 'multer';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  async create(@Body() createResourceDto: CreateResourceDto) {
    const data = await this.resourcesService.create(createResourceDto);
    return {
      success: true,
      data,
      message: 'Resource created successfully',
    };
  }

  @Post('vault/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVaultResource(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const result = await this.resourcesService.uploadVaultResource(file, {
      title: body.title,
      languageId: body.languageId || body.language || body.languageName,
      languageName: body.language || body.languageName || body.languageId,
      tenantId: body.tenantId,
      framework: body.framework,
      cefrLevel: body.cefrLevel,
      masterIndex: body.masterIndex,
      description: body.description,
      topicIds: body.topicIds ? (Array.isArray(body.topicIds) ? body.topicIds : [body.topicIds]) : undefined,
    } as any);
    return result;
  }

  @Post('vault/link')
  async ingestVaultLink(@Body() body: any) {
    const result = await this.resourcesService.ingestVaultUrlResource({
      url: body.url,
      title: body.title,
      language: body.language,
      languageId: body.languageId,
      framework: body.framework,
      cefrLevel: body.cefrLevel,
      masterIndex: body.masterIndex,
      description: body.description,
      tenantId: body.tenantId,
    });
    return result;
  }

  @Post('vault/search')
  async hybridVaultSearch(@Body() body: VaultSearchDto) {
    const data = await this.resourcesService.hybridSearch(body);
    return {
      success: true,
      message: 'Knowledge Vault hybrid retrieval executed.',
      ...data,
    };
  }

  @Get(':id/presigned-url')
  async getPresignedUrl(
    @Param('id') id: string,
    @Query('tenantId') tenantId?: string,
  ) {
    const data = await this.resourcesService.getPresignedUrl(id, tenantId);
    return data;
  }

  @Post(':id/extract')
  async triggerExtraction(
    @Param('id') id: string,
    @Body() body?: { tenantId?: string },
  ) {
    const data = await this.resourcesService.processVaultExtraction(id, body?.tenantId);
    return {
      success: true,
      message: 'Extraction processing executed.',
      data,
    };
  }

  @Post(':id/index-vault')
  async triggerIndexing(
    @Param('id') id: string,
    @Body() body?: { tenantId?: string },
  ) {
    const data = await this.resourcesService.indexResource(id, body?.tenantId);
    return {
      success: true,
      message: 'Knowledge Vault vector chunking & 768-dim indexing completed.',
      data,
    };
  }

  @Get(':id/processing-status')
  async getProcessingStatus(
    @Param('id') id: string,
    @Query('tenantId') tenantId?: string,
  ) {
    const data = await this.resourcesService.getProcessingStatus(id, tenantId);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id/approval')
  async updateApprovalStatus(
    @Param('id') id: string,
    @Body() body: { decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUIRED'; comments?: string; reviewerId?: string },
  ) {
    const data = await this.resourcesService.updateApprovalStatus(id, body.decision, body.comments, body.reviewerId);
    return data;
  }

  @Get()
  async findAll(@Query() query: ResourceQueryDto) {
    const result = await this.resourcesService.findAll(query);
    return {
      success: true,
      meta: result.meta,
      data: result.data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.resourcesService.findOne(id);
    return {
      success: true,
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    const data = await this.resourcesService.update(id, updateResourceDto);
    return {
      success: true,
      data,
      message: 'Resource updated successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.resourcesService.remove(id);
    return {
      success: true,
      ...result,
    };
  }
}
