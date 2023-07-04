import { expect } from "chai";
import {
  waitForSubgraphToBeSynced,
  getDISpairEvent,
  getEventArgs,
} from "./utils";

import {
  // Subgraph
  subgraph,
  deployer,
} from "./0_initialization.test";

// Types
import type { FetchResult } from "apollo-fetch";

import {
  rainterpreterDeploy,
  rainterpreterStoreDeploy,
} from "../utils/deploy/interpreter/shared/rainterpreter/deploy";
import { rainterpreterExpressionDeployerDeploy } from "../utils/deploy/interpreter/shared/rainterpreterExpressionDeployer/deploy";
import { flowCloneFactory } from "../utils/deploy/factory/cloneFactory";
import { CloneFactory, Flow } from "../typechain";

import {
  deployFlowClone,
  flowImplementation,
} from "../utils/deploy/flow/basic/deploy";
import { opMetaHash, standardEvaluableConfig } from "../utils";
import { rainlang } from "../utils/extensions/rainlang";
import { FlowConfig } from "../utils/types/flow";
import { InitializeEvent } from "../typechain/contracts/flow/basic/Flow";

// describe.only("clones checks", async () => {
describe("clones contract tests", async () => {
  it("should not break the subgraph when cloning a contract", async () => {
    // const interpreter = await rainterpreterDeploy();
    // const store = await rainterpreterStoreDeploy();
    // // Deploy the expression deployer to get the event
    // const expressionDeployer = await rainterpreterExpressionDeployerDeploy(
    //   interpreter,
    //   store
    // );
    // console.log(expressionDeployer.address);

    const cloneFactory: CloneFactory = await flowCloneFactory();
    console.log("CloneFActory: ", cloneFactory.address);

    const implementation: Flow = await flowImplementation();
    console.log("Flow imp: ", implementation.address);

    ///

    const { sources: sourceFlowIO, constants: constantsFlowIO } =
      await standardEvaluableConfig(
        rainlang`
      @${opMetaHash}

      /* variables */
      from: context<0 1>(),
      to: context<0 0>(),
      amount: 2,
      seperator: 2,

      /**
       * erc1155 transfers
       */
      transfererc1155slist: seperator,

      /**
       * erc721 transfers
       */
      transfererc721slist: seperator,

      /**
       * er20 transfers
       */
      transfererc20slist: seperator;
    `
      );

    const flowConfig: FlowConfig = {
      flows: [
        {
          sources: sourceFlowIO,
          constants: constantsFlowIO,
        },
        {
          sources: sourceFlowIO,
          constants: constantsFlowIO,
        },
        {
          sources: sourceFlowIO,
          constants: constantsFlowIO,
        },
      ],
    };
    //
    //
    const { flow } = await deployFlowClone(
      deployer,
      cloneFactory,
      implementation,
      flowConfig
    );

    const { sender, config } = (await getEventArgs(
      flow.deployTransaction,
      "Initialize",
      flow
    )) as InitializeEvent["args"];

    //
    console.log("flow: ", flow.address);
    console.log("sender: ", sender);
    console.log(config);

    //
    await waitForSubgraphToBeSynced();
  });
});
