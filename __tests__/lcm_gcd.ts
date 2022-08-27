import { calc } from ".";

describe("Finding the LCM and the GCD of two numbers", () => {
    test("To obtain the LCM of 48 and 60", async () => {
        expect(await calc(`LCM(48, 60)`)).toBe("240");
    });

    test("To obtain the GCD of 48 and 60", async () => {
        expect(await calc(`GCD(48, 60)`)).toBe("12");
    });
});