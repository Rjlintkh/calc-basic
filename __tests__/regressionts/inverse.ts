import { regressionCtx } from ".";
import { calc } from "..";
import { Regression } from "../../src/data/stat_utils";
import { NamedCalculation } from "../../src/parsing/tokens";

describe("Performing Paired-variable Statistical Calculations", () => {
    test("Regression Coefficient and Estimated Value Calculation (Inverse)", async () => {
        regressionCtx.selectRegression(Regression.Inverse);

        expect(await calc(NamedCalculation.StatCoefficientA, ctx => regressionCtx)).toBe("9223.955403");

        expect(await calc(NamedCalculation.StatCoefficientB, ctx => regressionCtx)).toBe("-123273.9426");

        expect(await calc(NamedCalculation.StatCoefficientR, ctx => regressionCtx)).toBe("-0.979815795");

        expect(await calc(`350x̂`, ctx => regressionCtx)).toBe("13.89165677");

        expect(await calc(`350ŷ`, ctx => regressionCtx)).toBe("8871.744138");
    });
});