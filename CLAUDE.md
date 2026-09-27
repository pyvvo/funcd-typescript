# funcd-typescript — agent working agreement

This repo holds the TypeScript side of funcd: the Node runtime shim and the TypeScript example
functions. The platform itself (Go daemon, API, CLI, e2e tests, ADRs) lives in the funcd repo.

## ⛔ Nothing about the dev machine ever enters the repo

No absolute OS paths, no local username, no personal email: not in files, commit messages,
examples or grep patterns. Paths are repo-root-relative. The only identity is `green-0-rabbit`,
`github.com/pyvvo` and "The funcd Authors".

## Decisions live in funcd

Design decisions are ADRs in the funcd repo (`docs/adr/`). This repo implements them and never
decides on its own. A change to the contract between funcd and the shim (the `FUNCD_*` env vars,
the health endpoints, the invoke socket, log capture, trace spans) needs a funcd ADR first.

## Layout

| Path | What |
|---|---|
| `shim/` | The runtime shim. `src/*.ts` builds to `shim.mjs` and `pool.mjs`, both committed. `embed.go` is the Go package funcd imports |
| `examples/*` | Example functions. Each commits its built bundle and contract schema |
| `go.mod` | This repo is also a Go module. funcd pins it by git tag |

## Toolchain

`flake.nix` pins node 22, Yarn 4, Go, just, lefthook and Biome. Run everything through the dev shell:

```bash
nix develop -c just ci
```

Yarn workspaces cover `shim` and `examples/*`, with `nodeLinker: node-modules`.

The dev shell also installs the lefthook git hooks. pre-commit formats and lints staged files
with Biome and gofmt, commit-msg enforces Conventional Commits, and pre-push runs the typecheck
and tests. CI runs the same checks, so never bypass a hook with `--no-verify`.

## Rules

- **Biome owns formatting.** Run `just fmt` instead of formatting by hand. CI runs `biome ci`.
- **Built files are committed.** After changing `shim/src/` or an example, run `just build` and
  commit the outputs. CI fails when a build changes a committed file.
- **Conventional Commits.** A PR title must be a Conventional Commit, and CI checks it. PRs are
  squash-merged through a merge queue, which uses the PR title as the commit message on `main`, so
  nobody can edit the message at merge time. The queue checks that exact message again before it
  lands. `main` takes no direct pushes, and the ruleset has no bypass, not even for admins.
- **release-please owns versions.** Never edit `version.txt`, `CHANGELOG.md` or the `version` in
  `shim/package.json` by hand, and never create tags. The funcd release GitHub App opens the
  release PR, which goes through the merge queue like any other PR. Merging it tags `vX.Y.Z`.
- **Before 1.0, a breaking change (`feat!:`) bumps the minor version.** From v2.0.0 on, Go requires
  a `/v2` module path, so stay below v2.
- YAML is block style, imports sit at the top of the module, and comments explain why, not what.
