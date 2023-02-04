import { ethers } from "hardhat";
import { Result, concat, hexlify, Hexable, zeroPad } from "ethers/lib/utils";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

import { createApolloFetch, ApolloFetch } from "apollo-fetch";
import type { Artifact } from "hardhat/types";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import type {
  Contract,
  Signer,
  BigNumberish,
  BigNumber,
  FixedNumber,
  ContractTransaction,
  BytesLike,
} from "ethers";
import {
  Factory,
  ImplementationEvent,
  NewChildEvent,
} from "../../typechain/contracts/factory/Factory";
import { deflateSync } from "zlib";
import { format } from "prettier";

// A fixed range to Tier Levels
type levelsRange = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type DataNotice = {
  repo: string;
  commit: string | Buffer;
  network: string;
  contracts: Array<{
    name: string;
    address: string;
    bytecodeHash: string;
  }>;
};

// Interfaces
interface SyncedSubgraphType {
  synced: boolean;
}

interface BasicArtifact {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abi: any[];
  bytecode: string;
}

// Helper values
export const sixZeros = "000000";
export const sixteenZeros = "0000000000000000";
export const eighteenZeros = "000000000000000000";
export const max_uint256 = ethers.BigNumber.from(
  "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
);

export const zeroAddress = ethers.constants.AddressZero;

// BigNumbers
export const ONE = ethers.BigNumber.from("1" + eighteenZeros);
export const RESERVE_ONE = ethers.BigNumber.from("1" + sixZeros);
export const ZERO_BN = ethers.BigNumber.from("0");

// Fixed number (Decimal)
export const oneHundredFN = ethers.FixedNumber.from(100, "fixed128x32");

export const divBNOrFixed = (
  a_: BigNumber | FixedNumber,
  b_: BigNumber | FixedNumber
): FixedNumber => {
  const a = ethers.FixedNumber.from(a_);
  const b = ethers.FixedNumber.from(b_);

  if (b.isZero()) return ethers.FixedNumber.from(0);

  return a.divUnsafe(b);
};

export const CREATOR_FUNDS_RELEASE_TIMEOUT_TESTING = 100;
export const MAX_RAISE_DURATION_TESTING = 100;

// Verify Roles
export const DEFAULT_ADMIN_ROLE = ethers.utils.hexZeroPad("0x00", 32);

export const APPROVER_ADMIN = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("APPROVER_ADMIN")
);
export const APPROVER = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("APPROVER")
);

export const REMOVER_ADMIN = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("REMOVER_ADMIN")
);
export const REMOVER = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("REMOVER")
);

export const BANNER_ADMIN = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("BANNER_ADMIN")
);
export const BANNER = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("BANNER")
);

export enum RequestType {
  APPROVE,
  BAN,
  REMOVE,
}

export enum RequestStatus {
  NONE,
  APPROVE,
  BAN,
  REMOVE,
}

export enum VerifyStatus {
  NIL,
  ADDED,
  APPROVED,
  BANNED,
}

export enum VerifyRole {
  NONE,
  APPROVER_ADMIN,
  REMOVER_ADMIN,
  BANNER_ADMIN,
  APPROVER,
  REMOVER,
  BANNER,
}

export enum Tier {
  ZERO, // NIL
  ONE, // COPPER
  TWO, // BRONZE
  THREE, // SILVER
  FOUR, // GOLD
  FIVE, // PLATINUM
  SIX, // DIAMOND
  SEVEN, // CHAD
  EIGHT, // JAWAD
}

// All Opcodes
export enum AllStandardOps {
  CONSTANT,
  STACK,
  CONTEXT,
  STORAGE,
  ZIPMAP,
  DEBUG,
  ERC20_BALANCE_OF,
  ERC20_TOTAL_SUPPLY,
  ERC20_SNAPSHOT_BALANCE_OF_AT,
  ERC20_SNAPSHOT_TOTAL_SUPPLY_AT,
  IERC721_BALANCE_OF,
  IERC721_OWNER_OF,
  IERC1155_BALANCE_OF,
  IERC1155_BALANCE_OF_BATCH,
  BLOCK_NUMBER,
  SENDER,
  THIS_ADDRESS,
  BLOCK_TIMESTAMP,
  SCALE18,
  SCALE18_DIV,
  SCALE18_MUL,
  SCALE_BY,
  SCALEN,
  ANY,
  EAGER_IF,
  EQUAL_TO,
  EVERY,
  GREATER_THAN,
  ISZERO,
  LESS_THAN,
  SATURATING_ADD,
  SATURATING_MUL,
  SATURATING_SUB,
  ADD,
  DIV,
  EXP,
  MAX,
  MIN,
  MOD,
  MUL,
  SUB,
  ITIERV2_REPORT,
  ITIERV2_REPORT_TIME_FOR_TIER,
  SATURATING_DIFF,
  SELECT_LTE,
  UPDATE_TIMES_FOR_TIER_RANGE,
  length,
}

// Orderbook opcodes
export const OrderBookOps = {
  ORDER_FUNDS_CLEARED: 0 + AllStandardOps.length,
  COUNTERPARTY_FUNDS_CLEARED: 1 + AllStandardOps.length,
};

export const OrderBookOpcode = {
  ...AllStandardOps,
  ...OrderBookOps,
};

// Sale opcodes
export enum OpcodeSale {
  SKIP,
  VAL,
  DUP,
  ZIPMAP,
  BLOCK_NUMBER,
  BLOCK_TIMESTAMP,
  SENDER,
  IS_ZERO,
  EAGER_IF,
  EQUAL_TO,
  LESS_THAN,
  GREATER_THAN,
  EVERY,
  ANY,
  ADD,
  SUB,
  MUL,
  DIV,
  MOD,
  POW,
  MIN,
  MAX,
  REPORT,
  NEVER,
  ALWAYS,
  SATURATING_DIFF,
  UPDATE_BLOCKS_FOR_TIER_RANGE,
  SELECT_LTE,
  ERC20_BALANCE_OF,
  ERC20_TOTAL_SUPPLY,
  ERC721_BALANCE_OF,
  ERC721_OWNER_OF,
  ERC1155_BALANCE_OF,
  ERC1155_BALANCE_OF_BATCH,
  REMAINING_UNITS,
  TOTAL_RESERVE_IN,
  LAST_BUY_BLOCK,
  LAST_BUY_UNITS,
  LAST_BUY_PRICE,
  CURRENT_BUY_UNITS,
  TOKEN_ADDRESS,
  RESERVE_ADDRESS,
}

// Tier opcodes
export enum OpcodeTier {
  END,
  VAL,
  DUP,
  ZIPMAP,
  BLOCK_NUMBER,
  BLOCK_TIMESTAMP,
  REPORT,
  NEVER,
  ALWAYS,
  DIFF,
  UPDATE_BLOCKS_FOR_TIER_RANGE,
  SELECT_LTE,
  ACCOUNT,
}

// Enum that represent the SaleStatus (Sale)
export enum SaleStatus {
  PENDING,
  ACTIVE,
  SUCCESS,
  FAIL,
}

/**
 * Return the Levels tier used by default. LEVELS always will be an array with 8 elements to
 * correspond to the 8 TierLevels
 */
export const LEVELS: string[] = Array.from(Array(8).keys()).map((value) =>
  ethers.BigNumber.from(++value + eighteenZeros).toString()
); // [1,2,3,4,5,6,7,8]

/**
 * Convert an array of BigNumberih to an array to string. This will facilitate the test.
 * **NOTE:** This ONLY will convert the value to the expression in string.
 * @param arr The array of the BigNumberish
 * @returns New array of string with the respected value
 */
export const arrayToString = (arr: BigNumberish[]): string[] => {
  return arr.map((x: BigNumberish) => x.toString());
};

/**
 * Calculate the amount necessary to send or refund for get a `desiredLevel` from `currentLevel` on a TierContract
 * @param desiredLvl Desired TierLevel. Required to be between 0-8
 * @param currentLevel (Optional) Current TierLevel, by default if Tier.Zero -  Required to be between 0-8
 * @returns The difference of tokens between the acutal level and desired level
 */
export const amountToLevel = (
  desiredLvl: levelsRange,
  currentLevel: levelsRange = 0
): string => {
  if (currentLevel == desiredLvl) {
    return "0";
  }
  const BN = ethers.BigNumber;

  let valueFrom =
    currentLevel == 0 ? ZERO_BN : BN.from(LEVELS[currentLevel - 1]);

  let valueTo = desiredLvl == 0 ? ZERO_BN : BN.from(LEVELS[desiredLvl - 1]);

  if (valueFrom.gt(valueTo)) {
    [valueFrom, valueTo] = [valueTo, valueFrom];
  }

  return valueTo.sub(valueFrom).toString();
};

/**
 * Create a fixed number with ethers. This intend to reduce the code and
 * manage the same format different to default one used by ethers
 * @param value value to convert to fixed number
 * @param format (optional) fixed number format. By default is fixed128x32
 * @returns a new fixedNumber object that represent the value
 */
export const fixedNumber = (
  value: BigNumber | string | number,
  format = "fixed128x32"
): FixedNumber => {
  return ethers.FixedNumber.from(value, format);
};

/**
 * Execute Child Processes
 * @param cmd Command to execute
 * @returns The command ran it
 */
export const exec = (cmd: string): string | Buffer => {
  const srcDir = path.join(__dirname, "..");
  try {
    return execSync(cmd, { cwd: srcDir, stdio: "inherit" });
  } catch (e) {
    throw new Error(`Failed to run command \`${cmd}\``);
  }
};

// Subgraph Management
export const fetchSubgraphs = createApolloFetch({
  uri: "http://localhost:8030/graphql",
});

/**
 * Connect to an existing subgraph deployed in localhost
 * @param subgraphName Name of the subgraph
 * @returns connection to subgraph
 */
export const fetchSubgraph = (subgraphName: string): ApolloFetch => {
  return createApolloFetch({
    uri: `http://localhost:8000/subgraphs/name/${subgraphName}`,
  });
};

/**
 * Wait for the synchronization of the subgraph when it is delayed with respect to the chain. It must be used
 * after a transaction and want to be query the result immediately after that
 * @param wait Amount of time in seconds to wait before ask to the subgraph about synchronization
 * @param timeDelay Amount of time in seconds to wait between queries
 * @param seconds Max time in seconds to wait by synchronization
 * @returns Subgraph Synchronized
 */
export const waitForSubgraphToBeSynced = async (
  wait = 0,
  timeDelay = 1,
  seconds = 60,
  subgraphName = "rainprotocol/rain-protocol-test"
): Promise<SyncedSubgraphType> => {
  if (wait > 0) {
    await delay(wait);
  }
  /**
   * Waiting for 60s by default
   * Does not care about waiting the 60s -  the function already try to handle if does not receive
   * a response. If the subgraph need to wait for a big number of blocks, would be good increse
   * the seconds to wait by sync.
   */
  const deadline = Date.now() + seconds * 1000;
  const currentBlock = await ethers.provider.getBlockNumber();

  const resp = new Promise<SyncedSubgraphType>((resolve, reject) => {
    // Function to check if the subgraph is synced asking to the GraphNode
    const checkSubgraphSynced = async () => {
      try {
        const result = await fetchSubgraphs({
          query: `
            {
              indexingStatusForCurrentVersion(subgraphName: "${subgraphName}") {
                synced
                health
                fatalError{
                  message
                  handler
                }
                chains {
                  chainHeadBlock {
                    number
                  }
                  latestBlock {
                    number
                  }
                }
              } 
            } 
          `,
        });
        const data = result.data.indexingStatusForCurrentVersion;
        if (
          data.synced === true &&
          data.chains[0].latestBlock.number == currentBlock
        ) {
          resolve({ synced: true });
        } else if (data.health === "failed") {
          reject(new Error(`Subgraph fatalError - ${data.fatalError.message}`));
        } else {
          throw new Error(`subgraph is not sync`);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown Error";
        if (message.includes("connect ECONNREFUSED")) {
          reject(new Error(`Unable to connect to Subgraph node: ${message}`));
        }

        if (message == "Unknown Error") {
          reject(new Error(`${message} - ${e}`));
        }

        if (!currentBlock) {
          reject(new Error(`current block is undefined`));
        }

        if (e instanceof TypeError) {
          reject(
            new Error(
              `${e.message} - Check that the subgraphName provided is correct.`
            )
          );
        }

        if (Date.now() > deadline) {
          reject(new Error(`Timed out waiting for the subgraph to sync`));
        } else {
          setTimeout(checkSubgraphSynced, timeDelay * 1000);
        }
      }
    };

    checkSubgraphSynced();
  });

  return resp;
};

/**
 * Deploy a contract with they artifact (JSON)
 * @param artifact The artifact of the contract to deploy. It should contain the ABI and bytecode. The
 * user should manage the type contract when returned.
 * @param signer Signer that will deploy the contract
 * @param argmts (Optional) Arguments to deploy the contract
 * @returns A deployed contract instance
 */
export const deploy = async (
  artifact: Artifact | BasicArtifact,
  signer: SignerWithAddress | Signer,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  argmts: any[] = []
): Promise<Contract> => {
  const iface = new ethers.utils.Interface(artifact.abi);
  const factory = new ethers.ContractFactory(iface, artifact.bytecode, signer);
  const contract = await factory.deploy(...argmts);
  await contract.deployed();
  return contract;
};

/**
 * Get the implementation address correpond to a Factory contract
 * @param factory The factory contract that have the implementation. For ex: a TrustFactory or SaleFactory
 * @returns The implementation address
 */
export const getImplementation = async (factory: Factory): Promise<string> => {
  const { implementation } = (await getEventArgs(
    factory.deployTransaction,
    "Implementation",
    factory
  )) as ImplementationEvent["args"];

  if (!ethers.utils.isAddress(implementation)) {
    throw new Error(
      `invalid implementation address: ${implementation} (${implementation.length} chars)`
    );
  }

  return implementation;
};

/**
 * Get the child address created by a factory contract in the correspond `transaction`
 * @param factory factory The factory contract that create the child. For ex: a TrustFactory or SaleFactory
 * @param transaction Transaction where the child was created
 * @returns Child address
 */
export const getChild = async (
  factory: Factory,
  transaction: ContractTransaction
): Promise<string> => {
  const { child } = (await getEventArgs(
    transaction,
    "NewChild",
    factory
  )) as NewChildEvent["args"];

  if (!ethers.utils.isAddress(child)) {
    throw new Error(`invalid address: ${child} (${child.length} chars)`);
  }

  return child;
};

/**
 * Send empty transactions to mine new blocks. Mainly used in HH network
 * @param count (optional) amount of block to be mined. If not provided, will just mine one block
 */
export const createEmptyBlock = async (count?: number): Promise<void> => {
  const signers = await ethers.getSigners();
  const tx = { to: signers[1].address };
  if (count && count > 0) {
    for (let i = 0; i < count; i++) {
      await signers[0].sendTransaction(tx);
    }
  } else {
    await signers[0].sendTransaction(tx);
  }
};

/**
 * Wait until reach an specific blockNumber, useful to live networks. ** Note:** since HH network increase
 * block when mined, try calling `createEmptyBlock` insted
 * @param blockNumber amount of block to wait
 */
export const waitForBlock = async (blockNumber: number): Promise<void> => {
  const currentBlock = await ethers.provider.getBlockNumber();

  if (currentBlock >= blockNumber) {
    return;
  }

  console.log({
    currentBlock,
    awaitingBlock: blockNumber,
  });

  await delay(2000);

  return await waitForBlock(blockNumber);
};

/**
 * Create a promise to wait a determinated `ms`
 * @param ms Amount of time to wait in miliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Read a file a return it as string
 * @param _path Location of the file
 * @returns The file as string
 */
export const fetchFile = (_path: string): string => {
  try {
    return fs.readFileSync(_path).toString();
  } catch (error) {
    console.log(error);
    return "";
  }
};

/**
 * Write a file
 * @param _path Location of the file
 * @param file The file
 */
// eslint-disable-next-line
export const writeFile = (_path: string, file: any): void => {
  try {
    fs.writeFileSync(_path, file);
  } catch (error) {
    console.log(error);
  }
};

/**
 *
 * @param tx transaction where event occurs
 * @param eventName name of event
 * @param contract contract object holding the address, filters, interface
 * @param contractAddressOverride (optional) override the contract address which emits this event
 * @returns Event arguments, can be deconstructed by array index or by object key
 */
export const getEventArgs = async (
  tx: ContractTransaction,
  eventName: string,
  contract: Contract,
  contractAddressOverride: string | null = null
): Promise<Result> => {
  const eventObj = (await tx.wait()).events?.find(
    (x) =>
      x.topics[0] === contract.filters[eventName]().topics?.[0] &&
      x.address === (contractAddressOverride || contract.address)
  );

  if (!eventObj) {
    throw new Error(`Could not find event with name ${eventName}`);
  }

  // Return all events indexed and not indexed
  return contract.interface.decodeEventLog(
    eventName,
    eventObj.data,
    eventObj.topics
  );
};

export const wait = 1000;

/**
 * Converts a value to raw bytes representation. Assumes `value` is less than or equal to 1 byte, unless a desired `bytesLength` is specified.
 * @param value value to convert to raw bytes format
 * @param bytesLength (defaults to 1) number of bytes to left pad if `value` doesn't completely fill the desired amount of memory. Will throw `InvalidArgument` error if value already exceeds bytes length.
 * @returns {Uint8Array} raw bytes representation
 */
export function bytify(
  value: number | BytesLike | Hexable,
  bytesLength = 1
): BytesLike {
  return zeroPad(hexlify(value), bytesLength);
}

/**
 * Converts an opcode and operand to bytes, and returns their concatenation.
 * @param code the opcode
 * @param erand the operand, currently limited to 1 byte (defaults to 0)
 */
export function op(code: number, erand = 0): Uint8Array {
  return concat([bytify(code), bytify(erand)]);
}

/**
 * Get the block and timestamp of a specific transaction
 * @param tx Transaction that will be use to get the block and timestamp
 * @returns The block and timestamp of the transaction
 */
export const getTxTimeblock = async (
  tx: ContractTransaction
): Promise<[number, number]> => {
  const block = tx.blockNumber;
  if (block == undefined) return [0, 0];
  const timestamp = (await ethers.provider.getBlock(block)).timestamp;
  return [block, timestamp];
};

export const afterBlockNumberSource = (constant: number): Uint8Array => {
  // prettier-ignore
  return concat([
    // (BLOCK_NUMBER blockNumberSub1 gt)
      op(AllStandardOps.BLOCK_NUMBER),
      op(AllStandardOps.CONSTANT, constant),
    op(AllStandardOps.GREATER_THAN),
  ]);
};

export const betweenBlockNumbersSource = (
  vStart: Uint8Array,
  vEnd: Uint8Array
): Uint8Array => {
  // prettier-ignore
  return concat([
        op(AllStandardOps.BLOCK_NUMBER),
        vStart,
      op(AllStandardOps.GREATER_THAN),
        op(AllStandardOps.BLOCK_NUMBER),
        vEnd,
      op(AllStandardOps.LESS_THAN),
    op(AllStandardOps.EVERY, 2),
  ])
};

export const fixedPointMul = (a: BigNumber, b: BigNumber): BigNumber =>
  a.mul(b).div(ONE);
export const fixedPointDiv = (a: BigNumber, b: BigNumber): BigNumber =>
  a.mul(ONE).div(b);
export const minBN = (a: BigNumber, b: BigNumber): BigNumber =>
  a.lt(b) ? a : b;
export const maxBN = (a: BigNumber, b: BigNumber): BigNumber =>
  a.gt(b) ? a : b;

/////////

/**
 * @public
 * All Rainterpreter opmetas
 */
// export const rainterpreterOpmeta = [
//   chainlinkOraclePriceMeta,
//   callMeta,
//   contextMeta,
//   contextRowMeta,
//   debugMeta,
//   doWhileMeta,
//   foldContextMeta,
//   getMeta,
//   loopNMeta,
//   readMemoryMeta,
//   setMeta,
//   hashMeta,
//   erc20BalanceOfMeta,
//   erc20TotalSupplyMeta,
//   erc20SnapshotBalanceOfatMeta,
//   erc20SnapshotTotalSupplyAtMeta,
//   erc721BalanceOfMeta,
//   erc721OwnerOfMeta,
//   erc1155BalanceOfMeta,
//   erc1155BalanceOfBatchMeta,
//   ensureMeta,
//   blockNumberMeta,
//   timestampMeta,
//   explode32Meta,
//   fixedPointScale18Meta,
//   fixedPointScale18DivMeta,
//   fixedPointScale18MulMeta,
//   fixedPointScaleByMeta,
//   fixedPointScaleNMeta,
//   anyMeta,
//   eagerIfMeta,
//   equalToMeta,
//   everyMeta,
//   greaterThanMeta,
//   isZeroMeta,
//   lessThanMeta,
//   saturatingAddMeta,
//   saturatingMulMeta,
//   saturatingSubMeta,
//   addMeta,
//   divMeta,
//   expMeta,
//   maxMeta,
//   minMeta,
//   modMeta,
//   mulMeta,
//   subMeta,
//   iOrderBookV1VaultBalanceMeta,
//   iSaleV2RemainingTokenInventoryMeta,
//   iSaleV2ReserveMeta,
//   iSaleV2SaleStatusMeta,
//   iSaleV2TokenMeta,
//   iSaleV2TotalReserveReceivedMeta,
//   iVerifyV1AccountStatusAtTimeMeta,
//   iTierV2ReportMeta,
//   iTierV2ReportTimeForTierMeta,
//   saturatingDiffMeta,
//   selectLteMeta,
//   updateTimesForTierRangeMeta,
// ];

// /**
//  * @public
//  * Compress and convert Rainterpreter opmetas to bytes
//  * @returns hex string
//  */
// export const getRainterpreterOpmetaBytes = (): string => {
//   const opmetaBytes = Uint8Array.from(
//     deflateSync(
//       format(JSON.stringify(rainterpreterOpmeta, null, 4), { parser: "json" })
//     )
//   );
//   let opmetaHexString = "0x";
//   for (let i = 0; i < opmetaBytes.length; i++) {
//     opmetaHexString =
//       opmetaHexString + opmetaBytes[i].toString(16).padStart(2, "0");
//   }
//   return opmetaHexString;
// };
