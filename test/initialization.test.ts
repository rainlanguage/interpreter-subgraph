import { ethers, network } from "hardhat";
import * as path from "path";

import * as Util from "./utils/utils";
import { hexlify, keccak256 } from "ethers/lib/utils";
import { waitForSubgraphToBeSynced, DataNotice } from "./utils/utils";

// Types
import { ApolloFetch } from "apollo-fetch";
import {
  NoticeBoard__factory,
  type NoticeBoard,
  type Rainterpreter,
} from "../typechain";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { rainterpreterDeploy } from "../utils/deploy/interpreter/shared/rainterpreter/deploy";
import { rainterpreterExpressionDeployerDeploy } from "../utils/deploy/interpreter/shared/rainterpreterExpressionDeployer/deploy";

const subgraphName = "rainprotocol/rain-protocol-test";

// Export Factories
export let subgraph: ApolloFetch, noticeboard: NoticeBoard;

// Export signers
export let deployer: SignerWithAddress,
  sender: SignerWithAddress,
  signer1: SignerWithAddress,
  signer2: SignerWithAddress,
  signer3: SignerWithAddress,
  signer4: SignerWithAddress;

const getRainterpreter = async () => {
  const interpreter = await rainterpreterDeploy();
  const interpreterFactory = await ethers.getContractFactory("Rainterpreter");

  const bytecodeHash = keccak256(interpreterFactory.bytecode);

  return {
    contract: interpreter,
    name: "Rainterpreter",
    address: interpreter.address,
    bytecodeHash,
  };
};

const getRainterpreterExpressionDeployer = async (
  interpreter_: Rainterpreter
) => {
  const expressionDeployer = await rainterpreterExpressionDeployerDeploy(
    interpreter_
  );
  const deployerFactory = await ethers.getContractFactory(
    "RainterpreterExpressionDeployer"
  );

  const bytecodeHash = keccak256(deployerFactory.bytecode);

  return {
    contract: expressionDeployer,
    name: "RainterpreterExpressionDeployer",
    address: expressionDeployer.address,
    bytecodeHash,
  };
};

before("Deployment contracts and subgraph", async function () {
  const signers = await ethers.getSigners();

  // Signers (to avoid fetch again)
  deployer = signers[0]; // deployer is NOT sender
  sender = signers[1];
  signer1 = signers[2];
  signer2 = signers[3];
  signer3 = signers[4];
  signer4 = signers[5];

  // Deploying StakeFactory contract
  noticeboard = await new NoticeBoard__factory(deployer).deploy();

  // Saving data in JSON
  const pathExampleConfig = path.resolve(__dirname, "../config/example.json");
  const file = Util.fetchFile(pathExampleConfig);
  const config = JSON.parse(file ? file : "{}");

  config.network = "localhost";

  // Saving addresses and individuals blocks to index

  config.NoticeBoard = noticeboard.address;
  config.NoticeBoardBlock = noticeboard.deployTransaction.blockNumber;

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
  const interpreterData = await getRainterpreter();
  const expressionDeployerData = await getRainterpreterExpressionDeployer(
    interpreterData.contract
  );

  const dataMessage: DataNotice = {
    repo: "rainprotocol/rain-protocol",
    commit: "7b950b46031cb7ece8043e5c8dadec528b578501",
    network: network.name,
    contracts: [
      {
        name: interpreterData.name,
        address: interpreterData.address,
        bytecodeHash: interpreterData.bytecodeHash,
      },
      {
        name: expressionDeployerData.name,
        address: expressionDeployerData.address,
        bytecodeHash: expressionDeployerData.bytecodeHash,
      },
    ],
  };
  console.log(dataMessage);

  const message = JSON.stringify(dataMessage);

  const notice = {
    subject: deployer.address,
    data: hexlify([...Buffer.from(message)]),
  };

  await noticeboard.connect(deployer).createNotices([notice]);

  await waitForSubgraphToBeSynced();
});
