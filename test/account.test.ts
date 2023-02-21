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

describe("Account entity", async () => {
  it("should query all the fields correctly after a new deploy of an ExpressionDeployer", async () => {
    const interpreter = await rainterpreterDeploy();
    const store = await rainterpreterStoreDeploy();

    // Deploy the expression deployer to get the event
    const expressionDeployer = await rainterpreterExpressionDeployerDeploy(
      interpreter,
      store
    );

    await waitForSubgraphToBeSynced();

    const { sender } = await getDISpairEvent(expressionDeployer);

    const query = `
        {
          account (id: "${sender.toLowerCase()}") {
            id
            events {
              id
            }
            expressions {
              id
            }
          }
          expressionDeployer (id: "${expressionDeployer.address.toLowerCase()}") {
            account {
              id
            }
          }
        }
      `;

    const response = (await subgraph({
      query,
    })) as FetchResult;

    const data = response.data;

    expect(data.account.id).to.be.equal(sender.toLowerCase());
    expect(data.account.events.length).to.be.gte(0);
    expect(data.account.expressions.length).to.be.gte(0);

    expect(data.expressionDeployer.account.id).to.be.equal(
      sender.toLowerCase()
    );
  });

  it("should get expressions that are deployed by an account entity");

  it("should get events that are emited the account entity interacted");
});
