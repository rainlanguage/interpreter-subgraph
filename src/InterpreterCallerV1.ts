import { Meta } from "../generated/templates/InterpreterCallerV1/InterpreterCallerV1";
import { generateTransaction, getContract } from "./utils";

export function handleMeta(event: Meta): void {
  const transaction = generateTransaction(event);
  const contract = getContract(event.address.toHex());

  contract.deployTransaction = transaction.id;
  contract.meta = event.params.meta.toHex();
  contract.save();
}
