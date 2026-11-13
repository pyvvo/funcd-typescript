# secret-writer — Functions that write a key of a Secret

Two functions bind the Secret `demo-token`, whose key `TOKEN` starts with the dummy value `token-v1`:

| Function | What |
|---|---|
| `token-owner` | the Secret's owner, which `spec.owner` names: a put writes the call's value into `TOKEN` with `context.secret.put`, and a delete removes `TOKEN` with `context.secret.del`, twice, since deleting a key that the Secret no longer holds is no error. Each call returns `TOKEN` as the next read returns it |
| `token-user` | binds the Secret but does not own it: each call reads `TOKEN` and tries to write the call's value. funcd refuses the write with the HTTP status 403 until [`fixtures/grant.yaml`](fixtures/grant.yaml) gives the function the role `Secret Data Writer` on `demo-token` |

## Run it locally

`funcdctl dev` runs both functions from their builds, `token-owner.mjs` and `token-user.mjs`. From the repository's
root folder:

```bash
funcdctl dev examples/secret-writer --gport 8080 --cport 8081
```

In another terminal:

```bash
curl -s -X POST -H 'content-type: application/json' -d '{"op":"put","value":"token-v2"}' http://127.0.0.1:8080/function/token-owner
# → {"token":"token-v2"}
curl -s -X POST -H 'content-type: application/json' -d '{"value":"token-v3"}' http://127.0.0.1:8080/function/token-user
# → {"token":"token-v2","error":"context.secret.put failed: 403 …"}
funcdctl --server http://127.0.0.1:8081 --token funcd-dev-token apply -f examples/secret-writer/fixtures/grant.yaml
curl -s -X POST -H 'content-type: application/json' -d '{"value":"token-v3"}' http://127.0.0.1:8080/function/token-user
# → {"token":"token-v3"}
curl -s -X POST -H 'content-type: application/json' -d '{"op":"delete"}' http://127.0.0.1:8080/function/token-owner
# → {"token":null}
```

## Files

- `secret.yaml`: the Secret `demo-token`, owned by `token-owner`.
- `token-owner.yaml`, `token-user.yaml`: the functions, each declaring and binding `demo-token`.
- `src/token-owner/main.ts`, `src/token-user/main.ts`: the handlers, which `yarn build` bundles into
  `token-owner.mjs` and `token-user.mjs`, committed beside their contract files.
- `fixtures/grant.yaml`: the RolesAssignment that lets `token-user` write `demo-token`. `funcdctl dev` reads only the
  folder's top-level files, so it does not apply this one.

## Tests

`yarn test` runs both handlers against a fake `context.secret` that refuses a put from a function that may not write.
funcd's `secret-writer` lane runs the example on containerd.
