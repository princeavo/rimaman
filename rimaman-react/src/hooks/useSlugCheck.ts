import { useEffect, useState } from 'react';
import { checkBlogSlug } from '../api/blog';
import { checkRecipeSlug } from '../api/recipes';

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

type CheckFn = (slug: string, excludeId?: string) => Promise<{ available: boolean }>;

function useSlugCheckGeneric(checkFn: CheckFn, slug: string, excludeId?: string): SlugStatus {
  const [status, setStatus] = useState<SlugStatus>('idle');

  useEffect(() => {
    if (!slug) { setStatus('idle'); return; }

    const valid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
    if (!valid) { setStatus('invalid'); return; }

    setStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const { available } = await checkFn(slug, excludeId);
        setStatus(available ? 'available' : 'taken');
      } catch {
        setStatus('idle');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug, excludeId]); // eslint-disable-line react-hooks/exhaustive-deps

  return status;
}

export function useSlugCheck(slug: string, excludeId?: string): SlugStatus {
  return useSlugCheckGeneric(checkBlogSlug, slug, excludeId);
}

export function useRecipeSlugCheck(slug: string, excludeId?: string): SlugStatus {
  return useSlugCheckGeneric(checkRecipeSlug, slug, excludeId);
}
