import { calc } from ".";

describe("Summation Calculations", () => {
    test("Σ {X = 1, 100} (X) = 5050", async () => {
        expect(await calc(`Σ(X, 1, 100)`)).toBe("5050");
    });
});