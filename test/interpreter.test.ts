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

describe("Interpreter entity", async () => {
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

    expect(data.instances).to.deep.include({
      id: interpreter.address.toLowerCase(),
    });
  });

  it(
    "should query different InterpreterInstances from same input within the Interpreter"
  );

  it("should get expressions that are deployed by an interpreter");
});
