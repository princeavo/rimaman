import React from 'react';
import type { BackendMedia } from '../../../api/backend-types';

interface Props {
  data: Record<string, unknown>;
  media: BackendMedia | null;
}

export const VideoBlock: React.FC<Props> = ({ media }) => {
  if (!media) return null;

  const isYoutube = media.url.includes('youtube.com') || media.url.includes('youtu.be');

  if (isYoutube) {
    const videoId = media.url.includes('youtu.be')
      ? media.url.split('/').pop()?.split('?')[0]
      : new URL(media.url).searchParams.get('v');
    return (
      <div className="aspect-video rounded-2xl overflow-hidden border border-outline-variant">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Vidéo RIMAMAN"
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant">
      <video
        src={media.url}
        controls
        className="w-full h-auto"
        preload="metadata"
      />
    </div>
  );
};
