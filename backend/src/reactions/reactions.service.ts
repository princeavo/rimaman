import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReactionEmoji } from '@prisma/client';

@Injectable()
export class ReactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async incrementArticle(postId: string, emoji: ReactionEmoji) {
    return this.prisma.articleReaction.upsert({
      where: { postId_emoji: { postId, emoji } },
      create: { postId, emoji, count: 1 },
      update: { count: { increment: 1 } },
    });
  }

  async getArticleReactions(postId: string) {
    return this.prisma.articleReaction.findMany({ where: { postId } });
  }

  async incrementRecipe(recipeId: string, emoji: ReactionEmoji) {
    return this.prisma.recipeReaction.upsert({
      where: { recipeId_emoji: { recipeId, emoji } },
      create: { recipeId, emoji, count: 1 },
      update: { count: { increment: 1 } },
    });
  }

  async getRecipeReactions(recipeId: string) {
    return this.prisma.recipeReaction.findMany({ where: { recipeId } });
  }
}
