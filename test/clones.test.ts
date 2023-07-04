import { expect } from "chai";
import { waitForSubgraphToBeSynced } from "./utils";
import {
  // Subgraph
  subgraph,
  deployer,
  extrospection,
} from "./0_initialization.test";

import { flowCloneFactory } from "../utils/deploy/factory/cloneFactory";
import {
  deployFlowClone,
  flowImplementation,
} from "../utils/deploy/flow/basic/deploy";
import { opMetaHash, standardEvaluableConfig } from "../utils";
import { rainlang } from "../utils/extensions/rainlang";

// Types
import type { FetchResult } from "apollo-fetch";
import type { CloneFactory, Flow } from "../typechain";
import type { FlowConfig } from "../utils/types/flow";

// describe.only("clones checks", async () => {
describe.only("Clones/proxies contract tests", async () => {
  it("should generate the contract entity from a proxy contract using a DISpair", async () => {
    const cloneFactory: CloneFactory = await flowCloneFactory();

    const implementation: Flow = await flowImplementation();
    const implementationHash = await extrospection.bytecodeHash(
      implementation.address
    );

    // Checking the implementation
    await waitForSubgraphToBeSynced();

    const query_0 = `
      {
        contract (id: "${implementation.address.toLowerCase()}") {
          bytecodeHash
          type
          implementation {
            id
          }
        }
      }
    `;

    const response_0 = (await subgraph({
      query: query_0,
    })) as FetchResult;

    const data_0 = response_0.data.contract;

    expect(data_0.bytecodeHash).to.be.equal(implementationHash);
    expect(data_0.type).to.be.equal("contract");
    expect(data_0.implementation).to.be.null;

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

    const flowHash = await extrospection.bytecodeHash(flow.address);

    // Checking the proxy
    await waitForSubgraphToBeSynced();

    const query_1 = `
    {
      contract (id: "${flow.address.toLowerCase()}") {
        bytecodeHash
        type
        implementation {
          id
        }
      }
    }
  `;

    const response_1 = (await subgraph({
      query: query_1,
    })) as FetchResult;

    const data_1 = response_1.data.contract;

    expect(data_1.bytecodeHash).to.be.equal(flowHash);
    expect(data_1.type).to.be.equal("proxy");
    expect(data_1.implementation.id).to.be.equal(
      implementation.address.toLowerCase()
    );
  });
});
