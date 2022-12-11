import { DeployExpression, ValidInterpreter } from "../generated/RainterpreterExpressionDeployer/RainterpreterExpressionDeployer";
import { Account, Contract, DeployExpressionEvent, EvalCount, Expression, ExpressionDeployer, Factory, Interpreter, InterpreterInstance, StateConfig, Transaction } from "../generated/schema";
import { Rainterpreter} from "../generated/RainterpreterExpressionDeployer/Rainterpreter";
import { decodeSources, getFactory, NEWCHILD_EVENT } from "./utils";
import { BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { RainterpreterTemplate } from "../generated/templates";
export function handleValidInterpreter(event: ValidInterpreter): void {
    let interpreter = new Interpreter(event.params.interpreter.toHex());
    interpreter.save();
    
    RainterpreterTemplate.create(event.params.interpreter);
    let interpreterInstance = new InterpreterInstance(event.params.interpreter.toHex());
    interpreterInstance.interpreter = interpreter.id;
    interpreterInstance.save();

    let account = Account.load(event.transaction.from.toHex());
    if(!account){
        account = new Account(event.transaction.from.toHex());
        account.save();
    }

    let contract = Rainterpreter.bind(event.params.interpreter);
    let expressionDeployer = new ExpressionDeployer(event.address.toHex());
    expressionDeployer.interpreter = interpreterInstance.id;
    expressionDeployer.account = account.id;
    let functionPointers = contract.functionPointers().toHexString();

    expressionDeployer.functionPointers = functionPointers;
    expressionDeployer.save();
}

export function handleDeployExpression(event: DeployExpression): void {
    let factory: Factory;
    let receipt = event.receipt;
    if(receipt){
        let logs = receipt.logs;
        if(logs){
            for(let i=0;i<logs.length;i++){
                let topics = logs[i].topics;
                if(topics[0].toHexString() == NEWCHILD_EVENT){
                    factory = getFactory(logs[i].address.toHexString());
                }
            }
        }
    } else {
        log.info("no receipt", []);
    }

    let emitter = Account.load(event.transaction.from.toHex());
    if(!emitter){
        emitter = new Account(event.transaction.from.toHex());
        emitter.save();
    }

    let transaction = new Transaction(event.transaction.hash.toHex());
    transaction.timestamp = event.block.timestamp;
    transaction.blockNumber = event.block.number;
    transaction.save();
    
    let deployExpressionEvent = new DeployExpressionEvent(event.transaction.hash.toHex());
    deployExpressionEvent.transaction = transaction.id;
    deployExpressionEvent.emitter = emitter.id;
    deployExpressionEvent.timestamp = event.block.timestamp;

    let expressionDeployer = ExpressionDeployer.load(event.address.toHex());
    if(expressionDeployer){
        let stateConfig = new StateConfig(event.transaction.hash.toHex());
        stateConfig.sources = decodeSources(expressionDeployer.functionPointers, event.params.config.sources);
        stateConfig.constants = event.params.config.constants;
        stateConfig.save();

        let sender = Contract.load(event.params.sender.toHex());
        if(!sender){
            sender = new Contract(event.params.sender.toHex());
            sender.factory = factory.id;
            sender.save();
        }

        let expression = new Expression(event.params.expressionAddress.toHex());
        expression.event = deployExpressionEvent.id;
        expression.account = emitter.id;
        expression.sender = sender.id;
        expression.contextScratch = event.params.contextScratch;
        expression.interpreter = expressionDeployer.interpreter;
        expression.interpreterInstance = expressionDeployer.interpreter;
        expression.config = stateConfig.id;
        expression.save();

        deployExpressionEvent.expression = expression.id;
        deployExpressionEvent.save()
    }
}

export function handleEval(call: ethereum.Call): void {
    log.info("Eval Called", []);
    let interpreter = EvalCount.load(call.to.toHex());
    if(!interpreter){
        interpreter = new EvalCount(call.to.toHex());
        interpreter.evalCount = BigInt.fromI32(0);
    }
    interpreter.evalCount = interpreter.evalCount.plus(BigInt.fromI32(1));
    interpreter.save();
}