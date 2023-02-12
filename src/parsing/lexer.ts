import { Delimiters, Keyword, Operators, Token, TokenType } from "./tokens";

export class Lexer {
    private input = "";
    private readonly inputOrignal = "";
    private cursor = 0;
    private fakedRightParentheses = new Array<number>();

    constructor() {
    }

    init(input: string) {
        // @ts-ignore
        this.inputOrignal = this.input = input;
        this.cursor = 0;
        this.fakedRightParentheses = [];
    }

    insert(input: string, index: number = this.cursor) {
        const original = this.input;
        this.input = original.slice(0, index) + input + original.slice(index);
        if (this.cursor >= index) {
            this.cursor += input.length;
        }
    }

    inputModified() {
        return this.input !== this.inputOrignal;
    }
    getInput(original = false) {
        return original ? this.inputOrignal : this.input;
    }

    private hasMoreTokens() {
        return this.cursor < this.input.length;
    }

    getInputLength() {
        return this.input.length;
    }

    emptyZero() {
        return new Token(TokenType.Number, "0", this.cursor, this.cursor);
    }

    isFakeRightParenthesis(index = this.cursor) {
        return this.fakedRightParentheses.includes(index);
    }

    fakeRightParenthesis() {
        this.fakedRightParentheses.push(this.cursor);
        return new Token(TokenType.RightParenthesis, Operators.RightParenthesis, this.cursor, this.cursor);
    }

    getCursorCurrent() {
        return this.cursor;
    }

    getCursorLast() {
        return this.cursor - 1;
    }

    nextToken() {
        let stream = this.input;

        if (Delimiters.Whitespace.includes(stream[this.cursor])) {
            while (Delimiters.Whitespace.includes(stream[this.cursor])) {
                this.cursor++;
            }
        }

        if (!this.hasMoreTokens()) return null;

        if (Delimiters.Number.test(stream[this.cursor]) || stream[this.cursor] === Delimiters.Dot) {
            const start = this.cursor;
            let collection = "";
            let dots = 0;
            if (stream[this.cursor] === Delimiters.Dot) {
                collection += "0";
            }
            do {
                if (stream[this.cursor] === Delimiters.Dot) dots++;
                if (dots > 1) {
                    throw new SyntaxError(`Unexpected token . at position ${this.cursor}`);
                }
                collection += stream[this.cursor++];
            } while (Delimiters.Number.test(stream[this.cursor]) || (stream[this.cursor] === Delimiters.Dot));
            return new Token(TokenType.Number, collection, start, this.cursor);
        }

        if (stream[this.cursor] === Delimiters.Quote) {
            const start = this.cursor;
            let collection = "";
            do {
                collection += stream[this.cursor++];
            } while (stream[this.cursor] !== Delimiters.Quote && this.hasMoreTokens());
            collection += stream[this.cursor++];
            return new Token(TokenType.String, collection, start, this.cursor);
        }

        if (stream[this.cursor] === Delimiters.DoubleQuote) {
            const start = this.cursor;
            let collection = "";
            do {
                collection += stream[this.cursor++];
            } while (stream[this.cursor] !== Delimiters.DoubleQuote && this.hasMoreTokens());
            collection += stream[this.cursor++];
            return new Token(TokenType.String, collection, start, this.cursor);
        }

        for (const [name, charset] of Object.entries(Operators)) {
            const sliced = stream.slice(this.cursor);
            const start = this.cursor;
            if (Array.isArray(charset)) {
                for (const char of charset) {
                    if (sliced.startsWith(char)) {
                        this.cursor += char.length;
                        if (Operators.Level5.includes(char) && !Delimiters.Number.test(stream[this.cursor])) {
                            // hardcode level 5: numerical prefix operators
                            this.cursor = start;
                            break;
                        }
                        return new Token((TokenType as any)[name], char, start, this.cursor);
                    }
                }
            } else {
                if (sliced.startsWith(charset)) {
                    this.cursor += charset.length;
                    return new Token((TokenType as any)[name], charset, start, this.cursor);
                }
            }
        }

        if (Delimiters.Word.test(stream[this.cursor])) {
            const start = this.cursor;
            let collection = "";
            do  {
                const c = stream[this.cursor];
                if ((c === "/" && collection !== "d") ||
                    ((c === "+" || c === "-") && collection !== "M")) break;
                collection += stream[this.cursor++];
            } while (Delimiters.Word.test(stream[this.cursor]) && this.hasMoreTokens());
            if (Keyword.hasOwnProperty(collection)) {
                return new Token(TokenType.Keyword, collection, start, this.cursor);
            }
            return new Token(TokenType.Symbol, collection, start, this.cursor);
        }

        return new Token(TokenType.Unknown, stream[this.cursor], this.cursor, this.cursor++);
    }
}