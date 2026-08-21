import { ConflictException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRecipeCategoryDto,
  UpdateRecipeCategoryDto,
  CreateRecipeDifficultyDto,
  UpdateRecipeDifficultyDto,
  CreateRecipeDto,
  UpdateRecipeDto,
} from './dto/recipe.dto';

const recipeInclude = {
  category: true,
  difficulty: true,
  image: true,
  video: true,
  ingredients: { orderBy: { sortOrder: 'asc' as const } },
  steps: {
    orderBy: { step: 'asc' as const },
    include: { media: { orderBy: { sortOrder: 'asc' as const }, include: { media: true } } },
  },
  relatedProducts: { include: { product: { include: { image: true } } } },
};

@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Catégories ───────────────────────────────────────────────────────────────

  findAllCategories() {
    return this.prisma.recipeCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async createCategory(dto: CreateRecipeCategoryDto) {
    const existing = await this.prisma.recipeCategory.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`La catégorie "${dto.name}" existe déjà.`);
    const max = await this.prisma.recipeCategory.aggregate({ _max: { sortOrder: true } });
    return this.prisma.recipeCategory.create({
      data: {
        name: dto.name,
        icon: dto.icon ?? 'restaurant',
        sortOrder: dto.sortOrder ?? (max._max.sortOrder ?? -1) + 1,
      },
    });
  }

  async updateCategory(id: string, dto: UpdateRecipeCategoryDto) {
    await this.prisma.recipeCategory.findUniqueOrThrow({ where: { id } });
    if (dto.name) {
      const conflict = await this.prisma.recipeCategory.findFirst({ where: { name: dto.name, NOT: { id } } });
      if (conflict) throw new ConflictException(`La catégorie "${dto.name}" existe déjà.`);
    }
    return this.prisma.recipeCategory.update({ where: { id }, data: dto });
  }

  async deleteCategory(id: string) {
    await this.prisma.recipeCategory.findUniqueOrThrow({ where: { id } });
    await this.prisma.recipeCategory.delete({ where: { id } });
    return { id };
  }

  // ── Difficultés ──────────────────────────────────────────────────────────────

  findAllDifficulties() {
    return this.prisma.recipeDifficulty.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async createDifficulty(dto: CreateRecipeDifficultyDto) {
    const existing = await this.prisma.recipeDifficulty.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Le niveau "${dto.name}" existe déjà.`);
    const max = await this.prisma.recipeDifficulty.aggregate({ _max: { sortOrder: true } });
    return this.prisma.recipeDifficulty.create({
      data: {
        name: dto.name,
        color: dto.color ?? 'green',
        sortOrder: dto.sortOrder ?? (max._max.sortOrder ?? -1) + 1,
      },
    });
  }

  async updateDifficulty(id: string, dto: UpdateRecipeDifficultyDto) {
    await this.prisma.recipeDifficulty.findUniqueOrThrow({ where: { id } });
    if (dto.name) {
      const conflict = await this.prisma.recipeDifficulty.findFirst({ where: { name: dto.name, NOT: { id } } });
      if (conflict) throw new ConflictException(`Le niveau "${dto.name}" existe déjà.`);
    }
    return this.prisma.recipeDifficulty.update({ where: { id }, data: dto });
  }

  async deleteDifficulty(id: string) {
    await this.prisma.recipeDifficulty.findUniqueOrThrow({ where: { id } });
    await this.prisma.recipeDifficulty.delete({ where: { id } });
    return { id };
  }

  // ── Recettes ─────────────────────────────────────────────────────────────────

  findAll() {
    return this.prisma.recipe.findMany({
      include: recipeInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.recipe.findUniqueOrThrow({
      where: { slug },
      include: recipeInclude,
    });
  }

  create(dto: CreateRecipeDto) {
    const { ingredients, steps, relatedProductIds, ...recipeData } = dto;
    const data: Prisma.RecipeUncheckedCreateInput = {
      ...recipeData,
      ingredients: {
        create: ingredients.map((ingredient, index) => ({
          ...ingredient,
          sortOrder: ingredient.sortOrder ?? index,
        })),
      },
      steps: {
        create: steps.map((s) => ({
          step: s.step,
          instruction: s.instruction,
          media: s.media?.length
            ? { create: s.media.map((m, i) => ({ mediaId: m.mediaId, sortOrder: m.sortOrder ?? i })) }
            : undefined,
        })),
      },
      relatedProducts: relatedProductIds
        ? { create: relatedProductIds.map((productId) => ({ productId })) }
        : undefined,
    };
    return this.prisma.recipe.create({ data, include: recipeInclude });
  }

  async update(id: string, dto: UpdateRecipeDto) {
    const { ingredients, steps, relatedProductIds, ...recipeData } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (ingredients) await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
      if (steps) await tx.recipeStep.deleteMany({ where: { recipeId: id } });
      if (relatedProductIds) await tx.recipeProduct.deleteMany({ where: { recipeId: id } });

      return tx.recipe.update({
        where: { id },
        data: {
          ...recipeData,
          ingredients: ingredients
            ? { create: ingredients.map((ing, i) => ({ ...ing, sortOrder: ing.sortOrder ?? i })) }
            : undefined,
          steps: steps
            ? {
                create: steps.map((s) => ({
                  step: s.step,
                  instruction: s.instruction,
                  media: s.media?.length
                    ? { create: s.media.map((m, i) => ({ mediaId: m.mediaId, sortOrder: m.sortOrder ?? i })) }
                    : undefined,
                })),
              }
            : undefined,
          relatedProducts: relatedProductIds
            ? { create: relatedProductIds.map((productId) => ({ productId })) }
            : undefined,
        },
        include: recipeInclude,
      });
    });
  }

  async remove(id: string) {
    await this.prisma.recipe.delete({ where: { id } });
    return { id };
  }

  async checkSlug(value: string, excludeId?: string): Promise<{ available: boolean }> {
    if (!value) return { available: false };
    const existing = await this.prisma.recipe.findFirst({
      where: { slug: value, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    return { available: !existing };
  }
}
