import React, { useRef, useState } from 'react';
import { Icon } from '../common/Icon';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchMediaLibrary, uploadMedia } from '../../api/media';
import type { Media } from '../../api/media';

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** Appelé avec le média sélectionné */
  onSelect: (media: Media) => void;
  /** Id du média actuellement sélectionné (pour le surlignage) */
  selectedId?: string;
  /** Si true, filtre uniquement les images (pas les vidéos) */
  imagesOnly?: boolean;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  open,
  onClose,
  onSelect,
  selectedId,
  imagesOnly = false,
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: mediaList, loading: mediaLoading } = useAsyncData(fetchMediaLibrary, [refreshKey]);

  const [tab, setTab] = useState<'library' | 'upload'>('library');
  const [search, setSearch] = useState('');

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadAlt, setUploadAlt] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const filtered = (mediaList ?? []).filter((m) => {
    if (imagesOnly && !m.mimeType.startsWith('image/')) return false;
    const q = search.toLowerCase();
    return m.alt.toLowerCase().includes(q) || m.mimeType.toLowerCase().includes(q);
  });

  const accept = imagesOnly
    ? 'image/jpeg,image/png,image/webp'
    : 'image/jpeg,image/png,image/webp,video/mp4';

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      let lastMedia: Media | null = null;
      for (const file of Array.from(files)) {
        lastMedia = await uploadMedia(file, uploadAlt || file.name.replace(/\.[^/.]+$/, ''));
      }
      setRefreshKey((k) => k + 1);
      setUploadAlt('');
      setTab('library');
      if (lastMedia) {
        onSelect(lastMedia);
        onClose();
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur lors de l'upload.");
    } finally {
      setUploading(false);
      setIsDragOver(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">

        {/* Header onglets */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant flex-shrink-0">
          <div className="flex gap-1 p-1 bg-surface-container-low rounded-xl">
            <button
              type="button"
              onClick={() => setTab('library')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === 'library'
                  ? 'bg-white text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name="photo_library" size="sm" />
              Médiathèque
            </button>
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === 'upload'
                  ? 'bg-white text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name="upload" size="sm" />
              Uploader
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-on-surface-variant hover:text-on-surface"
          >
            <Icon name="close" size="sm" />
          </button>
        </div>

        {/* ── Onglet Médiathèque ── */}
        {tab === 'library' && (
          <>
            <div className="px-6 py-3 border-b border-outline-variant flex-shrink-0">
              <input
                type="text"
                placeholder="Rechercher par nom ou type…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {mediaLoading ? (
                <div className="flex justify-center py-12"><LoadingSpinner /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="photo_library" size="xl" className="text-on-surface-variant mb-3" />
                  <p className="text-on-surface-variant text-sm mb-4">
                    {search ? 'Aucun résultat.' : 'Aucun fichier uploadé.'}
                  </p>
                  {!search && (
                    <button
                      type="button"
                      onClick={() => setTab('upload')}
                      className="bg-primary text-on-primary px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Uploader un fichier
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {filtered.map((media: Media) => {
                    const isSelected = selectedId === media.id;
                    const isVid = media.mimeType.startsWith('video/');
                    return (
                      <button
                        key={media.id}
                        type="button"
                        onClick={() => { onSelect(media); onClose(); }}
                        className={`group relative rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                          isSelected
                            ? 'border-primary ring-2 ring-primary/30 scale-[0.97]'
                            : 'border-outline-variant hover:border-primary/50'
                        }`}
                      >
                        <img
                          src={media.thumbnailUrl ?? media.url}
                          alt={media.alt}
                          className="w-full h-full object-cover"
                        />
                        {isVid && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                            <Icon name="play_arrow" size="sm" className="text-white" />
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                            <Icon name="check" size="sm" className="text-on-primary" />
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <p className="text-white text-xs truncate">{media.alt || 'Sans titre'}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Onglet Upload ── */}
        {tab === 'upload' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            <input
              type="text"
              placeholder="Description du fichier (optionnel)"
              value={uploadAlt}
              onChange={(e) => setUploadAlt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-outline-variant text-sm focus:outline-none focus:border-primary"
            />
            <div
              className={`flex-1 min-h-52 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${
                isDragOver ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
              {uploading ? (
                <>
                  <LoadingSpinner size="lg" />
                  <p className="text-on-surface-variant text-sm">Upload en cours…</p>
                </>
              ) : (
                <>
                  <Icon name="cloud_upload" size="xl" className="text-on-surface-variant" />
                  <div className="text-center">
                    <p className="font-medium text-on-surface">Glissez vos fichiers ici ou cliquez</p>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {imagesOnly
                        ? 'JPEG, PNG, WebP (max 8 Mo)'
                        : 'JPEG, PNG, WebP (max 8 Mo) · MP4 (max 80 Mo)'}
                    </p>
                  </div>
                </>
              )}
            </div>
            {uploadError && (
              <p className="text-error text-sm bg-error/5 px-4 py-2 rounded-xl">{uploadError}</p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant flex justify-between items-center flex-shrink-0">
          <p className="text-xs text-on-surface-variant">
            Les fichiers uploadés sont sauvegardés dans la médiathèque et réutilisables partout.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl border border-outline-variant hover:bg-surface-container transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
