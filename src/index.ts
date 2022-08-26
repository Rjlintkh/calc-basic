import { Context } from "./interpretation/context";
import { Interpreter } from "./interpretation/interpreter";
import { Parser } from "./parsing/parser";

export namespace CalcBasic {
    const parser = new Parser();

    export function createContext() {
        return new Context();
    }

    export async function runInContext(input: string, ctx: Context, setup?: (intr: Interpreter) => void) {
        const ast = parser.parse(input);
        const interpreter = new Interpreter(ast, ctx);
        if (setup) setup(interpreter);
        const result = await interpreter.evaluate();
        return ctx.format(result);
    }
}