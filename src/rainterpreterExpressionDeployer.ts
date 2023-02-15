import {
  DISpair,
  ExpressionAddress,
  NewExpression,
} from "../generated/templates/RainterpreterExpressionDeployerTemplate/RainterpreterExpressionDeployer";
// import {
//   Account,
//   Contract,
//   DeployExpressionEvent,
//   Expression,
//   ExpressionDeployer,
//   Factory,
//   Interpreter,
//   InterpreterInstance,
//   StateConfig,
//   Transaction,
// } from "../generated/schema";
// import { Rainterpreter } from "../generated/RainterpreterExpressionDeployer/Rainterpreter";
// import { decodeSources, getFactory, NEWCHILD_EVENT } from "./utils";
import { log } from "@graphprotocol/graph-ts";

export function handleDISpair(event: DISpair): void {
  //
  log.info(
    `handleDISpair3: interpreter: ${event.params.interpreter.toHex()} - deployer: ${event.params.deployer.toHex()}}`,
    []
  );
}
export function handleExpressionAddress(event: ExpressionAddress): void {
  //
}
export function handleNewExpression(event: NewExpression): void {
  //
}

// export function handleValidInterpreter(event: ValidInterpreter): void {
//   let interpreter = new Interpreter(event.params.interpreter.toHex());
//   interpreter.save();

//   let interpreterInstance = new InterpreterInstance(
//     event.params.interpreter.toHex()
//   );
//   interpreterInstance.interpreter = interpreter.id;
//   interpreterInstance.save();

//   let account = Account.load(event.transaction.from.toHex());
//   if (!account) {
//     account = new Account(event.transaction.from.toHex());
//     account.save();
//   }

//   let contract = Rainterpreter.bind(event.params.interpreter);
//   let expressionDeployer = new ExpressionDeployer(event.address.toHex());
//   expressionDeployer.interpreter = interpreterInstance.id;
//   expressionDeployer.account = account.id;
//   let functionPointers = contract.functionPointers().toHexString();
//   // let pointers: string[] = [];
//   // for(let i=0;i<functionPointers.length;i=i+4){
//   //     pointers.push(functionPointers.slice(i,i+4));
//   // }
//   expressionDeployer.functionPointers = functionPointers;
//   expressionDeployer.save();
// }

// export function handleDeployExpression(event: DeployExpression): void {
//   let factory: Factory;
//   let receipt = event.receipt;
//   if (receipt) {
//     let logs = receipt.logs;
//     if (logs) {
//       for (let i = 0; i < logs.length; i++) {
//         let topics = logs[i].topics;
//         if (topics.length > 0) {
//           if (topics[0].toHexString() == NEWCHILD_EVENT) {
//             factory = getFactory(logs[i].address.toHexString());
//             break;
//           }
//         }
//       }
//     }
//   }

//   let emitter = Account.load(event.transaction.from.toHex());
//   if (!emitter) {
//     emitter = new Account(event.transaction.from.toHex());
//     emitter.save();
//   }

//   let transaction = new Transaction(event.transaction.hash.toHex());
//   transaction.timestamp = event.block.timestamp;
//   transaction.blockNumber = event.block.number;
//   transaction.save();

//   let deployExpressionEvent = new DeployExpressionEvent(
//     event.transaction.hash.toHex()
//   );
//   deployExpressionEvent.transaction = transaction.id;
//   deployExpressionEvent.emitter = emitter.id;
//   deployExpressionEvent.timestamp = event.block.timestamp;

//   let expressionDeployer = ExpressionDeployer.load(event.address.toHex());
//   if (expressionDeployer) {
//     let stateConfig = new StateConfig(event.transaction.hash.toHex());
//     stateConfig.sources = decodeSources("", event.params.config.sources);
//     stateConfig.constants = event.params.config.constants;
//     stateConfig.save();

//     let sender = Contract.load(event.params.sender.toHex());
//     if (!sender) {
//       sender = new Contract(event.params.sender.toHex());
//       if (factory) sender.factory = factory.id;
//       sender.save();
//     }

//     let expression = new Expression(event.params.expressionAddress.toHex());
//     expression.event = deployExpressionEvent.id;
//     expression.account = emitter.id;
//     expression.sender = sender.id;
//     expression.contextScratch = event.params.contextScratch;
//     // if (expressionDeployer.interpreter)
//     //   expression.interpreter = expressionDeployer.interpreter;
//     // if (expressionDeployer.interpreter)
//     //   expression.interpreterInstance = expressionDeployer.interpreter;
//     expression.config = stateConfig.id;
//     expression.save();

//     deployExpressionEvent.expression = expression.id;
//     deployExpressionEvent.save();
//   }
// }
