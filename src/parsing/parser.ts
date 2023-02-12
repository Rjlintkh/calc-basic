import { ArgumentError } from "../data/errors";
import { getFunction, WrappedFunction } from "../data/predefined/functions";
import { Lexer } from "./lexer";
import { BaseNode, BinaryExpressionNode, BreakStatementNode, CallExpressionNode, CommandNode, DataInputNode, DittoDatumNode, ErrorNode, ForStatementNode, FrequencyNode, IfEndStatementNode, IfStatementNode, Implicity, isNumerical, isNumericSexagesimal, NextStatementNode, NumericLiteralNode, PairedDatumNode, ProgramNode, StringLiteralNode, SymbolNode, TernaryExpressionNode, UnaryExpressionNode, UnconditionalJumpStatementNode, VariableAssignmentNode, WhileEndStatementNode, WhileStatementNode } from "./nodes";
import { Delimiters, Keyword, Operators, Token, TokenType } from "./tokens";

export class Parser {
    private lexer = new Lexer();
    private lookahead: Token | null = null;

    private body = new Array<BaseNode>();
    //** Key: label, Value: index of statement the label statement is at */
    private labels = <Record<string, number>>{};
    private ifStatement?: IfStatementNode;
    private forStatement?: ForStatementNode;
    private whileStatement?: WhileStatementNode;
    private argumentListNest = 0;
    constructor() {
    }
    
    parse(input: string) {
        this.lexer.init(input);
        this.lookahead = this.lexer.nextToken();
        this.body = [];
        
        this.labels = {};
        this.ifStatement = undefined;
        this.forStatement = undefined;
        this.whileStatement = undefined;
        this.argumentListNest = 0;

        return this.parseProgram();
    }

    getCurrentIndex() {
        return this.body.length;
    }

    getInput(original = false) {
        return this.lexer.getInput(original);
    }

    private parseProgram() {
        let loop = 0;
        while (this.lookahead) {
            if (loop === 1000) throw RangeError("Infinite loop detected");
            try {
                this.body.push(this.parseExpressionStatement());
            } catch (err) {
                if (err instanceof SyntaxError || err instanceof ArgumentError) {
                    this.body.push(new ErrorNode(this.lookahead?.start ?? 0, err));
                    this.jumpToNextStatement();
                }
                else throw err;
            }
            loop++;
        }
        return new ProgramNode(
            0,
            this.body,
            this.labels
        );
    } 

    private jumpToNextStatement() {
        while (this.lookahead) {
            const type = this.lookahead?.type;
            this.eat(type);
            if (type === TokenType.Separator) return;
        }
    }
    
    private parseExpressionStatement() {
        const token = this.lookahead;
        if (this.lookahead) {
            if (token?.type === TokenType.Separator) {
                this.eat(TokenType.Separator);
                throw new SyntaxError(`Unexpected token ${token.value} at position ${token.start}`);
            }
        }
        const expression = this.parseExpression();
        if (this.lookahead) {
            const sep = this.eat(TokenType.Separator);
            switch (sep.value) {
                case Delimiters.Output:
                    expression.setShouldOutput();
                    break;
                case Delimiters.ConditionalJump:
                    expression.setShouldConditionalJump();
                    break;
            }
        }
        return expression;
    }

    private parseExpression(): BaseNode {
        return this.parseIfStatement();
    }

    private parseIfStatement() {
        const token = this.lookahead;
        if (token?.value === Keyword.If) {
            if (this.ifStatement) throw new SyntaxError(`Nested ${Keyword.If} statements are not allowed`);
            this.eat(TokenType.Keyword);
            const condition = this.parseExpression();
            return this.ifStatement = new IfStatementNode(
                token.start,
                condition
            );
        }
        if (this.ifStatement) {
            if (!this.ifStatement.hasElse() && token?.value === Keyword.Else) {
                this.eat(TokenType.Keyword);
                this.ifStatement.elseIndex = this.getCurrentIndex();
                return this.parseExpression();
            }
            if (this.ifStatement.hasThen()) {
                if (token?.value === Keyword.IfEnd) {
                    this.eat(TokenType.Keyword);
                    this.ifStatement.endIndex = this.getCurrentIndex();
                    delete this.ifStatement;
                    return new IfEndStatementNode(token.start);
                }
            } else {
                if (token?.value !== Keyword.Then) throw new SyntaxError(`Expected ${Keyword.Then} after ${Keyword.If}`);
                this.eat(TokenType.Keyword);
                this.ifStatement.thenIndex = this.getCurrentIndex();
                return this.parseExpression();
            }
        }
        return this.parseForStatement();
    }

    private parseForStatement() {
        const token = this.lookahead;
        if (token?.value === Keyword.For) {
            if (this.forStatement || this.whileStatement) throw new SyntaxError(`Nested ${Keyword.For} statements are not allowed`);
            this.eat(TokenType.Keyword);

            const assignment = this.parseAssigmentExpression();
            if (!(assignment instanceof VariableAssignmentNode)) throw new SyntaxError(`Expected variable assignment after ${Keyword.For}`);

            if (this.lookahead?.value !== Keyword.To) throw new SyntaxError(`Expected ${Keyword.To} after ${Keyword.For}`);
            this.eat(TokenType.Keyword);
            const endingValue = this.parseExpression();

            let step: BaseNode | undefined;
            // @ts-ignore
            if (this.lookahead?.value === Keyword.Step) {
                this.eat(TokenType.Keyword);
                step = this.parseExpression();
            }
            return this.forStatement = new ForStatementNode(
                token.start,
                this.getCurrentIndex(),
                assignment,
                endingValue,
                step
            );
        }
        if (this.forStatement && token?.value === Keyword.Next) {
            this.eat(TokenType.Keyword);
            this.forStatement.endIndex = this.getCurrentIndex();
            delete this.forStatement;
            return new NextStatementNode(token.start);
        }
        return this.parseWhileStatement();
    }

    private parseWhileStatement() {
        const token = this.lookahead;
        if (token?.value === Keyword.While) {
            if (this.forStatement || this.whileStatement) throw new SyntaxError(`Nested ${Keyword.While} statements are not allowed`);
            this.eat(TokenType.Keyword);
            const condition = this.parseExpression();
            return this.whileStatement = new WhileStatementNode(
                token.start,
                condition,
                this.getCurrentIndex()
            );
        }
        if (this.whileStatement && token?.value === Keyword.WhileEnd) {
            this.eat(TokenType.Keyword);
            this.whileStatement.endIndex = this.getCurrentIndex();
            delete this.whileStatement;
            return new WhileEndStatementNode(token.start);
        }
        return this.parseBreakStatement();
    }

    private parseBreakStatement() {
        const token = this.lookahead;
        if (token?.value === Keyword.Break) {
            this.eat(TokenType.Keyword);
            if (this.forStatement) {
                return new BreakStatementNode(
                    token.start,
                    this.forStatement
                );
            } else if (this.whileStatement) {
                return new BreakStatementNode(
                    token.start,
                    this.whileStatement
                );
            } else {
                throw new SyntaxError(`${Keyword.Break} can only be used inside a ${Keyword.For} or ${Keyword.WhileEnd} loop`);
            }
        }
        return this.parseUnconditionalJumpStatement();
    }

    private parseUnconditionalJumpStatement() {
        const token = this.lookahead;
        const goto = token?.value === Keyword.Goto;
        if (goto || token?.value === Keyword.Lbl) {
            const keyword = this.eat(TokenType.Keyword).value;
            const arg = this.parseAssigmentExpression();
            if (!(arg instanceof NumericLiteralNode)) throw new ArgumentError(`${keyword} statement must be followed by a number`);
            if (!goto) {
                this.labels[arg.value] = this.getCurrentIndex();
            }
            return new UnconditionalJumpStatementNode(
                token!.start,
                goto,
                arg.value
            );
        }
        return this.parseAssigmentExpression();
    }

    private parseAssigmentExpression() {
        let left = this.parseDataInputExpression();
        if (this.lookahead?.type === TokenType.AssignmentOperator) {
            this.eat(TokenType.AssignmentOperator);
            const identifier = this.parseSymbol();
            return new VariableAssignmentNode(
                left.start,
                identifier,
                left
            );
        }
        return left;
    }

    private parseDataInputExpression() {
        let left = this.parseFrequency();
        if (this.lookahead?.type === TokenType.DataInputOperator) {
            this.eat(TokenType.DataInputOperator);
            if (left instanceof FrequencyNode) {
                return new DataInputNode(
                    left.start,
                    left.value,
                    left.frequency
                );
            } else {
                return new DataInputNode(
                    left.start,
                    left
                );
            }
        }
        return left;
    }

    private parseFrequency() {
        let left = this.parsePairedDatum();
        if (this.lookahead?.type === TokenType.FrequencyOperator) {
            this.eat(TokenType.FrequencyOperator);
            let right = this.parseLevel13Expression();
            return new FrequencyNode(
                left.start,
                left,
                right
            );
        }
        return left;
    }

    private parseDittoDatum() {
        return new DittoDatumNode(
            this.lexer.getCursorCurrent(),
        )
    }

    private parsePairedDatum() {
        if (this.lookahead?.type === TokenType.FrequencyOperator) { // `;3 DT`
            return this.parseDittoDatum();
        }
        if (this.lookahead?.type === TokenType.Comma) { // `,2;3 DT`
            const operator = this.eat(TokenType.Comma);
            let right = this.parseLevel13Expression();
            return new PairedDatumNode(
                operator.start,
                this.parseImplicitZero(),
                right
            );
        }
        let left = this.parseLevel13Expression();
        if (this.argumentListNest) return left;
        // @ts-ignore
        if (this.lookahead?.type === TokenType.Comma) { // `1,2;3 DT`
            this.eat(TokenType.Comma);
            let right = this.parseLevel13Expression();
            return new PairedDatumNode(
                left.start,
                left,
                right
            );
        }
        return left;
    }

    private parseLevel13Expression() {
        let left = this.parseLevel12Expression();
        while (this.lookahead?.type === TokenType.Level13) {
            const operator = this.eat(TokenType.Level13).value;
            const right = this.parseLevel12Expression();
            left = new BinaryExpressionNode(
                left.start,
                operator,
                left,
                right
            );
        }
        return left;
    }

    private parseLevel12Expression() {
        let left = this.parseLevel11Expression();
        while (this.lookahead?.type === TokenType.Level12) {
            const operator = this.eat(TokenType.Level12).value;
            const right = this.parseLevel11Expression();
            left = new BinaryExpressionNode(
                left.start,
                operator,
                left,
                right
            );
        }
        return left;
    }

    private parseLevel11Expression() {
        let left = this.parseLevel10Expression();
        while (this.lookahead?.type === TokenType.Level11) {
            const operator = this.eat(TokenType.Level11).value;
            const right = this.parseLevel10Expression();
            left = new BinaryExpressionNode(
                left.start,
                operator,
                left,
                right
            );
        }
        return left;
    }

    private parseLevel10Expression() {
        let left = this.parseImplicitMultiplicationExpression();
        while (this.lookahead?.type === TokenType.Level10) {
            const operator = this.eat(TokenType.Level10).value;
            const right = this.parseImplicitMultiplicationExpression();
            left = new BinaryExpressionNode(
                left.start,
                operator,
                left,
                right
            );
        }
        return left;
    }

    private parseImplicitMultiplicationExpression() {
        let left = this.parseMultiplicationExpression();

        let parenthesized = false;
        let implicity: Implicity;

        while (parenthesized = this.lookahead?.type === TokenType.LeftParenthesis ||
            this.lookahead?.type === TokenType.Symbol ||
            this.lookahead?.type === TokenType.ExponentialOperator) {
            const right = this.parseLevel7Expresion();
            // @ts-ignore
            if (left?.operator === "”" && right?.operator === "”" && parenthesized) {
                if (isNumericSexagesimal(left) && isNumericSexagesimal(right)) {
                    implicity = Implicity.ParenthesizedSexagesimalImplicit;
                } else {
                    implicity = Implicity.ParenthesizedImplicit;
                }
            } else {
                implicity = parenthesized ? Implicity.ParenthesizedImplicit : Implicity.BareImplicit;
            }
            left = new BinaryExpressionNode(
                left.start,
                "*",
                left,
                right
            );
            (<BinaryExpressionNode>left).setImplicity(implicity);
        }
        return left;
    }

    private parseDivisionExpression() {
        let left = this.parseLevel7Expresion();
        while (this.lookahead?.value === "/") {
            const operator = this.eat(TokenType.Level9).value;
            const right = this.parseImplicitMultiplicationExpression(); // rule 2
            let implicity: Implicity;
            if (right instanceof BinaryExpressionNode && (implicity = right.getImplicity())) {
                this.lexer.insert("(", right.start);
                if (implicity !== Implicity.ParenthesizedImplicit || !this.lexer.isFakeRightParenthesis(this.lexer.getCursorLast())) {
                    this.lexer.insert(")");
                }
            }
            left = new BinaryExpressionNode(
                left.start,
                operator,
                left,
                right
            );
        }
        return left;
    }

    private parseMultiplicationExpression() {
        let left = this.parseDivisionExpression();
        while (this.lookahead?.value === "*") {
            const operator = this.eat(TokenType.Level9).value;
            const right = this.parseLevel7Expresion();
            left = new BinaryExpressionNode(
                left.start,
                operator,
                left,
                right
            );
        }
        return left;
    }

    private parseLevel7Expresion() { // Permutation, Combination, Complex Number  Polar Coordinate Symbol
        let left = this.parseLevel6Expresion();
        while (this.lookahead?.type === TokenType.Level7) {
            const operator = this.eat(TokenType.Level7).value;
            const right = this.parseLevel6Expresion();
            left = new BinaryExpressionNode(
                left.start,
                operator,
                left,
                right
            );
        }
        return left;
    }

    private parseLevel6Expresion() { // Statistical Estimated Value Calculations
        let arg = this.parseLevel5Expresion();
        while (this.lookahead?.type === TokenType.Level6) {
            const operator = this.eat(TokenType.Level6).value;
            arg = new UnaryExpressionNode(
                arg.start,
                operator,
                arg,
                false
            );
        }
        return arg;
    }

    private parseLevel5Expresion(): BaseNode { // Prefix Symbols
        if (this.lookahead?.type === TokenType.Level10) { // Unary plus, unary minus
            const operator = this.eat(TokenType.Level10);
            const arg = this.parseLevel5Expresion();
            return new UnaryExpressionNode(
                operator.start,
                operator.value,
                arg,
                true
            );
        } else if (this.lookahead?.type === TokenType.Level5) { // Number Base Symbol
            const operator = this.eat(TokenType.Level5);
            const arg = this.parseLevel4Expression();
            return new UnaryExpressionNode(
                operator.start,
                operator.value,
                arg,
                true
            );
        } else {
            return this.parseLevel4Expression();
        }
    }

    private parseLevel4Expression() { // Fractions
        let left = this.parseLevel3Expresion();
        if (this.lookahead?.type === TokenType.Level4) {
            const operator = this.eat(TokenType.Level4).value;
            const middle = this.parseLevel3Expresion();
            if (this.lookahead?.type === TokenType.Level4) {
                this.eat(TokenType.Level4);
                const right = this.parseLevel3Expresion();
                return new TernaryExpressionNode(
                    left.start,
                    operator,
                    left,
                    middle,
                    right
                );
            }
            return new BinaryExpressionNode(
                left.start,
                operator,
                left,
                middle
            );
        }
        return left;
    }

    private parseLevel3Expresion() { // Power, Power Root
        let left = this.parseSexagesimalExpression();
        while (this.lookahead?.type === TokenType.Level3) {
            const operator = this.eat(TokenType.Level3).value;
            const right = this.parseSexagesimalExpression();
            left = new BinaryExpressionNode(
                left.start,
                operator,
                left,
                right
            );
        }
        return left;
    }
    
    private parseSexagesimalExpression() {
        let left = this.parseLevel2Expression();
        if (this.argumentListNest) return left;
        if (this.lookahead?.type === TokenType.SexagesimalOperator) {
            const operator = this.eat(TokenType.SexagesimalOperator).value;

            // @ts-ignore
            if (this.lookahead?.type === TokenType.Number) {
                const middle = this.parseLevel2Expression();
                this.eat(TokenType.SexagesimalOperator);

                // @ts-ignore
                if (this.lookahead?.type === TokenType.Number) {
                    const right = this.parseLevel2Expression();
                    this.eat(TokenType.SexagesimalOperator);

                    // @ts-ignore
                    if (this.lookahead?.type === TokenType.Number) {
                        this.eat(TokenType.SexagesimalOperator);
                    }

                    return new TernaryExpressionNode(
                        left.start,
                        operator,
                        left,
                        middle,
                        right
                    );
                } else {
                    return new BinaryExpressionNode(
                        left.start,
                        operator,
                        left,
                        middle
                    );
                }
            } else {
                return new UnaryExpressionNode(
                    left.start,
                    operator,
                    left,
                    false
                );
            }
        }
        return left;
    }

    private parseLevel2Expression(): BaseNode { // Functions Preceded by Values
        if (this.lookahead?.type === TokenType.ExponentialOperator) {
            const operator = this.eat(TokenType.ExponentialOperator);
            const arg = this.parseLevel5Expresion();
            if (!isNumerical(arg)) throw new SyntaxError(`${Operators.ExponentialOperator} must be followed by a number`);
            return new UnaryExpressionNode(
                operator.start,
                operator.value,
                arg,
                true
            );
        } else {
            let arg = this.parseCallExpression();
            while (this.lookahead?.type === TokenType.Level2) {
                const operator = this.eat(TokenType.Level2).value;
                arg = new UnaryExpressionNode(
                    arg.start,
                    operator,
                    arg,
                    false
                );
            }
            return arg;
        }
    }

    private parseCallExpression() {
        let left = this.parsePrimaryExpression();
        if (left instanceof SymbolNode) {
            const func = getFunction(left.name);
            if (func) {
                const args = this.parseArgumentList(func);
                left = new CallExpressionNode(
                    left.start,
                    left,
                    args
                );
            }
        }
        return left;
    }

    private parseArgumentList(func: WrappedFunction) {
        if (func.mustRequireParthenesis() || this.lookahead?.type === TokenType.LeftParenthesis) {
            const [minLen, maxLen] = func.arity;
            this.eat(TokenType.LeftParenthesis);
            this.argumentListNest++;
            const args: BaseNode[] = [this.parseExpression()];
            while (this.lookahead?.type === TokenType.Comma && args.length < maxLen) {
                this.eat(TokenType.Comma);
                args.push(this.parseExpression());
            }
            this.argumentListNest--;
            if (args.length < minLen) {
                throw new SyntaxError(`Expected ${minLen} arguments, but got ${args.length}`);
            }
            this.eat(TokenType.RightParenthesis);
            return args;
        } else {
            return [this.parseExpression()];
        }
    }

    private parsePrimaryExpression(): BaseNode {
        switch (this.lookahead?.type) {
            case TokenType.LeftParenthesis:
                return this.parseParenthesizedExpression();
            case TokenType.Symbol:
                return this.parseSymbol();
            case TokenType.Keyword:
                return this.parseCommand();
            case TokenType.Keyword:
                return this.parseCommand();
            default:
                return this.parseLiteral();
        }
    }

    private parseParenthesizedExpression() {
        this.eat(TokenType.LeftParenthesis);
        const expression = this.parseLevel11Expression();
        this.eat(TokenType.RightParenthesis);
        return expression;
    }

    private parseSymbol() {
        const token = this.eat(TokenType.Symbol);
        return new SymbolNode(
            token.start,
            token.value
        );
    }

    private parseCommand() {
        const token = this.eat(TokenType.Keyword);
        return new CommandNode(
            token.start,
            token.value
        );
    }

    private parseLiteral() {
        switch (this.lookahead?.type) {
            case TokenType.Number:
                return this.parseNumericLiteral();
            case TokenType.String:
                return this.parseStringLiteral();
            default:
                const token = this.lookahead!;
                this.eat(TokenType.Unknown);
                throw new SyntaxError(`Unexpected ${token.value} at position ${token.start}`);
        }
    }

    private parseNumericLiteral() {
        const token = this.eat(TokenType.Number);
        return new NumericLiteralNode(
            token.start,
            token.value
        );
    }

    private parseStringLiteral() {
        const token = this.eat(TokenType.String);
        return new StringLiteralNode(
            token.start,
            token.value.slice(1, -1)
        );
    }

    private parseImplicitZero() {
        const token = this.lexer.emptyZero();
        return new NumericLiteralNode(
            token.start,
            token.value
        );
    }

    private eat(inferType: TokenType) {
        const token = this.lookahead;

        if (inferType === TokenType.RightParenthesis && (token == null || token?.type !== inferType)) return this.lexer.fakeRightParenthesis();

        this.lookahead = this.lexer.nextToken();
        
        if (token == null) {
            throw new SyntaxError(`Unexpected end of input`);
        }

        if (token.type !== inferType) {
            switch (token.type) {
                case TokenType.Number:
                    throw new SyntaxError(`Unexpected number at position ${token.start}`);
                case TokenType.String:
                    throw new SyntaxError(`Unexpected string at position ${token.start}`);
                default:
                    throw new SyntaxError(`Unexpected token ${token.value} at position ${token.start}`);
            }
        }

        return token;
    }
}