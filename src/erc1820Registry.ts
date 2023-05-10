import { InterfaceImplementerSet } from "../generated/ERC1820Registry/ERC1820Registry";
import { RainterpreterExpressionDeployerTemplate } from "../generated/templates";
import { ExpressionDeployer } from "../generated/schema";
import {
  IERC1820_NAME_IEXPRESSION_DEPLOYER_V1_HASH,
  generateTransaction,
} from "./utils";

export function handleInterfaceImplementerSet(
  event: InterfaceImplementerSet
): void {
  if (
    event.params.interfaceHash.toHex() ==
    IERC1820_NAME_IEXPRESSION_DEPLOYER_V1_HASH
  ) {
    const expressionDeployer = new ExpressionDeployer(
      event.params.account.toHex()
    );
    const transaction = generateTransaction(event);
    expressionDeployer.deployTransaction = transaction.id;

    expressionDeployer.save();

    RainterpreterExpressionDeployerTemplate.create(event.params.implementer);
  }
}
