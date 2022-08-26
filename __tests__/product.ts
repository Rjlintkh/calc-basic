import { calc } from ".";

describe("Product Calculations", () => {
    test("Π {X = 5, 7} (X²) = 44100", async () => {
        expect(await calc(`Π(X², 5, 7)`)).toBe("44100");
    });
});