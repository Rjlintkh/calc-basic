import { calc } from ".";

describe("Integration Calculations", () => {
    test("∫ {1, 5} (2x² + 3x + 8) dx = 150.6666667", async () => {
        expect(await calc(`∫(2X² + 3X + 8, 1, 5)`)).toBe("150.6666667");
    });
});