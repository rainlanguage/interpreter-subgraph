/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IInterpreterExternV1,
  IInterpreterExternV1Interface,
} from "../../../../../lib/rain.interpreter/src/interface/IInterpreterExternV1";

const _abi = [
  {
    inputs: [
      {
        internalType: "ExternDispatch",
        name: "dispatch_",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "inputs_",
        type: "uint256[]",
      },
    ],
    name: "extern",
    outputs: [
      {
        internalType: "uint256[]",
        name: "outputs_",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class IInterpreterExternV1__factory {
  static readonly abi = _abi;
  static createInterface(): IInterpreterExternV1Interface {
    return new utils.Interface(_abi) as IInterpreterExternV1Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IInterpreterExternV1 {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as IInterpreterExternV1;
  }
}
