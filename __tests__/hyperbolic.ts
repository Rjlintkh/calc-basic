import { calc } from ".";

describe("Hyperbolic and Inverse Hyperbolic Functions", () => {
    test("sinh 1 = 1.175201194", async () => {
        expect(await calc(`sinh(1)`)).toBe("1.175201194");
        expect(await calc(`sinh 1`)).toBe("1.175201194");
    });
    test("cos⁻¹1 = 04", async () => {
        expect(await calc(`acosh(1)`)).toBe("0");
        expect(await calc(`acosh 1`)).toBe("0");
    });
})