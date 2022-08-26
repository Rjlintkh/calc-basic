import { calc } from ".";

describe("Angle Unit Conversion", () => {
    test("To convert π/2 radians and 50 grads both to degrees", async () => {
        expect(await calc(`(pi / 2)ʳ`)).toBe("90");

        expect(await calc(`50ᵍ`)).toBe("45");
    });
});