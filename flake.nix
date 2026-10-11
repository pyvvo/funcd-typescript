{
  description = "funcd TypeScript shim and examples";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }: let
    supportedSystems = [ "aarch64-darwin" "x86_64-linux" "aarch64-linux" ];
    forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
  in {
    devShells = forAllSystems (system: let
      pkgs = import nixpkgs { inherit system; };
      # node 22 matches the curated runtime image funcd ships the shim in (ADR-0039)
      node = pkgs.nodejs_22;
    in {
      default = pkgs.mkShellNoCC {
        packages = with pkgs; [
          node
          # yarn runs package scripts (the tests too) on the node that runs yarn itself, and nixpkgs builds
          # yarn-berry on its default node
          (yarn-berry.override { nodejs = node; })
          go
          just
          git
          lefthook
          biome
        ];
        # installs the git hooks from lefthook.yml; idempotent
        shellHook = ''
          [ -d .git ] && lefthook install >/dev/null 2>&1 || true
        '';
      };

      # npm 11 (bundled with node 24) for npm trusted publishing; the shim itself stays on node 22
      publish = pkgs.mkShellNoCC {
        packages = [ pkgs.nodejs_24 ];
      };
    });
  };
}
