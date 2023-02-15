import { expect } from "chai";
import { waitForSubgraphToBeSynced } from "./utils";

import {
  // Subgraph
  subgraph,
  //
  extrospection,
} from "./0_initialization.test";

// Types
import type { FetchResult } from "apollo-fetch";

import {
  rainterpreterDeploy,
  rainterpreterStoreDeploy,
} from "../utils/deploy/interpreter/shared/rainterpreter/deploy";
import { rainterpreterExpressionDeployerDeploy } from "../utils/deploy/interpreter/shared/rainterpreterExpressionDeployer/deploy";

describe("InterpreterInstance entity", async () => {
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

  it("should get expressions that are deployed by an interpreter instance");
});
