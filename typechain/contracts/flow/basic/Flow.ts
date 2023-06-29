/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../common";

export type DeployerDiscoverableMetaV1ConstructionConfigStruct = {
  deployer: PromiseOrValue<string>;
  meta: PromiseOrValue<BytesLike>;
};

export type DeployerDiscoverableMetaV1ConstructionConfigStructOutput = [
  string,
  string
] & { deployer: string; meta: string };

export type EvaluableStruct = {
  interpreter: PromiseOrValue<string>;
  store: PromiseOrValue<string>;
  expression: PromiseOrValue<string>;
};

export type EvaluableStructOutput = [string, string, string] & {
  interpreter: string;
  store: string;
  expression: string;
};

export type EvaluableConfigStruct = {
  deployer: PromiseOrValue<string>;
  sources: PromiseOrValue<BytesLike>[];
  constants: PromiseOrValue<BigNumberish>[];
};

export type EvaluableConfigStructOutput = [string, string[], BigNumber[]] & {
  deployer: string;
  sources: string[];
  constants: BigNumber[];
};

export type FlowConfigStruct = {
  dummyConfig: EvaluableConfigStruct;
  config: EvaluableConfigStruct[];
};

export type FlowConfigStructOutput = [
  EvaluableConfigStructOutput,
  EvaluableConfigStructOutput[]
] & {
  dummyConfig: EvaluableConfigStructOutput;
  config: EvaluableConfigStructOutput[];
};

export type SignedContextV1Struct = {
  signer: PromiseOrValue<string>;
  context: PromiseOrValue<BigNumberish>[];
  signature: PromiseOrValue<BytesLike>;
};

export type SignedContextV1StructOutput = [string, BigNumber[], string] & {
  signer: string;
  context: BigNumber[];
  signature: string;
};

export type ERC20TransferStruct = {
  token: PromiseOrValue<string>;
  from: PromiseOrValue<string>;
  to: PromiseOrValue<string>;
  amount: PromiseOrValue<BigNumberish>;
};

export type ERC20TransferStructOutput = [string, string, string, BigNumber] & {
  token: string;
  from: string;
  to: string;
  amount: BigNumber;
};

export type ERC721TransferStruct = {
  token: PromiseOrValue<string>;
  from: PromiseOrValue<string>;
  to: PromiseOrValue<string>;
  id: PromiseOrValue<BigNumberish>;
};

export type ERC721TransferStructOutput = [string, string, string, BigNumber] & {
  token: string;
  from: string;
  to: string;
  id: BigNumber;
};

export type ERC1155TransferStruct = {
  token: PromiseOrValue<string>;
  from: PromiseOrValue<string>;
  to: PromiseOrValue<string>;
  id: PromiseOrValue<BigNumberish>;
  amount: PromiseOrValue<BigNumberish>;
};

export type ERC1155TransferStructOutput = [
  string,
  string,
  string,
  BigNumber,
  BigNumber
] & {
  token: string;
  from: string;
  to: string;
  id: BigNumber;
  amount: BigNumber;
};

export type FlowTransferV1Struct = {
  erc20: ERC20TransferStruct[];
  erc721: ERC721TransferStruct[];
  erc1155: ERC1155TransferStruct[];
};

export type FlowTransferV1StructOutput = [
  ERC20TransferStructOutput[],
  ERC721TransferStructOutput[],
  ERC1155TransferStructOutput[]
] & {
  erc20: ERC20TransferStructOutput[];
  erc721: ERC721TransferStructOutput[];
  erc1155: ERC1155TransferStructOutput[];
};

export interface FlowInterface extends utils.Interface {
  functions: {
    "flow((address,address,address),uint256[],(address,uint256[],bytes)[])": FunctionFragment;
    "initialize(bytes)": FunctionFragment;
    "multicall(bytes[])": FunctionFragment;
    "onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)": FunctionFragment;
    "onERC1155Received(address,address,uint256,uint256,bytes)": FunctionFragment;
    "onERC721Received(address,address,uint256,bytes)": FunctionFragment;
    "previewFlow((address,address,address),uint256[],(address,uint256[],bytes)[])": FunctionFragment;
    "supportsInterface(bytes4)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "flow"
      | "initialize"
      | "multicall"
      | "onERC1155BatchReceived"
      | "onERC1155Received"
      | "onERC721Received"
      | "previewFlow"
      | "supportsInterface"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "flow",
    values: [
      EvaluableStruct,
      PromiseOrValue<BigNumberish>[],
      SignedContextV1Struct[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "multicall",
    values: [PromiseOrValue<BytesLike>[]]
  ): string;
  encodeFunctionData(
    functionFragment: "onERC1155BatchReceived",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>[],
      PromiseOrValue<BigNumberish>[],
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "onERC1155Received",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "onERC721Received",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "previewFlow",
    values: [
      EvaluableStruct,
      PromiseOrValue<BigNumberish>[],
      SignedContextV1Struct[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [PromiseOrValue<BytesLike>]
  ): string;

  decodeFunctionResult(functionFragment: "flow", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "multicall", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "onERC1155BatchReceived",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "onERC1155Received",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "onERC721Received",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "previewFlow",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;

  events: {
    "Context(address,uint256[][])": EventFragment;
    "FlowInitialized(address,tuple)": EventFragment;
    "Initialize(address,tuple)": EventFragment;
    "Initialized(uint8)": EventFragment;
    "MetaV1(address,uint256,bytes)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Context"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "FlowInitialized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Initialize"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "MetaV1"): EventFragment;
}

export interface ContextEventObject {
  sender: string;
  context: BigNumber[][];
}
export type ContextEvent = TypedEvent<
  [string, BigNumber[][]],
  ContextEventObject
>;

export type ContextEventFilter = TypedEventFilter<ContextEvent>;

export interface FlowInitializedEventObject {
  sender: string;
  evaluable: EvaluableStructOutput;
}
export type FlowInitializedEvent = TypedEvent<
  [string, EvaluableStructOutput],
  FlowInitializedEventObject
>;

export type FlowInitializedEventFilter = TypedEventFilter<FlowInitializedEvent>;

export interface InitializeEventObject {
  sender: string;
  config: FlowConfigStructOutput;
}
export type InitializeEvent = TypedEvent<
  [string, FlowConfigStructOutput],
  InitializeEventObject
>;

export type InitializeEventFilter = TypedEventFilter<InitializeEvent>;

export interface InitializedEventObject {
  version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;

export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;

export interface MetaV1EventObject {
  sender: string;
  subject: BigNumber;
  meta: string;
}
export type MetaV1Event = TypedEvent<
  [string, BigNumber, string],
  MetaV1EventObject
>;

export type MetaV1EventFilter = TypedEventFilter<MetaV1Event>;

export interface Flow extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: FlowInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    flow(
      evaluable_: EvaluableStruct,
      callerContext_: PromiseOrValue<BigNumberish>[],
      signedContexts_: SignedContextV1Struct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    initialize(
      data_: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    multicall(
      data: PromiseOrValue<BytesLike>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    onERC1155BatchReceived(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>[],
      arg3: PromiseOrValue<BigNumberish>[],
      arg4: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    onERC1155Received(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      arg3: PromiseOrValue<BigNumberish>,
      arg4: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    onERC721Received(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      arg3: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    previewFlow(
      evaluable_: EvaluableStruct,
      callerContext_: PromiseOrValue<BigNumberish>[],
      signedContexts_: SignedContextV1Struct[],
      overrides?: CallOverrides
    ): Promise<[FlowTransferV1StructOutput]>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;
  };

  flow(
    evaluable_: EvaluableStruct,
    callerContext_: PromiseOrValue<BigNumberish>[],
    signedContexts_: SignedContextV1Struct[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  initialize(
    data_: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  multicall(
    data: PromiseOrValue<BytesLike>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  onERC1155BatchReceived(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<string>,
    arg2: PromiseOrValue<BigNumberish>[],
    arg3: PromiseOrValue<BigNumberish>[],
    arg4: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  onERC1155Received(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<string>,
    arg2: PromiseOrValue<BigNumberish>,
    arg3: PromiseOrValue<BigNumberish>,
    arg4: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  onERC721Received(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<string>,
    arg2: PromiseOrValue<BigNumberish>,
    arg3: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  previewFlow(
    evaluable_: EvaluableStruct,
    callerContext_: PromiseOrValue<BigNumberish>[],
    signedContexts_: SignedContextV1Struct[],
    overrides?: CallOverrides
  ): Promise<FlowTransferV1StructOutput>;

  supportsInterface(
    interfaceId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  callStatic: {
    flow(
      evaluable_: EvaluableStruct,
      callerContext_: PromiseOrValue<BigNumberish>[],
      signedContexts_: SignedContextV1Struct[],
      overrides?: CallOverrides
    ): Promise<FlowTransferV1StructOutput>;

    initialize(
      data_: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<void>;

    multicall(
      data: PromiseOrValue<BytesLike>[],
      overrides?: CallOverrides
    ): Promise<string[]>;

    onERC1155BatchReceived(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>[],
      arg3: PromiseOrValue<BigNumberish>[],
      arg4: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    onERC1155Received(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      arg3: PromiseOrValue<BigNumberish>,
      arg4: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    onERC721Received(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      arg3: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    previewFlow(
      evaluable_: EvaluableStruct,
      callerContext_: PromiseOrValue<BigNumberish>[],
      signedContexts_: SignedContextV1Struct[],
      overrides?: CallOverrides
    ): Promise<FlowTransferV1StructOutput>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;
  };

  filters: {
    "Context(address,uint256[][])"(
      sender?: null,
      context?: null
    ): ContextEventFilter;
    Context(sender?: null, context?: null): ContextEventFilter;

    "FlowInitialized(address,tuple)"(
      sender?: null,
      evaluable?: null
    ): FlowInitializedEventFilter;
    FlowInitialized(
      sender?: null,
      evaluable?: null
    ): FlowInitializedEventFilter;

    "Initialize(address,tuple)"(
      sender?: null,
      config?: null
    ): InitializeEventFilter;
    Initialize(sender?: null, config?: null): InitializeEventFilter;

    "Initialized(uint8)"(version?: null): InitializedEventFilter;
    Initialized(version?: null): InitializedEventFilter;

    "MetaV1(address,uint256,bytes)"(
      sender?: null,
      subject?: null,
      meta?: null
    ): MetaV1EventFilter;
    MetaV1(sender?: null, subject?: null, meta?: null): MetaV1EventFilter;
  };

  estimateGas: {
    flow(
      evaluable_: EvaluableStruct,
      callerContext_: PromiseOrValue<BigNumberish>[],
      signedContexts_: SignedContextV1Struct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    initialize(
      data_: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    multicall(
      data: PromiseOrValue<BytesLike>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    onERC1155BatchReceived(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>[],
      arg3: PromiseOrValue<BigNumberish>[],
      arg4: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    onERC1155Received(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      arg3: PromiseOrValue<BigNumberish>,
      arg4: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    onERC721Received(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      arg3: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    previewFlow(
      evaluable_: EvaluableStruct,
      callerContext_: PromiseOrValue<BigNumberish>[],
      signedContexts_: SignedContextV1Struct[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    flow(
      evaluable_: EvaluableStruct,
      callerContext_: PromiseOrValue<BigNumberish>[],
      signedContexts_: SignedContextV1Struct[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    initialize(
      data_: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    multicall(
      data: PromiseOrValue<BytesLike>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    onERC1155BatchReceived(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>[],
      arg3: PromiseOrValue<BigNumberish>[],
      arg4: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    onERC1155Received(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      arg3: PromiseOrValue<BigNumberish>,
      arg4: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    onERC721Received(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      arg2: PromiseOrValue<BigNumberish>,
      arg3: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    previewFlow(
      evaluable_: EvaluableStruct,
      callerContext_: PromiseOrValue<BigNumberish>[],
      signedContexts_: SignedContextV1Struct[],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
