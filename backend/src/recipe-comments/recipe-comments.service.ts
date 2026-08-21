import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeCommentDto } from './dto/recipe-comment.dto';

@Injectable()
export class RecipeCommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(recipeId: string, dto: CreateRecipeCommentDto) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) throw new NotFoundException('Recette introuvable');

    if (dto.parentId) {
      const parent = await this.prisma.recipeComment.findUnique({ where: { id: dto.parentId } });
      if (!parent || parent.recipeId !== recipeId) throw new NotFoundException('Commentaire parent introuvable');
    }

    return this.prisma.recipeComment.create({
      data: { recipeId, parentId: dto.parentId ?? null, authorName: dto.authorName, authorEmail: dto.authorEmail, content: dto.content },
    });
  }

  async findByRecipe(recipeId: string) {
    return this.prisma.recipeComment.findMany({
      where: { recipeId, status: 'approved', parentId: null },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true, authorName: true, content: true, createdAt: true,
        replies: {
          where: { status: 'approved' },
          orderBy: { createdAt: 'asc' },
          select: { id: true, authorName: true, content: true, createdAt: true },
        },
      },
    });
  }

  async findAllAdmin(status?: string) {
    return this.prisma.recipeComment.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { recipe: { select: { id: true, title: true, slug: true } } },
    });
  }

  async updateStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    const comment = await this.prisma.recipeComment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException();
    return this.prisma.recipeComment.update({ where: { id }, data: { status } });
  }

  async remove(id: string) {
    const comment = await this.prisma.recipeComment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException();
    await this.prisma.recipeComment.delete({ where: { id } });
  }
}
