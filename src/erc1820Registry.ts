import { InterfaceImplementerSet } from "../generated/ERC1820Registry/ERC1820Registry";
import { Extrospection } from "../generated/ERC1820Registry/Extrospection";
import {
  Account,
  Contract,
  DeployExpressionEvent,
  Expression,
  ExpressionDeployer,
  Factory,
  Interpreter,
  InterpreterInstance,
  StateConfig,
  Transaction,
} from "../generated/schema";
import { RainterpreterExpressionDeployerTemplate } from "../generated/templates";

import { Address, dataSource, log } from "@graphprotocol/graph-ts";

function getExtrospection(): Extrospection | null {
  const currentNetwork = dataSource.network();
  if (currentNetwork == "localhost") {
    return Extrospection.bind(
      Address.fromString("0x5daCf1ad3714D4c4E5314d946C4fa359cE85D2C6")
    );
  }
  return null;
}

export function handleInterfaceImplementerSet(
  event: InterfaceImplementerSet
): void {
  const extrospection = getExtrospection();
  if (extrospection) {
    const bytecodeHash = extrospection.bytecodeHash(event.params.implementer);
    log.info(`bytecodeHash: ${bytecodeHash.toHex()}`, []);
  }

  const expressionDeployer = new ExpressionDeployer(
    event.params.account.toHex()
  );

  expressionDeployer.save();

  RainterpreterExpressionDeployerTemplate.create(event.params.implementer);
}
