import { ethers } from "hardhat";
import { type Signer, utils, BigNumber } from "ethers";
import { type SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export const keylessDeploy = async (
  contractInfo: { abi: any; bytecode: any },
  signer: Signer | SignerWithAddress,
  args: any = []
) => {
  args = Array.isArray(args) ? args : [args];

  const provider = signer.provider;
  if (!provider || !provider._isProvider) throw new Error("Not provider");

  const { chainId } = await provider.getNetwork();
  const { maxFeePerGas, maxPriorityFeePerGas } = await estimateFeeData(chainId);

  const factory = new ethers.ContractFactory(
    contractInfo.abi,
    contractInfo.bytecode,
    signer
  );
  // const factory = await ethers.getContractFactory(contractName);
  const txReq = factory.getDeployTransaction(...args);

  const gasLimit = await provider.estimateGas(txReq);

  const tx = {
    nonce: 0,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasLimit,
    value: "0x00",
    data: txReq.data,
    type: 2,
    chainId,
  };

  const signature = {
    r: "0x1231231231231231231231231231231231231231231231231231231231231231",
    s: "0x1231231231231231231231231231231231231231231231231231231231231231",
    v: 27,
  };

  const rawTx = utils.serializeTransaction(tx, signature);
  const parsedTx = utils.parseTransaction(rawTx);
  const deployerAddress = parsedTx.from;

  // Deterministically calculated contract address
  const contractAddress = ethers.utils.getContractAddress({
    from: deployerAddress,
    nonce: 0,
  });

  // If the contract is deployed to this address, return the instance direclty
  const code = await provider.getCode(contractAddress);
  if (code != "0x") return factory.attach(contractAddress);

  const value = ethers.BigNumber.from(tx.gasLimit).mul(
    tx.maxFeePerGas.add(tx.maxPriorityFeePerGas)
  );

  // Send funds to the address
  await signer.sendTransaction({
    to: deployerAddress,
    // Send GasLimit * GasPrice of the tx
    value,
  });

  const txResp = await provider.sendTransaction(rawTx);
  const txReceipt = await txResp.wait();

  const contract = factory.attach(txReceipt.contractAddress);

  // @ts-expect-error Using attach does not add the deploy transaction
  contract.deployTransaction = txResp;

  return contract;
};

export const estimateFeeData = async (
  chainId: number
): Promise<{
  gasPrice: BigNumber;
  maxFeePerGas: BigNumber;
  maxPriorityFeePerGas: BigNumber;
}> => {
  if (chainId === 31337) {
    return {
      gasPrice: BigNumber.from("1980000104"),
      maxFeePerGas: BigNumber.from("1500000030"),
      maxPriorityFeePerGas: BigNumber.from("1500000000"),
    };
  } else {
    throw new Error("This function only support localhost.");
  }
};
