import { NewNotice } from "../generated/NoticeBoard/NoticeBoard";
import {
  Account,
  Contract,
  DeployExpressionEvent,
  Expression,
  ExpressionDeployer,
  Factory,
  Interpreter,
  InterpreterInstance,
  StateConfig,
  Transaction,
} from "../generated/schema";
import { Rainterpreter } from "../generated/RainterpreterExpressionDeployer/Rainterpreter";
import { decodeSources, getFactory, NEWCHILD_EVENT } from "./utils";
import { Bytes, log, json, JSONValueKind } from "@graphprotocol/graph-ts";

export function handleNewNotice(event: NewNotice): void {
  const data = event.params.notice.data;
  const value = json.fromBytes(data);
  if (value.kind == JSONValueKind.NULL) {
    log.info(`it is an NULL`, []);
  }
  if (value.kind == JSONValueKind.BOOL) {
    log.info(`it is a BOOL`, []);
  }
  if (value.kind == JSONValueKind.NUMBER) {
    log.info(`it is a NUMBER`, []);
  }
  if (value.kind == JSONValueKind.ARRAY) {
    log.info(`it is a ARRAY`, []);
  }
  if (value.kind == JSONValueKind.STRING) {
    log.info(`it is a STRING`, []);
  }
  if (value.kind == JSONValueKind.OBJECT) {
    log.info(`CODE_55: it is a OBJECT`, []);
    const myObject = value.toObject();
    const name = myObject.get("contracts");

    if (name) {
      const myContracts = name.toArray();
      log.info(`CODE_55 length: ${myContracts.length}`, []);
    } else {
      log.info(`CODE_55: Name not found`, []);
    }
  }
  // const a = data.
  // const dataMessage = {
  //   name: "core-dev",
  //   commit: "this commit",
  //   contracts: [
  //     { name: "Interpreter", address: "0xabcd" },
  //     { name: "Rainterpreter", address: "0xefgh" },
  //   ],
  // };
  // const message = JSON.stringify(dataMessage);
  // const a = JSON.parse(data.toString());
  log.info(`OKAS_3 - data length: ${data.length}`, []);
  // let interpreter = new Interpreter(event.params.interpreter.toHex());
  // interpreter.save();
  // let interpreterInstance = new InterpreterInstance(
  //   event.params.interpreter.toHex()
  // );
  // interpreterInstance.interpreter = interpreter.id;
  // interpreterInstance.save();
  // let account = Account.load(event.transaction.from.toHex());
  // if (!account) {
  //   account = new Account(event.transaction.from.toHex());
  //   account.save();
  // }
  // let contract = Rainterpreter.bind(event.params.interpreter);
  // let expressionDeployer = new ExpressionDeployer(event.address.toHex());
  // expressionDeployer.interpreter = interpreterInstance.id;
  // expressionDeployer.account = account.id;
  // let functionPointers = contract.functionPointers().toHexString();
  // // let pointers: string[] = [];
  // // for(let i=0;i<functionPointers.length;i=i+4){
  // //     pointers.push(functionPointers.slice(i,i+4));
  // // }
  // expressionDeployer.functionPointers = functionPointers;
  // expressionDeployer.save();
}
