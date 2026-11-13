// devices-api: a Function that serves HTTP. http(app) makes the Hono app its export, which the shim calls
// with every request under spec.protocol: http.
import { http } from '@funcd-dev/shim';

import { app } from './app.ts';

export const handle = http(app);
