import { DeployExpression, ValidInterpreter } from "../generated/RainterpreterExpressionDeployer/RainterpreterExpressionDeployer";
import { Account, Contract, DeployExpressionEvent, Expression, ExpressionDeployer, Interpreter, InterpreterInstance, StateConfig, Transaction } from "../generated/schema";
import { Rainterpreter } from "../generated/RainterpreterExpressionDeployer/Rainterpreter";
import { decodeSources } from "./utils";
export function handleValidInterpreter(event: ValidInterpreter): void {
    let interpreter = new Interpreter(event.params.interpreter.toHex());
    interpreter.save();
    
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
    // let pointers: string[] = [];
    // for(let i=0;i<functionPointers.length;i=i+4){
    //     pointers.push(functionPointers.slice(i,i+4));
    // }
    expressionDeployer.functionPointers = functionPointers;
    expressionDeployer.save();
}

export function handleDeployExpression(event: DeployExpression): void { 
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
