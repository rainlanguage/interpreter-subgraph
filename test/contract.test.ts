import { ethers } from "hardhat";
import { expect } from "chai";
import {
  waitForSubgraphToBeSynced,
  // getEventArgs,
  eighteenZeros,
} from "./utils";

import {
  // Subgraph
  subgraph,
  // Signers
  deployer,
  signer1,
} from "./0_initialization.test";

import {
  rainterpreterDeploy,
  rainterpreterStoreDeploy,
} from "../utils/deploy/interpreter/shared/rainterpreter/deploy";
import { rainterpreterExpressionDeployerDeploy } from "../utils/deploy/interpreter/shared/rainterpreterExpressionDeployer/deploy";
import { getRainContractMetaBytes } from "../utils/meta";
import { randomUint256 } from "../utils/bytes";
import { max_uint256 } from "../utils/constants";

// Types
import type { FetchResult } from "apollo-fetch";
import type { OrderBook, ReserveToken18 } from "../typechain";
import type { InterpreterCallerV1ConstructionConfigStruct } from "../typechain/contracts/flow/FlowCommon";
import type { InterpreterCallerMetaEvent } from "../typechain/contracts/interpreter/caller/IInterpreterCallerV1";
import { MemoryType, Opcode, memoryOperand, op } from "../utils/interpreter";
import { concat } from "ethers/lib/utils";
import { OrderConfigStruct } from "../typechain/contracts/orderbook/OrderBook";
import { basicDeploy } from "../utils/deploy/basicDeploy";
import { ExpressionAddressEvent } from "../typechain/contracts/interpreter/shared/RainterpreterExpressionDeployer";
import { getEventArgs } from "../utils/events";
import { EvaluableConfigStruct } from "../typechain/contracts/lobby/Lobby";

describe("Contract entity", async () => {
  it("should query the Contract after touch the ExpressionDeployer with OB", async () => {
    const interpreter = await rainterpreterDeploy();
    const store = await rainterpreterStoreDeploy();

    // Deploy the expression deployer to get the event
    const expressionDeployer = await rainterpreterExpressionDeployerDeploy(
      interpreter,
      store
    );

    const config_: InterpreterCallerV1ConstructionConfigStruct = {
      callerMeta: getRainContractMetaBytes("orderbook"),
      deployer: expressionDeployer.address,
    };
    const orderBookFactory = await ethers.getContractFactory(
      "OrderBook",
      deployer
    );
    const orderBook = (await orderBookFactory.deploy(config_)) as OrderBook;

    await waitForSubgraphToBeSynced();

    const { callerMeta } = (await getEventArgs(
      orderBook.deployTransaction,
      "InterpreterCallerMeta",
      orderBook
    )) as InterpreterCallerMetaEvent["args"];

    const query = `
      {
        contract (id: "${orderBook.address.toLowerCase()}") {
          opmeta
          deployTransaction {
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

    const data = response.data.contract;

    expect(data.opmeta).to.be.equal(callerMeta);
    expect(
      data.expressions,
      "The expression when touching the deployer is being added"
    ).to.be.empty;
    expect(data.deployTransaction.id).to.be.equal(
      orderBook.deployTransaction.hash
    );
  });

  it("should query the expression in the contract after an use of deployExpression with OB addOrder", async () => {
    const interpreter = await rainterpreterDeploy();
    const store = await rainterpreterStoreDeploy();

    // Deploy the expression deployer to get the event
    const expressionDeployer = await rainterpreterExpressionDeployerDeploy(
      interpreter,
      store
    );

    const config_: InterpreterCallerV1ConstructionConfigStruct = {
      callerMeta: getRainContractMetaBytes("orderbook"),
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

    const aliceOrder = ethers.utils.toUtf8Bytes("Order_A");

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

    const EvaluableConfig_A: EvaluableConfigStruct = {
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
      data: aliceOrder,
    };

    const txOrder_A = await orderBook.connect(alice).addOrder(orderConfig_A);

    await waitForSubgraphToBeSynced();

    const { callerMeta } = (await getEventArgs(
      orderBook.deployTransaction,
      "InterpreterCallerMeta",
      orderBook
    )) as InterpreterCallerMetaEvent["args"];

    const { expression } = (await getEventArgs(
      txOrder_A,
      "ExpressionAddress",
      expressionDeployer
    )) as ExpressionAddressEvent["args"];

    const query = `
      {
        contract (id: "${orderBook.address.toLowerCase()}") {
          opmeta
          deployTransaction {
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

    const data = response.data.contract;

    expect(data.opmeta).to.be.equal(callerMeta);
    expect(data.deployTransaction.id).to.be.equal(
      orderBook.deployTransaction.hash
    );

    expect(data.expressions).to.deep.include({
      id: expression.toLowerCase(),
    });
  });
});
