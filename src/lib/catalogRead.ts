type CatalogResult<T> = { data: T[] | null; error: unknown };

/** A failed read is not an empty catalog and must not erase the visible data. */
export function readCatalogRows<T, U>(result: CatalogResult<T>, map: (row: T) => U): U[] | null {
  return result.error ? null : (result.data ?? []).map(map);
}

export function isConfirmedEmptyCatalog(catalogs: ReadonlyArray<unknown[] | null>): boolean {
  return catalogs.length > 0 && catalogs.every(rows => rows !== null && rows.length === 0);
}
