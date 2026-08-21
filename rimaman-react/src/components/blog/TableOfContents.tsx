import React from 'react';
import { slugify } from '../../utils/slugify';

export { slugify };

export interface TocEntry {
  level: number;
  text: string;
  id: string;
}

function extractNodeText(node: Record<string, unknown>): string {
  if (node.type === 'text') return String(node.text ?? '');
  return ((node.content ?? []) as Record<string, unknown>[]).map(extractNodeText).join('');
}

export function extractHeadings(doc: Record<string, unknown>): TocEntry[] {
  const headings: TocEntry[] = [];
  const traverse = (node: Record<string, unknown>) => {
    if (node.type === 'heading') {
      const level = ((node.attrs as Record<string, unknown>)?.level as number) ?? 2;
      const text = extractNodeText(node);
      if (text.trim()) headings.push({ level, text, id: `h-${slugify(text)}` });
    }
    ((node.content ?? []) as Record<string, unknown>[]).forEach(traverse);
  };
  traverse(doc);
  return headings;
}

const HEADER_OFFSET = 112;

function scrollToHeading(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top, behavior: 'smooth' });
}

interface TableOfContentsProps {
  headings: TocEntry[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
  if (headings.length < 3) return null;

  return (
    <nav
      aria-label="Table des matières"
      className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 mb-10"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">
        Dans cet article
      </p>
      <ol className="space-y-1.5">
        {headings.map((h) => (
          <li
            key={h.id}
            style={{ paddingLeft: `${(h.level - 2) * 14}px` }}
          >
            <button
              type="button"
              onClick={() => scrollToHeading(h.id)}
              className="text-sm text-on-surface-variant hover:text-primary transition-colors leading-snug block text-left w-full"
            >
              {h.text}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};
