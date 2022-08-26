import { calc } from "..";

describe("http://webcal.freehostia.com/casio.fx-50FH/simultaneous1.htm", () => {
    const prog = `
        ?→A:
        ?→B:
        ?→C:
        ?→D:
        ?→X:
        ?→Y:
        A X - D B→M:
        M⁻¹(C X - Y B→X◢
        M⁻¹(A Y - D C→Y`;

    test("Example 1", async () => {
        const input = ["1", "1", "7", "1", "-1", "1"];

        await calc(prog, undefined, intr => {
            intr.queuePromptInput(...input);

            intr.onClose(async () => {
                const output = intr.getAllOutputs(true);
                expect(output).toEqual(["4", "3"]);
                return;
            });
        });
    });

    // test("Example 2", async () => {
    //     const input = ["1+i", "1-i", "4+4i", "2+3i", "3+4i", "-10+24i"];

    //     await calc(prog, ctx => ctx.setMode(CalculationModes.Complx), intr => {
    //         intr.queuePromptInput(...input);

    //         intr.onClose(async () => {
    //             const output = intr.getAllOutputs(true);
    //             expect(output).toEqual(["1+2i", "2+3i"]);
    //             return;
    //         });
    //     });
    // });
});