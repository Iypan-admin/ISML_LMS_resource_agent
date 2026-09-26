import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

@Injectable()
export class LanguagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLanguageDto) {
    const existing = await this.prisma.language.findUnique({
      where: { code: dto.code.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException(`Language with code '${dto.code}' already exists`);
    }

    return this.prisma.language.create({
      data: {
        code: dto.code.toLowerCase(),
        name: dto.name,
        nativeName: dto.nativeName,
        flagEmoji: dto.flagEmoji,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(activeOnly = false) {
    return this.prisma.language.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: {
        _count: {
          select: {
            courses: true,
            topics: true,
            resources: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const language = await this.prisma.language.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            courses: true,
            topics: true,
            resources: true,
          },
        },
      },
    });

    if (!language) {
      throw new NotFoundException(`Language with ID '${id}' not found`);
    }

    return language;
  }

  async update(id: string, dto: UpdateLanguageDto) {
    await this.findOne(id);

    if (dto.code) {
      const existing = await this.prisma.language.findFirst({
        where: {
          code: dto.code.toLowerCase(),
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(`Language code '${dto.code}' is already in use by another language`);
      }
    }

    return this.prisma.language.update({
      where: { id },
      data: {
        ...dto,
        code: dto.code ? dto.code.toLowerCase() : undefined,
      },
    });
  }

  async remove(id: string) {
    const language = await this.findOne(id);

    const relatedCount = language._count.courses + language._count.topics + language._count.resources;

    if (relatedCount > 0) {
      // Soft-delete strategy if references exist to protect relational integrity
      const updated = await this.prisma.language.update({
        where: { id },
        data: { isActive: false },
      });
      return {
        softDeleted: true,
        message: `Language '${language.name}' has ${relatedCount} linked records and was soft-deleted (marked inactive) to protect database integrity.`,
        data: updated,
      };
    }

    // Hard delete if clean without dependencies
    await this.prisma.language.delete({
      where: { id },
    });

    return {
      softDeleted: false,
      message: `Language '${language.name}' was permanently deleted.`,
      id,
    };
  }
}
