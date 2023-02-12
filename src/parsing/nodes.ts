import { Operators } from "./tokens";

export enum ExpressionType {
    Unary = "unary",
    Binary = "binary",
    Ternary = "ternary",
    Call = "call",
}

export enum NodeType {
    Program = "program",
    Error = "error",
    NumericLiteral = "numeric_literal",
    StringLiteral = "string_literal",
    ExpressionStatement = "expression_statement",
    VariableAssignment = "variable_assignment",
    DataInput = "data_input",
    Frequency = "frequency",
    PairedDatum = "paired_datum",
    DittoDatum = "ditto_datum",
    IfStatement = "if_statement",
    IfEndStatement = "if_end_statement",
    ForStatement = "for_statement",
    NextStatement = "next_statement",
    WhileStatement = "while_statement",
    WhileEndStatement = "while_end_statement",
    BreakStatement = "break_statement",
    UnconditionalJumpStatement = "unconditional_jump_statement",
    Symbol = "symbol",
    Command = "command",
}

export class BaseNode {
    private shouldOutput = false;
    private shouldConditionalJump = false;
    private shouldIgnoreAnswer = false;

    constructor(public type: NodeType, public start: number) {
    }

    setShouldOutput() {
        this.shouldOutput = true;
    }
    getShouldOutput() {
        return this.shouldOutput;
    }

    setShouldConditionalJump() {
        this.shouldConditionalJump = true;
    }
    getShouldConditionalJump() {
        return this.shouldConditionalJump;
    }

    setShouldIgnoreAnswer() {
        this.shouldIgnoreAnswer = true;
    }
    getShouldIgnoreAnswer() {
        return this.shouldIgnoreAnswer;
    }
}

export class ProgramNode extends BaseNode {
    constructor(start: number, public body: BaseNode[], public labels: Record<string, number>) {
        super(NodeType.Program, start);
    }
}

export class ErrorNode extends BaseNode {
    #err: Error;

    constructor(start: number, err: Error) {
        super(NodeType.Error, start);
        this.#err = err;
    }

    throw() {
        throw this.#err;
    }
}

export class NumericLiteralNode extends BaseNode {
    constructor(start: number, public value: string) {
        super(NodeType.NumericLiteral, start);
    }
}

export class StringLiteralNode extends BaseNode {
    constructor(start: number, public value: string) {
        super(NodeType.StringLiteral, start);
    }
}

export class ExpressionStatementNode extends BaseNode {
    constructor(start: number, public expression: ExpressionType) {
        super(NodeType.ExpressionStatement, start);
    }
}

export class UnaryExpressionNode extends ExpressionStatementNode {
    constructor(start: number, public operator: string, public arg: BaseNode, public leftAssosiative: boolean) {
        super(start, ExpressionType.Unary);
    }
}

export enum Implicity {
    Explicit,
    BareImplicit, // 2A
    ParenthesizedImplicit, // 2(A
    ParenthesizedSexagesimalImplicit, // 2”(2”
}

export class BinaryExpressionNode extends ExpressionStatementNode {
    constructor(start: number, public operator: string, public left: BaseNode, public right: BaseNode) {
        super(start, ExpressionType.Binary);
    }

    #implicity = Implicity.Explicit;
    setImplicity(implicity: Implicity) {
        this.#implicity = implicity;
    }
    getImplicity() {
        return this.#implicity;
    }
}

export class TernaryExpressionNode extends ExpressionStatementNode {
    constructor(start: number, public operator: string, public left: BaseNode, public middle: BaseNode, public right: BaseNode) {
        super(start, ExpressionType.Ternary);
    }
}

export class CallExpressionNode extends ExpressionStatementNode {
    constructor(start: number, public callee: SymbolNode, public args: BaseNode[]) {
        super(start, ExpressionType.Call);
    }
}

export class VariableAssignmentNode extends BaseNode {
    constructor(start: number, public identifier: SymbolNode, public value: BaseNode) {
        super(NodeType.VariableAssignment, start);
    }
}

export class DataInputNode extends BaseNode {
    constructor(start: number, public value: BaseNode, public frequency?: BaseNode) {
        super(NodeType.DataInput, start);
    }
}

export class FrequencyNode extends BaseNode {
    constructor(start: number, public value: BaseNode, public frequency: BaseNode) {
        super(NodeType.Frequency, start);
    }
}

export class PairedDatumNode extends BaseNode {
    constructor(start: number, public primary: BaseNode | undefined, public secondary: BaseNode) {
        super(NodeType.PairedDatum, start);
    }
}

export class DittoDatumNode extends BaseNode { // means "same as above"
    constructor(start: number, ) {
        super(NodeType.DittoDatum, start);
    }
}

export class IfStatementNode extends BaseNode {
    constructor(start: number, public condition: BaseNode) {
        super(NodeType.IfStatement, start);
    }
    thenIndex = -1;
    elseIndex = -1;
    endIndex = -1;

    hasThen() {
        return this.thenIndex !== -1;
    }
    hasElse() {
        return this.elseIndex !== -1;
    }
    hasEnd() {
        return this.endIndex !== -1;
    }
}

export class IfEndStatementNode extends BaseNode {
    constructor(start: number) {
        super(NodeType.IfEndStatement, start);
        this.setShouldIgnoreAnswer();
    }
}

export class ForStatementNode extends BaseNode {
    constructor(start: number, public startIndex: number, public assignment: VariableAssignmentNode, public endingValue: BaseNode, public step?: BaseNode) {
        super(NodeType.ForStatement, start);
        this.setShouldIgnoreAnswer();
    }

    endIndex = -1;

    hasNext() {
        return this.endIndex !== -1;
    }

    #startingValueAssigned = false;
    setStartingValueAssigned() {
        this.#startingValueAssigned = true;
    }
    getStartingValueAssigned() {
        return this.#startingValueAssigned;
    }
}

export class NextStatementNode extends BaseNode {
    constructor(start: number) {
        super(NodeType.NextStatement, start);
        this.setShouldIgnoreAnswer();
    }
}

export class WhileStatementNode extends BaseNode {
    constructor(start: number, public condition: BaseNode, public startIndex: number) {
        super(NodeType.WhileStatement, start);
    }
    endIndex = -1;
    
    hasEnd() {
        return this.endIndex !== -1;
    }
}

export class WhileEndStatementNode extends BaseNode {
    constructor(start: number) {
        super(NodeType.WhileEndStatement, start);
        this.setShouldIgnoreAnswer();
    }
}

export class BreakStatementNode extends BaseNode {
    constructor(start: number, public targetStatement: ForStatementNode | WhileStatementNode) {
        super(NodeType.BreakStatement, start);
        this.setShouldIgnoreAnswer();
    }
}

export class UnconditionalJumpStatementNode extends BaseNode {
    constructor(start: number, public goto: boolean, public label: string) {
        super(NodeType.UnconditionalJumpStatement, start);
        this.setShouldIgnoreAnswer();
    }
}

export class SymbolNode extends BaseNode {
    constructor(start: number, public name: string) {
        super(NodeType.Symbol, start);
    }
}

export class CommandNode extends BaseNode {
    constructor(start: number, public name: string) {
        super(NodeType.Command, start);
        this.setShouldIgnoreAnswer();
    }
}

export function isNumerical(node: BaseNode): boolean {
    if (node.type === NodeType.NumericLiteral) {
        return true;
    } else if (node instanceof UnaryExpressionNode) {
        if (Operators.Level10.includes(node.operator)) return isNumerical(node.arg);
    }
    return false;
}

export function isNumericSexagesimal(node: BaseNode) {
    if (node instanceof UnaryExpressionNode) {
        return isNumerical(node.arg)
    } else if (node instanceof BinaryExpressionNode) {
        return isNumerical(node.left) || isNumerical(node.right);
    } else if (node instanceof TernaryExpressionNode) {
        return isNumerical(node.left) || isNumerical(node.middle) || isNumerical(node.right);
    }
    return false;
}