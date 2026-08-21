import { ConflictException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TiptapResolverService } from './tiptap-resolver.service';
import {
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
} from './dto/blog-post.dto';

const INCLUDE_POST = { image: true, category: true } as const;

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tiptapResolver: TiptapResolverService,
  ) {}

  // ── Catégories ──────────────────────────────────────────────────────────────

  findAllCategories() {
    return this.prisma.blogCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async createCategory(dto: CreateBlogCategoryDto) {
    const existing = await this.prisma.blogCategory.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`La catégorie "${dto.name}" existe déjà.`);
    const maxOrder = await this.prisma.blogCategory.aggregate({ _max: { sortOrder: true } });
    return this.prisma.blogCategory.create({
      data: {
        name: dto.name,
        sortOrder: dto.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });
  }

  async updateCategory(id: string, dto: UpdateBlogCategoryDto) {
    await this.prisma.blogCategory.findUniqueOrThrow({ where: { id } });
    if (dto.name) {
      const conflict = await this.prisma.blogCategory.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (conflict) throw new ConflictException(`La catégorie "${dto.name}" existe déjà.`);
    }
    return this.prisma.blogCategory.update({ where: { id }, data: dto });
  }

  async deleteCategory(id: string) {
    await this.prisma.blogCategory.findUniqueOrThrow({ where: { id } });
    await this.prisma.blogCategory.delete({ where: { id } });
    return { id };
  }

  async reorderCategories(entries: { id: string; sortOrder: number }[]) {
    await this.prisma.$transaction(
      entries.map(({ id, sortOrder }) =>
        this.prisma.blogCategory.update({ where: { id }, data: { sortOrder } }),
      ),
    );
    return { reordered: entries.length };
  }

  // ── Articles ────────────────────────────────────────────────────────────────

  async findPublished() {
    const posts = await this.prisma.blogPost.findMany({
      where: { publishedAt: { not: null } },
      include: INCLUDE_POST,
      orderBy: { publishedAt: 'desc' },
    });
    return Promise.all(
      posts.map(async (p) => ({ ...p, content: await this.tiptapResolver.resolve(p.content as Record<string, unknown>) })),
    );
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUniqueOrThrow({
      where: { slug },
      include: INCLUDE_POST,
    });
    return { ...post, content: await this.tiptapResolver.resolve(post.content as Record<string, unknown>) };
  }

  async findAllForAdmin() {
    const posts = await this.prisma.blogPost.findMany({
      include: INCLUDE_POST,
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(
      posts.map(async (p) => ({ ...p, content: await this.tiptapResolver.resolve(p.content as Record<string, unknown>) })),
    );
  }

  async create(dto: CreateBlogPostDto) {
    await this.prisma.blogCategory.findUniqueOrThrow({ where: { id: dto.categoryId } });
    const data: Prisma.BlogPostUncheckedCreateInput = {
      ...dto,
      content: dto.content as Prisma.InputJsonValue,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
    };
    return this.prisma.blogPost.create({ data, include: INCLUDE_POST });
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    if (dto.categoryId) {
      await this.prisma.blogCategory.findUniqueOrThrow({ where: { id: dto.categoryId } });
    }
    const data: Prisma.BlogPostUncheckedUpdateInput = {
      ...dto,
      content: dto.content as Prisma.InputJsonValue | undefined,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
    };
    return this.prisma.blogPost.update({ where: { id }, data, include: INCLUDE_POST });
  }

  async remove(id: string) {
    await this.prisma.blogPost.delete({ where: { id } });
    return { id };
  }

  async checkSlug(value: string, excludeId?: string): Promise<{ available: boolean }> {
    if (!value) return { available: false };
    const existing = await this.prisma.blogPost.findFirst({
      where: { slug: value, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    return { available: !existing };
  }
}
