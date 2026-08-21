import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const SETTINGS_ID = 1;

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  get() {
    return this.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        whatsappNumber: '',
        contactEmail: '',
        contactPhone: '',
        companyAddress: '',
        socialLinks: [],
      },
      update: {},
    });
  }

  async update(dto: UpdateSettingsDto) {
    let mapLat: number | null = null;
    let mapLng: number | null = null;

    if (dto.mapGoogleUrl) {
      const coords = await this.extractCoordinates(dto.mapGoogleUrl);
      if (coords) {
        mapLat = coords.lat;
        mapLng = coords.lng;
      }
    }

    const data = {
      whatsappNumber: dto.whatsappNumber,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
      companyAddress: dto.companyAddress,
      mapGoogleUrl: dto.mapGoogleUrl ?? null,
      mapLat,
      mapLng,
      socialLinks: (dto.socialLinks ?? []) as unknown as Prisma.InputJsonValue,
    };

    return this.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...data },
      update: data,
    });
  }

  private async extractCoordinates(url: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const response = await fetch(url, { redirect: 'follow' });
      const finalUrl = response.url;

      // Format /@lat,lng (URL de lieu ou de vue)
      const atMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) {
        return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
      }

      // Format /search/lat,+lng (lien court maps.app.goo.gl)
      const searchMatch = finalUrl.match(/\/search\/(-?\d+\.\d+),\s*\+?(-?\d+\.\d+)/);
      if (searchMatch) {
        return { lat: parseFloat(searchMatch[1]), lng: parseFloat(searchMatch[2]) };
      }

      this.logger.warn(`Coordonnées introuvables dans : ${finalUrl}`);
      return null;
    } catch (err) {
      this.logger.warn(`Échec de résolution du lien Maps : ${err}`);
      return null;
    }
  }
}
