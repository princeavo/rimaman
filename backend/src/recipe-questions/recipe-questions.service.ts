import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnswerRecipeQuestionDto, CreateRecipeQuestionDto } from './dto/recipe-question.dto';

@Injectable()
export class RecipeQuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(recipeId: string, dto: CreateRecipeQuestionDto) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) throw new NotFoundException('Recette introuvable');
    return this.prisma.recipeQuestion.create({
      data: { recipeId, authorName: dto.authorName, authorEmail: dto.authorEmail, question: dto.question },
    });
  }

  async findByRecipe(recipeId: string) {
    return this.prisma.recipeQuestion.findMany({
      where: { recipeId, status: 'answered' },
      orderBy: { answeredAt: 'desc' },
      select: { id: true, question: true, answer: true, authorName: true, createdAt: true, answeredAt: true },
    });
  }

  async findAllAdmin(status?: string) {
    return this.prisma.recipeQuestion.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { recipe: { select: { id: true, title: true, slug: true } } },
    });
  }

  async answer(id: string, dto: AnswerRecipeQuestionDto) {
    const q = await this.prisma.recipeQuestion.findUnique({ where: { id } });
    if (!q) throw new NotFoundException();
    return this.prisma.recipeQuestion.update({
      where: { id },
      data: { answer: dto.answer, status: dto.status ?? 'answered', answeredAt: new Date() },
    });
  }

  async updateStatus(id: string, status: 'pending' | 'answered' | 'rejected') {
    const q = await this.prisma.recipeQuestion.findUnique({ where: { id } });
    if (!q) throw new NotFoundException();
    return this.prisma.recipeQuestion.update({ where: { id }, data: { status } });
  }

  async remove(id: string) {
    const q = await this.prisma.recipeQuestion.findUnique({ where: { id } });
    if (!q) throw new NotFoundException();
    await this.prisma.recipeQuestion.delete({ where: { id } });
  }
}
