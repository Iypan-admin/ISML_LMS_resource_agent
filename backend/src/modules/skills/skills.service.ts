import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSkillDto) {
    const code = dto.code.toLowerCase();
    const slug = dto.slug.toLowerCase();

    const existingCode = await this.prisma.skill.findUnique({ where: { code } });
    if (existingCode) {
      throw new ConflictException(`Skill with code '${code}' already exists`);
    }

    const existingSlug = await this.prisma.skill.findUnique({ where: { slug } });
    if (existingSlug) {
      throw new ConflictException(`Skill with slug '${slug}' already exists`);
    }

    return this.prisma.skill.create({
      data: {
        code,
        name: dto.name,
        slug,
        description: dto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.skill.findMany({
      include: {
        _count: {
          select: {
            resourceSkills: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(idOrSlug: string) {
    const skill = await this.prisma.skill.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug.toLowerCase() }, { code: idOrSlug.toLowerCase() }],
      },
      include: {
        _count: {
          select: {
            resourceSkills: true,
          },
        },
      },
    });

    if (!skill) {
      throw new NotFoundException(`Skill '${idOrSlug}' not found`);
    }

    return skill;
  }

  async update(id: string, dto: UpdateSkillDto) {
    await this.findOne(id);

    if (dto.code) {
      const existing = await this.prisma.skill.findFirst({
        where: { code: dto.code.toLowerCase(), NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(`Skill code '${dto.code}' is already in use`);
      }
    }

    if (dto.slug) {
      const existing = await this.prisma.skill.findFirst({
        where: { slug: dto.slug.toLowerCase(), NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(`Skill slug '${dto.slug}' is already in use`);
      }
    }

    return this.prisma.skill.update({
      where: { id },
      data: {
        ...dto,
        code: dto.code ? dto.code.toLowerCase() : undefined,
        slug: dto.slug ? dto.slug.toLowerCase() : undefined,
      },
    });
  }

  async remove(id: string) {
    const skill = await this.findOne(id);
    const relatedCount = skill._count.resourceSkills;

    if (relatedCount > 0) {
      throw new ConflictException(`Cannot delete Skill '${skill.name}' because it is linked to ${relatedCount} resource records.`);
    }

    await this.prisma.skill.delete({ where: { id } });

    return {
      success: true,
      message: `Skill '${skill.name}' deleted successfully`,
      id,
    };
  }
}
