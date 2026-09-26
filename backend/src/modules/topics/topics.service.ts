import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTopicDto) {
    const language = await this.prisma.language.findUnique({
      where: { id: dto.languageId },
    });
    if (!language) {
      throw new NotFoundException(`Language with ID '${dto.languageId}' does not exist`);
    }

    if (dto.parentTopicId) {
      const parent = await this.prisma.topic.findUnique({
        where: { id: dto.parentTopicId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent topic '${dto.parentTopicId}' not found`);
      }
    }

    const slug = dto.slug.toLowerCase();
    const code = dto.code.toLowerCase();

    const existing = await this.prisma.topic.findUnique({
      where: {
        languageId_slug: {
          languageId: dto.languageId,
          slug,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Topic with slug '${slug}' already exists for this language`);
    }

    return this.prisma.topic.create({
      data: {
        languageId: dto.languageId,
        code,
        title: dto.title,
        slug,
        description: dto.description,
        parentTopicId: dto.parentTopicId,
      },
      include: {
        language: true,
        parentTopic: true,
      },
    });
  }

  async findAll(languageId?: string) {
    const where: any = {};
    if (languageId) where.languageId = languageId;

    return this.prisma.topic.findMany({
      where,
      include: {
        language: true,
        parentTopic: true,
        subTopics: true,
        _count: {
          select: {
            resourceTopics: true,
          },
        },
      },
      orderBy: { title: 'asc' },
    });
  }

  async findOne(idOrSlug: string) {
    const topic = await this.prisma.topic.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug.toLowerCase() }, { code: idOrSlug.toLowerCase() }],
      },
      include: {
        language: true,
        parentTopic: true,
        subTopics: true,
        _count: {
          select: {
            resourceTopics: true,
          },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException(`Topic '${idOrSlug}' not found`);
    }

    return topic;
  }

  async update(id: string, dto: UpdateTopicDto) {
    const current = await this.findOne(id);

    if (dto.parentTopicId) {
      if (dto.parentTopicId === id) {
        throw new BadRequestException(`A topic cannot be its own parent`);
      }
      const parent = await this.prisma.topic.findUnique({
        where: { id: dto.parentTopicId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent topic '${dto.parentTopicId}' not found`);
      }
    }

    const targetLanguageId = dto.languageId || current.languageId;
    const targetSlug = dto.slug ? dto.slug.toLowerCase() : current.slug;

    if (dto.slug || dto.languageId) {
      const existing = await this.prisma.topic.findFirst({
        where: {
          languageId: targetLanguageId,
          slug: targetSlug,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(`Topic slug '${targetSlug}' is already in use for this language`);
      }
    }

    return this.prisma.topic.update({
      where: { id },
      data: {
        ...dto,
        code: dto.code ? dto.code.toLowerCase() : undefined,
        slug: dto.slug ? dto.slug.toLowerCase() : undefined,
      },
      include: {
        language: true,
        parentTopic: true,
      },
    });
  }

  async remove(id: string) {
    const topic = await this.findOne(id);
    const subTopicsCount = topic.subTopics.length;
    const resourceCount = topic._count.resourceTopics;

    if (subTopicsCount > 0 || resourceCount > 0) {
      throw new ConflictException(
        `Cannot delete Topic '${topic.title}' because it has ${subTopicsCount} sub-topics and ${resourceCount} linked resources.`,
      );
    }

    await this.prisma.topic.delete({ where: { id } });

    return {
      success: true,
      message: `Topic '${topic.title}' deleted successfully`,
      id,
    };
  }
}
