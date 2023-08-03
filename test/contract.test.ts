import assert from "assert";
import { ethers } from "hardhat";
import { expect } from "chai";
import { waitForSubgraphToBeSynced } from "./utils";

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
import { getRainMetaDocumentFromContract } from "../utils/meta";
import { randomUint256 } from "../utils/bytes";
import { eighteenZeros, max_uint256 } from "../utils/constants";
import { encodeMeta } from "../utils/orderBook/order";
import { compareStructs } from "../utils";

// Types
import type { FetchResult } from "apollo-fetch";
import type { OrderBook, ReserveToken18 } from "../typechain";
import { MemoryType, Opcode, memoryOperand, op } from "../utils/interpreter";
import { concat } from "ethers/lib/utils";
import {
  AddOrderEvent,
  DeployerDiscoverableMetaV1ConstructionConfigStruct,
  MetaV1Event,
  OrderConfigStruct,
} from "../typechain/contracts/orderbook/OrderBook";
import { basicDeploy } from "../utils/deploy/basicDeploy";
import { ExpressionAddressEvent } from "../typechain/contracts/interpreter/shared/RainterpreterExpressionDeployer";
import { getEventArgs } from "../utils/events";

describe("Contract entity", async () => {
  it("should query the Contract after touch the ExpressionDeployer with OB", async () => {
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

    await waitForSubgraphToBeSynced();

    const { meta } = (await getEventArgs(
      orderBook.deployTransaction,
      "MetaV1",
      orderBook
    )) as MetaV1Event["args"];

    const metaV1_ID = ethers.utils.keccak256(meta);

    const query = `
      {
        contract (id: "${orderBook.address.toLowerCase()}") {
          meta {
            id
          }
          deployTransaction {
            id
          }
          expressions {
            id
          }
          initialDeployer {
            id
          }
        }
      }
    `;

    const response = (await subgraph({
      query,
    })) as FetchResult;

    const data = response.data.contract;

    expect(data.meta.id).to.be.equal(metaV1_ID);
    expect(
      data.expressions,
      "The expression when touching the deployer is being added"
    ).to.be.empty;
    expect(data.deployTransaction.id).to.be.equal(
      orderBook.deployTransaction.hash
    );
    expect(data.initialDeployer.id).to.be.equal(
      expressionDeployer.address.toLowerCase()
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
    // Arbitrary encode method
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
    assert(
      expressionDeployer.address === EvaluableConfig_A.deployer,
      "wrong expression deployer"
    );

    assert(sender_A === alice.address, "wrong sender");
    compareStructs(order_A, orderConfig_A);

    await waitForSubgraphToBeSynced();

    const { meta } = (await getEventArgs(
      orderBook.deployTransaction,
      "MetaV1",
      orderBook
    )) as MetaV1Event["args"];

    const { expression } = (await getEventArgs(
      txOrder_A,
      "ExpressionAddress",
      expressionDeployer
    )) as ExpressionAddressEvent["args"];

    const metaV1_ID = ethers.utils.keccak256(meta);

    const query = `
      {
        contract (id: "${orderBook.address.toLowerCase()}") {
          meta {
            id
          }
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

    expect(data.meta.id).to.be.equal(metaV1_ID);
    expect(data.deployTransaction.id).to.be.equal(
      orderBook.deployTransaction.hash
    );

    expect(data.expressions).to.deep.include({
      id: expression.toLowerCase(),
    });
  });

  it("should not crash using bad designed/encoded meta bytes", async () => {
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
    // Aribitrary wrong encoded
    const aliceOrder = "0xFF0A89C674EE78746F726465725F61";

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
    assert(
      expressionDeployer.address === EvaluableConfig_A.deployer,
      "wrong expression deployer"
    );

    assert(sender_A === alice.address, "wrong sender");
    compareStructs(order_A, orderConfig_A);

    await waitForSubgraphToBeSynced();

    const { meta } = (await getEventArgs(
      orderBook.deployTransaction,
      "MetaV1",
      orderBook
    )) as MetaV1Event["args"];

    const { expression } = (await getEventArgs(
      txOrder_A,
      "ExpressionAddress",
      expressionDeployer
    )) as ExpressionAddressEvent["args"];

    const metaV1_ID = ethers.utils.keccak256(meta);

    const query = `
      {
        contract (id: "${orderBook.address.toLowerCase()}") {
          meta {
            id
          }
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

    expect(data.meta.id).to.be.equal(metaV1_ID);
    expect(data.deployTransaction.id).to.be.equal(
      orderBook.deployTransaction.hash
    );

    expect(data.expressions).to.deep.include({
      id: expression.toLowerCase(),
    });
  });
});
