import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { CEFRLevel } from '@prisma/client';

@Injectable()
export class LevelsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLevelDto) {
    const existing = await this.prisma.level.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`Level with code '${dto.code}' already exists`);
    }

    return this.prisma.level.create({
      data: {
        code: dto.code,
        name: dto.name,
        rank: dto.rank,
      },
    });
  }

  async findAll() {
    return this.prisma.level.findMany({
      include: {
        _count: {
          select: {
            resourceLevels: true,
          },
        },
      },
      orderBy: { rank: 'asc' },
    });
  }

  async findOne(idOrCode: string) {
    let level;

    // Check if valid CEFRLevel enum value
    if (Object.values(CEFRLevel).includes(idOrCode as CEFRLevel)) {
      level = await this.prisma.level.findUnique({
        where: { code: idOrCode as CEFRLevel },
        include: {
          _count: {
            select: { resourceLevels: true },
          },
        },
      });
    } else {
      level = await this.prisma.level.findUnique({
        where: { id: idOrCode },
        include: {
          _count: {
            select: { resourceLevels: true },
          },
        },
      });
    }

    if (!level) {
      throw new NotFoundException(`Level '${idOrCode}' not found`);
    }

    return level;
  }

  async update(id: string, dto: UpdateLevelDto) {
    await this.findOne(id);

    if (dto.code) {
      const existing = await this.prisma.level.findFirst({
        where: {
          code: dto.code,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(`Level with code '${dto.code}' already exists`);
      }
    }

    return this.prisma.level.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const level = await this.findOne(id);
    const relatedCount = level._count.resourceLevels;

    if (relatedCount > 0) {
      throw new ConflictException(`Cannot delete Level '${level.code}' because it is linked to ${relatedCount} resource records.`);
    }

    await this.prisma.level.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Level '${level.code}' deleted successfully`,
      id,
    };
  }
}
