export interface StoredFile {
  /** Nom de fichier unique généré (utilisé comme clé de stockage). */
  filename: string;
  /** URL publique permettant d'accéder au fichier. */
  url: string;
}

/**
 * Abstraction du stockage de fichiers. Implémentation locale aujourd'hui
 * (disque du serveur), remplaçable par un stockage objet S3-compatible plus
 * tard sans changer MediaService ni les contrôleurs qui en dépendent.
 */
export interface StorageService {
  save(buffer: Buffer, originalName: string, mimeType: string): Promise<StoredFile>;
  delete(filename: string): Promise<void>;
}

export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');
