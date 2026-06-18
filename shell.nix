let
  pkgs = import (fetchTarball("https://github.com/NixOS/nixpkgs/archive/refs/tags/26.05.tar.gz")) {};
in pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs_26
  ];
}
