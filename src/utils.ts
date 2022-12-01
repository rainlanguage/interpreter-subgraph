import { Bytes, log } from "@graphprotocol/graph-ts";

export function decodeSources(
  functionPointers: string,
  sources: Bytes[]
): Bytes[] {
  let tmp: string = "";
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
