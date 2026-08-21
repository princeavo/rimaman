import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFaqCategoryDto,
  UpdateFaqCategoryDto,
  CreateFaqItemDto,
  UpdateFaqItemDto,
} from './dto/faq-item.dto';

const ITEMS_ORDER: Prisma.FaqItemOrderByWithRelationInput[] = [
  { sortOrder: 'asc' },
  { question: 'asc' },
];

const INCLUDE_CATEGORY_WITH_ITEMS: Prisma.FaqCategoryInclude = {
  items: { orderBy: ITEMS_ORDER },
};

const INCLUDE_ITEM = { category: true } as const;

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Catégories ──────────────────────────────────────────────────────────────

  findAllCategories() {
    return this.prisma.faqCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: INCLUDE_CATEGORY_WITH_ITEMS,
    });
  }

  findPublicCategories() {
    return this.prisma.faqCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, icon: true, sortOrder: true },
    });
  }

  async createCategory(dto: CreateFaqCategoryDto) {
    const existing = await this.prisma.faqCategory.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`La catégorie "${dto.name}" existe déjà.`);

    const maxOrder = await this.prisma.faqCategory.aggregate({ _max: { sortOrder: true } });
    return this.prisma.faqCategory.create({
      data: {
        name: dto.name,
        icon: dto.icon ?? 'help',
        sortOrder: dto.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
      },
      include: INCLUDE_CATEGORY_WITH_ITEMS,
    });
  }

  async updateCategory(id: string, dto: UpdateFaqCategoryDto) {
    await this.prisma.faqCategory.findUniqueOrThrow({ where: { id } });
    if (dto.name) {
      const conflict = await this.prisma.faqCategory.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (conflict) throw new ConflictException(`La catégorie "${dto.name}" existe déjà.`);
    }
    return this.prisma.faqCategory.update({
      where: { id },
      data: dto,
      include: INCLUDE_CATEGORY_WITH_ITEMS,
    });
  }

  async deleteCategory(id: string) {
    await this.prisma.faqCategory.findUniqueOrThrow({ where: { id } });
    await this.prisma.faqCategory.delete({ where: { id } });
    return { id };
  }

  async reorderCategories(entries: { id: string; sortOrder: number }[]) {
    await this.prisma.$transaction(
      entries.map(({ id, sortOrder }) =>
        this.prisma.faqCategory.update({ where: { id }, data: { sortOrder } }),
      ),
    );
    return { reordered: entries.length };
  }

  // ── Items ───────────────────────────────────────────────────────────────────

  findAll() {
    return this.prisma.faqItem.findMany({
      include: INCLUDE_ITEM,
      orderBy: ITEMS_ORDER,
    });
  }

  findOne(id: string) {
    return this.prisma.faqItem.findUniqueOrThrow({ where: { id }, include: INCLUDE_ITEM });
  }

  async create(dto: CreateFaqItemDto) {
    await this.prisma.faqCategory.findUniqueOrThrow({ where: { id: dto.categoryId } });
    const maxOrder = await this.prisma.faqItem.aggregate({
      where: { categoryId: dto.categoryId },
      _max: { sortOrder: true },
    });
    return this.prisma.faqItem.create({
      data: {
        categoryId: dto.categoryId,
        question: dto.question,
        answer: dto.answer,
        sortOrder: dto.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
      },
      include: INCLUDE_ITEM,
    });
  }

  async update(id: string, dto: UpdateFaqItemDto) {
    await this.prisma.faqItem.findUniqueOrThrow({ where: { id } });
    if (dto.categoryId) {
      await this.prisma.faqCategory.findUniqueOrThrow({ where: { id: dto.categoryId } });
    }
    return this.prisma.faqItem.update({ where: { id }, data: dto, include: INCLUDE_ITEM });
  }

  async remove(id: string) {
    await this.prisma.faqItem.delete({ where: { id } });
    return { id };
  }

  async reorder(entries: { id: string; sortOrder: number }[]) {
    await this.prisma.$transaction(
      entries.map(({ id, sortOrder }) =>
        this.prisma.faqItem.update({ where: { id }, data: { sortOrder } }),
      ),
    );
    return { reordered: entries.length };
  }
}
