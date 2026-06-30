export function isMissingDbColumnError(error: unknown, columns: string[]) {
  const message = error instanceof Error
    ? error.message
    : typeof error === 'object' && error && 'message' in error
      ? String((error as { message?: unknown }).message)
      : String(error ?? '');

  return columns.some(column => {
    const escaped = column.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:'${escaped}' column|column .*${escaped}|${escaped}.* column|${escaped}.*schema cache)`, 'i').test(message);
  });
}

export function omitDbColumns<T extends Record<string, unknown>>(payload: T, columns: string[]) {
  const next: Record<string, unknown> = { ...payload };
  columns.forEach(column => {
    delete next[column];
  });
  return next;
}

export function isMissingRpcError(error: unknown, rpcName: string) {
  const message = error instanceof Error
    ? error.message
    : typeof error === 'object' && error && 'message' in error
      ? String((error as { message?: unknown }).message)
      : String(error ?? '');
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code?: unknown }).code)
    : '';
  return code === 'PGRST202'
    || /could not find the function/i.test(message)
    || new RegExp(rpcName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(message);
}
