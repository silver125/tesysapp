export function stripEnvValue(raw: string): string {
  const value = raw.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1).trim();
  }
  return value;
}

export function isValidSupabaseUrl(url: string): boolean {
  return /^https:\/\/.+\.supabase\.co\/?$/i.test(stripEnvValue(url));
}

export function isValidSupabasePublicKey(key: string): boolean {
  const value = stripEnvValue(key);
  if (value.length < 20) return false;
  return (
    value.startsWith('eyJ') ||
    value.startsWith('sb_publishable_')
  );
}

export function readSupabaseEnv(
  urlRaw: string | undefined,
  keyRaw: string | undefined,
): { url: string; key: string; configured: boolean } {
  const url = stripEnvValue(urlRaw ?? '');
  const key = stripEnvValue(keyRaw ?? '');
  return {
    url,
    key,
    configured: isValidSupabaseUrl(url) && isValidSupabasePublicKey(key),
  };
}
