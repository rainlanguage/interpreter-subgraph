import { Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { Factory } from "../generated/schema";

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

export function getFactory(address: string): Factory {
  let factory = Factory.load(address);
  if (!factory) {
    factory = new Factory(address);
    factory.save();
  }
  return factory;
}

export let NEWCHILD_EVENT =
  "0x7da70c4e5387d7038610b79ca7d304caaef815826e51e67cf247135387a79bce";
