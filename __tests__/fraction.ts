import { calc } from ".";
import { ConfigProperty, FractionDisplayFormat } from "../src/interpretation/config";

describe("Fraction Calculations", () => {
    test("3 1/4 + 1 2/3 = 4 11/12", async () => {
        expect(await calc(`3⌟1⌟4 + 1⌟2⌟3`)).toBe("4⌟11⌟12");
    });

    test("4 - 3 1/2 = 1/2", async () => {    
        expect(await calc(`4 - 3⌟1⌟2`)).toBe("1⌟2");
    });

    test("2/3 + 1/2 = 7/6 (Fraction Display Format: d/c)", async () => {
        expect(await calc(`2⌟3 + 1⌟2`, ctx => ctx.setConfigProperty(ConfigProperty.FractionDisplayFormat, FractionDisplayFormat.Improper))).toBe("7⌟6");
    });
});