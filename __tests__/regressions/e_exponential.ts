import { regressionCtx } from ".";
import { calc } from "..";
import { Regression } from "../../src/data/utils/stat_utils";
import { NamedCalculation } from "../../src/parsing/tokens";

describe("Performing Paired-variable Statistical Calculations", () => {
    test("Regression Coefficient and Estimated Value Calculation (e Exponential)", async () => {
        regressionCtx.selectRegression(Regression.eExponential);

        expect(await calc(NamedCalculation.StatCoefficientA, ctx => regressionCtx)).toBe("3646.501426");

        expect(await calc(NamedCalculation.StatCoefficientB, ctx => regressionCtx)).toBe("0.003818409");

        expect(await calc(NamedCalculation.StatCoefficientR, ctx => regressionCtx)).toBe("0.882245703");

        expect(await calc(`350x̂`, ctx => regressionCtx)).toBe("-613.7608987");

        expect(await calc(`350ŷ`, ctx => regressionCtx)).toBe("13876.70378");
    });
});