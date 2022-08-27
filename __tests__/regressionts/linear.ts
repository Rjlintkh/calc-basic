import { regressionCtx } from ".";
import { calc } from "..";
import { Regression } from "../../src/data/stat_utils";
import { NamedCalculation } from "../../src/parsing/tokens";

describe("Performing Paired-variable Statistical Calculations", () => {
    test("Regression Coefficient and Estimated Value Calculation (Linear)", async () => {
        regressionCtx.selectRegression(Regression.Linear);

        expect(await calc(NamedCalculation.StatCoefficientA, ctx => regressionCtx)).toBe("3703.222222");

        expect(await calc(NamedCalculation.StatCoefficientB, ctx => regressionCtx)).toBe("22.18888889");

        expect(await calc(NamedCalculation.StatCoefficientR, ctx => regressionCtx)).toBe("0.922847901");

        expect(await calc(`350x̂`, ctx => regressionCtx)).toBe("-151.1216825");

        expect(await calc(`350ŷ`, ctx => regressionCtx)).toBe("11469.33333");
    });
});