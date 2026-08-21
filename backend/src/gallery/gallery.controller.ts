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
import { GalleryService } from './gallery.service';
import {
  CreateGalleryCategoryDto,
  UpdateGalleryCategoryDto,
  ReorderCategoriesDto,
  CreateGalleryItemDto,
  UpdateGalleryItemDto,
  ReorderGalleryDto,
} from './dto/gallery-item.dto';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  // ── Catégories publiques ───────────────────────────────────────────────────

  @Get('categories')
  findPublicCategories() {
    return this.galleryService.findPublicCategories();
  }

  // ── Catégories admin ───────────────────────────────────────────────────────

  @Get('categories/full')
  @UseGuards(JwtAuthGuard)
  findAllCategories() {
    return this.galleryService.findAllCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  createCategory(@Body() dto: CreateGalleryCategoryDto) {
    return this.galleryService.createCategory(dto);
  }

  @Put('categories/reorder')
  @UseGuards(JwtAuthGuard)
  reorderCategories(@Body() dto: ReorderCategoriesDto) {
    return this.galleryService.reorderCategories(dto.items);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard)
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGalleryCategoryDto,
  ) {
    return this.galleryService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.galleryService.deleteCategory(id);
  }

  // ── Items publics ──────────────────────────────────────────────────────────

  @Get()
  findAll() {
    return this.galleryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.galleryService.findOne(id);
  }

  // ── Items admin ────────────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateGalleryItemDto) {
    return this.galleryService.create(dto);
  }

  @Put('reorder')
  @UseGuards(JwtAuthGuard)
  reorder(@Body() dto: ReorderGalleryDto) {
    return this.galleryService.reorder(dto.items);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateGalleryItemDto) {
    return this.galleryService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.galleryService.remove(id);
  }
}
