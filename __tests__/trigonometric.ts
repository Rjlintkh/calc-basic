import { calc } from ".";

describe("Trigonometric and Inverse Trigonometric Functions", () => {
    test("sin 30 = 0.5 (Angle Unit: Deg)", async () => {
        expect(await calc(`sin(30)`)).toBe("0.5");
        expect(await calc(`sin 30`)).toBe("0.5");
    });
    
    test("sin⁻¹0.5 = 30 (Angle Unit: Deg)", async () => {
        expect(await calc(`asin(0.5)`)).toBe("30");
        expect(await calc(`asin 0.5`)).toBe("30");
    });
});