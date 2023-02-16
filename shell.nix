let
  pkgs = import
    (builtins.fetchTarball {
      name = "nixos-unstable-2021-10-01";
      url = "https://github.com/nixos/nixpkgs/archive/d3d2c44a26b693293e8c79da0c3e3227fc212882.tar.gz";
      sha256 = "0vi4r7sxzfdaxzlhpmdkvkn3fjg533fcwsy3yrcj5fiyqip2p3kl";
    })
    { };

  command = pkgs.writeShellScriptBin "command" ''
  '';

  hardhat-node = pkgs.writeShellScriptBin "hardhat-node" ''
    npx hardhat node
  '';

  graph-node = pkgs.writeShellScriptBin "graph-node" ''
    npm run graph-node
  '';

  graph-node-up = pkgs.writeShellScriptBin "graph-node-up" ''
    npm run graph-node-up
  '';

  graph-node-down = pkgs.writeShellScriptBin "graph-node-down" ''
    npm run graph-node-down
  '';

  graph-test = pkgs.writeShellScriptBin "graph-test" ''
    npx hardhat test
  '';

  deploy-subgraph = pkgs.writeShellScriptBin "deploy-subgraph" ''
    ts-node scripts/index.ts
  '';

  init = pkgs.writeShellScriptBin "init" ''
    mkdir -p contracts && cp -r node_modules/@rainprotocol/rain-protocol/contracts .
    mkdir -p utils && cp -r node_modules/@rainprotocol/rain-protocol/utils .
    cp -r node_modules/@rainprotocol/rain-protocol/utils .
    npx hardhat compile
  '';
  
in
pkgs.stdenv.mkDerivation {
 name = "shell";
 buildInputs = [
  pkgs.nodejs-16_x
  pkgs.jq
  command
  hardhat-node
  graph-node
  graph-node-up
  graph-node-down
  graph-test
  deploy-subgraph
  init
 ];

 shellHook = ''
  export PATH=$( npm bin ):$PATH
  # keep it fresh
  npm install --verbose --fetch-timeout 3000000
  init
 '';
}