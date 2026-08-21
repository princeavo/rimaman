import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger('OrdersService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Le numéro de commande est généré côté serveur (jamais fourni par le
   * client) pour garantir son unicité et éviter toute manipulation.
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = randomUUID().slice(0, 6).toUpperCase();
    return `RM-${timestamp}-${random}`;
  }

  async create(dto: CreateOrderDto) {
    const order = await this.prisma.order.create({
      data: {
        orderNumber: this.generateOrderNumber(),
        items: dto.items as unknown as Prisma.InputJsonValue,
        subtotal: dto.subtotal,
        shippingCost: dto.shippingCost,
        discount: dto.discount ?? 0,
        total: dto.total,
        shippingAddress: dto.shippingAddress as unknown as Prisma.InputJsonValue,
        deliveryMethod: dto.deliveryMethod,
        paymentMethod: dto.paymentMethod,
        promoCode: dto.promoCode,
      },
    });

    // L'échec d'une notification ne doit jamais remettre en cause la commande,
    // déjà enregistrée en base à ce stade.
    this.notifications.notifyNewOrder(order).catch((error) => {
      this.logger.error(
        `Échec des notifications pour la commande ${order.orderNumber}`,
        error instanceof Error ? error.stack : String(error),
      );
    });

    return order;
  }

  findByOrderNumber(orderNumber: string) {
    return this.prisma.order.findUniqueOrThrow({ where: { orderNumber } });
  }

  findAllForAdmin() {
    return this.prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
  }

  updateStatus(id: string, dto: UpdateOrderStatusDto) {
    return this.prisma.order.update({ where: { id }, data: dto });
  }
}
