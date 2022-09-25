import { regressionCtx } from ".";
import { calc } from "..";
import { Regression } from "../../src/data/utils/stat_utils";
import { NamedCalculation } from "../../src/parsing/tokens";

describe("Performing Paired-variable Statistical Calculations", () => {
    test("Regression Coefficient and Estimated Value Calculation (Power)", async () => {
        regressionCtx.selectRegression(Regression.Power);

        expect(await calc(NamedCalculation.StatCoefficientA, ctx => regressionCtx)).toBe("925.6338296");

        expect(await calc(NamedCalculation.StatCoefficientB, ctx => regressionCtx)).toBe("0.420671876");

        expect(await calc(NamedCalculation.StatCoefficientR, ctx => regressionCtx)).toBe("0.989633824");

        expect(await calc(`350x̂`, ctx => regressionCtx)).toBe("0.099074186");

        expect(await calc(`350ŷ`, ctx => regressionCtx)).toBe("10880.70649");
    });
});