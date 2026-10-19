// context.catalog — a catalog binding's proxy URL and this function's token (funcd ADR-0245, ADR-0091, ADR-0137), from
// FUNCD_CATALOG_<ALIAS>_URL and _TOKEN at call time.

export interface CatalogEndpoint {
  url: string;
  token: string;
}

/** A function's catalog bindings by alias (funcd ADR-0245). */
export interface CatalogClient {
  /** Throws an Error naming the alias when it is not bound. */
  get(alias: string): CatalogEndpoint;
}

export function makeCatalog(env: NodeJS.ProcessEnv = process.env): CatalogClient {
  return {
    get(alias) {
      const prefix = `FUNCD_CATALOG_${alias.toUpperCase()}_`;
      const url = env[`${prefix}URL`];
      const token = env[`${prefix}TOKEN`];
      if (!url || !token) throw new Error(`context.catalog.get: catalog "${alias}" is not bound`);
      return { url, token };
    },
  };
}
