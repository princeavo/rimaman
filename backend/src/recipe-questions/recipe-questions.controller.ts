import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RecipeQuestionsService } from './recipe-questions.service';
import { AnswerRecipeQuestionDto, CreateRecipeQuestionDto } from './dto/recipe-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('recipe-questions')
export class RecipeQuestionsController {
  constructor(private readonly service: RecipeQuestionsService) {}

  @Post(':recipeId')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  create(@Param('recipeId') recipeId: string, @Body() dto: CreateRecipeQuestionDto) {
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

  @Patch(':id/answer')
  @UseGuards(JwtAuthGuard)
  answer(@Param('id') id: string, @Body() dto: AnswerRecipeQuestionDto) {
    return this.service.answer(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@Param('id') id: string, @Body('status') status: 'pending' | 'answered' | 'rejected') {
    return this.service.updateStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
