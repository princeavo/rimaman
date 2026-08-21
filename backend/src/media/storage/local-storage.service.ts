import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { mkdir, unlink, writeFile } from 'fs/promises';
import type { EnvConfig } from '../../config/env.validation';
import type { StorageService, StoredFile } from './storage.interface';

@Injectable()
export class LocalStorageService implements StorageService {
  constructor(private readonly config: ConfigService<EnvConfig, true>) {}

  async save(buffer: Buffer, originalName: string, _mimeType: string): Promise<StoredFile> {
    const basePath = this.config.get('MEDIA_LOCAL_PATH', { infer: true });
    await mkdir(basePath, { recursive: true });

    const filename = `${randomUUID()}${extname(originalName)}`;
    await writeFile(join(basePath, filename), buffer);

    const publicUrl = this.config.get('MEDIA_PUBLIC_URL', { infer: true });
    return { filename, url: `${publicUrl}/${filename}` };
  }

  async delete(filename: string): Promise<void> {
    const basePath = this.config.get('MEDIA_LOCAL_PATH', { infer: true });
    try {
      await unlink(join(basePath, filename));
    } catch {
      // Fichier déjà absent : pas bloquant, on n'échoue pas la suppression en base.
    }
  }
}
