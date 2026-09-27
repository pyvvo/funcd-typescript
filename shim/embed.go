// Package nodejs embeds the funcd Node runtime shims (ADR-0030, ADR-0044) into the binary, so the
// single self-contained `funcd` daemon ships them with no sidecar file (ADR-0036). The daemon
// extracts Shim to its data dir on boot and points WithRuntimeShim at it; `funcd bench` extracts
// Pool for its pooled runs (ADR-0141).
package nodejs

import _ "embed"

// Shim is shim.mjs, the single-tenant shim.
//
//go:embed shim.mjs
var Shim []byte

// Pool is pool.mjs, the worker_threads pool shim that hosts many handlers of one namespace.
//
//go:embed pool.mjs
var Pool []byte
