import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourceQueryDto } from './dto/resource-query.dto';
import { ResourceStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateUrlHash(url?: string): string | undefined {
    if (!url) return undefined;
    return crypto.createHash('sha256').update(url.trim().toLowerCase()).digest('hex');
  }

  async create(dto: CreateResourceDto) {
    const language = await this.prisma.language.findUnique({
      where: { id: dto.languageId },
    });
    if (!language) {
      throw new NotFoundException(`Language '${dto.languageId}' not found`);
    }

    if (dto.sourceId) {
      const source = await this.prisma.source.findUnique({
        where: { id: dto.sourceId },
      });
      if (!source) {
        throw new NotFoundException(`Source '${dto.sourceId}' not found`);
      }
    }

    const slug = dto.slug.toLowerCase();
    const existingSlug = await this.prisma.resource.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      throw new ConflictException(`Resource with slug '${slug}' already exists`);
    }

    const primaryUrl = dto.normalizedUrl || dto.canonicalUrl || dto.originalUrl;
    const urlHash = this.calculateUrlHash(primaryUrl);

    if (urlHash) {
      const existingHash = await this.prisma.resource.findFirst({
        where: { urlHash },
      });
      if (existingHash) {
        throw new ConflictException(`A resource with duplicate URL hash already exists ('${existingHash.title}')`);
      }
    }

    return this.prisma.resource.create({
      data: {
        slug,
        title: dto.title,
        description: dto.description,
        languageId: dto.languageId,
        sourceId: dto.sourceId,
        sourceType: dto.sourceType,
        resourceType: dto.resourceType,
        status: dto.status ?? ResourceStatus.DRAFT,
        originalUrl: dto.originalUrl,
        canonicalUrl: dto.canonicalUrl,
        normalizedUrl: dto.normalizedUrl,
        urlHash,
        thumbnailUrl: dto.thumbnailUrl,
        authorName: dto.authorName,
        durationSeconds: dto.durationSeconds,
        publishedLocation: dto.publishedLocation,
        courses: dto.courseIds?.length
          ? { create: dto.courseIds.map((courseId) => ({ courseId })) }
          : undefined,
        levels: dto.levelIds?.length
          ? { create: dto.levelIds.map((levelId) => ({ levelId })) }
          : undefined,
        categories: dto.categoryIds?.length
          ? { create: dto.categoryIds.map((categoryId) => ({ categoryId })) }
          : undefined,
        skills: dto.skillIds?.length
          ? { create: dto.skillIds.map((skillId) => ({ skillId })) }
          : undefined,
        topics: dto.topicIds?.length
          ? { create: dto.topicIds.map((topicId) => ({ topicId })) }
          : undefined,
      },
      include: {
        language: true,
        source: true,
        courses: { include: { course: true } },
        levels: { include: { level: true } },
        categories: { include: { category: true } },
        skills: { include: { skill: true } },
        topics: { include: { topic: true } },
      },
    });
  }

  async findAll(query: ResourceQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.languageId) where.languageId = query.languageId;
    if (query.resourceType) where.resourceType = query.resourceType;
    if (query.status) where.status = query.status;
    if (query.sourceId) where.sourceId = query.sourceId;
    if (query.urlHash) where.urlHash = query.urlHash;

    if (query.courseId) {
      where.courses = { some: { courseId: query.courseId } };
    }
    if (query.levelId) {
      where.levels = { some: { levelId: query.levelId } };
    }
    if (query.categoryId) {
      where.categories = { some: { categoryId: query.categoryId } };
    }
    if (query.skillId) {
      where.skills = { some: { skillId: query.skillId } };
    }
    if (query.topicId) {
      where.topics = { some: { topicId: query.topicId } };
    }

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      where.OR = [
        { title: { contains: searchLower, mode: 'insensitive' } },
        { description: { contains: searchLower, mode: 'insensitive' } },
        { slug: { contains: searchLower, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.resource.count({ where }),
      this.prisma.resource.findMany({
        where,
        skip,
        take: limit,
        include: {
          language: true,
          source: true,
          courses: { include: { course: true } },
          levels: { include: { level: true } },
          categories: { include: { category: true } },
          skills: { include: { skill: true } },
          topics: { include: { topic: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(idOrSlug: string) {
    const resource = await this.prisma.resource.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug.toLowerCase() }],
      },
      include: {
        language: true,
        source: true,
        courses: { include: { course: true } },
        levels: { include: { level: true } },
        categories: { include: { category: true } },
        skills: { include: { skill: true } },
        topics: { include: { topic: true } },
        aiAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 },
        copyrightAnalyses: { where: { isCurrent: true }, take: 1 },
        reviews: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!resource) {
      throw new NotFoundException(`Resource '${idOrSlug}' not found`);
    }

    return resource;
  }

  async update(id: string, dto: UpdateResourceDto) {
    await this.findOne(id);

    if (dto.slug) {
      const existing = await this.prisma.resource.findFirst({
        where: { slug: dto.slug.toLowerCase(), NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(`Resource slug '${dto.slug}' is already in use`);
      }
    }

    const primaryUrl = dto.normalizedUrl || dto.canonicalUrl || dto.originalUrl;
    const urlHash = primaryUrl ? this.calculateUrlHash(primaryUrl) : undefined;

    // Handle Junction Table updates cleanly
    if (dto.courseIds !== undefined) {
      await this.prisma.resourceCourse.deleteMany({ where: { resourceId: id } });
    }
    if (dto.levelIds !== undefined) {
      await this.prisma.resourceLevel.deleteMany({ where: { resourceId: id } });
    }
    if (dto.categoryIds !== undefined) {
      await this.prisma.resourceCategory.deleteMany({ where: { resourceId: id } });
    }
    if (dto.skillIds !== undefined) {
      await this.prisma.resourceSkill.deleteMany({ where: { resourceId: id } });
    }
    if (dto.topicIds !== undefined) {
      await this.prisma.resourceTopic.deleteMany({ where: { resourceId: id } });
    }

    return this.prisma.resource.update({
      where: { id },
      data: {
        slug: dto.slug ? dto.slug.toLowerCase() : undefined,
        title: dto.title,
        description: dto.description,
        languageId: dto.languageId,
        sourceId: dto.sourceId,
        sourceType: dto.sourceType,
        resourceType: dto.resourceType,
        status: dto.status,
        originalUrl: dto.originalUrl,
        canonicalUrl: dto.canonicalUrl,
        normalizedUrl: dto.normalizedUrl,
        urlHash,
        thumbnailUrl: dto.thumbnailUrl,
        authorName: dto.authorName,
        durationSeconds: dto.durationSeconds,
        publishedLocation: dto.publishedLocation,
        courses: dto.courseIds?.length
          ? { create: dto.courseIds.map((courseId) => ({ courseId })) }
          : undefined,
        levels: dto.levelIds?.length
          ? { create: dto.levelIds.map((levelId) => ({ levelId })) }
          : undefined,
        categories: dto.categoryIds?.length
          ? { create: dto.categoryIds.map((categoryId) => ({ categoryId })) }
          : undefined,
        skills: dto.skillIds?.length
          ? { create: dto.skillIds.map((skillId) => ({ skillId })) }
          : undefined,
        topics: dto.topicIds?.length
          ? { create: dto.topicIds.map((topicId) => ({ topicId })) }
          : undefined,
      },
      include: {
        language: true,
        source: true,
        courses: { include: { course: true } },
        levels: { include: { level: true } },
        categories: { include: { category: true } },
        skills: { include: { skill: true } },
        topics: { include: { topic: true } },
      },
    });
  }

  async remove(id: string) {
    const resource = await this.findOne(id);
    const hasHistory = resource.reviews.length > 0 || resource.aiAnalyses.length > 0;

    if (hasHistory) {
      const updated = await this.prisma.resource.update({
        where: { id },
        data: { status: ResourceStatus.ARCHIVED },
      });
      return {
        archived: true,
        message: `Resource '${resource.title}' has linked evaluation/review history and was archived to preserve audit records.`,
        data: updated,
      };
    }

    await this.prisma.resource.delete({ where: { id } });

    return {
      archived: false,
      message: `Resource '${resource.title}' was permanently deleted.`,
      id,
    };
  }
}
