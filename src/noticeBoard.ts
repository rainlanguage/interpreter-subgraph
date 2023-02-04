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
import {
  Bytes,
  // log,
  json,
  JSONValueKind,
  JSONValue,
  Address,
} from "@graphprotocol/graph-ts";

const SENDER_TO_LISTEN = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

/**
 * Check if a JSONValue is an object directly
 */
function _isObject(value_: JSONValue): boolean {
  return value_.kind == JSONValueKind.OBJECT;
}

/**
 * Check if a JSONValue is a string directly
 */
function _isString(value_: JSONValue): boolean {
  return value_.kind == JSONValueKind.STRING;
}

/**
 * Check if a JSONValue is an array directly
 */
function _isArray(value_: JSONValue): boolean {
  return value_.kind == JSONValueKind.ARRAY;
}

class ContractData {
  name: string = "";
  address: string = "";
  bytecodeHash: string = "";

  private _valid: boolean;

  constructor(
    nameValue_: JSONValue,
    addressValue_: JSONValue,
    bytecodeHashValue_: JSONValue
  ) {
    if (
      _isString(nameValue_) &&
      _isString(addressValue_) &&
      _isString(bytecodeHashValue_)
    ) {
      this.name = nameValue_.toString();
      this.address = addressValue_.toString();
      this.bytecodeHash = bytecodeHashValue_.toString();

      // All was built correctly. The values types are correct.
      this._valid = true;
    } else {
      // There is a wrong value.
      this._valid = false;
    }
  }

  isValid(): boolean {
    return this._valid == true;
  }
}

class ContractsData {
  data: Array<ContractData> = [];

  private _valid: boolean;

  constructor(value_: JSONValue) {
    this._valid = false;
    if (_isArray(value_)) {
      const contractsArray = value_.toArray();
      const auxContracts: Array<ContractData> = [];

      // Local valid flag
      let validFlag = false;

      for (let i = 0; i < contractsArray.length; i++) {
        const contractValue = contractsArray[i];
        if (_isObject(contractValue)) {
          const contractObj = contractValue.toObject();
          const nameValue = contractObj.get("name");
          const addressValue = contractObj.get("address");
          const bytecodeHashValue = contractObj.get("bytecodeHash");

          if (nameValue && addressValue && bytecodeHashValue) {
            const contractData = new ContractData(
              nameValue,
              addressValue,
              bytecodeHashValue
            );

            if (contractData.isValid()) {
              validFlag = true;
              auxContracts.push(contractData);
            } else {
              // Has an invalid value - Does not iterate more and invalidate the class.
              validFlag = false;
              break;
            }
          }
        }
      }

      this.data = auxContracts;
      this._valid = validFlag;
    }
  }

  isValid(): boolean {
    return this._valid == true;
  }
}

class DeploymentData {
  repo: string = "";
  commit: string = "";
  network: string = "";
  contracts: Array<ContractData> = [];

  private _valid: boolean;

  constructor(
    repoValue_: JSONValue,
    commitValue_: JSONValue,
    networkValue_: JSONValue,
    contractsValue_: JSONValue
  ) {
    // The class is valid until found a bad value
    this._valid = true;
    const contracts = new ContractsData(contractsValue_);

    if (
      _isString(repoValue_) &&
      _isString(commitValue_) &&
      _isString(networkValue_) &&
      contracts.isValid()
    ) {
      this.repo = repoValue_.toString();
      this.commit = commitValue_.toString();
      this.network = networkValue_.toString();

      this.contracts = contracts.data;
    } else {
      // One or more values are not valid
      this._valid = false;
    }
  }

  isValid(): boolean {
    return this._valid == true;
  }
}

/**
 * Decode from a given data of the NoticeBoard and tried to obtain the correct
 * deployment format. If in the data/json atleast one value it was not correctly
 * added, will return null since considered as a invalid source/format.
 */
function getDataFormatted(data_: Bytes): DeploymentData | null {
  // Decode from the data_ bytes to a JSONValue to be handled with the JSON API.
  const value = json.fromBytes(data_);

  if (value.kind == JSONValueKind.OBJECT) {
    const dataNotice = value.toObject();

    const repoValue = dataNotice.get("repo");
    const commitValue = dataNotice.get("commit");
    const networkValue = dataNotice.get("network");
    const contractsValue = dataNotice.get("contracts");

    if (repoValue && commitValue && networkValue && contractsValue) {
      const deploymentData = new DeploymentData(
        repoValue,
        commitValue,
        networkValue,
        contractsValue
      );

      if (deploymentData.isValid()) return deploymentData;
    }
  }

  return null;
}

export function handleNewNotice(event: NewNotice): void {
  // Only listeing an address (fixed/static atm)
  if (SENDER_TO_LISTEN == event.transaction.from.toHex()) {
    const subject = event.params.notice.subject;
    const data = event.params.notice.data;

    const dataInfo = getDataFormatted(data);

    if (dataInfo) {
      //
      dataInfo.contracts.forEach((contract_) => {
        //
        if (contract_.name == "RainterpreterExpressionDeployer") {
          let contract = Rainterpreter.bind(
            Address.fromString(contract_.address)
          );

          // TODO: THIS throw an error since we have null fields into non-nullable field
          let expressionDeployer = new ExpressionDeployer(contract_.address);
          expressionDeployer.save();
        }
      });
    }
  }

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
