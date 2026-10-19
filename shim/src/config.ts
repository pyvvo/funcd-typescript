// context.config — the keys of a function's bound ConfigMaps (funcd ADR-0245), read from the environment at call time.
// funcd sets FUNCD_CONFIG_KEYS and FUNCD_SECRET_KEYS, comma-separated lists of the bound keys of each kind in the
// environment; an absent or empty list is no keys. context.secret reads its list with the same helpers.
export type Env = Record<string, string | undefined>;

export function listedKeys(env: Env, list: string): string[] {
  const v = env[list];
  return v ? v.split(',') : [];
}

export function listedValue(env: Env, list: string, key: string): string | undefined {
  return listedKeys(env, list).includes(key) ? env[key] : undefined;
}

/** A function's bound config (funcd ADR-0245): a key a secret overrides, or any unbound variable, reads as undefined. */
export interface ConfigClient {
  get(key: string): string | undefined;
  list(): string[];
}

export function makeConfig(env: Env = process.env): ConfigClient {
  return {
    get: (key) => listedValue(env, 'FUNCD_CONFIG_KEYS', key),
    list: () => listedKeys(env, 'FUNCD_CONFIG_KEYS'),
  };
}
