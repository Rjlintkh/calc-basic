import { calc } from "..";
import { Regression } from "../../src/data/utils/stat_utils";
import { Context } from "../../src/interpretation/context";
import { NamedCalculation } from "../../src/parsing/tokens";
import { CalculationModes } from "../../src/specifications/calculation_modes";

export const regressionCtx = new Context;

describe("Performing Paired-variable Statistical Calculations", () => {
    /*
        | x               | y                | Frequency (Freq) |
        | 20              | 3150             | 1                |
        | 110             | 7310             | 1                |
        | 200             | 8800             | 1                |
        | 290             | 9310             | 1                |
    */
    regressionCtx.setMode(CalculationModes.Reg);
    regressionCtx.selectRegression(Regression.Linear);
    
    test("To input the following data", async () => {
        expect(await calc(`;3 DT`, ctx => regressionCtx)).toBe("0");
        expect(regressionCtx.format(regressionCtx.table!)).toEqual([
            { x: "0", y: "0", freq: "3" }
        ]);

        expect(await calc(`,2;3 DT`, ctx => regressionCtx)).toBe("0");
        expect(regressionCtx.format(regressionCtx.table!)).toEqual([
            { x: "0", y: "0", freq: "3" },
            { x: "0", y: "2", freq: "3" }
        ]);

        expect(await calc(`1.1,2.2;3.3 DT`, ctx => regressionCtx)).toBe("1.1");
        expect(regressionCtx.format(regressionCtx.table!)).toEqual([
            { x: "0", y: "0", freq: "3" },
            { x: "0", y: "2", freq: "3" },
            { x: "1.1", y: "2.2", freq: "3.3" }
        ]);

        expect(await calc(`;1.2 DT`, ctx => regressionCtx)).toBe("1.1"); // TODO is this 1.1 or 0? I don't know.
        expect(regressionCtx.format(regressionCtx.table!)).toEqual([
            { x: "0", y: "0", freq: "3" },
            { x: "0", y: "2", freq: "3" },
            { x: "1.1", y: "2.2", freq: "3.3" },
            { x: "1.1", y: "2.2", freq: "1.2" }
        ]);
    });

    test("Deleting All Sample Data", async () => {
        await calc(`ClrStat`, ctx => regressionCtx);
        expect(regressionCtx.format(regressionCtx.table!)).toEqual([]);
    });
    
    test("To input the following data", async () => {
        await calc(`20, 3150 DT: 110, 7310 DT: 200, 8800 DT: 290, 9310 DT`, ctx => regressionCtx);
        expect(regressionCtx.format(regressionCtx.table!)).toEqual([
            { x: "20", y: "3150", freq: "1" },
            { x: "110", y: "7310", freq: "1" },
            { x: "200", y: "8800", freq: "1" },
            { x: "290", y: "9310", freq: "1" }
        ]);
    });
    
    test("Statistical Calculations Using Input Regression", async () => {
        expect(await calc(NamedCalculation.StatXSquareSum, ctx => regressionCtx)).toBe("136600");

        expect(await calc(NamedCalculation.StatXSum, ctx => regressionCtx)).toBe("620");

        expect(await calc(NamedCalculation.StatCount, ctx => regressionCtx)).toBe("4");

        expect(await calc(NamedCalculation.StatYSquareSum, ctx => regressionCtx)).toBe("227474700");

        expect(await calc(NamedCalculation.StatYSum, ctx => regressionCtx)).toBe("28570");

        expect(await calc(NamedCalculation.StatXYSum, ctx => regressionCtx)).toBe("5327000");

        expect(await calc(NamedCalculation.StatXSquareYSum, ctx => regressionCtx)).toBe("1224682000");

        expect(await calc(NamedCalculation.StatXCubeSum, ctx => regressionCtx)).toBe("33728000");

        expect(await calc(NamedCalculation.StatXFourthPowerSum, ctx => regressionCtx)).toBe("8819380000");

        expect(await calc(NamedCalculation.StatXMean, ctx => regressionCtx)).toBe("155");

        expect(await calc(NamedCalculation.StatXPopulationStandardDeviation, ctx => regressionCtx)).toBe("100.623059");

        expect(await calc(NamedCalculation.StatXSampleStandardDeviation, ctx => regressionCtx)).toBe("116.1895004");

        expect(await calc(NamedCalculation.StatYMean, ctx => regressionCtx)).toBe("7142.5");

        expect(await calc(NamedCalculation.StatYPopulationStandardDeviation, ctx => regressionCtx)).toBe("2419.373628");

        expect(await calc(NamedCalculation.StatYSampleStandardDeviation, ctx => regressionCtx)).toBe("2793.65203");

        expect(await calc(NamedCalculation.StatMinX, ctx => regressionCtx)).toBe("20");

        expect(await calc(NamedCalculation.StatMaxX, ctx => regressionCtx)).toBe("290");

        expect(await calc(NamedCalculation.StatMinY, ctx => regressionCtx)).toBe("3150");

        expect(await calc(NamedCalculation.StatMaxY, ctx => regressionCtx)).toBe("9310");
    });
});