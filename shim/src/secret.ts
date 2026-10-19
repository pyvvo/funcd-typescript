// context.secret — the keys of a function's bound Secrets (funcd ADR-0245), read from the environment at call time.
// The methods return Promises, as every client that calls funcd does, so a later read from funcd keeps this API.
import { listedKeys, listedValue } from './config.ts';

/** A function's bound secrets (funcd ADR-0245): an unbound key reads as undefined. */
export interface SecretClient {
  get(key: string): Promise<string | undefined>;
  list(): Promise<string[]>;
}

export function makeSecret(env: NodeJS.ProcessEnv = process.env): SecretClient {
  return {
    get: async (key) => listedValue(env, 'FUNCD_SECRET_KEYS', key),
    list: async () => listedKeys(env, 'FUNCD_SECRET_KEYS'),
  };
}
