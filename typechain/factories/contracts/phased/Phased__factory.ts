/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type { Phased, PhasedInterface } from "../../../contracts/phased/Phased";

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
        internalType: "uint256",
        name: "newPhase",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "scheduledTime",
        type: "uint256",
      },
    ],
    name: "PhaseScheduled",
    type: "event",
  },
  {
    inputs: [],
    name: "currentPhase",
    outputs: [
      {
        internalType: "uint256",
        name: "phase_",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32[8]",
        name: "phaseTimes_",
        type: "uint32[8]",
      },
      {
        internalType: "uint256",
        name: "timestamp_",
        type: "uint256",
      },
    ],
    name: "phaseAtTime",
    outputs: [
      {
        internalType: "uint256",
        name: "phase_",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "phaseTimes",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32[8]",
        name: "phaseTimes_",
        type: "uint32[8]",
      },
      {
        internalType: "uint256",
        name: "phase_",
        type: "uint256",
      },
    ],
    name: "timeForPhase",
    outputs: [
      {
        internalType: "uint256",
        name: "timestamp_",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5061036e806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c8063055ad42e146100515780631cf355e81461006c5780635d521c101461007f57806393c9655714610092575b600080fd5b6100596100ba565b6040519081526020015b60405180910390f35b61005961007a366004610222565b610124565b61005961008d366004610222565b610163565b6100a56100a03660046102ac565b6101aa565b60405163ffffffff9091168152602001610063565b6040805161010081019182905260009161011f919083906008908280855b82829054906101000a900463ffffffff1663ffffffff16815260200190600401906020826003010492830192600103820291508084116100d8579050505050505042610163565b905090565b6000808211610134576000610156565b826101406001846102f4565b6008811061015057610150610307565b60200201515b63ffffffff169392505050565b60005b60088110156101a45782816008811061018157610181610307565b602002015163ffffffff1682106101a4578061019c81610336565b915050610166565b92915050565b600081600881106101ba57600080fd5b60089182820401919006600402915054906101000a900463ffffffff1681565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b803563ffffffff8116811461021d57600080fd5b919050565b600080610120838503121561023657600080fd5b83601f84011261024557600080fd5b60405161010080820182811067ffffffffffffffff8211171561026a5761026a6101da565b6040528401818682111561027d57600080fd5b855b8281101561029e5761029081610209565b82526020918201910161027f565b509196903595509350505050565b6000602082840312156102be57600080fd5b5035919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b818103818111156101a4576101a46102c5565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203610367576103676102c5565b506001019056";

type PhasedConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PhasedConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Phased__factory extends ContractFactory {
  constructor(...args: PhasedConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Phased> {
    return super.deploy(overrides || {}) as Promise<Phased>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Phased {
    return super.attach(address) as Phased;
  }
  override connect(signer: Signer): Phased__factory {
    return super.connect(signer) as Phased__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PhasedInterface {
    return new utils.Interface(_abi) as PhasedInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Phased {
    return new Contract(address, _abi, signerOrProvider) as Phased;
  }
}
