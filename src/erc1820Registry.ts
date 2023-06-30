import { InterfaceImplementerSet } from "../generated/ERC1820Registry/ERC1820Registry";
import { RainterpreterExpressionDeployerTemplate } from "../generated/templates";
import { ExpressionDeployer } from "../generated/schema";
import {
  IERC1820_NAME_IEXPRESSION_DEPLOYER_V1_HASH,
  generateTransaction,
  ExtrospectionPerNetwork,
} from "./utils";
import { log } from "@graphprotocol/graph-ts";
export function handleInterfaceImplementerSet(
  event: InterfaceImplementerSet
): void {
  if (
    event.params.interfaceHash.toHex() ==
    IERC1820_NAME_IEXPRESSION_DEPLOYER_V1_HASH
  ) {
    const extrospection = ExtrospectionPerNetwork.get();

    const isAllowedInterpreter =
      extrospection.scanOnlyAllowedInterpreterEVMOpcodes(event.params.account);

    log.info(
      `XD_0: Address: ${event.params.account.toHex()} - allowed: ${isAllowedInterpreter}`,
      []
    );
    // If allowed, then will create the ExpressionDeployer entity.
    // Consequently, only contracts called from the ExpressionDeployer readed will
    // be show
    if (isAllowedInterpreter) {
      const expressionDeployer = new ExpressionDeployer(
        event.params.account.toHex()
      );
      const transaction = generateTransaction(event);
      expressionDeployer.deployTransaction = transaction.id;

      expressionDeployer.save();

      RainterpreterExpressionDeployerTemplate.create(event.params.implementer);
    }
  }
}
