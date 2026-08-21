import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.location.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  findOne(id: string) {
    return this.prisma.location.findUniqueOrThrow({ where: { id } });
  }

  create(dto: CreateLocationDto) {
    return this.prisma.location.create({ data: dto });
  }

  update(id: string, dto: UpdateLocationDto) {
    return this.prisma.location.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.prisma.location.delete({ where: { id } });
    return { id };
  }
}
