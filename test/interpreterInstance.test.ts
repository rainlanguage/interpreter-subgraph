import { expect } from "chai";
import { waitForSubgraphToBeSynced } from "./utils";
import { concat } from "ethers/lib/utils";

import {
  // Subgraph
  subgraph,
  //
  extrospection,
  flowFactory,
  //
  signer1,
} from "./0_initialization.test";

// Types
import type { FetchResult } from "apollo-fetch";

import {
  rainterpreterDeploy,
  rainterpreterStoreDeploy,
} from "../utils/deploy/interpreter/shared/rainterpreter/deploy";
import { rainterpreterExpressionDeployerDeploy } from "../utils/deploy/interpreter/shared/rainterpreterExpressionDeployer/deploy";
import { flowDeploy } from "../utils/deploy/flow/basic/deploy";

import { RAIN_FLOW_SENTINEL } from "../utils/constants/sentinel";
import {
  memoryOperand,
  MemoryType,
  op,
} from "../utils/interpreter/interpreter";
import { Opcode } from "../utils/interpreter/ops";
import { FlowConfig } from "../utils/types/flow";

describe.only("InterpreterInstance entity", async () => {
  it("should query all the fields correctly after a new deploy of an ExpressionDeployer", async () => {
    const interpreter = await rainterpreterDeploy();
    const store = await rainterpreterStoreDeploy();

    // Deploy the expression deployer to get the event
    await rainterpreterExpressionDeployerDeploy(interpreter, store);

    await waitForSubgraphToBeSynced();

    const interpreterBytecodeHash = await extrospection.bytecodeHash(
      interpreter.address
    );

    const query = `
        {
          interpreterInstance (id: "${interpreter.address.toLowerCase()}") {
            interpreter {
              id
            }
            expressions {
              id
            }
          }
        }
      `;

    const response = (await subgraph({
      query,
    })) as FetchResult;

    const data = response.data.interpreterInstance;

    expect(data.interpreter.id).to.be.equal(interpreterBytecodeHash);
    expect(
      data.expressions,
      "There are no expressions deployed at this point with this instance"
    ).to.be.empty;
  });

  it("should create different InterpreterInstances from same input");

  it.only("should get expressions that are deployed by an interpreter instance", async () => {
    const interpreter = await rainterpreterDeploy();
    const store = await rainterpreterStoreDeploy();

    // Deploy the expression deployer to get the event
    await rainterpreterExpressionDeployerDeploy(interpreter, store);

    await waitForSubgraphToBeSynced();

    const interpreterBytecodeHash = await extrospection.bytecodeHash(
      interpreter.address
    );

    const constants = [RAIN_FLOW_SENTINEL, 1];

    const SENTINEL = () =>
      op(Opcode.read_memory, memoryOperand(MemoryType.Constant, 0));

    const sourceFlowIO = concat([
      SENTINEL(), // ERC1155 SKIP
      SENTINEL(), // ERC721 SKIP
      SENTINEL(), // ERC20 SKIP
      SENTINEL(), // NATIVE END
    ]);

    const flowConfigStruct: FlowConfig = {
      flows: [{ sources: [sourceFlowIO], constants }],
    };

    const _flow = await flowDeploy(signer1, flowFactory, flowConfigStruct);

    console.log(_flow.flow.address);
    console.log(flowFactory.address);

    const query = `
        {
          interpreter (id: "${interpreterBytecodeHash.toLowerCase()}") {
            instances {
              id
            }
          }
        }
      `;

    const response = (await subgraph({
      query,
    })) as FetchResult;

    const data = response.data.interpreter;
  });
});
