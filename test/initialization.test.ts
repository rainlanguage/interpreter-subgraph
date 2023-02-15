import { artifacts, ethers, network } from "hardhat";
import * as path from "path";

import * as Util from "./utils/utils";
import { hexlify, keccak256 } from "ethers/lib/utils";
import { waitForSubgraphToBeSynced, DataNotice } from "./utils/utils";
import { deploy1820 } from "../utils/deploy/registry1820/deploy";

// Types
import { ApolloFetch } from "apollo-fetch";
import { type Extrospection, Extrospection__factory } from "../typechain";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  rainterpreterDeploy,
  rainterpreterStoreDeploy,
} from "../utils/deploy/interpreter/shared/rainterpreter/deploy";
import { rainterpreterExpressionDeployerDeploy } from "../utils/deploy/interpreter/shared/rainterpreterExpressionDeployer/deploy";
import { RainterpreterExpressionDeployerConstructionConfigStruct } from "../typechain/contracts/interpreter/shared/RainterpreterExpressionDeployer";
import { Contract } from "ethers";
import { keylessDeploy } from "./utils/keylessDeploy";

const subgraphName = "rainprotocol/rain-protocol-test";

// Export Factories
export let subgraph: ApolloFetch,
  registry1820: Contract,
  extrospection: Extrospection;

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

  console.log("extrospection: ", extrospection.address);
  console.log(
    "bytecodeHash: ",
    await extrospection.bytecodeHash(registry1820.address)
  );

  // Saving data in JSON
  const pathExampleConfig = path.resolve(__dirname, "../config/example.json");
  const file = Util.fetchFile(pathExampleConfig);
  const config = JSON.parse(file ? file : "{}");

  config.network = "localhost";

  // Saving addresses and individuals blocks to index

  config.ERC1820Registry = registry1820.address;

  config.ERC1820RegistryBlock =
    registry1820.deployTransaction?.blockNumber ?? 0;

  // Write address and block to configuration contracts file
  const pathConfigLocal = path.resolve(__dirname, "../config/localhost.json");
  Util.writeFile(pathConfigLocal, JSON.stringify(config, null, 2));

  // Setting all to localhost to test locally
  const configPath = "config/localhost.json";
  const endpoint = "http://localhost:8020/";
  const ipfsEndpoint = "http://localhost:5001";
  const versionLabel = "test-v2.0.0";

  Util.exec(
    `npm run deploy-subgraph -- --config ${configPath} --subgraphName ${subgraphName} --endpoint ${endpoint} --ipfsEndpoint ${ipfsEndpoint} --versionLabel ${versionLabel}`
  );

  subgraph = Util.fetchSubgraph(subgraphName);

  // Wait for sync
  await waitForSubgraphToBeSynced(1000);
});

it("Initial testing", async () => {
  const interpreter = await rainterpreterDeploy();
  const store = await rainterpreterStoreDeploy();
  const expressionDeployer = await rainterpreterExpressionDeployerDeploy(
    interpreter,
    store
  );

  const interfaceHash = await registry1820.interfaceHash(
    "IExpressionDeployerV1"
  );

  const bytecodeHash = await extrospection.bytecodeHash(
    expressionDeployer.address
  );

  console.log("bytecodeHash: ", bytecodeHash);
  console.log("extrospection: ", extrospection.address);
  console.log("interfaceHash: ", interfaceHash);
  console.log("interpreter: ", interpreter.address);
  console.log("store: ", store.address);
  console.log("expressionDeployer: ", expressionDeployer.address);

  await waitForSubgraphToBeSynced();
});
