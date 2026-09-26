import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const code = dto.code.toLowerCase();
    const slug = dto.slug.toLowerCase();

    const existingCode = await this.prisma.category.findUnique({ where: { code } });
    if (existingCode) {
      throw new ConflictException(`Category with code '${code}' already exists`);
    }

    const existingSlug = await this.prisma.category.findUnique({ where: { slug } });
    if (existingSlug) {
      throw new ConflictException(`Category with slug '${slug}' already exists`);
    }

    return this.prisma.category.create({
      data: {
        code,
        name: dto.name,
        slug,
        description: dto.description,
        displayOrder: dto.displayOrder ?? 0,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: {
            resourceCategories: true,
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(idOrSlug: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug.toLowerCase() }, { code: idOrSlug.toLowerCase() }],
      },
      include: {
        _count: {
          select: {
            resourceCategories: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category '${idOrSlug}' not found`);
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);

    if (dto.code) {
      const existing = await this.prisma.category.findFirst({
        where: { code: dto.code.toLowerCase(), NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(`Category code '${dto.code}' is already in use`);
      }
    }

    if (dto.slug) {
      const existing = await this.prisma.category.findFirst({
        where: { slug: dto.slug.toLowerCase(), NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(`Category slug '${dto.slug}' is already in use`);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...dto,
        code: dto.code ? dto.code.toLowerCase() : undefined,
        slug: dto.slug ? dto.slug.toLowerCase() : undefined,
      },
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    const relatedCount = category._count.resourceCategories;

    if (relatedCount > 0) {
      throw new ConflictException(`Cannot delete Category '${category.name}' because it is linked to ${relatedCount} resource records.`);
    }

    await this.prisma.category.delete({ where: { id } });

    return {
      success: true,
      message: `Category '${category.name}' deleted successfully`,
      id,
    };
  }
}
