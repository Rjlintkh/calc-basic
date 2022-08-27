import { calc } from "..";
import { CalculationModes } from "../../src/specifications/calculation_modes";

describe("http://webcal.freehostia.com/casio.fx-50FH/quadratic1.htm", () => {
    const prog = `
        ?→A:
        ?→B:
        ?→M:
        -B⌟(2A→C:
        A C²→M-:
        C+sqrt( -M⌟A→A◢
        2C - Ans→B`;

    test("Example 1", async () => {
        const input = ["1", "-7", "12"];

        await calc(prog, undefined, intr => {
            intr.queuePromptInput(...input);

            intr.onClose(async () => {
                const output = intr.getAllOutputs(true);
                expect(output).toEqual(["4", "3"]);
                return;
            });
        });
    });

    test("Example 2", async () => {
        const input = ["1", "6", "25"];

        await calc(prog, ctx => ctx.setMode(CalculationModes.Complx), intr => {
            intr.queuePromptInput(...input);

            intr.onClose(async () => {
                const output = intr.getAllOutputs(true);
                expect(output).toEqual(["-3+4i", "-3-4i"]);
                return;
            });
        });
    });
});