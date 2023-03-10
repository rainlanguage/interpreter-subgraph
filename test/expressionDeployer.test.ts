import { expect } from "chai";
import { waitForSubgraphToBeSynced, getDISpairEvent } from "./utils";

import {
  // Subgraph
  subgraph,
} from "./0_initialization.test";

// Types
import type { FetchResult } from "apollo-fetch";

import {
  rainterpreterDeploy,
  rainterpreterStoreDeploy,
} from "../utils/deploy/interpreter/shared/rainterpreter/deploy";
import { rainterpreterExpressionDeployerDeploy } from "../utils/deploy/interpreter/shared/rainterpreterExpressionDeployer/deploy";

describe("ExpressionDeployer entity", async () => {
  it("should query all the fields correctly after a new deploy of an ExpressionDeployer ", async () => {
    const interpreter = await rainterpreterDeploy();
    const store = await rainterpreterStoreDeploy();
    const expressionDeployer = await rainterpreterExpressionDeployerDeploy(
      interpreter,
      store
    );
    await waitForSubgraphToBeSynced();

    const { sender, opMeta } = await getDISpairEvent(expressionDeployer);
    const functionPointers = await interpreter.functionPointers();

    const query = `
        {
          expressionDeployer (id: "${expressionDeployer.address.toLowerCase()}") {
            interpreter {
              id
            }
            account {
              id
            }
            store {
              id
            }
            functionPointers
            meta
          }
        }
      `;

    const response = (await subgraph({
      query,
    })) as FetchResult;

    const data = response.data.expressionDeployer;

    expect(data.interpreter.id).to.be.equal(interpreter.address.toLowerCase());
    expect(data.store.id).to.be.equal(store.address.toLowerCase());
    expect(data.account.id).to.be.equal(sender.toLowerCase());
    expect(data.functionPointers).to.be.equal(functionPointers);
    expect(data.meta).to.be.equal(opMeta);
  });
});
