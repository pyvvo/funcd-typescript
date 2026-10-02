# Run every recipe through the pinned dev shell: `nix develop -c just <recipe>`.

default:
    @just --list

# install the shim and example deps from yarn.lock
install:
    yarn install --immutable

typecheck:
    yarn workspaces foreach --all --topological-dev run typecheck

test:
    yarn workspaces foreach --all --topological-dev run test

# rebuild shim.mjs, pool.mjs, the Vite plugin, then every example's committed bundle with it
build:
    yarn workspaces foreach --all --topological-dev run build

# format the TS sources and apply Biome's safe lint fixes
fmt:
    biome check --write .

# the format check and lint, exactly as CI runs them
lint:
    biome ci .

# the Go embed package funcd imports
go-check:
    go vet ./...
    go build ./...
    go test ./...

# the CI gate: fails when a build changed a committed file
ci: install lint typecheck test build go-check
    @if [ -n "$(git status --porcelain)" ]; then git status --short; echo "build outputs are stale: run 'just build' and commit the result"; exit 1; fi
