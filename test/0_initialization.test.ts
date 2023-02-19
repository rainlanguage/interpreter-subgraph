import { ethers } from "hardhat";
import * as path from "path";
import { ApolloFetch } from "apollo-fetch";

import {
  exec,
  writeFile,
  fetchFile,
  keylessDeploy,
  fetchSubgraph,
  waitForSubgraphToBeSynced,
} from "./utils";
import { flowFactoryDeploy } from "../utils/deploy/flow/basic/flowFactory/deploy";
import { deploy1820 } from "../utils/deploy/registry1820/deploy";

// Types
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import type { Contract } from "ethers";
import type { Extrospection, FlowFactory } from "../typechain";

const subgraphName = "rainprotocol/interpreter-registry-test";

// Export the Subgraph Fetch
export let subgraph: ApolloFetch;

// Export Contract
export let registry1820: Contract,
  extrospection: Extrospection,
  flowFactory: FlowFactory;

// Export signers
export let deployer: SignerWithAddress,
  sender: SignerWithAddress,
  signer1: SignerWithAddress,
  signer2: SignerWithAddress,
  signer3: SignerWithAddress,
  signer4: SignerWithAddress;

before("Deployment contracts and subgraph", async function () {
  const signers = await ethers.getSigners();

  // Signers (to avoid fetch again)
  deployer = signers[0]; // deployer is NOT sender
  sender = signers[1];
  signer1 = signers[2];
  signer2 = signers[3];
  signer3 = signers[4];
  signer4 = signers[5];

  // Deploying Registry1820 contract
  registry1820 = await deploy1820(deployer);
  extrospection = (await keylessDeploy(
    "Extrospection",
    deployer
  )) as Extrospection;

  flowFactory = await flowFactoryDeploy();

  // Saving data in JSON
  const pathExampleConfig = path.resolve(__dirname, "../config/example.json");
  const file = fetchFile(pathExampleConfig);
  const config = JSON.parse(file ? file : "{}");

  config.network = "localhost";

  // Saving addresses and individuals blocks to index

  config.ERC1820Registry = registry1820.address;

  config.ERC1820RegistryBlock =
    registry1820.deployTransaction?.blockNumber ?? 0;

  // Write address and block to configuration contracts file
  const pathConfigLocal = path.resolve(__dirname, "../config/localhost.json");
  writeFile(pathConfigLocal, JSON.stringify(config, null, 2));

  // Setting all to localhost to test locally
  const configPath = "config/localhost.json";
  const endpoint = "http://localhost:8020/";
  const ipfsEndpoint = "http://localhost:5001";
  const versionLabel = "test-v2.0.0";

  exec(
    `npm run deploy-subgraph -- --config ${configPath} --subgraphName ${subgraphName} --endpoint ${endpoint} --ipfsEndpoint ${ipfsEndpoint} --versionLabel ${versionLabel}`
  );

  subgraph = fetchSubgraph(subgraphName);

  // Wait for sync
  await waitForSubgraphToBeSynced(1000);
});
