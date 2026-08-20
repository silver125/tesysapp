import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Sincroniza aba do dashboard com ?tab= na URL (voltar/avançar do browser). */
export function useDashboardTab<T extends string>(
  defaultTab: T,
  validTabs: readonly T[],
) {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = useMemo(() => {
    const raw = searchParams.get('tab');
    return (raw && validTabs.includes(raw as T) ? raw : defaultTab) as T;
  }, [searchParams, defaultTab, validTabs]);

  const setTab = useCallback((next: T) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (next === defaultTab) params.delete('tab');
      else params.set('tab', next);
      return params;
    }, { replace: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [defaultTab, setSearchParams]);

  return [tab, setTab] as const;
}
