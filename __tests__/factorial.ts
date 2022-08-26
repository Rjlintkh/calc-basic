import { calc } from ".";

describe("Factorial", () => {
    test("(5 + 3)!", async () => {
        expect(await calc(`(5 + 3)!`)).toBe("40320");
    });

    // Edge cases:

    test("70!", async () => {
        expect(await calc(`70!`)).toBe("NaN");
    });

    test("-2!", async () => {
        expect(await calc(`-2!`)).toBe("-2");
    });

    test("(-3)!", async () => {
        expect(await calc(`(-3)!`)).toBe("NaN");
    });

    test("0.1!", async () => {
        expect(await calc(`0.1!`)).toBe("NaN");
    });
});