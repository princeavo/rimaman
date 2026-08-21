import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecipesService } from './recipes.service';
import {
  CreateRecipeCategoryDto,
  UpdateRecipeCategoryDto,
  CreateRecipeDifficultyDto,
  UpdateRecipeDifficultyDto,
  CreateRecipeDto,
  UpdateRecipeDto,
} from './dto/recipe.dto';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  // ── Catégories ───────────────────────────────────────────────────────────────

  @Get('categories')
  findAllCategories() {
    return this.recipesService.findAllCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  createCategory(@Body() dto: CreateRecipeCategoryDto) {
    return this.recipesService.createCategory(dto);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard)
  updateCategory(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRecipeCategoryDto) {
    return this.recipesService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.recipesService.deleteCategory(id);
  }

  // ── Difficultés ──────────────────────────────────────────────────────────────

  @Get('difficulties')
  findAllDifficulties() {
    return this.recipesService.findAllDifficulties();
  }

  @Post('difficulties')
  @UseGuards(JwtAuthGuard)
  createDifficulty(@Body() dto: CreateRecipeDifficultyDto) {
    return this.recipesService.createDifficulty(dto);
  }

  @Patch('difficulties/:id')
  @UseGuards(JwtAuthGuard)
  updateDifficulty(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRecipeDifficultyDto) {
    return this.recipesService.updateDifficulty(id, dto);
  }

  @Delete('difficulties/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  deleteDifficulty(@Param('id', ParseUUIDPipe) id: string) {
    return this.recipesService.deleteDifficulty(id);
  }

  // ── Recettes ─────────────────────────────────────────────────────────────────

  @Get()
  findAll() {
    return this.recipesService.findAll();
  }

  @Get('slug/check')
  @UseGuards(JwtAuthGuard)
  checkSlug(
    @Query('value') value: string,
    @Query('excludeId') excludeId?: string,
  ) {
    return this.recipesService.checkSlug(value, excludeId);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.recipesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateRecipeDto) {
    return this.recipesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRecipeDto) {
    return this.recipesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.recipesService.remove(id);
  }
}
