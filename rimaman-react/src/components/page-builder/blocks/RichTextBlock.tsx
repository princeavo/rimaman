import React from 'react';
import { tiptapToSafeHtml } from '../tiptap-to-html';

interface Props {
  data: { content: Record<string, unknown> };
}

export const RichTextBlock: React.FC<Props> = ({ data }) => {
  const html = tiptapToSafeHtml(data.content);
  return (
    <div
      className="prose prose-lg max-w-none text-on-surface-variant
        prose-headings:text-on-surface prose-headings:font-headline
        prose-a:text-primary prose-strong:text-on-surface
        prose-code:bg-surface-container prose-code:rounded prose-code:px-1"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
