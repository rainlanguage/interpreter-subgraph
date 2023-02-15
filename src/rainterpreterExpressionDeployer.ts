import {
  DISpair,
  ExpressionAddress,
  NewExpression,
} from "../generated/templates/RainterpreterExpressionDeployerTemplate/RainterpreterExpressionDeployer";
import {
  Account,
  // Contract,
  // DeployExpressionEvent,
  // Expression,
  ExpressionDeployer,
  // Factory,
  Interpreter,
  InterpreterInstance,
  // StateConfig,
  // Transaction,
} from "../generated/schema";
import { Rainterpreter } from "../generated/templates/RainterpreterExpressionDeployerTemplate/Rainterpreter";
import {
  ExtrospectionPerNetwork,
  // decodeSources,
  // getFactory,
  // NEWCHILD_EVENT,
} from "./utils";
// import { Address, log } from "@graphprotocol/graph-ts";

function getExpressionDeployer(address_: string): ExpressionDeployer {
  let expressionDeployer = ExpressionDeployer.load(address_);
  if (!expressionDeployer) {
    expressionDeployer = new ExpressionDeployer(address_);
    expressionDeployer.save();
  }

  return expressionDeployer;
}

function getInterpreter(hash_: string): Interpreter {
  let interpreter = Interpreter.load(hash_);
  if (!interpreter) {
    interpreter = new Interpreter(hash_);
    interpreter.save();
  }

  return interpreter;
}

function getInterpreterInstance(address_: string): InterpreterInstance {
  let interpreterInstance = InterpreterInstance.load(address_);
  if (!interpreterInstance) {
    interpreterInstance = new InterpreterInstance(address_);
  }

  return interpreterInstance;
}

function getAccount(address_: string): Account {
  let account = Account.load(address_);
  if (!account) {
    account = new Account(address_);
    account.save();
  }

  return account;
}

export function handleDISpair(event: DISpair): void {
  const extrospection = ExtrospectionPerNetwork.get();
  const bytecodeHash = extrospection.bytecodeHash(event.params.interpreter);

  // Interpreter - using the bytecode hash as ID.
  const interpreter = getInterpreter(bytecodeHash.toHex());

  // ExpressionDeployer - using the address of the ExpressionDeployer as ID.
  const expressionDeployer = getExpressionDeployer(
    event.params.deployer.toHex()
  );

  // InterpreterInstance - using the address of the Interpreter as ID.
  const interpreterInstance = getInterpreterInstance(
    event.params.interpreter.toHex()
  );

  // Account - using the address of the sender as ID.
  const account = getAccount(event.transaction.from.toHex());

  // ExpressionDeployer fields
  expressionDeployer.interpreter = interpreterInstance.id;
  expressionDeployer.account = account.id;
  expressionDeployer.opmeta = event.params.opMeta.toHex();

  const rainterpreterContract = Rainterpreter.bind(event.params.interpreter);
  const functionPointers = rainterpreterContract.try_functionPointers();
  if (!functionPointers.reverted) {
    expressionDeployer.functionPointers = functionPointers.value.toHex();
  }

  // InterpreterInstance fields
  interpreterInstance.interpreter = interpreter.id;

  interpreter.save();
  interpreterInstance.save();
  expressionDeployer.save();
}

export function handleExpressionAddress(event: ExpressionAddress): void {
  //
}

export function handleNewExpression(event: NewExpression): void {
  //
}
