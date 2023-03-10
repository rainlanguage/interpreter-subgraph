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

describe("RainterpreterStore entity", async () => {
  it("should query all the fields correctly after a new deploy of an RainterpreterStore", async () => {
    const interpreter = await rainterpreterDeploy();
    const store = await rainterpreterStoreDeploy();

    // Deploy the expression deployer to get the event
    const expressionDeployer = await rainterpreterExpressionDeployerDeploy(
      interpreter,
      store
    );

    const storeBytecodeHash = await extrospection.bytecodeHash(store.address);

    await waitForSubgraphToBeSynced();

    const query = `
      {
        rainterpreterStore (id: "${store.address.toLowerCase()}") {
          bytecodeHash
          deployers {
            id
          }
        }
      }
    `;

    const response = (await subgraph({
      query,
    })) as FetchResult;

    const data = response.data.rainterpreterStore;

    expect(data.bytecodeHash).to.be.equal(storeBytecodeHash);
    expect(data.deployers).to.deep.include({
      id: expressionDeployer.address.toLowerCase(),
    });
  });
});
