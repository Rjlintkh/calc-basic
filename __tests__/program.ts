import { calc } from ".";
import { Context } from "../src/interpretation/context";
import { Parser } from "../src/parsing/parser";

describe("Special Program Commands", () => {
    test("Input Prompt", async() => {
        const tmp = new Context;

        await calc(`? → A`, ctx => tmp, intr => intr.onPrompt(async variable => {
            expect(variable).toBe("A");
            if (variable === "A") {
                return new Parser().parse("1");
            }
            return null;
        }));

        expect(await calc(`A`, ctx => tmp)).toBe("1");
    });

    test("Output Command", async() => {
        const tmp = new Context;

        expect(await calc(`5 → A: A²◢ Ans²`, ctx => tmp, intr => intr.onOutput(async data => {
            expect(tmp.format(data)).toBe("25");
            return;
        }))).toBe("625");
    });

    test("Unconditional Jump Command", async() => {
        const tmp = new Context;

        expect(await calc(`5: Goto 1: 1/0: Lbl 1`)).toBe("5");
    });
});