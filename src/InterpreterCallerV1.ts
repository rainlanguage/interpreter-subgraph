import { JSONValueKind, json } from "@graphprotocol/graph-ts";
import { MetaV1 } from "../generated/templates/InterpreterCallerV1/InterpreterCallerV1";
import {
  CONTRACT_META_MAGIC_NUMBER_HEX,
  RAIN_META_DOCUMENT_HEX,
  generateTransaction,
  getContract,
  getKeccak256FromBytes,
  getRainMetaV1,
  stringToArrayBuffer,
} from "./utils";
import { CBORDecoder } from "@rainprotocol/assemblyscript-cbor";
import { ContentMeta } from "./metav1";

export function handleMetaV1(event: MetaV1): void {
  const transaction = generateTransaction(event);
  const contract = getContract(event.address.toHex());

  contract.deployTransaction = transaction.id;

  // Decode meta bytes
  const metaV1 = getRainMetaV1(event.params.meta);

  // Converts the emitted target from Bytes to a Hexadecimal value
  let meta = event.params.meta.toHex();

  // The meta emitted does not include the RainMeta magic number, so does not
  // follow the RainMeta Desing
  if (meta.includes(RAIN_META_DOCUMENT_HEX)) {
    meta = meta.replace(RAIN_META_DOCUMENT_HEX, "");
    const data = new CBORDecoder(stringToArrayBuffer(meta));
    const res = data.parse();

    const contentArr: ContentMeta[] = [];

    if (res.isSequence) {
      const dataString = res.toString();
      const jsonArr = json.fromString(dataString).toArray();
      for (let i = 0; i < jsonArr.length; i++) {
        const jsonValue = jsonArr[i];

        // if some value is not a JSON/Map, then is not following the RainMeta design.
        // So, return here to avoid assignation.
        if (jsonValue.kind != JSONValueKind.OBJECT) return;

        const jsonContent = jsonValue.toObject();

        // If some content is not valid, then skip it since is bad formed
        if (!ContentMeta.validate(jsonContent)) return;

        const content = new ContentMeta(jsonContent, metaV1.id);
        contentArr.push(content);
      }
    } else if (res.isObj) {
      const dataString = res.toString();
      const jsonObj = json.fromString(dataString).toObject();

      if (!ContentMeta.validate(jsonObj)) return;
      const content = new ContentMeta(jsonObj, metaV1.id);
      contentArr.push(content);
      //
    } else {
      // If the response is NOT a Sequence or an Object, then the meta have an
      // error or it's bad formed.
      // In this case, we skip to continue the decoding and assignation process.
      return;
    }

    for (let i = 0; i < contentArr.length; i++) {
      const metaContent_ = contentArr[i].generate();

      const magicNumber = metaContent_.magicNumber.toHex();
      if (magicNumber == CONTRACT_META_MAGIC_NUMBER_HEX) {
        contract.contractMeta = metaContent_.payload;
        contract.contractMetaHash = getKeccak256FromBytes(metaContent_.payload);
      }
    }
  }

  contract.meta = metaV1.id;
  contract.save();
}
