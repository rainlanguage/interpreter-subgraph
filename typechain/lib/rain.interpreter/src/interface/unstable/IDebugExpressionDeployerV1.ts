/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../../../common";

export interface IDebugExpressionDeployerV1Interface extends utils.Interface {
  functions: {
    "offchainDebugEval(bytes[],uint256[],uint256,uint256[][],uint16,uint256[],uint256)": FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: "offchainDebugEval"): FunctionFragment;

  encodeFunctionData(
    functionFragment: "offchainDebugEval",
    values: [
      PromiseOrValue<BytesLike>[],
      PromiseOrValue<BigNumberish>[],
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>[][],
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>[],
      PromiseOrValue<BigNumberish>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "offchainDebugEval",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IDebugExpressionDeployerV1 extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IDebugExpressionDeployerV1Interface;

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
    offchainDebugEval(
      sources: PromiseOrValue<BytesLike>[],
      constants: PromiseOrValue<BigNumberish>[],
      namespace: PromiseOrValue<BigNumberish>,
      context: PromiseOrValue<BigNumberish>[][],
      sourceIndex: PromiseOrValue<BigNumberish>,
      initialStack: PromiseOrValue<BigNumberish>[],
      minOutputs: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber[], BigNumber[]] & { finalStack: BigNumber[]; kvs: BigNumber[] }
    >;
  };

  offchainDebugEval(
    sources: PromiseOrValue<BytesLike>[],
    constants: PromiseOrValue<BigNumberish>[],
    namespace: PromiseOrValue<BigNumberish>,
    context: PromiseOrValue<BigNumberish>[][],
    sourceIndex: PromiseOrValue<BigNumberish>,
    initialStack: PromiseOrValue<BigNumberish>[],
    minOutputs: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber[], BigNumber[]] & { finalStack: BigNumber[]; kvs: BigNumber[] }
  >;

  callStatic: {
    offchainDebugEval(
      sources: PromiseOrValue<BytesLike>[],
      constants: PromiseOrValue<BigNumberish>[],
      namespace: PromiseOrValue<BigNumberish>,
      context: PromiseOrValue<BigNumberish>[][],
      sourceIndex: PromiseOrValue<BigNumberish>,
      initialStack: PromiseOrValue<BigNumberish>[],
      minOutputs: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber[], BigNumber[]] & { finalStack: BigNumber[]; kvs: BigNumber[] }
    >;
  };

  filters: {};

  estimateGas: {
    offchainDebugEval(
      sources: PromiseOrValue<BytesLike>[],
      constants: PromiseOrValue<BigNumberish>[],
      namespace: PromiseOrValue<BigNumberish>,
      context: PromiseOrValue<BigNumberish>[][],
      sourceIndex: PromiseOrValue<BigNumberish>,
      initialStack: PromiseOrValue<BigNumberish>[],
      minOutputs: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    offchainDebugEval(
      sources: PromiseOrValue<BytesLike>[],
      constants: PromiseOrValue<BigNumberish>[],
      namespace: PromiseOrValue<BigNumberish>,
      context: PromiseOrValue<BigNumberish>[][],
      sourceIndex: PromiseOrValue<BigNumberish>,
      initialStack: PromiseOrValue<BigNumberish>[],
      minOutputs: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
