import { ethers } from "hardhat";
import * as path from "path";

import * as Util from "./utils/utils";
import { hexlify } from "ethers/lib/utils";
import { waitForSubgraphToBeSynced } from "./utils/utils";

// Types
import { ApolloFetch } from "apollo-fetch";
import { NoticeBoard__factory, type NoticeBoard } from "../typechain";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const subgraphName = "rainprotocol/rain-protocol-test";

// Export Factories
export let subgraph: ApolloFetch, noticeboard: NoticeBoard;

// Export signers
export let deployer: SignerWithAddress,
  creator: SignerWithAddress,
  signer1: SignerWithAddress,
  signer2: SignerWithAddress,
  signer3: SignerWithAddress,
  signer4: SignerWithAddress;

before("Deployment contracts and subgraph", async function () {
  const signers = await ethers.getSigners();

  // Signers (to avoid fetch again)
  deployer = signers[0]; // deployer is NOT creator
  creator = signers[1];
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
  const dataMessage = {
    name: "core-dev",
    commit: "this commit",
    contracts: [
      {
        name: "Interpreter",
        address: "0x93b2179a8fBA5C989CeE627eD9f8F3AE9d9C45a0",
      },
      {
        name: "Rainterpreter",
        address: "0x4Ef88F266D03eC2a3e3e1beb1D77cB9c52c93003",
      },
    ],
  };
  const message = JSON.stringify(dataMessage);

  const notice = {
    subject: deployer.address,
    data: hexlify([...Buffer.from(message)]),
  };

  await noticeboard.createNotices([notice]);

  await waitForSubgraphToBeSynced();
});
