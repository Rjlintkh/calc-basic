import { regressionCtx } from ".";
import { calc } from "..";
import { Regression } from "../../src/data/utils/stat_utils";
import { NamedCalculation } from "../../src/parsing/tokens";

describe("Performing Paired-variable Statistical Calculations", () => {
    test("Regression Coefficient and Estimated Value Calculation (Logarithmic)", async () => {
        regressionCtx.selectRegression(Regression.Logarithmic);

        expect(await calc(NamedCalculation.StatCoefficientA, ctx => regressionCtx)).toBe("-3857.984413");

        expect(await calc(NamedCalculation.StatCoefficientB, ctx => regressionCtx)).toBe("2357.531551");

        expect(await calc(NamedCalculation.StatCoefficientR, ctx => regressionCtx)).toBe("0.998334468");

        expect(await calc(`350x̂`, ctx => regressionCtx)).toBe("5.959050616");

        expect(await calc(`350ŷ`, ctx => regressionCtx)).toBe("9952.277824");
    });
});