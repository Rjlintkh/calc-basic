import { calc } from ".";
import { Context } from "../src/interpretation/context";

describe("Using Variables", () => {
    const tmp = new Context;

    test("To assign 3 + 5 to variable A", async () => {
        expect(await calc(`3 + 5 → A`, ctx => tmp)).toBe("8");
    });

    test("To view the value assigned to variable A", async () => {
        expect(await calc(`A`, ctx => tmp)).toBe("8");
    });

    test("To calculate 5 + A", async () => {
        expect(await calc(`5 + A`, ctx => tmp)).toBe("13");
    });

    test("To clear variable A", async () => {
        expect(await calc(`0 → A`, ctx => tmp)).toBe("0");
    });

    test("To perform calculations that assign results to variables B and C, and then use the variables to perform another calculation (9 × 6 + 3) / (5 × 8) = 1.425", async () => {
        expect(await calc(`9 * 6 + 3 → B: 5 * 8 → C: B / C`)).toBe("1.425");
    });
});