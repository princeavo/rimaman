import DOMPurify from 'dompurify';
import { slugify } from '../../utils/slugify';

interface TiptapMark {
  type: 'bold' | 'italic' | 'code' | 'link' | 'underline' | 'strike' | 'highlight' | 'textStyle';
  attrs?: { href?: string; target?: string; color?: string; fontFamily?: string; class?: string };
}

interface TiptapNode {
  type: string;
  text?: string;
  marks?: TiptapMark[];
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
}

function renderMark(mark: TiptapMark, inner: string): string {
  switch (mark.type) {
    case 'bold': return `<strong>${inner}</strong>`;
    case 'italic': return `<em>${inner}</em>`;
    case 'code': return `<code>${inner}</code>`;
    case 'underline': return `<u>${inner}</u>`;
    case 'strike': return `<s>${inner}</s>`;
    case 'highlight': return `<mark>${inner}</mark>`;
    case 'textStyle': {
      const color = mark.attrs?.color as string | undefined;
      const fontFamily = mark.attrs?.fontFamily as string | undefined;
      const styles = [
        color ? `color:${color}` : '',
        fontFamily ? `font-family:${fontFamily}` : '',
      ].filter(Boolean).join(';');
      return styles ? `<span style="${styles}">${inner}</span>` : inner;
    }
    case 'link': {
      const href = String(mark.attrs?.href ?? '#');
      if (!/^(https?:|mailto:|\/)/.test(href)) return inner;
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
    }
    default: return inner;
  }
}

function nodeText(node: TiptapNode): string {
  if (node.type === 'text') return node.text ?? '';
  return (node.content ?? []).map(nodeText).join('');
}

function alignStyle(attrs?: Record<string, unknown>): string {
  const align = attrs?.textAlign as string | undefined;
  return align ? ` style="text-align:${align}"` : '';
}

function renderNode(node: TiptapNode): string {
  switch (node.type) {
    case 'doc':
      return (node.content ?? []).map(renderNode).join('');

    case 'paragraph': {
      const inner = (node.content ?? []).map(renderNode).join('');
      return `<p${alignStyle(node.attrs)}>${inner || '&nbsp;'}</p>`;
    }

    case 'heading': {
      const level = Number(node.attrs?.level ?? 2);
      const inner = (node.content ?? []).map(renderNode).join('');
      const id = `h-${slugify(nodeText(node))}`;
      const align = node.attrs?.textAlign as string | undefined;
      const style = ['scroll-margin-top:110px', align ? `text-align:${align}` : ''].filter(Boolean).join(';');
      return `<h${level} id="${id}" style="${style}">${inner}</h${level}>`;
    }

    case 'bulletList':
      return `<ul>${(node.content ?? []).map(renderNode).join('')}</ul>`;

    case 'orderedList':
      return `<ol>${(node.content ?? []).map(renderNode).join('')}</ol>`;

    case 'listItem': {
      const inner = (node.content ?? []).map(renderNode).join('');
      return `<li>${inner}</li>`;
    }

    case 'text': {
      let text = (node.text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      for (const mark of node.marks ?? []) {
        text = renderMark(mark, text);
      }
      return text;
    }

    case 'hardBreak':
      return '<br />';

    case 'blockquote':
      return `<blockquote>${(node.content ?? []).map(renderNode).join('')}</blockquote>`;

    case 'codeBlock': {
      const inner = (node.content ?? []).map(renderNode).join('');
      return `<pre><code>${inner}</code></pre>`;
    }

    case 'horizontalRule':
      return '<hr />';

    case 'image': {
      const src = String(node.attrs?.src ?? '');
      const alt = String(node.attrs?.alt ?? '');
      const title = node.attrs?.title ? ` title="${String(node.attrs.title)}"` : '';
      const width = node.attrs?.width as string | undefined;
      const style = width ? ` style="width:${width};height:auto"` : '';
      return `<img src="${src}" alt="${alt}"${title}${style} loading="lazy" />`;
    }

    case 'video': {
      const src = String(node.attrs?.src ?? '');
      return `<video src="${src}" controls preload="metadata" style="max-width:100%"></video>`;
    }

    case 'youtube': {
      const src = String(node.attrs?.src ?? '');
      const w = Number(node.attrs?.width ?? 640);
      const h = Number(node.attrs?.height ?? 360);
      return `<div class="youtube-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden">
        <iframe src="${src}" width="${w}" height="${h}" frameborder="0" allowfullscreen
          style="position:absolute;top:0;left:0;width:100%;height:100%"></iframe>
      </div>`;
    }

    case 'table':
      return `<table>${(node.content ?? []).map(renderNode).join('')}</table>`;

    case 'tableRow':
      return `<tr>${(node.content ?? []).map(renderNode).join('')}</tr>`;

    case 'tableHeader': {
      const inner = (node.content ?? []).map(renderNode).join('');
      return `<th>${inner}</th>`;
    }

    case 'tableCell': {
      const inner = (node.content ?? []).map(renderNode).join('');
      return `<td>${inner}</td>`;
    }

    default:
      return (node.content ?? []).map(renderNode).join('');
  }
}

export function tiptapToSafeHtml(doc: Record<string, unknown>): string {
  const raw = renderNode(doc as unknown as TiptapNode);
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre', 'mark', 'span',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'hr', 'a',
      'img', 'video', 'iframe', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'loading',
      'controls', 'preload', 'style', 'width', 'height', 'frameborder',
      'allowfullscreen', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
  });
}
