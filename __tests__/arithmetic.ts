import { calc } from ".";

describe("Arithmetic Calculations", () => {
    test("2.5 + 1 − 2 = 1.5", async () => {
        expect(await calc(`2.5 + 1 - 2`)).toBe("1.5");
    });

    test("7 × 8 − 4 × 5 = 36", async () => {
        expect(await calc(`7 * 8 - 4 * 5`)).toBe("36");
    });

    test("3 × (5 × 10^–9) = 1.5 × 10^–8", async () => {
        expect(await calc(`3 * (5ᴇ-9)`)).toBe("1.5×₁₀-8");
    });
});