import { Bytes, Address, dataSource, ethereum } from "@graphprotocol/graph-ts";
import { Extrospection } from "../generated/ERC1820Registry/Extrospection";
import {
  Account,
  Contract,
  ExpressionDeployer,
  Interpreter,
  InterpreterInstance,
  Expression,
  Transaction,
  RainterpreterStore,
  RainterpreterStoreInstance,
} from "../generated/schema";

// IERC1820_REGISTRY.interfaceHash("IExpressionDeployerV1")
export let IERC1820_NAME_IEXPRESSION_DEPLOYER_V1_HASH =
  "0xf10faf5e29ad7057aa6922f7dc34fd1b591620d40c7a7f4443565469f249ec91";

// InterpreterCallerMeta(address sender, bytes meta)
export let INTERPRETER_CALLER_META_EVENT =
  "0x20b33fd5188a57eebbb3ccd67ceef094e73dbda848ba098e82859bf860eb1d7f";

// ExpressionAddress(address sender, address expression)
export let EXPRESSION_ADDRESS_EVENT =
  "0xce6e4a4a7b561c65155990775d2faf8a581292f97859ce67e366fd53686b31f1";

export let NEWCHILD_EVENT =
  "0x7da70c4e5387d7038610b79ca7d304caaef815826e51e67cf247135387a79bce";

export class ExtrospectionPerNetwork {
  static get(): Extrospection {
    const currentNetwork = dataSource.network();
    let address = "";

    // TODO: Implement keyless deploy + CREATE2 opcode to have the same address on all chains
    if (currentNetwork == "mumbai")
      address = "0x95A5aC80025128a220D577D77E400191087a3B83";

    if (currentNetwork == "matic" || currentNetwork == "polygon")
      address = "0x5EBfFD6eF6f588ff69873aa39B2159d646fC32e2";

    if (currentNetwork == "localhost")
      address = "0x5daCf1ad3714D4c4E5314d946C4fa359cE85D2C6";

    return Extrospection.bind(Address.fromString(address));
  }
}

export function decodeSources(
  functionPointers: string,
  sources: Bytes[]
): Bytes[] {
  let tmp = "";
  let decompiledSources: Bytes[] = [];
  functionPointers = functionPointers.substring(2);
  for (let i = 0; i < sources.length; i++) {
    let source = sources[i].toHexString().slice(2);
    //log.warning("Source : {}", [source]);
    for (let j = 0; j < source.length; j += 8) {
      let opcode = source.slice(j, j + 4);
      let operand = source.slice(j + 4, j + 8);
      let index = (functionPointers.indexOf(opcode) / 4)
        .toString(16)
        .padStart(4, "0");

      tmp = tmp + index + operand;
      // log.warning("Opcode : {} , Operand {} ", [
      //   functionPointers.indexOf(opcode).toString(),
      //   operand,
      // ]);
    }
    tmp = "0x" + tmp;
    decompiledSources.push(Bytes.fromHexString(tmp));
    tmp = "";
  }
  return decompiledSources;
}

export function getExpressionDeployer(address_: string): ExpressionDeployer {
  let expressionDeployer = ExpressionDeployer.load(address_);
  if (!expressionDeployer) {
    expressionDeployer = new ExpressionDeployer(address_);
    expressionDeployer.save();
  }

  return expressionDeployer;
}

export function getInterpreter(hash_: string): Interpreter {
  let interpreter = Interpreter.load(hash_);
  if (!interpreter) {
    interpreter = new Interpreter(hash_);
    interpreter.save();
  }

  return interpreter;
}

export function getInterpreterInstance(address_: string): InterpreterInstance {
  let interpreterInstance = InterpreterInstance.load(address_);
  if (!interpreterInstance) {
    interpreterInstance = new InterpreterInstance(address_);
  }

  return interpreterInstance;
}

export function getRainterpreterStore(hash_: string): RainterpreterStore {
  let rainterpreterStore = RainterpreterStore.load(hash_);
  if (!rainterpreterStore) {
    rainterpreterStore = new RainterpreterStore(hash_);
    rainterpreterStore.save();
  }

  return rainterpreterStore;
}

export function getRainterpreterStoreInstance(
  address_: string
): RainterpreterStoreInstance {
  let storeInstance = RainterpreterStoreInstance.load(address_);
  if (!storeInstance) {
    storeInstance = new RainterpreterStoreInstance(address_);
    // storeInstance.save();
  }

  return storeInstance;
}

export function getAccount(address_: string): Account {
  let account = Account.load(address_);
  if (!account) {
    account = new Account(address_);
    account.save();
  }

  return account;
}

export function getContract(address_: string): Contract {
  let contract = Contract.load(address_);
  if (!contract) {
    contract = new Contract(address_);
    const extrospection = ExtrospectionPerNetwork.get();
    const bytecodeHash = extrospection.bytecodeHash(
      Address.fromString(address_)
    );

    contract.bytecodeHash = bytecodeHash.toHexString();

    contract.save();
  }

  return contract;
}

export function getExpression(address_: string): Expression {
  let expression = Expression.load(address_);
  if (!expression) {
    expression = new Expression(address_);
    expression.save();
  }

  return expression;
}

export function generateTransaction(event_: ethereum.Event): Transaction {
  let transaction = Transaction.load(event_.transaction.hash.toHex());
  if (!transaction) {
    transaction = new Transaction(event_.transaction.hash.toHex());
    transaction.timestamp = event_.block.timestamp;
    transaction.blockNumber = event_.block.number;
    transaction.save();
  }

  return transaction;
}
