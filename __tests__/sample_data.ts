import { calc } from ".";
import { Context } from "../src/interpretation/context";
import { NamedCalculation } from "../src/parsing/tokens";
import { CalculationModes } from "../src/specifications/calculation_modes";

describe("Performing Single-variable Statistical Calculations", () => {
    /*
        | Class Value (x) | Frequency (Freq) |
        | 24.5            | 4                |
        | 25.5            | 6                |
        | 26.5            | 2                |
    */
    const tmp = new Context;
    tmp.setMode(CalculationModes.SD);
    
    test("To input the following data", async () => {
        await calc(`24.5; 4 DT: 25.5; 6 DT: 26.5; 2 DT`, ctx => tmp);
        expect(tmp.format(tmp.table!)).toEqual([
            { x: "24.5", freq: "4" },
            { x: "25.5", freq: "6" },
            { x: "26.5", freq: "2" }
        ]);
    });
    
    test("Statistical Calculations Using Input Sample Data", async () => {
        expect(await calc(NamedCalculation.StatXSquareSum, ctx => tmp)).toBe("7707");

        expect(await calc(NamedCalculation.StatXSum, ctx => tmp)).toBe("304");

        expect(await calc(NamedCalculation.StatCount, ctx => tmp)).toBe("12");

        expect(await calc(NamedCalculation.StatXMean, ctx => tmp)).toBe("25.33333333");

        expect(await calc(NamedCalculation.StatXPopulationStandardDeviation, ctx => tmp)).toBe("0.68718427");

        expect(await calc(NamedCalculation.StatXSampleStandardDeviation, ctx => tmp)).toBe("0.717740562");

        expect(await calc(NamedCalculation.StatMinX, ctx => tmp)).toBe("24.5");

        expect(await calc(NamedCalculation.StatMaxX, ctx => tmp)).toBe("26.5");
    });

    test("Deleting All Sample Data", async () => {
        await calc(`ClrStat`, ctx => tmp);
        expect(tmp.format(tmp.table!)).toEqual([]);
    });
});