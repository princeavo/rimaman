import React from 'react';
import { Helmet } from 'react-helmet-async';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { BlockRenderer } from './BlockRenderer';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchPublishedPage } from '../../api/pages';
import type { PageRow, PageColumn } from '../../api/pages';

interface Props {
  /** URL slug of the page to render, e.g. "home", "a-propos" */
  slug: string;
  /** Additional content for <head> (title, meta) */
  helmet?: React.ReactNode;
  /** Content shown while the page tree loads (defaults to centred spinner) */
  fallback?: React.ReactNode;
}

// Background token → CSS class
const bgClass: Record<string, string> = {
  default: 'bg-surface',
  'surface-container-low': 'bg-surface-container-low',
  surface: 'bg-surface',
  primary: 'bg-primary text-on-primary',
  white: 'bg-white',
};

function rowBg(settings: Record<string, unknown>): string {
  return bgClass[String(settings.background ?? 'default')] ?? 'bg-surface';
}

/**
 * Converts a Tailwind spacing value (4, 8, 20, 28…) to pixels.
 * 1 Tailwind unit = 4px at the default 16px rem.
 */
function twToPx(val: unknown, fallback = 20): number {
  return Number(val ?? fallback) * 4;
}

function columnAlign(settings: Record<string, unknown>): string {
  const map: Record<string, string> = {
    center: 'items-center text-center',
    right: 'items-end text-right',
    left: 'items-start text-left',
  };
  return map[String(settings.align ?? 'left')] ?? 'items-start';
}

const ColumnRenderer: React.FC<{ column: PageColumn }> = ({ column }) => (
  <div className={`flex flex-col gap-6 min-w-0 ${columnAlign(column.settings)}`}>
    {column.blocks.map((block) => (
      <BlockRenderer key={block.id} block={block} />
    ))}
  </div>
);

const ALIGN_ITEMS: Record<string, string> = {
  center: 'center',
  end: 'end',
  start: 'start',
};

const RowRenderer: React.FC<{ row: PageRow }> = ({ row }) => {
  const s = row.settings;
  const fullWidth = Boolean(s.fullWidth);
  const paddingTop = twToPx(s.paddingTop ?? s.paddingY);
  const paddingBottom = twToPx(s.paddingBottom ?? s.paddingY);
  const alignItems = ALIGN_ITEMS[String(s.alignItems ?? '')] ?? 'stretch';

  return (
    <section
      className={rowBg(s)}
      style={{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}
    >
      <div className={fullWidth ? 'w-full px-0' : 'max-w-7xl mx-auto px-8'}>
        <div
          className="pb-col-row grid gap-8"
          style={{
            gridTemplateColumns: row.columns.map((col) => `${col.width}fr`).join(' '),
            alignItems,
          }}
        >
          {row.columns.map((col) => (
            <ColumnRenderer key={col.id} column={col} />
          ))}
        </div>
      </div>
    </section>
  );
};

export const PageRenderer: React.FC<Props> = ({ slug, helmet, fallback }) => {
  const { data: page, loading, error } = useAsyncData(
    () => fetchPublishedPage(slug),
    [slug],
  );

  if (loading) {
    return (
      <>
        {helmet}
        {fallback ?? (
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </>
    );
  }

  if (error || !page) {
    return (
      <>
        {helmet}
        <main className="pt-28 pb-24 max-w-7xl mx-auto px-8 text-center">
          <p className="text-on-surface-variant text-lg">
            Cette page est en cours de préparation. Revenez bientôt.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      {helmet ?? (
        <Helmet>
          <title>{page.title} | RIMAMAN – Moulin d'Or</title>
          {page.metaDescription && (
            <meta name="description" content={page.metaDescription} />
          )}
        </Helmet>
      )}
      {page.rows.map((row) => (
        <RowRenderer key={row.id} row={row} />
      ))}
    </>
  );
};
