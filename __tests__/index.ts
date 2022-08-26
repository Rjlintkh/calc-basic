import { CalcBasic } from "../src";
import { Context } from "../src/interpretation/context";
import { Interpreter } from "../src/interpretation/interpreter";
import { Parser } from "../src/parsing/parser";

const parser = new Parser();

export async function calc(expression: string, ctxSetup?: (ctx: Context) => Context | void, intrSetup?: (intr: Interpreter) => void): Promise<string> {
    // const ast = parser.parse(expression);

    let ctx = CalcBasic.createContext();

    if (ctxSetup) {
        const retval = ctxSetup(ctx);
        if (retval instanceof Context) {
            ctx = retval;
        }
    }

    const ans = await CalcBasic.runInContext(expression, ctx, intr => {
        intr.onError(async err => void 0);
    
        if (intrSetup) {
            intrSetup(intr);
        }
    });

    return ans;
}