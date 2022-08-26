import { calc } from ".";

describe("Power Functions and Power Root Functions", () => {
    test("(√2 + 1) (√2  – 1) = 1, (1 + 1)^(2+2) = 16", async () => {
        expect(await calc(`(sqrt(2) + 1) (sqrt(2) - 1)`)).toBe("1");

        expect(await calc(`(1+1)^(2+2)`)).toBe("16");
    });
    
    test("-2^(2/3) = –1.587401052", async () => {
        expect(await calc(`-2^(2⌟3)`)).toBe("-1.587401052");
    });

    test("(-2)^4 = 16", async () => {
        expect(await calc(`(-2)^(4)`)).toBe("16");
    });

    test("³√5 + ³√-27", async () => {
        expect(await calc(`cbrt(5) + cbrt(-27)`)).toBe("-1.290024053");
    });

    test("⁷√123", async () => {
        expect(await calc(`7ˣ√123`)).toBe("1.988647795");
    });

    test("123 + 30²", async () => {
        expect(await calc(`123 + 30²`)).toBe("1023");
    });

    test("12³", async () => {
        expect(await calc(`12³`)).toBe("1728");
    });

    test("(1/3 - 1/4)⁻¹", async () => {
        expect(await calc(`(1⌟3 - 1⌟4)⁻¹`)).toBe("12");
    });
})