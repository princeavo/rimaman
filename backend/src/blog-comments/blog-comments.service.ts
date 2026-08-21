import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogCommentDto } from './dto/blog-comment.dto';

@Injectable()
export class BlogCommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(postId: string, dto: CreateBlogCommentDto) {
    const post = await this.prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Article introuvable');

    if (dto.parentId) {
      const parent = await this.prisma.blogComment.findUnique({ where: { id: dto.parentId } });
      if (!parent || parent.postId !== postId) throw new NotFoundException('Commentaire parent introuvable');
    }

    return this.prisma.blogComment.create({
      data: { postId, parentId: dto.parentId ?? null, authorName: dto.authorName, authorEmail: dto.authorEmail, content: dto.content },
    });
  }

  async findByPost(postId: string) {
    const comments = await this.prisma.blogComment.findMany({
      where: { postId, status: 'approved', parentId: null },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true, authorName: true, content: true, createdAt: true,
        replies: {
          where: { status: 'approved' },
          orderBy: { createdAt: 'asc' },
          select: { id: true, authorName: true, content: true, createdAt: true },
        },
      },
    });
    return comments;
  }

  async findAllAdmin(status?: string) {
    return this.prisma.blogComment.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { post: { select: { id: true, title: true, slug: true } } },
    });
  }

  async updateStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    const comment = await this.prisma.blogComment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException();
    return this.prisma.blogComment.update({ where: { id }, data: { status } });
  }

  async remove(id: string) {
    const comment = await this.prisma.blogComment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException();
    await this.prisma.blogComment.delete({ where: { id } });
  }
}
