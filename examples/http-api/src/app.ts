import type { FunctionContext } from '@funcd-dev/shim';
import { Hono } from 'hono';
import { requestId } from 'hono/request-id';
import { streamText } from 'hono/streaming';

/** A device of the fleet. */
export interface Device {
  id: string;
  name: string;
}

// The devices and their firmware live in this worker's memory, so the example needs no store: a restart empties them.
const devices = new Map<string, Device>();
const firmware = new Map<string, Uint8Array<ArrayBuffer>>();
let nextId = 1;

/** isNamed accepts a JSON body that carries a non-empty name. */
function isNamed(body: unknown): body is { name: string } {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as { name?: unknown }).name === 'string' &&
    (body as { name: string }).name !== ''
  );
}

/** The REST API of the devices, a plain Hono app its tests call directly. A route reaches the function context as
 *  `c.env.funcd`; every reply carries the request's X-Request-Id, or a new one. */
export const app = new Hono<{ Bindings: { funcd: FunctionContext } }>()
  .use(requestId())
  .get('/devices', (c) => {
    const name = c.req.query('name');
    return c.json([...devices.values()].filter((device) => name === undefined || device.name === name));
  })
  .get('/devices/export', (c) =>
    // One line per device, each sent as it is written (funcd ADR-0243): the edge flushes every chunk.
    streamText(c, async (stream) => {
      for (const device of devices.values()) {
        await stream.writeln(JSON.stringify(device));
        await stream.sleep(50);
      }
    }),
  )
  .post('/devices/purge', (c) => {
    const purged = devices.size;
    devices.clear();
    firmware.clear();
    return c.json({ purged });
  })
  .get('/devices/:id', (c) => {
    const device = devices.get(c.req.param('id'));
    return device ? c.json(device) : c.json({ error: 'no such device' }, 404);
  })
  .post('/devices', async (c) => {
    const body: unknown = await c.req.json().catch(() => null);
    if (!isNamed(body)) return c.json({ error: 'a device needs a name' }, 400);
    const device = { id: String(nextId++), name: body.name };
    devices.set(device.id, device);
    c.env.funcd.log('device created', device.id);
    return c.json(device, 201, { location: `${c.req.header('x-forwarded-prefix') ?? ''}/devices/${device.id}` });
  })
  .put('/devices/:id', async (c) => {
    const id = c.req.param('id');
    if (!devices.has(id)) return c.json({ error: 'no such device' }, 404);
    const body: unknown = await c.req.json().catch(() => null);
    if (!isNamed(body)) return c.json({ error: 'a device needs a name' }, 400);
    const device = { id, name: body.name };
    devices.set(id, device);
    return c.json(device);
  })
  .delete('/devices/:id', (c) => {
    const id = c.req.param('id');
    firmware.delete(id);
    return devices.delete(id) ? c.body(null, 204) : c.json({ error: 'no such device' }, 404);
  })
  .put('/devices/:id/firmware', async (c) => {
    const id = c.req.param('id');
    if (!devices.has(id)) return c.json({ error: 'no such device' }, 404);
    firmware.set(id, new Uint8Array(await c.req.arrayBuffer()));
    return c.body(null, 204);
  })
  .get('/devices/:id/firmware', (c) => {
    const image = firmware.get(c.req.param('id'));
    return image
      ? c.body(image, 200, { 'content-type': 'application/octet-stream' })
      : c.json({ error: 'no firmware' }, 404);
  });
