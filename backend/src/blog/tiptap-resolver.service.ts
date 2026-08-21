import { Injectable } from '@nestjs/common';
import { MediaService } from '../media/media.service';

export const MEDIA_REF_PREFIX = 'media:';

type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
};

@Injectable()
export class TiptapResolverService {
  constructor(private readonly mediaService: MediaService) {}

  /** Collect all media UUIDs referenced in a TipTap JSON tree. */
  private collectIds(node: TiptapNode, ids: Set<string>): void {
    if (node.type === 'image' || node.type === 'video') {
      const src = node.attrs?.src as string | undefined;
      if (src?.startsWith(MEDIA_REF_PREFIX)) {
        ids.add(src.slice(MEDIA_REF_PREFIX.length));
      }
    }
    for (const mark of node.marks ?? []) {
      if (mark.type === 'link') {
        const href = mark.attrs?.href as string | undefined;
        if (href?.startsWith(MEDIA_REF_PREFIX)) {
          ids.add(href.slice(MEDIA_REF_PREFIX.length));
        }
      }
    }
    for (const child of node.content ?? []) {
      this.collectIds(child, ids);
    }
  }

  /** Replace all media:uuid references with resolved URLs in-place (deep clone). */
  private replaceIds(node: TiptapNode, urlMap: Map<string, string>): TiptapNode {
    const resolve = (ref: string) => {
      if (!ref.startsWith(MEDIA_REF_PREFIX)) return ref;
      return urlMap.get(ref.slice(MEDIA_REF_PREFIX.length)) ?? ref;
    };

    return {
      ...node,
      attrs: node.attrs
        ? {
            ...node.attrs,
            ...(node.attrs.src !== undefined ? { src: resolve(node.attrs.src as string) } : {}),
          }
        : undefined,
      marks: node.marks?.map((m) =>
        m.type === 'link' && m.attrs?.href
          ? { ...m, attrs: { ...m.attrs, href: resolve(m.attrs.href as string) } }
          : m,
      ),
      content: node.content?.map((child) => this.replaceIds(child, urlMap)),
    };
  }

  async resolve(doc: Record<string, unknown>): Promise<Record<string, unknown>> {
    const root = doc as unknown as TiptapNode;
    const ids = new Set<string>();
    this.collectIds(root, ids);
    if (!ids.size) return doc;
    const urlMap = await this.mediaService.findByIds([...ids]);
    return this.replaceIds(root, urlMap) as unknown as Record<string, unknown>;
  }

  /**
   * Inverse: walk a resolved doc and replace full URLs back to media:uuid.
   * Used when the admin sends back a doc that TipTap populated with real URLs
   * (e.g. on load→edit→save round-trip where URLs were resolved for display).
   * The urlMap here is url→id.
   */
  static urlsToRefs(
    doc: Record<string, unknown>,
    urlToId: Map<string, string>,
  ): Record<string, unknown> {
    const toRef = (val: string) => {
      const id = urlToId.get(val);
      return id ? `${MEDIA_REF_PREFIX}${id}` : val;
    };

    function walk(node: TiptapNode): TiptapNode {
      return {
        ...node,
        attrs: node.attrs
          ? {
              ...node.attrs,
              ...(node.attrs.src !== undefined ? { src: toRef(node.attrs.src as string) } : {}),
            }
          : undefined,
        marks: node.marks?.map((m) =>
          m.type === 'link' && m.attrs?.href
            ? { ...m, attrs: { ...m.attrs, href: toRef(m.attrs.href as string) } }
            : m,
        ),
        content: node.content?.map(walk),
      };
    }

    return walk(doc as unknown as TiptapNode) as unknown as Record<string, unknown>;
  }
}
