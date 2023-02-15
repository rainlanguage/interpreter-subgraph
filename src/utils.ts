import { Bytes, Address, dataSource } from "@graphprotocol/graph-ts";
import { Factory } from "../generated/schema";
import { Extrospection } from "../generated/ERC1820Registry/Extrospection";

export class ExtrospectionPerNetwork {
  static get(): Extrospection {
    const currentNetwork = dataSource.network();
    let address = "";

    // TODO: Implement keyless deploy + CREATE2 opcode to have the same address on all chains
    if (currentNetwork == "mumbai")
      address = "0x95A5aC80025128a220D577D77E400191087a3B83";

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

export function getFactory(address: string): Factory {
  let factory = Factory.load(address);
  if (!factory) {
    factory = new Factory(address);
    factory.save();
  }
  return factory;
}

export let IERC1820_NAME_IEXPRESSION_DEPLOYER_V1_HASH =
  "0xf10faf5e29ad7057aa6922f7dc34fd1b591620d40c7a7f4443565469f249ec91";

export let NEWCHILD_EVENT =
  "0x7da70c4e5387d7038610b79ca7d304caaef815826e51e67cf247135387a79bce";
