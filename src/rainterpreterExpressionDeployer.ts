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
} from "../generated/schema";
import { Rainterpreter } from "../generated/templates/RainterpreterExpressionDeployerTemplate/Rainterpreter";
import {
  EXPRESSION_ADDRESS_EVENT,
  ExtrospectionPerNetwork,
  INTERPRETER_CALLER_META_EVENT,
  decodeSources,
  generateTransaction,
  getAccount,
  getContract,
  getExpressionDeployer,
  getInterpreter,
  getInterpreterInstance,
  getRainterpreterStore,
  getRainterpreterStoreInstance,
  // decodeSources,
  // getFactory,
  // NEWCHILD_EVENT,
} from "./utils";

import { InterpreterCallerV1 } from "../generated/templates";

export function handleDISpair(event: DISpair): void {
  const extrospection = ExtrospectionPerNetwork.get();
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
  expressionDeployer.meta = event.params.opMeta.toHex();
  expressionDeployer.bytecodeHash = deployerBytecodeHash.toHex();

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
  expressionDeployer.save();
  rainterpreterStore.save();
  storeInstance.save();
}

export function handleNewExpression(event: NewExpression): void {
  const receipt = event.receipt;
  let contract: Contract | null = null;

  // Should be at least one log (the current event is one). This is by safe typed.
  if (receipt && receipt.logs.length > 0) {
    contract = getContract(event.params.sender.toHex());

    // If the sender and tx from are the same, an user interact directly with the ExpressionDeployer.
    // In that case, do not create a Contract entity
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

        const sourcesL = event.params.sources.length;
        const minOutputsL = event.params.minOutputs.length;

        // If sources and minOutputsL are empty. do not create the Expressio Entity
        if (!sourcesL && !minOutputsL) return;
      }
    }

    // TODO: ADD EXPRESSION (ONLY IF sources and output are filled)
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
      const fnPointer = expressionDeployer.functionPointers;
      stateConfig.constants = event.params.constants;
      if (fnPointer) {
        stateConfig.sources = decodeSources(fnPointer, event.params.sources);
      }
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

export function handleExpressionAddress(event: ExpressionAddress): void {
  //
}
