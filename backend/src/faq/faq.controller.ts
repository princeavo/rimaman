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
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FaqService } from './faq.service';
import {
  CreateFaqCategoryDto,
  UpdateFaqCategoryDto,
  ReorderFaqCategoriesDto,
  CreateFaqItemDto,
  UpdateFaqItemDto,
  ReorderFaqDto,
} from './dto/faq-item.dto';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  // ── Catégories (routes statiques avant :id) ──────────────────────────────

  @Get('categories')
  findPublicCategories() {
    return this.faqService.findPublicCategories();
  }

  @Get('categories/full')
  @UseGuards(JwtAuthGuard)
  findAllCategories() {
    return this.faqService.findAllCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  createCategory(@Body() dto: CreateFaqCategoryDto) {
    return this.faqService.createCategory(dto);
  }

  @Put('categories/reorder')
  @UseGuards(JwtAuthGuard)
  reorderCategories(@Body() dto: ReorderFaqCategoriesDto) {
    return this.faqService.reorderCategories(dto.items);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard)
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFaqCategoryDto,
  ) {
    return this.faqService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.faqService.deleteCategory(id);
  }

  // ── Items ─────────────────────────────────────────────────────────────────

  @Get()
  findAll() {
    return this.faqService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.faqService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateFaqItemDto) {
    return this.faqService.create(dto);
  }

  @Put('reorder')
  @UseGuards(JwtAuthGuard)
  reorder(@Body() dto: ReorderFaqDto) {
    return this.faqService.reorder(dto.items);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFaqItemDto) {
    return this.faqService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.faqService.remove(id);
  }
}
