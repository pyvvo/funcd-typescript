# http-api

A Function that serves HTTP (funcd ADR-0243): `devices-api`, a Hono REST API with a streamed export, exported with
`http(app)` under `spec.protocol: http`.

| File | What |
|---|---|
| `src/app.ts` | The Hono app: `GET/POST /devices` (`?name=` filters), `GET/PUT/DELETE /devices/:id`, `GET/PUT /devices/:id/firmware` (raw bytes), `POST /devices/purge`, and `GET /devices/export`, one line per device, streamed |
| `src/devices.ts` | `export const handle = http(app)` |
| `devices.funcdctl.yaml` | The push config: `protocol: http`, so `funcdctl push` bakes no I/O contract |
| `devices.yaml`, `route.yaml` | The Function `devices-api` and the Route `api` that serves it at `/api` |
| `funcdconfig.yaml` | The daemon config of funcd's `http-api` lane |

The devices live in the worker's memory, so a restart empties them. A JSON body reaches the app re-encoded and any
other body byte for byte, at most 1 MiB.

```bash
yarn build                                  # → devices.mjs
funcdctl push devices.mjs <ref>
funcdctl apply -f devices.yaml -f route.yaml
curl -s -X POST localhost:8081/api/devices -H 'content-type: application/json' -d '{"name":"truck-7"}'
curl -sN localhost:8081/api/devices/export  # one line per device, as it is written
```
