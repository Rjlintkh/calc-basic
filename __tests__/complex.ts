import { calc } from ".";
import { Context } from "../src/interpretation/context";
import { CalculationModes } from "../src/specifications/calculation_modes";

describe("Complex Number Calculations", () => {
    const tmp = new Context;
    tmp.setMode(CalculationModes.Complx);

    test("To input 2 + 3i", async () => {
        expect(await calc(`2 + 3i`, ctx => tmp)).toBe("2+3i");
    });

    test("To input 5 ∠ 30", async () => {
        expect(await calc(`5 ∠ 30`, ctx => tmp)).toBe("4.330127019+2.5i");
    });

    test("(2 + 3i) + (4 + 5i) = 6 + 8i", async () => {
        expect(await calc(`(2 + 3i) + (4 + 5i)`, ctx => tmp)).toBe("6+8i");
    });

    test("(2 + 6i) ÷ (2i) = 3 – i", async () => {
        expect(await calc(`(2 + 6i) / (2i)`, ctx => tmp)).toBe("3-i");
    });

    test("√2 ∠ 45 = 1 + i", async () => {
        expect(await calc(`sqrt(2) ∠ 45`, ctx => tmp)).toBe("1+i");
    });

    test("To obtain the absolute value and argument of 1 + i", async () => {
        expect(await calc(`Abs(1 + i)`, ctx => tmp)).toBe("1.414213562");

        expect(await calc(`arg(1 + i)`, ctx => tmp)).toBe("45");
    });

    test("To obtain the conjugate complex number of 2 + 3i", async () => {
        expect(await calc(`Conjg(2 + 3i)`, ctx => tmp)).toBe("2-3i");
    });
});