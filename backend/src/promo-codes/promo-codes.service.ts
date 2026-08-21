import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromoCodeDto, UpdatePromoCodeDto } from './dto/promo-code.dto';

@Injectable()
export class PromoCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(code: string, orderAmount: number) {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo || !promo.isActive) {
      throw new NotFoundException('Code promo invalide ou expiré.');
    }
    if (promo.validUntil && promo.validUntil < new Date()) {
      throw new BadRequestException('Ce code promo a expiré.');
    }
    if (promo.maxUses !== null && promo.useCount >= promo.maxUses) {
      throw new BadRequestException('Ce code promo a atteint son nombre maximum d\'utilisations.');
    }
    if (orderAmount < promo.minOrderAmount) {
      throw new BadRequestException(
        `Ce code est valable à partir de ${promo.minOrderAmount} FCFA d'achat.`,
      );
    }

    const discountAmount =
      promo.discountType === 'PERCENT'
        ? Math.floor(orderAmount * (promo.discountValue / 100))
        : Math.min(promo.discountValue, orderAmount);

    return {
      code: promo.code,
      discountType: promo.discountType as 'PERCENT' | 'FIXED',
      discountValue: promo.discountValue,
      discountAmount,
    };
  }

  create(dto: CreatePromoCodeDto) {
    return this.prisma.promoCode.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(),
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      },
    });
  }

  findAll() {
    return this.prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async update(id: string, dto: UpdatePromoCodeDto) {
    return this.prisma.promoCode.update({
      where: { id },
      data: {
        ...dto,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.promoCode.delete({ where: { id } });
    return { id };
  }
}
