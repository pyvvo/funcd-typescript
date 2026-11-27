// WebSocket in a Function with spec.protocol: http (funcd ADR-0360): Hono's upgradeWebSocket, whose route hands its
// events to the shim, and the shim completes the handshake with @hono/node-server's own WebSocket support.
import { defineWebSocketHelper, type UpgradeWebSocket, type WSEvents } from 'hono/ws';
import type { WebSocket } from 'ws';

import { WS_UPGRADE } from './types.ts';

/** TakeWebSocket is the hook under WS_UPGRADE on the shim's context: it takes the socket of the call that runs it, when
 *  the shim's server received that call as an upgrade, and answers 500 otherwise. */
export type TakeWebSocket = (events: WSEvents<WebSocket>) => Promise<Response>;

/** upgradeWebSocket takes a WebSocket upgrade in a route of a Function with spec.protocol: http, as Hono's helper does
 *  on its other runtimes: `app.get('/relay', upgradeWebSocket((c) => ({ onMessage(event, ws) {} })))`. A request
 *  whose Upgrade header is not websocket goes to the next handler. */
export const upgradeWebSocket: UpgradeWebSocket<WebSocket> = defineWebSocketHelper<WebSocket>(async (c, events) => {
  if (c.req.header('upgrade')?.toLowerCase() !== 'websocket') return;
  const take = (c.env as { funcd?: { [WS_UPGRADE]?: TakeWebSocket } } | undefined)?.funcd?.[WS_UPGRADE];
  if (typeof take !== 'function') {
    throw new Error(
      'upgradeWebSocket needs a Function with spec.protocol: http, served by a funcd shim that takes WebSockets (funcd ADR-0360)',
    );
  }
  return take(events);
});
