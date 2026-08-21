import { Controller, Get, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ReactionsService } from './reactions.service';
import { ReactionEmoji } from '@prisma/client';

@Controller('reactions')
export class ReactionsController {
  constructor(private readonly service: ReactionsService) {}

  @Post('article/:postId/:emoji')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  incrementArticle(@Param('postId') postId: string, @Param('emoji') emoji: ReactionEmoji) {
    return this.service.incrementArticle(postId, emoji);
  }

  @Get('article/:postId')
  getArticleReactions(@Param('postId') postId: string) {
    return this.service.getArticleReactions(postId);
  }

  @Post('recipe/:recipeId/:emoji')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  incrementRecipe(@Param('recipeId') recipeId: string, @Param('emoji') emoji: ReactionEmoji) {
    return this.service.incrementRecipe(recipeId, emoji);
  }

  @Get('recipe/:recipeId')
  getRecipeReactions(@Param('recipeId') recipeId: string) {
    return this.service.getRecipeReactions(recipeId);
  }
}
