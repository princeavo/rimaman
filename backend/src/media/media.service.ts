import { ConflictException, Inject, Injectable, UnsupportedMediaTypeException, PayloadTooLargeException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_SERVICE, type StorageService } from './storage/storage.interface';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
]);

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 Mo
const MAX_VIDEO_BYTES = 80 * 1024 * 1024; // 80 Mo

export interface UploadedFileInput {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  async upload(file: UploadedFileInput, alt: string) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new UnsupportedMediaTypeException(
        'Format de fichier non autorisé. Formats acceptés : JPEG, PNG, WEBP, MP4.',
      );
    }

    const isVideo = file.mimetype.startsWith('video/');
    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      throw new PayloadTooLargeException(
        `Fichier trop volumineux (max ${Math.round(maxBytes / (1024 * 1024))} Mo).`,
      );
    }

    const stored = await this.storage.save(file.buffer, file.originalname, file.mimetype);

    return this.prisma.media.create({
      data: {
        filename: stored.filename,
        url: stored.url,
        alt,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      },
    });
  }

  findAll() {
    return this.prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findByIds(ids: string[]): Promise<Map<string, string>> {
    if (!ids.length) return new Map();
    const records = await this.prisma.media.findMany({
      where: { id: { in: ids } },
      select: { id: true, url: true },
    });
    return new Map(records.map((r) => [r.id, r.url]));
  }

  async remove(id: string) {
    const media = await this.prisma.media.findUniqueOrThrow({ where: { id } });

    try {
      await this.prisma.media.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new ConflictException(
          'Ce média est utilisé ailleurs sur le site et ne peut pas être supprimé.',
        );
      }
      throw error;
    }

    await this.storage.delete(media.filename);
    return { id };
  }
}
