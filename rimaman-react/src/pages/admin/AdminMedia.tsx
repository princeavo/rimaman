import { toast } from '../../store/toastStore';
import { showConfirm } from '../../store/confirmStore';
import React, { useCallback, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Icon } from '../../components/common/Icon';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchMediaLibrary, uploadMedia, deleteMedia } from '../../api/media';
import type { Media } from '../../api/media';


export const AdminMedia: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: mediaList, loading, error } = useAsyncData(fetchMediaLibrary, [refreshKey]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [altInput, setAltInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copyUrl = async (media: Media) => {
    await navigator.clipboard.writeText(media.url);
    setCopiedId(media.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploading(true);
      setUploadError(null);
      try {
        for (const file of Array.from(files)) {
          await uploadMedia(file, altInput || file.name.replace(/\.[^/.]+$/, ''));
        }
        setRefreshKey((k) => k + 1);
        setAltInput('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Erreur lors de l\'upload.');
      } finally {
        setUploading(false);
      }
    },
    [altInput],
  );

  const handleDelete = async (id: string) => {
    if (!await showConfirm('Ce fichier sera supprimé définitivement et ne pourra pas être récupéré.', 'Supprimer le fichier ?')) return;
    setDeletingId(id);
    try {
      await deleteMedia(id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossible de supprimer ce fichier.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Médiathèque | Admin RIMAMAN</title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-headline text-on-surface">Médiathèque</h1>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <Icon name="upload" size="sm" />
            Ajouter des fichiers
          </button>
        </div>

        {/* Upload zone */}
        <div
          className="bg-white border-2 border-dashed border-outline-variant rounded-2xl p-8 mb-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          {uploading ? (
            <div className="flex items-center justify-center gap-3">
              <LoadingSpinner size="sm" />
              <span className="text-on-surface-variant">Upload en cours…</span>
            </div>
          ) : (
            <>
              <Icon name="cloud_upload" className="text-on-surface-variant mb-2" size="lg" />
              <p className="text-on-surface font-medium mb-1">
                Glissez-déposez ou cliquez pour sélectionner
              </p>
              <p className="text-on-surface-variant text-sm">
                JPEG, PNG, WebP (max 8 Mo) &middot; MP4 (max 80 Mo)
              </p>
            </>
          )}
        </div>

        <div className="mb-4 flex items-center gap-3">
          <input
            type="text"
            value={altInput}
            onChange={(e) => setAltInput(e.target.value)}
            placeholder="Texte alternatif pour le prochain upload (optionnel)"
            className="flex-1 px-4 py-2 rounded-xl border border-outline-variant text-sm text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        {uploadError && (
          <p className="text-error text-sm mb-4 bg-error/5 px-4 py-2 rounded-xl">{uploadError}</p>
        )}

        {/* Media grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <p className="text-center text-error py-12">Impossible de charger la médiathèque.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {(mediaList ?? []).map((media) => (
              <div
                key={media.id}
                className="bg-white rounded-xl border border-outline-variant overflow-hidden group"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-surface-container relative">
                  {media.mimeType.startsWith('video') ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="videocam" className="text-on-surface-variant" size="lg" />
                    </div>
                  ) : (
                    <img
                      src={media.thumbnailUrl ?? media.url}
                      alt={media.alt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Info + actions */}
                <div className="p-2">
                  <p className="text-xs text-on-surface truncate mb-2" title={media.alt || media.url}>
                    {media.alt || media.url.split('/').pop()}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyUrl(media)}
                      title="Copier l'URL"
                      className="flex-1 flex items-center justify-center gap-1 text-xs py-1 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
                    >
                      <Icon name={copiedId === media.id ? 'check' : 'content_copy'} size="sm" className={copiedId === media.id ? 'text-primary' : ''} />
                      {copiedId === media.id ? 'Copié' : 'URL'}
                    </button>
                    <button
                      onClick={() => handleDelete(media.id)}
                      disabled={deletingId === media.id}
                      title="Supprimer"
                      className="p-1 rounded-lg text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                    >
                      <Icon name="delete" size="sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {mediaList?.length === 0 && (
              <div className="col-span-full text-center py-16 text-on-surface-variant">
                <Icon name="photo_library" size="xl" className="mb-3 mx-auto opacity-40" />
                <p>Aucun fichier pour l'instant. Uploadez votre premier fichier ci-dessus.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
