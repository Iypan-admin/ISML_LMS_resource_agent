import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { SourceType } from '@prisma/client';

@Injectable()
export class SourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSourceDto) {
    return this.prisma.source.create({
      data: {
        name: dto.name,
        domain: dto.domain ? dto.domain.toLowerCase() : undefined,
        baseUrl: dto.baseUrl,
        sourceType: dto.sourceType ?? SourceType.WEB_PORTAL,
        description: dto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.source.findMany({
      include: {
        _count: {
          select: {
            resources: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const source = await this.prisma.source.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            resources: true,
          },
        },
      },
    });

    if (!source) {
      throw new NotFoundException(`Source with ID '${id}' not found`);
    }

    return source;
  }

  async update(id: string, dto: UpdateSourceDto) {
    await this.findOne(id);

    return this.prisma.source.update({
      where: { id },
      data: {
        ...dto,
        domain: dto.domain ? dto.domain.toLowerCase() : undefined,
      },
    });
  }

  async remove(id: string) {
    const source = await this.findOne(id);
    const relatedCount = source._count.resources;

    if (relatedCount > 0) {
      throw new ConflictException(`Cannot delete Source '${source.name}' because it is referenced by ${relatedCount} resources.`);
    }

    await this.prisma.source.delete({ where: { id } });

    return {
      success: true,
      message: `Source '${source.name}' deleted successfully`,
      id,
    };
  }
}
