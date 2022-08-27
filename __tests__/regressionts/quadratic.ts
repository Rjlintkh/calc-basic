import { regressionCtx } from ".";
import { calc } from "..";
import { Regression } from "../../src/data/stat_utils";
import { NamedCalculation } from "../../src/parsing/tokens";

describe("Performing Paired-variable Statistical Calculations", () => {
    test("Regression Coefficient and Estimated Value Calculation (Quadratic)", async () => {
        regressionCtx.selectRegression(Regression.Quadratic);

        expect(await calc(NamedCalculation.StatCoefficientA, ctx => regressionCtx)).toBe("2137.32716");

        expect(await calc(NamedCalculation.StatCoefficientB, ctx => regressionCtx)).toBe("57.1117284");

        expect(await calc(NamedCalculation.StatCoefficientR, ctx => regressionCtx)).toBe("-0.112654321");

        expect(await calc(`350x̂`, ctx => regressionCtx)).toBe("-29.57047221");

        expect(await calc(`350X̂`, ctx => regressionCtx)).toBe("536.5348558");

        expect(await calc(`350ŷ`, ctx => regressionCtx)).toBe("8326.277778");
    });
});