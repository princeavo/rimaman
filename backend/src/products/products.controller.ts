import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateProductVariantDto,
  UpdateProductVariantDto,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from './dto/product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ── Catégories (routes statiques en premier) ──────────────────────────────────

  @Get('categories')
  findAllCategories() {
    return this.productsService.findAllCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  createCategory(@Body() dto: CreateProductCategoryDto) {
    return this.productsService.createCategory(dto);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard)
  updateCategory(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductCategoryDto) {
    return this.productsService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard)
  deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.deleteCategory(id);
  }

  // ── Produits ──────────────────────────────────────────────────────────────────

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get('slug/check')
  @UseGuards(JwtAuthGuard)
  checkSlug(
    @Query('slug') slug: string,
    @Query('excludeId') excludeId?: string,
  ) {
    return this.productsService.isSlugAvailable(slug, excludeId);
  }

  /**
   * Route publique : accepte un UUID ou un slug.
   * Sans ParseUUIDPipe intentionnellement — la résolution est faite dans le service.
   * Les routes d'écriture admin gardent ParseUUIDPipe (UUID uniquement).
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOneOrSlug(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }

  // ── Variantes ─────────────────────────────────────────────────────────────────

  @Get(':productId/variants')
  findVariants(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.productsService.findVariants(productId);
  }

  @Post(':productId/variants')
  @UseGuards(JwtAuthGuard)
  createVariant(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.productsService.createVariant(productId, dto);
  }

  @Patch(':productId/variants/:variantId')
  @UseGuards(JwtAuthGuard)
  updateVariant(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.productsService.updateVariant(variantId, dto);
  }

  @Delete(':productId/variants/:variantId')
  @UseGuards(JwtAuthGuard)
  removeVariant(@Param('variantId', ParseUUIDPipe) variantId: string) {
    return this.productsService.removeVariant(variantId);
  }
}
