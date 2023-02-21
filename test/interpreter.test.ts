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

  it("should query same Interpreter with different InterpreterInstances from same bytecodehash", async () => {
    // First instance
    const interpreter_1 = await rainterpreterDeploy();
    const store_1 = await rainterpreterStoreDeploy();
    await rainterpreterExpressionDeployerDeploy(interpreter_1, store_1);

    // Second instance
    const interpreter_2 = await rainterpreterDeploy();
    const store_2 = await rainterpreterStoreDeploy();
    await rainterpreterExpressionDeployerDeploy(interpreter_2, store_2);

    const interpreterBytecodeHash_1 = await extrospection.bytecodeHash(
      interpreter_1.address
    );

    const interpreterBytecodeHash_2 = await extrospection.bytecodeHash(
      interpreter_2.address
    );

    expect(interpreterBytecodeHash_1).to.be.equal(interpreterBytecodeHash_2);

    await waitForSubgraphToBeSynced();

    const query = `
        {
          interpreter (id: "${interpreterBytecodeHash_1.toLowerCase()}") {
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
      id: interpreter_1.address.toLowerCase(),
    });
    expect(data.instances).to.deep.include({
      id: interpreter_2.address.toLowerCase(),
    });
  });

  it("should get expressions that are deployed by an interpreter");
});
