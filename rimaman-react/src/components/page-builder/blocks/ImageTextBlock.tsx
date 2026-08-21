import React from 'react';
import type { BackendMedia } from '../../../api/backend-types';

interface Props {
  data: {
    title: string;
    text: string;
    imagePosition: 'left' | 'right';
  };
  media: BackendMedia | null;
}

export const ImageTextBlock: React.FC<Props> = ({ data, media }) => {
  const imageFirst = data.imagePosition !== 'right';

  const imageEl = media ? (
    <div className="overflow-hidden rounded-2xl border border-outline-variant">
      <img
        src={media.url}
        alt={media.alt || data.title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  ) : null;

  const textEl = (
    <div className="space-y-4">
      <h3 className="text-2xl md:text-3xl font-bold font-headline text-on-surface">
        {data.title}
      </h3>
      <p className="text-on-surface-variant leading-relaxed text-lg">{data.text}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      {imageFirst ? (
        <>
          {imageEl}
          {textEl}
        </>
      ) : (
        <>
          {textEl}
          {imageEl}
        </>
      )}
    </div>
  );
};
