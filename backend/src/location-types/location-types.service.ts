import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationTypeDto, UpdateLocationTypeDto } from './dto/location-type.dto';

@Injectable()
export class LocationTypesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.locationType.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  create(dto: CreateLocationTypeDto) {
    return this.prisma.locationType.create({ data: dto });
  }

  update(id: string, dto: UpdateLocationTypeDto) {
    return this.prisma.locationType.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.prisma.locationType.delete({ where: { id } });
    return { id };
  }
}
