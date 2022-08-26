import { calc } from ".";

describe("Differential Calculations", () => {
    test("To determine the derivative at point x = 2 for the function y = 3x² – 5x + 2, when the increase or decrease in x is ∆x = 2 × 10^-4 (Result: 7)", async () => {
        expect(await calc(`d/dx(3X² - 5X + 2, 2)`)).toBe("7");
    });
});