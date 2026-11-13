// context.config — the keys of a function's bound ConfigMaps (funcd ADR-0245), read from the environment at call time.
// funcd sets FUNCD_CONFIG_KEYS, the comma-separated bound config keys in the environment; an absent or empty list is no
// keys. Secrets are read from funcd instead (context.secret, funcd ADR-0249).
function listedKeys(env: NodeJS.ProcessEnv, list: string): string[] {
  const v = env[list];
  return v ? v.split(',') : [];
}

function listedValue(env: NodeJS.ProcessEnv, list: string, key: string): string | undefined {
  return listedKeys(env, list).includes(key) ? env[key] : undefined;
}

/** A function's bound config: the keys of the ConfigMaps in spec.bindings.config, with the values that the worker got
 *  when it started. A key that a bound Secret also holds, or any other variable, reads as undefined. */
export interface ConfigClient {
  /** The key's value, or undefined when list() does not include the key. */
  get(key: string): string | undefined;
  /** The keys of the bound ConfigMaps, sorted, without the keys left out. */
  list(): string[];
}

export function makeConfig(env: NodeJS.ProcessEnv = process.env): ConfigClient {
  return {
    get: (key) => listedValue(env, 'FUNCD_CONFIG_KEYS', key),
    list: () => listedKeys(env, 'FUNCD_CONFIG_KEYS'),
  };
}
