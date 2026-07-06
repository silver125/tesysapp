/** Remove caches locais (produtos offline, leads, onboarding, etc.). */
export function clearLocalTessyData() {
  if (typeof window === 'undefined') return;
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('tessy')) localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}
