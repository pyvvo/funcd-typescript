// The http(app) export of the WebSocket tests (funcd ADR-0360): /relay sends each message to every other socket of the
// route, /order answers what its events saw, and /plain takes no socket.
import { Hono } from 'hono';
import type { WSContext } from 'hono/ws';

import { type FunctionContext, http } from '../src/types.ts';
import { upgradeWebSocket } from '../src/ws.ts';

const peers = new Set<WSContext>();

const app = new Hono<{ Bindings: { funcd: FunctionContext } }>()
  .get(
    '/relay',
    upgradeWebSocket(() => ({
      onOpen(_event, ws) {
        peers.add(ws);
      },
      onMessage(event, ws) {
        for (const peer of peers) {
          if (peer !== ws && typeof event.data === 'string') peer.send(event.data);
        }
      },
      onClose(_event, ws) {
        peers.delete(ws);
      },
    })),
  )
  .get(
    '/order',
    upgradeWebSocket((c) => {
      const seen: string[] = [];
      return {
        onOpen() {
          seen.push('open');
        },
        onMessage(_event, ws) {
          seen.push('message', c.env.funcd.principal?.id ?? 'nobody', String(c.env.funcd.remainingMs()));
          ws.send(seen.join(','));
        },
      };
    }),
  )
  .get('/plain', (c) => c.text('plain', 200, { 'x-plain': 'yes' }))
  .onError((err, c) => c.text(err.message, 500));

export const handle = http(app);
