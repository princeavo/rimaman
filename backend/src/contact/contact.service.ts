import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateContactMessageDto, UpdateContactMessageStatusDto } from './dto/contact-message.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger('ContactService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreateContactMessageDto) {
    const contactMessage = await this.prisma.contactMessage.create({ data: dto });

    this.notifications.notifyNewContactMessage(contactMessage).catch((error) => {
      this.logger.error(
        'Échec des notifications pour un message de contact',
        error instanceof Error ? error.stack : String(error),
      );
    });

    return contactMessage;
  }

  findAllForAdmin() {
    return this.prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  }

  updateStatus(id: string, dto: UpdateContactMessageStatusDto) {
    return this.prisma.contactMessage.update({ where: { id }, data: dto });
  }
}
