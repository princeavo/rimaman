import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Icon } from '../common/Icon';
import { MediaPickerModal } from './MediaPickerModal';
import { tiptapToSafeHtml } from '../page-builder/tiptap-to-html';
import type { Media } from '../../api/media';

// ── Extension vidéo (uploadée via médiathèque) ───────────────────────────────
const VideoNode = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  addAttributes() {
    return { src: { default: null } };
  },
  parseHTML() {
    return [{ tag: 'video[src]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes({ controls: true, preload: 'metadata', style: 'max-width:100%' }, HTMLAttributes)];
  },
});

const FONT_OPTIONS = [
  { label: 'Par défaut', value: '' },
  { label: 'Sora', value: 'Sora, sans-serif' },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },
  { label: 'Outfit', value: 'Outfit, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Monospace', value: 'monospace' },
];

export const MEDIA_REF_PREFIX = 'media:';

interface Props {
  content: Record<string, unknown>;
  onChange: (doc: Record<string, unknown>) => void;
  /** Map of mediaId → url for resolving refs when loading existing content */
  mediaUrlMap?: Map<string, string>;
  placeholder?: string;
}

// ── Toolbar button ────────────────────────────────────────────────────────────

const Btn: React.FC<{
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, disabled, title, onClick, children }) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`p-1.5 rounded-lg text-sm transition-colors ${
      active
        ? 'bg-primary/15 text-primary'
        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
    } disabled:opacity-30`}
  >
    {children}
  </button>
);

const Sep = () => <div className="w-px h-5 bg-outline-variant mx-0.5 self-center" />;

// ── Main component ────────────────────────────────────────────────────────────

export const RichTextEditor: React.FC<Props> = ({
  content,
  onChange,
  mediaUrlMap,
  placeholder = 'Commencez à rédiger…',
}) => {
  const [previewMode, setPreviewMode] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'insert' | 'link'>('insert');
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // Resolve media:uuid → real URL for display inside the editor
  const resolveContent = useCallback(
    (doc: Record<string, unknown>): Record<string, unknown> => {
      if (!mediaUrlMap?.size) return doc;
      const json = JSON.stringify(doc).replace(
        new RegExp(`"${MEDIA_REF_PREFIX}([^"]+)"`, 'g'),
        (_, id) => {
          const url = mediaUrlMap.get(id);
          return url ? `"${url}"` : `"${MEDIA_REF_PREFIX}${id}"`;
        },
      );
      return JSON.parse(json);
    },
    [mediaUrlMap],
  );

  // Convert real URLs back to media:uuid before storing
  const urlToId = mediaUrlMap
    ? new Map([...mediaUrlMap.entries()].map(([id, url]) => [url, id]))
    : new Map<string, string>();

  const toRefs = (doc: Record<string, unknown>): Record<string, unknown> => {
    if (!urlToId.size) return doc;
    const json = JSON.stringify(doc);
    let result = json;
    urlToId.forEach((id, url) => {
      result = result.split(`"${url}"`).join(`"${MEDIA_REF_PREFIX}${id}"`);
    });
    return JSON.parse(result);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      Color,
      VideoNode,
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: null,
              renderHTML: (attrs) => attrs.width ? { style: `width:${attrs.width};height:auto` } : {},
              parseHTML: (el) => {
                const m = el.style.width;
                return m || null;
              },
            },
          };
        },
      }).configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({ width: 640, height: 360 }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: resolveContent(content),
    onUpdate: ({ editor }) => {
      onChange(toRefs(editor.getJSON() as Record<string, unknown>));
    },
  });

  if (!editor) return null;

  const handleMediaSelect = (media: Media) => {
    if (mediaTarget === 'insert') {
      const ref = `${MEDIA_REF_PREFIX}${media.id}`;
      if (media.mimeType.startsWith('video/')) {
        // VideoNode stocke la ref ; resolveContent la convertit en URL à l'affichage
        editor.chain().focus().insertContent({ type: 'video', attrs: { src: ref } }).run();
      } else {
        editor.chain().focus().setImage({ src: ref, alt: media.alt ?? '' }).run();
      }
    }
  };

  const applyLink = () => {
    if (!linkUrl.trim()) { editor.chain().focus().unsetLink().run(); }
    else { editor.chain().focus().setLink({ href: linkUrl.trim() }).run(); }
    setLinkOpen(false);
    setLinkUrl('');
  };

  const applyYoutube = () => {
    if (youtubeUrl.trim()) editor.commands.setYoutubeVideo({ src: youtubeUrl.trim() });
    setYoutubeOpen(false);
    setYoutubeUrl('');
  };

  const wordCount = editor.storage.characterCount?.words() ?? 0;
  const charCount = editor.storage.characterCount?.characters() ?? 0;

  return (
    <div className="border border-outline-variant rounded-xl overflow-hidden focus-within:border-primary transition-colors">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-outline-variant bg-surface-container-low">

        {!previewMode && (
          <>
            {/* History */}
            <Btn title="Annuler" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
              <Icon name="undo" size="sm" />
            </Btn>
            <Btn title="Rétablir" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
              <Icon name="redo" size="sm" />
            </Btn>

            <Sep />

            {/* Police */}
            <select
              title="Police"
              value={FONT_OPTIONS.find(f => f.value && editor.isActive('textStyle', { fontFamily: f.value }))?.value ?? ''}
              onChange={(e) => {
                if (e.target.value) {
                  editor.chain().focus().setFontFamily(e.target.value).run();
                } else {
                  editor.chain().focus().unsetFontFamily().run();
                }
              }}
              className="h-7 px-1.5 rounded-lg border border-outline-variant text-xs text-on-surface bg-surface focus:outline-none focus:border-primary"
            >
              {FONT_OPTIONS.map(f => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value || undefined }}>
                  {f.label}
                </option>
              ))}
            </select>

            {/* Couleur du texte */}
            <div className="relative flex items-center" title="Couleur du texte">
              <input
                type="color"
                className="sr-only"
                id="rte-color"
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              />
              <label
                htmlFor="rte-color"
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg cursor-pointer hover:bg-surface-container transition-colors"
                title="Couleur du texte"
              >
                <Icon name="format_color_text" size="sm" className="text-on-surface-variant" />
                <span
                  className="w-4 h-1 rounded-sm"
                  style={{ background: editor.getAttributes('textStyle').color ?? '#000000' }}
                />
              </label>
            </div>

            {/* Effacer le formatage */}
            <Btn
              title="Effacer le formatage"
              onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            >
              <Icon name="format_clear" size="sm" />
            </Btn>

            <Sep />

            {/* Headings */}
            {([1, 2, 3] as const).map((level) => (
              <Btn
                key={level}
                title={`Titre ${level}`}
                active={editor.isActive('heading', { level })}
                onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              >
                <span className="font-bold text-xs">H{level}</span>
              </Btn>
            ))}
            <Btn title="Paragraphe" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}>
              <Icon name="format_paragraph" size="sm" />
            </Btn>

            <Sep />

            {/* Inline marks */}
            <Btn title="Gras" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
              <Icon name="format_bold" size="sm" />
            </Btn>
            <Btn title="Italique" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <Icon name="format_italic" size="sm" />
            </Btn>
            <Btn title="Souligné" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
              <Icon name="format_underlined" size="sm" />
            </Btn>
            <Btn title="Barré" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
              <Icon name="strikethrough_s" size="sm" />
            </Btn>
            <Btn title="Surligner" active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>
              <Icon name="highlight" size="sm" />
            </Btn>
            <Btn title="Code inline" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
              <Icon name="code" size="sm" />
            </Btn>

            <Sep />

            {/* Alignment */}
            <Btn title="Aligner à gauche" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
              <Icon name="format_align_left" size="sm" />
            </Btn>
            <Btn title="Centrer" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
              <Icon name="format_align_center" size="sm" />
            </Btn>
            <Btn title="Aligner à droite" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
              <Icon name="format_align_right" size="sm" />
            </Btn>
            <Btn title="Justifier" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
              <Icon name="format_align_justify" size="sm" />
            </Btn>

            <Sep />

            {/* Lists */}
            <Btn title="Liste à puces" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
              <Icon name="format_list_bulleted" size="sm" />
            </Btn>
            <Btn title="Liste numérotée" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
              <Icon name="format_list_numbered" size="sm" />
            </Btn>
            <Btn title="Citation" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              <Icon name="format_quote" size="sm" />
            </Btn>
            <Btn title="Bloc de code" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
              <Icon name="data_object" size="sm" />
            </Btn>
            <Btn title="Séparateur" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
              <Icon name="horizontal_rule" size="sm" />
            </Btn>

            <Sep />

            {/* Link */}
            <Btn
              title="Lien"
              active={editor.isActive('link')}
              onClick={() => {
                setLinkUrl(editor.getAttributes('link').href ?? '');
                setLinkOpen(true);
              }}
            >
              <Icon name="link" size="sm" />
            </Btn>

            {/* Media */}
            <Btn title="Insérer image / vidéo" onClick={() => { setMediaTarget('insert'); setMediaOpen(true); }}>
              <Icon name="image" size="sm" />
            </Btn>

            {/* YouTube */}
            <Btn title="Embed YouTube" onClick={() => setYoutubeOpen(true)}>
              <Icon name="smart_display" size="sm" />
            </Btn>

            {/* Table */}
            <Btn
              title="Insérer tableau"
              active={editor.isActive('table')}
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            >
              <Icon name="table_chart" size="sm" />
            </Btn>
            {editor.isActive('table') && (
              <>
                <Btn title="Ajouter colonne" onClick={() => editor.chain().focus().addColumnAfter().run()}>
                  <Icon name="add_column_right" size="sm" />
                </Btn>
                <Btn title="Ajouter ligne" onClick={() => editor.chain().focus().addRowAfter().run()}>
                  <Icon name="add_row_below" size="sm" />
                </Btn>
                <Btn title="Supprimer tableau" onClick={() => editor.chain().focus().deleteTable().run()}>
                  <Icon name="table_rows" size="sm" />
                </Btn>
              </>
            )}
          </>
        )}

        {/* Aperçu toggle — toujours visible, collé à droite */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); setPreviewMode((v) => !v); }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ml-auto ${
            previewMode
              ? 'bg-primary text-on-primary'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <Icon name={previewMode ? 'edit' : 'visibility'} size="sm" />
          {previewMode ? 'Édition' : 'Aperçu'}
        </button>
      </div>

      {/* ── Link popup ── */}
      {linkOpen && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-outline-variant bg-surface-container-low">
          <input
            autoFocus
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyLink(); } if (e.key === 'Escape') setLinkOpen(false); }}
            placeholder="https://…"
            className="flex-1 px-3 py-1.5 rounded-lg border border-outline-variant text-sm focus:outline-none focus:border-primary"
          />
          <button type="button" onClick={applyLink} className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-sm font-medium">OK</button>
          {editor.isActive('link') && (
            <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkOpen(false); }} className="px-3 py-1.5 border border-outline-variant rounded-lg text-sm text-error">Retirer</button>
          )}
          <button type="button" onClick={() => setLinkOpen(false)} className="p-1.5 text-on-surface-variant hover:text-on-surface"><Icon name="close" size="sm" /></button>
        </div>
      )}

      {/* ── YouTube popup ── */}
      {youtubeOpen && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-outline-variant bg-surface-container-low">
          <input
            autoFocus
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyYoutube(); } if (e.key === 'Escape') setYoutubeOpen(false); }}
            placeholder="https://www.youtube.com/watch?v=…"
            className="flex-1 px-3 py-1.5 rounded-lg border border-outline-variant text-sm focus:outline-none focus:border-primary"
          />
          <button type="button" onClick={applyYoutube} className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-sm font-medium">Insérer</button>
          <button type="button" onClick={() => setYoutubeOpen(false)} className="p-1.5 text-on-surface-variant hover:text-on-surface"><Icon name="close" size="sm" /></button>
        </div>
      )}

      {/* ── Editor / Preview area ── */}
      {previewMode ? (
        <div
          className="prose prose-sm max-w-none px-4 py-3 min-h-[320px] bg-surface-container-lowest"
          dangerouslySetInnerHTML={{ __html: tiptapToSafeHtml(editor.getJSON() as Record<string, unknown>) }}
        />
      ) : (
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none px-4 py-3 min-h-[320px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-on-surface-variant/50 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
        />
      )}

      {/* ── Footer: word count ── */}
      <div className="px-4 py-1.5 border-t border-outline-variant bg-surface-container-low flex justify-end">
        <span className="text-xs text-on-surface-variant">{wordCount} mots · {charCount} caractères</span>
      </div>

      {/* ── Media picker ── */}
      <MediaPickerModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={handleMediaSelect}
      />

      {/* ── Image size bubble menu ── */}
      {!previewMode && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor: e }) => e.isActive('image')}
        >
          <div className="flex items-center gap-1 bg-white border border-outline-variant rounded-xl px-2 py-1.5 shadow-lg">
            <span className="text-xs text-on-surface-variant mr-1 font-medium">Taille :</span>
            {([
              { label: '25%', value: '25%' },
              { label: '50%', value: '50%' },
              { label: '75%', value: '75%' },
              { label: '100%', value: '100%' },
            ] as const).map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().updateAttributes('image', { width: value }).run();
                }}
                className="px-2 py-1 text-xs font-semibold rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-on-surface-variant"
              >
                {label}
              </button>
            ))}
            <div className="w-px h-4 bg-outline-variant mx-0.5" />
            <button
              type="button"
              title="Supprimer l'image"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().deleteSelection().run();
              }}
              className="p-1 rounded-lg hover:bg-error/10 hover:text-error transition-colors text-on-surface-variant"
            >
              <Icon name="delete" size="sm" />
            </button>
          </div>
        </BubbleMenu>
      )}
    </div>
  );
};
