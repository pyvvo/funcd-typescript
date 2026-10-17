// devices: a Function that serves HTTP (funcd ADR-0243). http(app) makes the Hono app its export, which the shim
// calls with every request under spec.protocol: http.
import { http } from '@funcd-dev/shim';

import { app } from './app.ts';

export const handle = http(app);
