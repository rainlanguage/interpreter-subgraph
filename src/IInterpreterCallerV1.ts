import { InterpreterCallerMeta } from "../generated/templates/IInterpreterCallerV1/IInterpreterCallerV1";
import { generateTransaction, getContract } from "./utils";

export function handleInterpreterCallerMeta(
  event: InterpreterCallerMeta
): void {
  const transaction = generateTransaction(event);
  const contract = getContract(event.address.toHex());

  contract.deployTransaction = transaction.id;
  contract.opmeta = event.params.callerMeta.toHex();
  contract.save();
}
