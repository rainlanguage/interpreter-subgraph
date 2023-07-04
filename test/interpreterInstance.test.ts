import { expect } from "chai";
import { ethers } from "hardhat";
import { getEventArgs, waitForSubgraphToBeSynced } from "./utils";
import { concat } from "ethers/lib/utils";

import {
  // Subgraph
  subgraph,
  //
  extrospection,
  //
  signer1,
  deployer,
} from "./0_initialization.test";

import {
  rainterpreterDeploy,
  rainterpreterStoreDeploy,
} from "../utils/deploy/interpreter/shared/rainterpreter/deploy";
import { rainterpreterExpressionDeployerDeploy } from "../utils/deploy/interpreter/shared/rainterpreterExpressionDeployer/deploy";
import {
  memoryOperand,
  MemoryType,
  op,
} from "../utils/interpreter/interpreter";
import { Opcode } from "../utils/interpreter/ops";
import { getRainMetaDocumentFromContract } from "../utils/meta";
import { basicDeploy } from "../utils/deploy/basicDeploy";
import { randomUint256 } from "../utils/bytes";

// Types
import type { FetchResult } from "apollo-fetch";
import type { ExpressionAddressEvent } from "../typechain/contracts/interpreter/shared/RainterpreterExpressionDeployer";
import type { OrderBook, ReserveToken18 } from "../typechain";
import type {
  AddOrderEvent,
  DeployerDiscoverableMetaV1ConstructionConfigStruct,
  OrderConfigStruct,
} from "../typechain/contracts/orderbook/OrderBook";
import { encodeMeta } from "../utils/orderBook/order";
import assert from "assert";
import { compareStructs, eighteenZeros, max_uint256 } from "../utils";

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

  it("should create different InterpreterInstances from same bytecodehash", async () => {
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
          interpreterInstances {
            id
          }
        }
      `;

    const response = (await subgraph({
      query,
    })) as FetchResult;

    const data = response.data.interpreterInstances;

    expect(data).to.deep.include({
      id: interpreter_1.address.toLowerCase(),
    });
    expect(data).to.deep.include({
      id: interpreter_2.address.toLowerCase(),
    });
  });

  it("should query the expression in the contract after an use of deployExpression with OB addOrder", async () => {
    const interpreter = await rainterpreterDeploy();
    const store = await rainterpreterStoreDeploy();

    // Deploy the expression deployer to get the event
    const expressionDeployer = await rainterpreterExpressionDeployerDeploy(
      interpreter,
      store
    );

    const config_: DeployerDiscoverableMetaV1ConstructionConfigStruct = {
      meta: getRainMetaDocumentFromContract("orderbook"),
      deployer: expressionDeployer.address,
    };
    const orderBookFactory = await ethers.getContractFactory(
      "OrderBook",
      deployer
    );
    const orderBook = (await orderBookFactory.deploy(config_)) as OrderBook;

    const tokenA = (await basicDeploy("ReserveToken18", {})) as ReserveToken18;
    const tokenB = (await basicDeploy("ReserveToken18", {})) as ReserveToken18;

    const alice = signer1;

    const aliceInputVault = ethers.BigNumber.from(randomUint256());
    const aliceOutputVault = ethers.BigNumber.from(randomUint256());

    // TODO: This is a WRONG encoding meta (FIX: @naneez)
    const aliceOrder = encodeMeta("Order_A");

    // Order_A
    const ratio_A = ethers.BigNumber.from("90" + eighteenZeros);
    const constants_A = [max_uint256, ratio_A];
    const aOpMax = op(
      Opcode.read_memory,
      memoryOperand(MemoryType.Constant, 0)
    );
    const aRatio = op(
      Opcode.read_memory,
      memoryOperand(MemoryType.Constant, 1)
    );
    // prettier-ignore
    const source_A = concat([
      aOpMax,
      aRatio,
    ]);

    const EvaluableConfig_A = {
      deployer: expressionDeployer.address,
      sources: [source_A, []],
      constants: constants_A,
    };

    const orderConfig_A: OrderConfigStruct = {
      validInputs: [
        { token: tokenA.address, decimals: 18, vaultId: aliceInputVault },
      ],
      validOutputs: [
        { token: tokenB.address, decimals: 18, vaultId: aliceOutputVault },
      ],
      evaluableConfig: EvaluableConfig_A,
      meta: aliceOrder,
    };

    const txOrder_A = await orderBook.connect(alice).addOrder(orderConfig_A);

    const {
      sender: sender_A,
      expressionDeployer: ExpressionDeployer_A,
      order: order_A,
    } = (await getEventArgs(
      txOrder_A,
      "AddOrder",
      orderBook
    )) as AddOrderEvent["args"];

    assert(
      ExpressionDeployer_A === EvaluableConfig_A.deployer,
      "wrong expression deployer"
    );
    assert(sender_A === alice.address, "wrong sender");
    compareStructs(order_A, orderConfig_A);

    await waitForSubgraphToBeSynced();

    const { expression } = (await getEventArgs(
      txOrder_A,
      "ExpressionAddress",
      expressionDeployer
    )) as ExpressionAddressEvent["args"];

    const query = `
      {
        interpreterInstance (id: "${interpreter.address.toLowerCase()}") {
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

    expect(data.expressions).to.deep.include({
      id: expression.toLowerCase(),
    });
  });
});
