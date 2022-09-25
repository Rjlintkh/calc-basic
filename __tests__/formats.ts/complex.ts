import { calc } from "..";

describe("Complex Formats", () => {
    test("(1⌟2 + i)(3 + i)", async () => {
        expect(await calc(`(1⌟2 + i)(3 + i)`)).toBe("1⌟2+3⌟1⌟2i");
    });

    test("(1⌟2 + i)/(3 + i)", async () => {
        expect(await calc(`(1⌟2 + i)/(3 + i)`)).toBe("1⌟4+1⌟4i");
    });

    test("(1⌟2 + i)^-1", async () => {
        expect(await calc(`(1⌟2 + i)^(-1)`)).toBe("2⌟5-4⌟5i");
    });
});