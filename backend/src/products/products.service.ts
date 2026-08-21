import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateProductVariantDto,
  UpdateProductVariantDto,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from './dto/product.dto';

const productInclude = {
  image: true,
  productCategory: true,
  variants: {
    include: { image: true },
    orderBy: { sortOrder: 'asc' as const },
  },
} as const;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Produits ─────────────────────────────────────────────────────────────────

  findAll() {
    return this.prisma.product.findMany({
      include: productInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.product.findUniqueOrThrow({
      where: { id },
      include: productInclude,
    });
  }

  findBySlug(slug: string) {
    return this.prisma.product.findUniqueOrThrow({
      where: { slug },
      include: productInclude,
    });
  }

  async isSlugAvailable(slug: string, excludeId?: string): Promise<{ available: boolean }> {
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    const available = !existing || existing.id === excludeId;
    return { available };
  }

  /** Résout un identifiant qui peut être un UUID ou un slug. */
  findOneOrSlug(idOrSlug: string) {
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    return isUUID ? this.findOne(idOrSlug) : this.findBySlug(idOrSlug);
  }

  create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto, include: productInclude });
  }

  update(id: string, dto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: productInclude,
    });
  }

  async remove(id: string) {
    await this.prisma.product.delete({ where: { id } });
    return { id };
  }

  // ── Variantes ─────────────────────────────────────────────────────────────────

  findVariants(productId: string) {
    return this.prisma.productVariant.findMany({
      where: { productId },
      include: { image: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  createVariant(productId: string, dto: CreateProductVariantDto) {
    return this.prisma.productVariant.create({
      data: { ...dto, productId },
      include: { image: true },
    });
  }

  updateVariant(id: string, dto: UpdateProductVariantDto) {
    return this.prisma.productVariant.update({
      where: { id },
      data: dto,
      include: { image: true },
    });
  }

  async removeVariant(id: string) {
    await this.prisma.productVariant.delete({ where: { id } });
    return { id };
  }

  // ── Catégories ────────────────────────────────────────────────────────────────

  findAllCategories() {
    return this.prisma.productCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async createCategory(dto: CreateProductCategoryDto) {
    const existing = await this.prisma.productCategory.findUnique({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException(`La catégorie "${dto.name}" existe déjà.`);
    const max = await this.prisma.productCategory.aggregate({ _max: { sortOrder: true } });
    return this.prisma.productCategory.create({
      data: {
        name: dto.name,
        icon: dto.icon ?? 'category',
        sortOrder: dto.sortOrder ?? (max._max.sortOrder ?? -1) + 1,
      },
    });
  }

  async updateCategory(id: string, dto: UpdateProductCategoryDto) {
    await this.prisma.productCategory.findUniqueOrThrow({ where: { id } });
    if (dto.name) {
      const conflict = await this.prisma.productCategory.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (conflict) throw new ConflictException(`La catégorie "${dto.name}" existe déjà.`);
    }
    return this.prisma.productCategory.update({ where: { id }, data: dto });
  }

  async deleteCategory(id: string) {
    await this.prisma.productCategory.findUniqueOrThrow({ where: { id } });
    await this.prisma.productCategory.delete({ where: { id } });
    return { id };
  }
}
