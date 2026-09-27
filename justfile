# Run every recipe through the pinned dev shell: `nix develop -c just <recipe>`.

default:
    @just --list

# install the shim and example deps from yarn.lock
install:
    yarn install --immutable

typecheck:
    yarn workspaces foreach --all run typecheck

test:
    yarn workspaces foreach --all run test

# rebuild shim.mjs, pool.mjs and every example's committed bundle and schema
build:
    yarn workspaces foreach --all run build

# the Go embed package funcd imports
go-check:
    go vet ./...
    go build ./...

# the CI gate: fails when a build changed a committed file
ci: install typecheck test build go-check
    @if [ -n "$(git status --porcelain)" ]; then git status --short; echo "build outputs are stale: run 'just build' and commit the result"; exit 1; fi
