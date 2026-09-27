package nodejs

import (
	"bytes"
	"testing"
)

// Each variable must embed its own bundle: a swapped or empty go:embed would ship the wrong shim.
func TestEmbedsEachBundle(t *testing.T) {
	for name, tc := range map[string]struct {
		data   []byte
		source string
	}{
		"Shim": {Shim, "shim/src/shim.ts"},
		"Pool": {Pool, "shim/src/pool.ts"},
	} {
		if !bytes.HasPrefix(tc.data, []byte("// GENERATED from "+tc.source+" ")) {
			t.Errorf("%s does not embed the bundle built from %s", name, tc.source)
		}
	}
}
