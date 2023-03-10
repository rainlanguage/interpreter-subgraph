import { expect } from "chai";
import { waitForSubgraphToBeSynced } from "./utils";

import {
  // Subgraph
  subgraph,
  //
  extrospection,
} from "./0_initialization.test";

import {
  rainterpreterDeploy,
  rainterpreterStoreDeploy,
} from "../utils/deploy/interpreter/shared/rainterpreter/deploy";
import { rainterpreterExpressionDeployerDeploy } from "../utils/deploy/interpreter/shared/rainterpreterExpressionDeployer/deploy";

// Types
import type { FetchResult } from "apollo-fetch";

describe("RainterpreterStoreInstance entity", async () => {
  it("should query all the fields correctly after a new deploy of an RainterpreterStoreInstance", async () => {
    const interpreter = await rainterpreterDeploy();
    const store = await rainterpreterStoreDeploy();

    // Deploy the expression deployer to get the event
    const deployer = await rainterpreterExpressionDeployerDeploy(
      interpreter,
      store
    );

    await waitForSubgraphToBeSynced();

    const storeBytecodeHash = await extrospection.bytecodeHash(store.address);

    const query = `
        {
          rainterpreterStoreInstance (id: "${store.address.toLowerCase()}") {
            store {
              id
            }
            deployers {
              id
            }
          }
        }
      `;

    const response = (await subgraph({
      query,
    })) as FetchResult;

    const data = response.data.rainterpreterStoreInstance;

    expect(data.store.id).to.be.equal(storeBytecodeHash.toLowerCase());
    expect(data.deployers).to.deep.include({
      id: deployer.address.toLowerCase(),
    });
  });

  it("should create different RainterpreterStoreInstances from same bytecodehash", async () => {
    // First instance
    const interpreter_1 = await rainterpreterDeploy();
    const store_1 = await rainterpreterStoreDeploy();
    await rainterpreterExpressionDeployerDeploy(interpreter_1, store_1);

    // Second instance
    const interpreter_2 = await rainterpreterDeploy();
    const store_2 = await rainterpreterStoreDeploy();
    await rainterpreterExpressionDeployerDeploy(interpreter_2, store_2);

    await waitForSubgraphToBeSynced();

    const query = `
        {
          rainterpreterStoreInstances {
            id
          }
        }
      `;

    const response = (await subgraph({
      query,
    })) as FetchResult;

    const data = response.data.rainterpreterStoreInstances;

    expect(data).to.deep.include({
      id: store_1.address.toLowerCase(),
    });
    expect(data).to.deep.include({
      id: store_2.address.toLowerCase(),
    });
  });
});
