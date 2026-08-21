import { Injectable } from '@nestjs/common';
import { ReviewStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Avis publics : uniquement ceux approuvés par l'admin. */
  findApproved(productId?: string) {
    return this.prisma.review.findMany({
      where: {
        status: ReviewStatus.approved,
        ...(productId ? { productId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Vue admin : tous les avis, pour la modération. */
  findAllForModeration() {
    return this.prisma.review.findMany({
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Soumission publique : toujours créée en attente de modération. */
  create(dto: CreateReviewDto) {
    return this.prisma.review.create({
      data: { ...dto, status: ReviewStatus.pending },
    });
  }

  updateStatus(id: string, dto: UpdateReviewStatusDto) {
    return this.prisma.review.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async remove(id: string) {
    await this.prisma.review.delete({ where: { id } });
    return { id };
  }
}
