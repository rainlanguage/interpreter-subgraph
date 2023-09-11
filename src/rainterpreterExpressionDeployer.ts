import {
  DISpair,
  ExpressionAddress,
  NewExpression,
} from "../generated/templates/RainterpreterExpressionDeployerTemplate/RainterpreterExpressionDeployer";
import {
  Contract,
  DeployExpressionEvent,
  Expression,
  InterpreterInstance,
  StateConfig,
  ExpressionDeployer,
} from "../generated/schema";
import { Rainterpreter } from "../generated/templates/RainterpreterExpressionDeployerTemplate/Rainterpreter";
import {
  EXPRESSION_ADDRESS_EVENT,
  ExtrospectionPerNetwork,
  INTERPRETER_CALLER_META_EVENT,
  OPMETA_MAGIC_NUMBER_HEX,
  RAIN_META_DOCUMENT_HEX,
  // decodeSources,
  generateTransaction,
  getAccount,
  getContract,
  getExpressionDeployer,
  getInterpreter,
  getInterpreterInstance,
  getKeccak256FromBytes,
  getRainMetaV1,
  getRainterpreterStore,
  getRainterpreterStoreInstance,
  stringToArrayBuffer,
  // decodeSources,
  // getFactory,
  // NEWCHILD_EVENT,
} from "./utils";

import { InterpreterCallerV1 } from "../generated/templates";
import { JSONValueKind, json, store } from "@graphprotocol/graph-ts";
import { CBORDecoder } from "@rainprotocol/assemblyscript-cbor";
import { ContentMeta } from "./metav1";

export function handleDISpair(event: DISpair): void {
  const extrospection = ExtrospectionPerNetwork.get();
  ////

  const isAllowedInterpreter =
    extrospection.scanOnlyAllowedInterpreterEVMOpcodes(
      event.params.interpreter
    );

  // If not allowed, then should deleted the ExpressionDeployer entity related
  // from the Subgraph store. This because the ExpressionDeployer is naturally
  // connected to his Interpreter and it should be no displayed.
  if (!isAllowedInterpreter) {
    // Loading the deployer to remove from the store
    const deployerToRemove = ExpressionDeployer.load(
      event.params.deployer.toHex()
    );

    if (deployerToRemove) {
      // Getting the Transaction related to the deployer, since should be
      // removed as well.
      const transactionToRemove = deployerToRemove.deployTransaction;
      if (transactionToRemove) {
        // Use the store to remove the Transaction entity
        store.remove("Transaction", transactionToRemove);
      }

      // Use the store to remove the ExpressionDeployer entity
      store.remove("ExpressionDeployer", deployerToRemove.id);
    }

    // Finish the function call;
    return;
  }

  ////
  const interpreterBytecodeHash = extrospection.bytecodeHash(
    event.params.interpreter
  );

  // Interpreter - using the bytecode hash as ID.
  const interpreter = getInterpreter(interpreterBytecodeHash.toHex());

  // ExpressionDeployer - using the address of the ExpressionDeployer as ID.
  const expressionDeployer = getExpressionDeployer(
    event.params.deployer.toHex()
  );

  // InterpreterInstance - using the address of the Interpreter as ID.
  const interpreterInstance = getInterpreterInstance(
    event.params.interpreter.toHex()
  );

  // RainterpreterStore hash - using the address of the RainterpreterStore as ID.
  const rainterpreterBytecodeHash = extrospection.bytecodeHash(
    event.params.store
  );

  // RainterpreterStore - using the bytecode hash of the RainterpreterStore as ID.
  const rainterpreterStore = getRainterpreterStore(
    rainterpreterBytecodeHash.toHex()
  );

  // RainterpreterStoreInstance and his field
  const storeInstance = getRainterpreterStoreInstance(
    event.params.store.toHex()
  );

  // Account - using the address of the sender as ID.
  const account = getAccount(event.transaction.from.toHex());

  const deployerBytecodeHash = extrospection.bytecodeHash(
    event.params.deployer
  );

  // ExpressionDeployer fields
  expressionDeployer.interpreter = interpreterInstance.id;
  expressionDeployer.store = storeInstance.id;
  expressionDeployer.account = account.id;
  expressionDeployer.bytecodeHash = deployerBytecodeHash.toHex();

  expressionDeployer.deployedBytecode = event.transaction.input;

  expressionDeployer.bytecode = extrospection.bytecode(event.params.deployer);

  const rainterpreterContract = Rainterpreter.bind(event.params.interpreter);
  const functionPointers = rainterpreterContract.try_functionPointers();
  if (!functionPointers.reverted) {
    expressionDeployer.functionPointers = functionPointers.value.toHex();
  }

  // InterpreterInstance fields
  interpreterInstance.interpreter = interpreter.id;

  // RainterpreterStoreInstance fields
  storeInstance.store = rainterpreterStore.id;

  interpreter.save();
  interpreterInstance.save();
  rainterpreterStore.save();
  storeInstance.save();

  // Decode meta bytes
  const metaV1 = getRainMetaV1(event.params.opMeta);

  // Converts the emitted target from Bytes to a Hexadecimal value
  let meta = event.params.opMeta.toHex();

  // Decode the meta only if incluse the RainMeta magic number.
  if (meta.includes(RAIN_META_DOCUMENT_HEX)) {
    meta = meta.replace(RAIN_META_DOCUMENT_HEX, "");
    const data = new CBORDecoder(stringToArrayBuffer(meta));
    const res = data.parse();

    const contentArr: ContentMeta[] = [];

    if (res.isSequence) {
      const dataString = res.toString();
      const jsonArr = json.fromString(dataString).toArray();
      for (let i = 0; i < jsonArr.length; i++) {
        const jsonValue = jsonArr[i];

        // if some value is not a JSON/Map, then is not following the RainMeta design.
        // So, return here to avoid assignation.
        if (jsonValue.kind != JSONValueKind.OBJECT) return;

        const jsonContent = jsonValue.toObject();

        // If some content is not valid, then skip it since is bad formed
        if (!ContentMeta.validate(jsonContent)) return;

        const content = new ContentMeta(jsonContent, metaV1.id);
        contentArr.push(content);
      }
    } else if (res.isObj) {
      const dataString = res.toString();
      const jsonObj = json.fromString(dataString).toObject();

      if (!ContentMeta.validate(jsonObj)) return;
      const content = new ContentMeta(jsonObj, metaV1.id);
      contentArr.push(content);
      //
    } else {
      // If the response is NOT a Sequence or an Object, then the meta have an
      // error or it's bad formed.
      // In this case, we skip to continue the decoding and assignation process.
      return;
    }

    for (let i = 0; i < contentArr.length; i++) {
      const metaContent_ = contentArr[i].generate();

      const magicNumber = metaContent_.magicNumber.toHex();
      if (magicNumber == OPMETA_MAGIC_NUMBER_HEX) {
        expressionDeployer.opmeta = metaContent_.payload;
        expressionDeployer.opmetaHash = getKeccak256FromBytes(
          metaContent_.payload
        );
      }
    }
  }

  expressionDeployer.meta = metaV1.id;
  expressionDeployer.save();
}

export function handleNewExpression(event: NewExpression): void {
  const receipt = event.receipt;
  let contract: Contract | null = null;

  // Should be at least one log (the current event is one). This is by safe typed.
  if (receipt && receipt.logs.length > 0) {
    contract = getContract(event.params.sender.toHex());

    // If the sender and tx from are the same, an user interact directly with the ExpressionDeployer.
    // Like deploying the ExpressionDeployer itself. In that case, do not create a Contract entity
    if (event.params.sender.notEqual(event.transaction.from)) {
      // Checking if the transaction hold an INTERPRETER_CALLER_META_EVENT.
      // If the index exist, then the event exist...
      const log_callerMeta_i = receipt.logs.findIndex(
        (log_) => log_.topics[0].toHex() == INTERPRETER_CALLER_META_EVENT
      );

      // And there is a Contract Caller that uses the ExpressionDeployer.
      if (log_callerMeta_i != -1) {
        const log_callerMeta = receipt.logs[log_callerMeta_i];

        // Checking if the contract address was previously added or creating new one.
        contract = getContract(log_callerMeta.address.toHex());
        InterpreterCallerV1.create(log_callerMeta.address);

        const constantsL = event.params.constants.length;
        const minOutputsL = event.params.minOutputs.length;
        const bytecodeL = event.params.bytecode.length;

        // If bytecode, constants and minOutputs length are zero, it consider that a
        // caller contract is touching the deployer.
        if (!bytecodeL && !constantsL && !minOutputsL) {
          if (contract && !contract.initialDeployer) {
            contract.initialDeployer = event.address.toHex();
            contract.save();
          }

          return;
        }
      }
    }

    const log_expressionAddress_i = receipt.logs.findIndex(
      (log_) => log_.topics[0].toHex() == EXPRESSION_ADDRESS_EVENT
    );

    if (log_expressionAddress_i != -1) {
      // Getting entities required
      const transaction = generateTransaction(event);
      const emitter = getAccount(event.transaction.from.toHex());
      const expressionDeployer = getExpressionDeployer(event.address.toHex());

      // Skipping safe typing... (!)
      let interpreterInstance: InterpreterInstance | null = null;
      let interpreterInstanceID = expressionDeployer.interpreter;
      if (interpreterInstanceID) {
        interpreterInstance = getInterpreterInstance(interpreterInstanceID);
      }

      // Creating the deploy expression event since is one time
      const deployExpressionEvent = new DeployExpressionEvent(
        event.transaction.hash.toHex()
      );
      deployExpressionEvent.transaction = transaction.id;
      deployExpressionEvent.emitter = emitter.id;
      deployExpressionEvent.timestamp = event.block.timestamp;

      // Creating StateConfig entitiy
      const stateConfig = new StateConfig(event.transaction.hash.toHex());

      stateConfig.bytecode = event.params.bytecode;
      stateConfig.constants = event.params.constants;
      stateConfig.minOutputs = event.params.minOutputs;
      stateConfig.save();

      // Obtain the log
      const log_expressionAddress = receipt.logs[log_expressionAddress_i];
      const expressionAddress =
        "0x" + log_expressionAddress.data.toHex().slice(90);

      const expression = new Expression(expressionAddress);
      expression.event = deployExpressionEvent.id;

      expression.account = emitter.id;
      expression.config = stateConfig.id;

      if (interpreterInstance) {
        expression.interpreter = interpreterInstance.interpreter;
        expression.interpreterInstance = interpreterInstance.id;
      }

      if (contract) expression.sender = contract.id;

      deployExpressionEvent.expression = expression.id;

      deployExpressionEvent.save();
      expression.save();
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function handleExpressionAddress(event: ExpressionAddress): void {
  //
}
