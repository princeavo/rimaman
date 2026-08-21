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
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BlogService } from './blog.service';
import {
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
  ReorderBlogCategoriesDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
} from './dto/blog-post.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // ── Catégories (statiques avant :slug) ───────────────────────────────────

  @Get('categories')
  findAllCategories() {
    return this.blogService.findAllCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  createCategory(@Body() dto: CreateBlogCategoryDto) {
    return this.blogService.createCategory(dto);
  }

  @Put('categories/reorder')
  @UseGuards(JwtAuthGuard)
  reorderCategories(@Body() dto: ReorderBlogCategoriesDto) {
    return this.blogService.reorderCategories(dto.items);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard)
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBlogCategoryDto,
  ) {
    return this.blogService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.blogService.deleteCategory(id);
  }

  // ── Articles ──────────────────────────────────────────────────────────────

  @Get()
  findPublished() {
    return this.blogService.findPublished();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  findAllForAdmin() {
    return this.blogService.findAllForAdmin();
  }

  @Get('slug/check')
  @UseGuards(JwtAuthGuard)
  checkSlug(
    @Query('value') value: string,
    @Query('excludeId') excludeId?: string,
  ) {
    return this.blogService.checkSlug(value, excludeId);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateBlogPostDto) {
    return this.blogService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.blogService.remove(id);
  }
}
