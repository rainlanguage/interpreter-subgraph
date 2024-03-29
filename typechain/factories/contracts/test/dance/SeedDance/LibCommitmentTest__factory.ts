/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../../common";
import type {
  LibCommitmentTest,
  LibCommitmentTestInterface,
} from "../../../../../contracts/test/dance/SeedDance/LibCommitmentTest";

const _abi = [
  {
    inputs: [
      {
        internalType: "Commitment",
        name: "a_",
        type: "uint256",
      },
      {
        internalType: "Commitment",
        name: "b_",
        type: "uint256",
      },
    ],
    name: "eq",
    outputs: [
      {
        internalType: "bool",
        name: "eq_",
        type: "bool",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "Secret",
        name: "secret_",
        type: "uint256",
      },
    ],
    name: "fromSecret",
    outputs: [
      {
        internalType: "Commitment",
        name: "commitment_",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "nil",
    outputs: [
      {
        internalType: "Commitment",
        name: "nil_",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5061012e806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80632c22f45514610046578063320cbc3f1461005c57806332148d731461006f575b600080fd5b60005b6040519081526020015b60405180910390f35b61004961006a3660046100f3565b610091565b61008161007d36600461010c565b1490565b6040519015158152602001610053565b600061009c826100a2565b92915050565b6000816040516020016100b791815260200190565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0818403018152919052805160209091012092915050565b60006020828403121561010557600080fd5b5035919050565b6000806040838503121561011f57600080fd5b5050803592602090910135915056";

type LibCommitmentTestConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: LibCommitmentTestConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class LibCommitmentTest__factory extends ContractFactory {
  constructor(...args: LibCommitmentTestConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<LibCommitmentTest> {
    return super.deploy(overrides || {}) as Promise<LibCommitmentTest>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): LibCommitmentTest {
    return super.attach(address) as LibCommitmentTest;
  }
  override connect(signer: Signer): LibCommitmentTest__factory {
    return super.connect(signer) as LibCommitmentTest__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): LibCommitmentTestInterface {
    return new utils.Interface(_abi) as LibCommitmentTestInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): LibCommitmentTest {
    return new Contract(address, _abi, signerOrProvider) as LibCommitmentTest;
  }
}
