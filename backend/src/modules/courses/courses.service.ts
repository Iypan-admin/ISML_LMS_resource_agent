import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCourseDto) {
    const language = await this.prisma.language.findUnique({
      where: { id: dto.languageId },
    });

    if (!language) {
      throw new NotFoundException(`Language with ID '${dto.languageId}' does not exist`);
    }

    const code = dto.code.toLowerCase();
    const existing = await this.prisma.course.findUnique({
      where: {
        languageId_code: {
          languageId: dto.languageId,
          code,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Course with code '${code}' already exists for this language`);
    }

    return this.prisma.course.create({
      data: {
        languageId: dto.languageId,
        code,
        title: dto.title,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
      include: {
        language: true,
      },
    });
  }

  async findAll(languageId?: string, activeOnly = false) {
    const where: any = {};
    if (languageId) where.languageId = languageId;
    if (activeOnly) where.isActive = true;

    return this.prisma.course.findMany({
      where,
      include: {
        language: true,
        _count: {
          select: {
            resources: true,
          },
        },
      },
      orderBy: { title: 'asc' },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        language: true,
        _count: {
          select: {
            resources: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID '${id}' not found`);
    }

    return course;
  }

  async update(id: string, dto: UpdateCourseDto) {
    const current = await this.findOne(id);

    const targetLanguageId = dto.languageId || current.languageId;
    const targetCode = dto.code ? dto.code.toLowerCase() : current.code;

    if (dto.languageId && dto.languageId !== current.languageId) {
      const language = await this.prisma.language.findUnique({
        where: { id: dto.languageId },
      });
      if (!language) {
        throw new NotFoundException(`Language with ID '${dto.languageId}' does not exist`);
      }
    }

    if (dto.code || dto.languageId) {
      const existing = await this.prisma.course.findFirst({
        where: {
          languageId: targetLanguageId,
          code: targetCode,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(`Course with code '${targetCode}' already exists for this language`);
      }
    }

    return this.prisma.course.update({
      where: { id },
      data: {
        ...dto,
        code: dto.code ? dto.code.toLowerCase() : undefined,
      },
      include: {
        language: true,
      },
    });
  }

  async remove(id: string) {
    const course = await this.findOne(id);
    const relatedCount = course._count.resources;

    if (relatedCount > 0) {
      const updated = await this.prisma.course.update({
        where: { id },
        data: { isActive: false },
      });
      return {
        softDeleted: true,
        message: `Course '${course.title}' has ${relatedCount} linked resource references and was deactivated.`,
        data: updated,
      };
    }

    await this.prisma.course.delete({
      where: { id },
    });

    return {
      softDeleted: false,
      message: `Course '${course.title}' was permanently deleted.`,
      id,
    };
  }
}
