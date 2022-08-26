import { calc } from ".";

describe("Exponential and Logarithmic Functions", () => {
    test("log 216 = 4, log16 = 1.204119983", async () => {
        expect(await calc(`log(2, 16)`)).toBe("4");

        expect(await calc(`log(16)`)).toBe("1.204119983");
        expect(await calc(`log16`)).toBe("1.204119983");
    });

    test("ln 90 = 4.49980967", async () => {
        expect(await calc(`ln(90)`)).toBe("4.49980967");
        expect(await calc(`ln 90`)).toBe("4.49980967");
    });

    test("e^10 = 22026.46579", async () => {
        expect(await calc(`e^(10)`)).toBe("22026.46579");
        expect(await calc(`e^10`)).toBe("22026.46579");
    });
})