import React from 'react';
import type { BackendMedia } from '../../../api/backend-types';

interface Props {
  data: { alt?: string };
  media: BackendMedia | null;
}

export const ImageBlock: React.FC<Props> = ({ data, media }) => {
  if (!media) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant">
      <img
        src={media.url}
        alt={data.alt ?? media.alt ?? ''}
        className="w-full h-auto object-cover"
        loading="lazy"
      />
    </div>
  );
};
