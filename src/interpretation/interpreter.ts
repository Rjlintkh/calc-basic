import nerdamer from "nerdamer";
import { GoError, MathError } from "../data/errors";
import { AngleUnit, M, NumberBase } from "../data/math";
import { getConstant } from "../data/predefined/constants";
import { getFunction } from "../data/predefined/functions";
import { PairedVarTable, SingleVarTable } from "../data/table";
import { ConversionUtils } from "../data/utils/conversion_utils";
import { StatUtils } from "../data/utils/stat_utils";
import { AlgebraicObject, NumericRepresentation, one, zero } from "../data/value";
import { BaseNode, BinaryExpressionNode, BreakStatementNode, CallExpressionNode, CommandNode, DataInputNode, ErrorNode, ExpressionStatementNode, ExpressionType, ForStatementNode, IfStatementNode, Implicity, NodeType, NumericLiteralNode, PairedDatumNode, ProgramNode, SymbolNode, TernaryExpressionNode, UnaryExpressionNode, UnconditionalJumpStatementNode, VariableAssignmentNode, WhileStatementNode } from "../parsing/nodes";
import { Parser } from "../parsing/parser";
import { Delimiters, Keyword, NamedCalculation, Operators } from "../parsing/tokens";
import { ConfigProperty, FrequencySetting } from "./config";
import { Context } from "./context";
const debug = false;

interface EvaluateOptions {
    preserveX?: boolean;
    base?: NumberBase;
}

export class Interpreter {
    constructor(private program: ProgramNode, public ctx: Context) {
    }

    private promptInputQueue = new Array<string | BaseNode>();

    private allOutputs = new Array<AlgebraicObject>();

    private tmpParser?: Parser;

    queuePromptInput(...inputs: (string | BaseNode)[]) {
        this.promptInputQueue.push(...inputs);
    }
    
    getAllOutputs(format = false) {
        if (format) {
            return this.allOutputs.map(v => this.ctx.format(v));
        }
        return this.allOutputs;
    }

    private promptCallback?: (prompt: string) => Promise<string | BaseNode | null>;
    onPrompt(callback: (variable: string) => Promise<string | BaseNode | null>) {
        this.promptCallback = callback;
    }

    private async prompt(variable: string) {
        const queued = this.promptInputQueue.shift();
        if (queued != null) return queued;
        if (!this.promptCallback) return null;
        return await this.promptCallback(variable);
    }

    private outputCallback?: (data: AlgebraicObject, formatted: string) => Promise<void>;
    onOutput(callback: (data: AlgebraicObject, formatted: string) => Promise<void>) {
        this.outputCallback = callback;
    }

    private async output(data: AlgebraicObject) {
        this.allOutputs.push(data);
        const formatted = this.ctx.format(data);
        if (!this.outputCallback) {
            return;
        }
        await this.outputCallback(data, formatted);
    }

    private errorCallback?: (err: Error) => Promise<void>;
    onError(callback: (err: Error) => Promise<void>) {
        this.errorCallback = callback;
    }

    private async error(err: Error) {
        if (!this.errorCallback) {
            console.error("Error:", err.message);
            return;
        }
        await this.errorCallback(err);
    }

    private closeCallback?: (result: AlgebraicObject, formatted: string) => Promise<void>;
    onClose(callback: (result: AlgebraicObject, formatted: string) => Promise<void>) {
        this.closeCallback = callback;
    }


    private async close(result: AlgebraicObject) {
        const formatted = this.ctx.format(result);
        if (!this.closeCallback) {
            return;
        }
        await this.closeCallback(result, formatted);
    }

    private getOrCreateTmpParser() {
        if (!this.tmpParser) {
            this.tmpParser = new Parser();
        }
        return this.tmpParser;
    }

    async evaluate() {
        const result = await this.evaluateAny(this.program, {}).catch(async err => {
            await this.error(<Error>err);
            return AlgebraicObject.const("NaN");
        });
        this.allOutputs.push(result);
        await this.close(result);
        return result;
    }

    private async _evaluateAny(node: BaseNode, options: EvaluateOptions) {
        switch (node.type) {
            case NodeType.Program:
                return await this.evaluateProgram(<ProgramNode>node, options);
            case NodeType.Error:
                (<ErrorNode>node).throw();
            case NodeType.NumericLiteral:
                return this.evaluateNumericLiteral(<NumericLiteralNode>node, options);
            case NodeType.StringLiteral:
                return zero;
            case NodeType.ExpressionStatement:
                return await this.evaluateExpressionStatement(<ExpressionStatementNode>node, options);
            case NodeType.VariableAssignment:
                return await this.evaluateVariableAssignment(<VariableAssignmentNode>node, options);
            case NodeType.DataInput:
                return await this.evaluateDataInput(<DataInputNode>node, options);
            case NodeType.IfStatement:
                return this.evaluateIfStatement(<IfStatementNode>node, options);
            case NodeType.ForStatement:
                return this.evaluateForStatement(<ForStatementNode>node, options);
            case NodeType.WhileStatement:
                return this.evaluateWhileStatement(<WhileStatementNode>node, options);
            case NodeType.BreakStatement:
                return this.evaluateBreakStatement(<BreakStatementNode>node, options);
            case NodeType.UnconditionalJumpStatement:
                return this.evaluateUnconditionalJumpStatement(<UnconditionalJumpStatementNode>node, options);
            case NodeType.Symbol:
                return await this.evaluateSymbol(<SymbolNode>node, options);
            case NodeType.Command:
                return this.evaluateCommand(<CommandNode>node, options);
            case NodeType.IfEndStatement:
            case NodeType.NextStatement:
            case NodeType.WhileEndStatement:
                return zero;
            case NodeType.Frequency:
            case NodeType.PairedDatum:
                throw new SyntaxError(`${node.type} must be input as data`);
        }
    }

    private async evaluateAny(node: BaseNode, options: EvaluateOptions): Promise<AlgebraicObject> {
        const value = await this._evaluateAny(node, options);
        this.ctx.validateRange(value);
        return value;
    }

    private currentStatementIndex = 0;

    private jumpToIndex(index: number) {
        if (index === -1) return this.jumpToEnd();
        this.currentStatementIndex = index - 1; // -1 to account for the increment in the for loop
    }

    private jumpOnce() {
        this.currentStatementIndex++;
    }

    private jumpToEnd() {
        this.currentStatementIndex = -1;
    }

    private pendingJumps = new Map<number, number>();
    private pendJump(from: number, to: number) {
        this.pendingJumps.set(from, to); // no need -1 as it is incremented in the for loop before the jump is made
    }
    private unpendJump(from: number) {
        this.pendingJumps.delete(from);
    }

    private async evaluateProgram({body}: ProgramNode, options: EvaluateOptions): Promise<AlgebraicObject> {
        let result = AlgebraicObject.const(0);
        for (this.currentStatementIndex = 0; this.currentStatementIndex < body.length; this.currentStatementIndex++) {
            if (this.pendingJumps.has(this.currentStatementIndex)) {
                const to = this.pendingJumps.get(this.currentStatementIndex)!;
                debug && console.log(`JUMP ${this.currentStatementIndex} -> ${to}`);
                this.currentStatementIndex = to;
            }

            if (this.currentStatementIndex === -1) break; // Jump to end

            const node = body[this.currentStatementIndex];
            
            let answer = await this.evaluateAny(node, options);
             
            debug && console.log(`EVAL ${this.currentStatementIndex}`, node);
            
            if (!node.getShouldIgnoreAnswer()) {
                this.ctx.newAnswer(result = answer);
            }
            if (node.getShouldOutput()) await this.output(result);
            if (node.getShouldConditionalJump() && answer.eq(zero)) this.jumpOnce();
        }
        return result;
    }

    private evaluateExpressionStatement(node: ExpressionStatementNode, options: EvaluateOptions) {
        switch (node.expression) {
            case ExpressionType.Unary:
                return this.evaluateUnaryExpression(<UnaryExpressionNode>node, options);
            case ExpressionType.Binary:
                return this.evaluateBinaryExpression(<BinaryExpressionNode>node, options);
            case ExpressionType.Ternary:
                return this.evaluateTernaryExpression(<TernaryExpressionNode>node, options);
            case ExpressionType.Call:
                return this.evaluateCallExpression(<CallExpressionNode>node, options);
        }
    }

    private async evaluateUnaryExpression(node: UnaryExpressionNode, options: EvaluateOptions) {
        switch (node.operator) {
            case "d": 
                return this.evaluateNumericLiteral(<NumericLiteralNode>node.arg, {base: NumberBase.Dec, ...options});
            case "h":
                return this.evaluateNumericLiteral(<NumericLiteralNode>node.arg, {base: NumberBase.Hex, ...options});
            case "b":
                return this.evaluateNumericLiteral(<NumericLiteralNode>node.arg, {base: NumberBase.Bin, ...options});
            case "o":
                return this.evaluateNumericLiteral(<NumericLiteralNode>node.arg, {base: NumberBase.Oct, ...options});
        }
        const arg = await this.evaluateAny(node.arg, options);
        switch (node.operator) {
            case "+":
                return arg;
            case "-":
                return zero.minus(arg);
            case "²":
                return arg.pow(2);
            case "³":
                return arg.pow(3);
            case "⁻¹":
                return arg.pow(-1);
            case "!":
                return M.factorial(arg);
            case "°":
                return ConversionUtils.toAngleUnit(arg, AngleUnit.Deg, this.ctx.getConfigProperty(ConfigProperty.AngleUnit));
            case "ʳ":
                return ConversionUtils.toAngleUnit(arg, AngleUnit.Rad, this.ctx.getConfigProperty(ConfigProperty.AngleUnit));
            case "ᵍ":
                return ConversionUtils.toAngleUnit(arg, AngleUnit.Gra, this.ctx.getConfigProperty(ConfigProperty.AngleUnit));
            case "%":
                return arg.div(100);
            case Delimiters.EstimatedX:
                if (!this.ctx.table) throw new MathError("No table defined");
                return StatUtils.estimatedX(this.ctx.table, arg);
            case Delimiters.EstimatedY:
                if (!this.ctx.table) throw new MathError("No table defined");
                return StatUtils.estimatedY(this.ctx.table, arg);
            case Delimiters.EstimatedX2:
                if (!this.ctx.table) throw new MathError("No table defined");
                return StatUtils.estimatedX2(this.ctx.table, arg);
            case Operators.ExponentialOperator:
                if (!arg.isInteger() || arg.text().length > 2) throw new SyntaxError(`${Operators.ExponentialOperator} must be followed by an integer with less than 3 digits`);
                return AlgebraicObject.const(10).pow(arg);
            case Operators.SexagesimalOperator:
                return new AlgebraicObject(arg.value, NumericRepresentation.Sexagesimal);
        }
        return zero;
    }

    private async evaluateBinaryExpression(node: BinaryExpressionNode, options: EvaluateOptions) {
        const left = await this.evaluateAny(node.left, options);
        const right = await this.evaluateAny(node.right, options);
        switch (node.operator) {
            case "+":
                return left.plus(right);
            case "-":
                return left.minus(right);
            case "*": 
                if (node.getImplicity() === Implicity.ParenthesizedSexagesimalImplicit) {
                    const retval = left.times(right);
                    return new AlgebraicObject(retval.value, NumericRepresentation.Decimal);
                }
                return left.times(right);
            case "/":
                if (right.eq(zero)) throw new MathError();
                return left.div(right);
            case "=":
                return left.eq(right) ? one : zero;
            case "≠":
                return left.eq(right) ? zero : one;
            case ">":
                return left.gt(right) ? one : zero;
            case "≥":
                return left.gte(right) ? one : zero;
            case "<":
                return left.lt(right) ? one : zero;
            case "≤":
                return left.lte(right) ? one : zero;
            case "^":
                if (left.eq(zero) && right.eq(zero)) throw new MathError();
                return left.pow(right);
            case "ˣ√":
                if (left.eq(zero)) throw new MathError();
                return right.root(left);
            case "choose":
                return M.nCr(left, right);
            case "permute":
                return M.nPr(left, right);
            case "multichoose":
                return M.nPr(left, right);
            case "∠": {
                const angle = ConversionUtils.toAngleUnit(right, this.ctx.getConfigProperty(ConfigProperty.AngleUnit), AngleUnit.Rad);
                return M.rcis(left, angle);
            }
            case "mod":
                return M.mod(left, right);
            case "or":
                return M.or(left, right);
            case "and":
                return M.and(left, right);
            case "xnor":
                return M.xnor(left, right);
            case "xor":
                return M.xor(left, right);
            case Delimiters.Fraction:
                if (right.eq(zero)) throw new MathError();
                return left.over(right);
            case Operators.SexagesimalOperator: {
                const retval = left.plus(right.div(60));
                return new AlgebraicObject(retval.value, NumericRepresentation.Sexagesimal);
            }
        }
        return zero;
    }

    private async evaluateTernaryExpression(node: TernaryExpressionNode, options: EvaluateOptions) {
        const left = await this.evaluateAny(node.left, options);
        const middle = await this.evaluateAny(node.middle, options);
        const right = await this.evaluateAny(node.right, options);
        switch (node.operator) {
            case Delimiters.Fraction: {
                const fraction = middle.over(right);
                const mixed = left.plus(fraction);
                const ret = ((left.isFraction() || left.isInteger()) && fraction.isFraction()) ?
                    new AlgebraicObject(mixed.value, NumericRepresentation.Fraction) : mixed;
                return ret;
            }
                
            case Operators.SexagesimalOperator: {
                const retval = left.plus(middle.div(60)).plus(right.div(3600));
                return new AlgebraicObject(retval.value, NumericRepresentation.Sexagesimal);
            }
        }
        return zero;
    }

    private async evaluateCallExpression(node: CallExpressionNode, options: EvaluateOptions) {
        const func = getFunction(node.callee.name);
        if (!func) throw new ReferenceError(`${node.callee.name} is not defined`);
        const args = new Array<AlgebraicObject>();
        for (const [i, arg] of node.args.entries()) {
            let argValue: AlgebraicObject;
            if (i === 0 && func.isExpressional()) {
                argValue = await this.evaluateAny(arg, {...options, preserveX: true});
            } else {
                argValue = await this.evaluateAny(arg, options);
            }
            args.push(argValue);
        }
        return func.call(this.ctx, ...args);
    }

    private async evaluateVariableAssignment(node: VariableAssignmentNode, options: EvaluateOptions) {
        let result: AlgebraicObject;
        if (node.value instanceof SymbolNode && node.value.name === Delimiters.InputPrompt) {
            let input = await this.prompt(node.identifier.name);
            if (input != null) {
                if (typeof input === "string") {
                    const parser = this.getOrCreateTmpParser();
                    input = parser.parse(input);
                }
                const interpreter = new Interpreter(new ProgramNode(
                    0,
                    [input],
                    {},
                ), this.ctx);
                result = await interpreter.evaluate();
            }
            else return this.ctx.getVariable(node.identifier.name);
        } else {
            result = await this.evaluateAny(node.value, options);
        }
        if (node.identifier.name === "M+") {
            const varM = this.ctx.getVariable("M");
            this.ctx.setVariable("M", varM.plus(await this.evaluateAny(node.value, options)));
        } else if (node.identifier.name === "M-") {
            const varM = this.ctx.getVariable("M");
            this.ctx.setVariable("M", varM.minus(await this.evaluateAny(node.value, options)));
        } else {
            this.ctx.setVariable(node.identifier.name, result);
        }
        return result;
    }

    private async evaluateDataInput(node: DataInputNode, options: EvaluateOptions) {
        if (!this.ctx.table) throw new SyntaxError("Table is undefined");
        
        const values = [];
        if (this.ctx.table instanceof SingleVarTable) {
            if (node.value instanceof PairedDatumNode) throw new SyntaxError("Cannot input paired data into single variable table");
            const x = await this.evaluateAny(node.value, options);
            values.push(x);
        } else if (this.ctx.table instanceof PairedVarTable) {
            if (node.value instanceof PairedDatumNode) {
                const x = node.value.primary ? await this.evaluateAny(node.value.primary, options) : AlgebraicObject.const(0);
                const y = await this.evaluateAny(node.value.secondary, options);
                values.push(x, y);
            } else {
                const x = await this.evaluateAny(node.value, options);
                values.push(x, AlgebraicObject.const(0));
            }
        }

        let frequency = AlgebraicObject.const(1);
        if (node.frequency) {
            if (this.ctx.getConfigProperty(ConfigProperty.FrequencySetting) === FrequencySetting.FreqOff) throw new SyntaxError("Frequency is not enabled");
            frequency = await this.evaluateAny(node.frequency, options)
        }

        const lineNumber = this.ctx.table.newLine(...values, frequency);
        return AlgebraicObject.const(lineNumber);
    }

    private async evaluateIfStatement(node: IfStatementNode, options: EvaluateOptions) {
        const condition = await this.evaluateAny(node.condition, options);
        if (condition.eq(0)) { // Condition is false
            if (node.hasElse()) {
                this.jumpToIndex(node.elseIndex); // Jump to Else
            } else if (node.hasEnd()) {
                this.jumpToIndex(node.endIndex); // Jump to IfEnd
            } else this.jumpToEnd(); // Jump to end
        } else { // Condition is true
            this.jumpToIndex(node.thenIndex); // Jump to Then
            if (node.hasElse()) {
                if (node.hasEnd()) {
                    this.pendJump(node.elseIndex, node.endIndex); // Pend jump from Else to IfEnd
                } else {
                    this.pendJump(node.elseIndex, -1); // Pend jump from Else to end
                }
            }
        }
        return condition;
    }

    private async evaluateForStatement(node: ForStatementNode, options: EvaluateOptions) {
        if (!node.hasNext()) throw new SyntaxError(`${Keyword.For} must have a ${Keyword.Next}`);
        if (node.getStartingValueAssigned()) {
            const step = node.step ? await this.evaluateAny(node.step, options) : one;
            const varStep = this.ctx.getVariable(node.assignment.identifier.name);
            varStep.plus(step);
            this.ctx.setVariable(node.assignment.identifier.name, varStep);
        } else {
            this.evaluateVariableAssignment(node.assignment, options);
            node.setStartingValueAssigned();
        }
        const variable = this.ctx.getVariable(node.assignment.identifier.name);
        const endingValue = await this.evaluateAny(node.endingValue, options);
        if (variable.lte(endingValue)) {
            this.pendJump(node.endIndex, node.startIndex);
        } else {
            this.unpendJump(node.endIndex);
            this.jumpToIndex(node.endIndex);
        }
        return variable;
    }

    private async evaluateWhileStatement(node: WhileStatementNode, options: EvaluateOptions) {
        if (!node.hasEnd()) throw new SyntaxError(`${Keyword.While} must have a ${Keyword.WhileEnd}`);
        const condition = await this.evaluateAny(node.condition, options);
        if (condition.eq(zero)) { // Condition is false
            this.unpendJump(node.endIndex); // Unpend jump from WhileEnd to While
            this.jumpToIndex(node.endIndex);
        } else { // Condition is true
            this.pendJump(node.endIndex, node.startIndex); // Pend jump from WhileEnd to While
        }
        return condition;
    }

    private async evaluateBreakStatement(node: BreakStatementNode, options: EvaluateOptions) {
        const index = node.targetStatement.endIndex;
        this.unpendJump(index);
        this.jumpToIndex(index);
        return zero;
    }

    private async evaluateUnconditionalJumpStatement(node: UnconditionalJumpStatementNode, options: EvaluateOptions) {
        if (node.goto) {
            const pos = this.program.labels[node.label];
            if (pos == null) throw new GoError(`Label ${node.label} is not defined`);
            this.jumpToIndex(pos);
        }
        return zero;
    }

    private evaluateNumericLiteral(node: NumericLiteralNode, options: EvaluateOptions) {
        const value = ConversionUtils.escapeHex(node.value);
        const base = options.base ?? this.ctx.getModeProperty("numberBase");
        const based = ConversionUtils.toBase(new AlgebraicObject(nerdamer(value), NumericRepresentation.Decimal), base, NumberBase.Dec);
        return based;
    }

    private async evaluateSymbol(node: SymbolNode, options: EvaluateOptions) {
        if (options.preserveX && node.name === "X") return AlgebraicObject.const("X");
        if (node.name === "i") return AlgebraicObject.const("i");

        const constant = getConstant(node.name);
        if (constant) return constant.value;

        for (const name of Object.values(NamedCalculation)) {
            if (node.name === name) {
                switch (node.name) {
                    case NamedCalculation.RandomNumber:
                        return M.rand();
                    case NamedCalculation.StatXSquareSum:
                    case NamedCalculation.StatXSum:
                    case NamedCalculation.StatCount:
                    case NamedCalculation.StatYSquareSum:
                    case NamedCalculation.StatYSum:
                    case NamedCalculation.StatXYSum:
                    case NamedCalculation.StatXSquareYSum:
                    case NamedCalculation.StatXCubeSum:
                    case NamedCalculation.StatXFourthPowerSum:
                    case NamedCalculation.StatXMean:
                    case NamedCalculation.StatXSampleStandardDeviation:
                    case NamedCalculation.StatXPopulationStandardDeviation:
                    case NamedCalculation.StatYMean:
                    case NamedCalculation.StatYSampleStandardDeviation:
                    case NamedCalculation.StatYPopulationStandardDeviation:
                    case NamedCalculation.StatCoefficientA:
                    case NamedCalculation.StatCoefficientB:
                    case NamedCalculation.StatCoefficientC:
                    case NamedCalculation.StatCoefficientR:
                    case NamedCalculation.StatMinX:
                    case NamedCalculation.StatMaxX:
                    case NamedCalculation.StatMinY:
                    case NamedCalculation.StatMaxY:
                        return StatUtils.summary(<PairedVarTable>this.ctx.table, node.name);
                }
            }
        }

        return this.ctx.getVariable(node.name);
    }

    private evaluateCommand(node: CommandNode, options: EvaluateOptions) {
        switch (node.name) {
            case Keyword.ClrMemory:
                this.ctx.initMemory();
                break;
            case Keyword.ClrStat:
                this.ctx.initTable();
                break;
            case Keyword.Deg:
            case Keyword.Rad:
            case Keyword.Gra:
                this.ctx.setConfigProperty(ConfigProperty.AngleUnit, AngleUnit[node.name]);
                break;
            case Keyword.Dec:
            case Keyword.Hex:
            case Keyword.Bin:
            case Keyword.Oct:
                this.ctx.setModeProperty("numberBase", NumberBase[node.name]);
                break;
        }
        return zero;
    }
}