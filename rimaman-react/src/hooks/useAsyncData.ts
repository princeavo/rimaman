import { useEffect, useState } from 'react';

interface AsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  retry: () => void;
}

function depsEqual(a: unknown[], b: unknown[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * Charge une ressource API au montage (et à chaque changement de `deps`).
 * Les pages restent simples : elles gèrent juste les trois états
 * (chargement / erreur / données) plutôt que de dupliquer la logique de
 * fetch partout.
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[] = []): AsyncDataState<T> {
  const [retryKey, setRetryKey] = useState(0);
  const retry = () => setRetryKey((k) => k + 1);

  const [state, setState] = useState<Omit<AsyncDataState<T>, 'retry'>>({ data: null, loading: true, error: null });
  const [prevDeps, setPrevDeps] = useState(deps);

  // "Ajuster l'état pendant le rendu" : le moyen recommandé par React pour
  // réinitialiser l'état quand une dépendance change, sans déclencher
  // l'avertissement "setState synchrone dans un effet".
  if (!depsEqual(prevDeps, deps)) {
    setPrevDeps(deps);
    setState({ data: null, loading: true, error: null });
  }

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, retryKey]);

  return { ...state, retry };
}
