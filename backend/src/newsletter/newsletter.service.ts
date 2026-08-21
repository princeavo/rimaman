import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribeNewsletterDto } from './dto/newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(dto: SubscribeNewsletterDto) {
    const existing = await this.prisma.newsletter.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Cette adresse email est déjà inscrite.');
    }
    await this.prisma.newsletter.create({
      data: { email: dto.email, name: dto.name },
    });
    return { message: 'Inscription réussie.' };
  }

  findAll() {
    return this.prisma.newsletter.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async remove(id: string) {
    await this.prisma.newsletter.delete({ where: { id } });
    return { id };
  }
}
