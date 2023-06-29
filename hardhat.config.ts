import type { HardhatUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-waffle";

import * as dotenv from "dotenv";
dotenv.config();

const MOCHA_TESTS_PATH = process.env.TESTS_PATH || "./test";
const MOCHA_SHOULD_BAIL = process.env.BAIL === "true";

function createLocalhostConfig() {
  const url = "http://localhost:8545";
  const mnemonic =
    "test test test test test test test test test test test junk";
  return {
    accounts: {
      count: 10,
      initialIndex: 0,
      mnemonic,
      path: "m/44'/60'/0'/0",
    },
    url,
  };
}

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      blockGasLimit: 100000000,
      allowUnlimitedContractSize: true,
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: process.env["DEPLOYMENT_KEY_MUMBAI"]
        ? [process.env["DEPLOYMENT_KEY_MUMBAI"]]
        : [],
    },
    localhost: createLocalhostConfig(),
  },
  defaultNetwork: "localhost",
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000000,
            details: {
              peephole: true,
              inliner: true,
              jumpdestRemover: true,
              orderLiterals: true,
              deduplicate: true,
              cse: true,
              constantOptimizer: true,
            },
          },
          evmVersion: "london",
          // viaIR: true,
          metadata: {
            useLiteralContent: true,
          },
        },
      },
    ],
  },
  mocha: {
    // explicit test configuration, just in case
    asyncOnly: true,
    bail: MOCHA_SHOULD_BAIL,
    parallel: false,
    timeout: 0,
  },
  paths: {
    tests: MOCHA_TESTS_PATH,
  },
};
export default config;
