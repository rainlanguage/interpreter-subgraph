/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IExpressionDeployerV1,
  IExpressionDeployerV1Interface,
} from "../../../../../lib/rain.interpreter/src/interface/IExpressionDeployerV1";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "deployer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "interpreter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "store",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "opMeta",
        type: "bytes",
      },
    ],
    name: "DISpair",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes[]",
        name: "sources",
        type: "bytes[]",
      },
      {
        internalType: "uint256[]",
        name: "constants",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "minOutputs",
        type: "uint256[]",
      },
    ],
    name: "deployExpression",
    outputs: [
      {
        internalType: "contract IInterpreterV1",
        name: "interpreter",
        type: "address",
      },
      {
        internalType: "contract IInterpreterStoreV1",
        name: "store",
        type: "address",
      },
      {
        internalType: "address",
        name: "expression",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IExpressionDeployerV1__factory {
  static readonly abi = _abi;
  static createInterface(): IExpressionDeployerV1Interface {
    return new utils.Interface(_abi) as IExpressionDeployerV1Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IExpressionDeployerV1 {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as IExpressionDeployerV1;
  }
}
