import { calc } from ".";

describe("Absolute Value", () => {
    test("Abs (2 – 7) = 5", async () => {
        expect(await calc(`Abs(2 - 7)`)).toBe("5");
    });
});