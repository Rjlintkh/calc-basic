import { calc } from ".";

describe("Random Number", () => {
    test("To obtain three random three-digit integers", async () => {
        for (let i = 0; i < 3; i++) {
            const random = +(await calc(`Ran#`));
            expect(random).toBeGreaterThanOrEqual(0);
            expect(random).toBeLessThan(1000);
        }
    });

    test("To generate random integers in the range of 1 to 6", async () => {
        for (let i = 0; i < 3; i++) {
            const random = +(await calc(`RanInt(1, 6)`));
            expect(random).toBeGreaterThanOrEqual(1);
            expect(random).toBeLessThanOrEqual(6);
        }
    });
});