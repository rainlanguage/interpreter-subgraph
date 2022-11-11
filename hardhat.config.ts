import { HardhatUserConfig } from "hardhat/config";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-ethers";
import "hardhat-contract-sizer";
import "@nomiclabs/hardhat-etherscan";
import * as dotenv from 'dotenv' 
dotenv.config()

const config: HardhatUserConfig = {
  typechain: {
    outDir: "typechain", // overrides upstream 'fix' for another issue which changed this to 'typechain-types'
  },
  networks: {
    hardhat: {
      blockGasLimit: 100000000,
      allowUnlimitedContractSize: true,
    }, 
    mumbai: {
      url: `https://rpc-mumbai.maticvigil.com`,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 50,
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
    bail: false,
    parallel: false,
    timeout: 0,
  },
  etherscan : {
    apiKey : process.env.API_KEY
  }
};

export default config;
