import { Bytes, log } from "@graphprotocol/graph-ts";

export function getOpcodes(functionPointers: String[], sources: Bytes[]): Bytes[] {
  let new_sources: Bytes[] = [];
  for (let i = 0; i < sources.length; i++) {
    let source = sources[i].toHexString().slice(2);
    log.warning("Source : {}", [source]);
    for (let j = 0; j < source.length; j = j + 8) {
      let opcode = source.slice(j, j + 4);
      let operand = source.slice(j + 4, j + 8);
      new_sources.push(
        Bytes.fromI32(functionPointers.indexOf(opcode))
      );
      new_sources.push(Bytes.fromHexString(operand));
      log.warning("Opcode : {} , Operand {} ", [
        functionPointers.indexOf(opcode).toString(),
        operand,
      ]);
    }
  }
  return new_sources;
}
