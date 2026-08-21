import { Injectable, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateGalleryCategoryDto,
  UpdateGalleryCategoryDto,
  CreateGalleryItemDto,
  UpdateGalleryItemDto,
} from './dto/gallery-item.dto';

const INCLUDE_ITEM = {
  media: true,
  category: true,
} as const;

const ITEMS_ORDER: Prisma.GalleryItemOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { createdAt: 'asc' },
];

const INCLUDE_CATEGORY_WITH_ITEMS: Prisma.GalleryCategoryInclude = {
  items: { include: { media: true }, orderBy: ITEMS_ORDER },
};

@Injectable()
export class GalleryService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Catégories ──────────────────────────────────────────────────────────────

  findAllCategories() {
    return this.prisma.galleryCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: INCLUDE_CATEGORY_WITH_ITEMS,
    });
  }

  findPublicCategories() {
    return this.prisma.galleryCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true },
    });
  }

  async createCategory(dto: CreateGalleryCategoryDto) {
    const existing = await this.prisma.galleryCategory.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`La catégorie "${dto.name}" existe déjà.`);

    const maxOrder = await this.prisma.galleryCategory.aggregate({ _max: { sortOrder: true } });
    return this.prisma.galleryCategory.create({
      data: {
        name: dto.name,
        sortOrder: dto.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
      },
      include: INCLUDE_CATEGORY_WITH_ITEMS,
    });
  }

  async updateCategory(id: string, dto: UpdateGalleryCategoryDto) {
    await this.prisma.galleryCategory.findUniqueOrThrow({ where: { id } });
    if (dto.name) {
      const conflict = await this.prisma.galleryCategory.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (conflict) throw new ConflictException(`La catégorie "${dto.name}" existe déjà.`);
    }
    return this.prisma.galleryCategory.update({
      where: { id },
      data: dto,
      include: INCLUDE_CATEGORY_WITH_ITEMS,
    });
  }

  async deleteCategory(id: string) {
    await this.prisma.galleryCategory.findUniqueOrThrow({ where: { id } });
    await this.prisma.galleryCategory.delete({ where: { id } });
    return { id };
  }

  async reorderCategories(entries: { id: string; sortOrder: number }[]) {
    await this.prisma.$transaction(
      entries.map(({ id, sortOrder }) =>
        this.prisma.galleryCategory.update({ where: { id }, data: { sortOrder } }),
      ),
    );
    return { reordered: entries.length };
  }

  // ── Items ───────────────────────────────────────────────────────────────────

  findAll() {
    return this.prisma.galleryItem.findMany({
      include: INCLUDE_ITEM,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  findOne(id: string) {
    return this.prisma.galleryItem.findUniqueOrThrow({ where: { id }, include: INCLUDE_ITEM });
  }

  async create(dto: CreateGalleryItemDto) {
    await this.prisma.galleryCategory.findUniqueOrThrow({ where: { id: dto.categoryId } });
    const maxOrder = await this.prisma.galleryItem.aggregate({
      where: { categoryId: dto.categoryId },
      _max: { sortOrder: true },
    });
    return this.prisma.galleryItem.create({
      data: {
        mediaId: dto.mediaId,
        categoryId: dto.categoryId,
        sortOrder: dto.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
      },
      include: INCLUDE_ITEM,
    });
  }

  async update(id: string, dto: UpdateGalleryItemDto) {
    await this.prisma.galleryItem.findUniqueOrThrow({ where: { id } });
    if (dto.categoryId) {
      await this.prisma.galleryCategory.findUniqueOrThrow({ where: { id: dto.categoryId } });
    }
    return this.prisma.galleryItem.update({ where: { id }, data: dto, include: INCLUDE_ITEM });
  }

  async remove(id: string) {
    await this.prisma.galleryItem.delete({ where: { id } });
    return { id };
  }

  async reorder(entries: { id: string; sortOrder: number }[]) {
    await this.prisma.$transaction(
      entries.map(({ id, sortOrder }) =>
        this.prisma.galleryItem.update({ where: { id }, data: { sortOrder } }),
      ),
    );
    return { reordered: entries.length };
  }
}
