// env-echo — a function that echoes the environment injected by its bindings (ADR-0093 spec.bindings.config +
// ADR-0057 spec.bindings.secret). It takes NO input (`FuncInput = void` → the ADR-0090 void-input contract
// `{"type":"null"}`, so an invocation with `data: null` / absent data is accepted) and returns three values:
// APP_MODE (from the ConfigMap, in the environment), API_KEY (from the Secret) and SHARED (present in BOTH — the
// Secret must win, config-then-secrets merge order), the last two read through ctx.secret. This is the
// containerd-lane counterpart to the in-process scenario pkg/funcd/config_secret_e2e_test.go: it proves
// the full path reconcile → resolve → materialize → process shim → running handler on real containerd.
import type { Handler } from '@funcd-dev/shim';

/** This function takes no event payload — the void-input contract (ADR-0090). */
export type FuncInput = void;

/** The three injected env vars echoed back: config from the ConfigMap, secret from the Secret, and the
 *  key present in both (the Secret wins). */
export interface FuncOutput {
  config: string;
  secret: string;
  shared: string;
}

// A bound Secret is not in the worker environment: its keys are read through ctx.secret, each read checked by funcd
// (ADR-0249). The ConfigMap's keys stay in the environment, and SHARED, which the Secret shadows, reads from the Secret.
export const handle: Handler<FuncInput, FuncOutput> = async (ctx) => {
  return {
    config: process.env.APP_MODE ?? '',
    secret: (await ctx.secret.get('API_KEY')) ?? '',
    shared: (await ctx.secret.get('SHARED')) ?? '',
  };
};
