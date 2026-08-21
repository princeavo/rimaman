import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RecipeCommentsService } from './recipe-comments.service';
import { CreateRecipeCommentDto } from './dto/recipe-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('recipe-comments')
export class RecipeCommentsController {
  constructor(private readonly service: RecipeCommentsService) {}

  @Post(':recipeId')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  create(@Param('recipeId') recipeId: string, @Body() dto: CreateRecipeCommentDto) {
    return this.service.create(recipeId, dto);
  }

  @Get()
  findByRecipe(@Query('recipeId') recipeId: string) {
    return this.service.findByRecipe(recipeId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAllAdmin(@Query('status') status?: string) {
    return this.service.findAllAdmin(status);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@Param('id') id: string, @Body('status') status: 'pending' | 'approved' | 'rejected') {
    return this.service.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
