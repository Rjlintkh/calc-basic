import { calc } from ".";
import { NumberBase } from "../src/data/math";
import { Context } from "../src/interpretation/context";
import { CalculationModes } from "../src/specifications/calculation_modes";

describe("Base-n Calculations", () => {
    const tmp = new Context;
    tmp.setMode(CalculationModes.Base);

    test("To select binary as the number base and calculate 1₂ + 1₂", async () => {
        tmp.selectNumberBase(NumberBase.Bin);

        expect(await calc(`1 + 1`, ctx => tmp)).toBe("10");
    });

    test("To select octal as the number base and calculate 7₈ + 1₈", async () => {
        tmp.selectNumberBase(NumberBase.Oct);

        expect(await calc(`7 + 1`, ctx => tmp)).toBe("10");
    });

    test("To select hexadecimal as the number base and calculate 1F₁₆ + 1₁₆", async () => {
        tmp.selectNumberBase(NumberBase.Oct);

        expect(await calc(`7 + 1`, ctx => tmp)).toBe("10");
    });

    test("To perform the calculation 5₁₀ + 5₁₆, and display the result in binary", async () => {
        tmp.selectNumberBase(NumberBase.Bin);

        expect(await calc(`d5+ h5`, ctx => tmp)).toBe("1010");
    });

    test("To convert the value 513₁₀ to its binary equivalent", async () => {
        tmp.selectNumberBase(NumberBase.Bin);

        expect(await calc(`d513`, ctx => tmp)).toBe("NaN");
    });

    test("1010₂ and 1100₂ = 1000₂", async () => {
        tmp.selectNumberBase(NumberBase.Bin);

        expect(await calc(`1010 and 1100`, ctx => tmp)).toBe("1000");
    });

    test("1011₂ or 11010₂ = 11011₂", async () => {
        tmp.selectNumberBase(NumberBase.Bin);

        expect(await calc(`1011 or 11010`, ctx => tmp)).toBe("11011");
    });

    test("1010₂ or 1100₂ = 110₂", async () => {
        tmp.selectNumberBase(NumberBase.Bin);

        expect(await calc(`1010 xor 1100`, ctx => tmp)).toBe("110");
    });

    test("Not(1010₂) = 1111110101₂", async () => {
        tmp.selectNumberBase(NumberBase.Bin);

        expect(await calc(`Not(1010)`, ctx => tmp)).toBe("1111110101");
    });

    test("Neg(101101₂) = 1111010011₂", async () => {
        tmp.selectNumberBase(NumberBase.Bin);

        expect(await calc(`Neg(101101)`, ctx => tmp)).toBe("1111010011");
    });
});