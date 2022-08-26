import { calc } from ".";
import { Regression } from "../src/data/stat_utils";
import { Context } from "../src/interpretation/context";
import { NamedCalculation } from "../src/parsing/tokens";
import { CalculationModes } from "../src/specifications/calculation_modes";

describe("Performing Paired-variable Statistical Calculations", () => {
    /*
        | x               | y                | Frequency (Freq) |
        | 20              | 3150             | 1                |
        | 110             | 7310             | 1                |
        | 200             | 8800             | 1                |
        | 290             | 9310             | 1                |
    */
    const tmp = new Context;
    tmp.setMode(CalculationModes.Reg);
    tmp.selectRegression(Regression.Linear);
    
    test("To input the following data", async () => {
        await calc(`20, 3150 DT: 110, 7310 DT: 200, 8800 DT: 290, 9310 DT`, ctx => tmp);
        expect(tmp.format(tmp.table!)).toEqual([
            { x: "20", y: "3150", freq: "1" },
            { x: "110", y: "7310", freq: "1" },
            { x: "200", y: "8800", freq: "1" },
            { x: "290", y: "9310", freq: "1" }
        ]);
    });
    
    test("Statistical Calculations Using Input Regression", async () => {
        expect(await calc(NamedCalculation.StatXSquareSum, ctx => tmp)).toBe("136600");

        expect(await calc(NamedCalculation.StatXSum, ctx => tmp)).toBe("620");

        expect(await calc(NamedCalculation.StatCount, ctx => tmp)).toBe("4");

        expect(await calc(NamedCalculation.StatYSquareSum, ctx => tmp)).toBe("227474700");

        expect(await calc(NamedCalculation.StatYSum, ctx => tmp)).toBe("28570");

        expect(await calc(NamedCalculation.StatXYSum, ctx => tmp)).toBe("5327000");

        expect(await calc(NamedCalculation.StatXSquareYSum, ctx => tmp)).toBe("1224682000");

        expect(await calc(NamedCalculation.StatXCubeSum, ctx => tmp)).toBe("33728000");

        expect(await calc(NamedCalculation.StatXFourthPowerSum, ctx => tmp)).toBe("8819380000");

        expect(await calc(NamedCalculation.StatXMean, ctx => tmp)).toBe("155");

        expect(await calc(NamedCalculation.StatXPopulationStandardDeviation, ctx => tmp)).toBe("100.623059");

        expect(await calc(NamedCalculation.StatXSampleStandardDeviation, ctx => tmp)).toBe("116.1895004");

        expect(await calc(NamedCalculation.StatYMean, ctx => tmp)).toBe("7142.5");

        expect(await calc(NamedCalculation.StatYPopulationStandardDeviation, ctx => tmp)).toBe("2419.373628");

        expect(await calc(NamedCalculation.StatYSampleStandardDeviation, ctx => tmp)).toBe("2793.65203");

        expect(await calc(NamedCalculation.StatMinX, ctx => tmp)).toBe("20");

        expect(await calc(NamedCalculation.StatMaxX, ctx => tmp)).toBe("290");

        expect(await calc(NamedCalculation.StatMinY, ctx => tmp)).toBe("3150");

        expect(await calc(NamedCalculation.StatMaxY, ctx => tmp)).toBe("9310");
    });

    test("Regression Coefficient and Estimated Value Calculation (Linear)", async () => {
        tmp.selectRegression(Regression.Linear);

        expect(await calc(NamedCalculation.StatCoefficientA, ctx => tmp)).toBe("3703.222222");

        expect(await calc(NamedCalculation.StatCoefficientB, ctx => tmp)).toBe("22.18888889");

        expect(await calc(NamedCalculation.StatCoefficientR, ctx => tmp)).toBe("0.922847901");
    });

    test("Regression Coefficient and Estimated Value Calculation (Quadratic)", async () => {
        tmp.selectRegression(Regression.Quadratic);

        expect(await calc(NamedCalculation.StatCoefficientA, ctx => tmp)).toBe("2137.32716");

        expect(await calc(NamedCalculation.StatCoefficientB, ctx => tmp)).toBe("57.1117284");

        expect(await calc(NamedCalculation.StatCoefficientR, ctx => tmp)).toBe("-0.112654321");
    });

    test("Regression Coefficient and Estimated Value Calculation (Logarithmic)", async () => {
        tmp.selectRegression(Regression.Logarithmic);

        expect(await calc(NamedCalculation.StatCoefficientA, ctx => tmp)).toBe("-3857.984413");

        expect(await calc(NamedCalculation.StatCoefficientB, ctx => tmp)).toBe("2357.531551");

        expect(await calc(NamedCalculation.StatCoefficientR, ctx => tmp)).toBe("0.998334468");
    });

    test("Regression Coefficient and Estimated Value Calculation (e Exponential)", async () => {
        tmp.selectRegression(Regression.eExponential);

        expect(await calc(NamedCalculation.StatCoefficientA, ctx => tmp)).toBe("3646.501426");

        expect(await calc(NamedCalculation.StatCoefficientB, ctx => tmp)).toBe("0.003818409");

        expect(await calc(NamedCalculation.StatCoefficientR, ctx => tmp)).toBe("0.882245703");
    });


    test("Regression Coefficient and Estimated Value Calculation (ab Exponential)", async () => {
        tmp.selectRegression(Regression.abExponential);

        expect(await calc(NamedCalculation.StatCoefficientA, ctx => tmp)).toBe("3646.501426");

        expect(await calc(NamedCalculation.StatCoefficientB, ctx => tmp)).toBe("1.003825709");

        expect(await calc(NamedCalculation.StatCoefficientR, ctx => tmp)).toBe("0.882245703");
    });

    test("Regression Coefficient and Estimated Value Calculation (Power)", async () => {
        tmp.selectRegression(Regression.Power);

        expect(await calc(NamedCalculation.StatCoefficientA, ctx => tmp)).toBe("925.6338296");

        expect(await calc(NamedCalculation.StatCoefficientB, ctx => tmp)).toBe("0.420671876");

        expect(await calc(NamedCalculation.StatCoefficientR, ctx => tmp)).toBe("0.989633824");
    });

    test("Regression Coefficient and Estimated Value Calculation (Inverse)", async () => {
        tmp.selectRegression(Regression.Inverse);

        expect(await calc(NamedCalculation.StatCoefficientA, ctx => tmp)).toBe("9223.955403");

        expect(await calc(NamedCalculation.StatCoefficientB, ctx => tmp)).toBe("-123273.9426");

        expect(await calc(NamedCalculation.StatCoefficientR, ctx => tmp)).toBe("-0.979815795");
    });

    test("Deleting All Sample Data", async () => {
        await calc(`ClrStat`, ctx => tmp);
        expect(tmp.format(tmp.table!)).toEqual([]);
    });
});