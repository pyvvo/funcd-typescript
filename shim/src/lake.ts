// context.lake — a lake binding's proxy URL and this function's token (funcd ADR-0245, ADR-0091, ADR-0137), from
// FUNCD_LAKE_<ALIAS>_URL and _TOKEN at call time.

export interface LakeEndpoint {
  url: string;
  token: string;
}

/** A function's Lake bindings, each by its alias in spec.bindings.lake. */
export interface LakeClient {
  /** The gateway of the Lake bound as alias: url, its address as host:port, and token, the token that it accepts from
   *  the function. Throws an Error naming the alias when the function binds no Lake with that alias. */
  get(alias: string): LakeEndpoint;
}

export function makeLake(env: NodeJS.ProcessEnv = process.env): LakeClient {
  return {
    get(alias) {
      const prefix = `FUNCD_LAKE_${alias.toUpperCase()}_`;
      const url = env[`${prefix}URL`];
      const token = env[`${prefix}TOKEN`];
      if (!url || !token) throw new Error(`context.lake.get: lake "${alias}" is not bound`);
      return { url, token };
    },
  };
}
