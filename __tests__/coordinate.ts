import { calc } from ".";
import { Context } from "../src/interpretation/context";

describe("Coordinate Conversion (Rectangular ↔ Polar)", () => {
    test("To convert the rectangular coordinates (√2, √2) to polar coordinates (Angle Unit: Deg)", async () => {
        const tmp = new Context;
        
        expect(await calc(`Pol(sqrt(2), sqrt(2))`, ctx => tmp)).toBe("2");

        expect(await calc(`Y`, ctx => tmp)).toBe("45");
    });

    test("To convert the polar coordinates (2, 30°) to rectangular coordinates (Angle Unit: Deg)", async () => {
        const tmp = new Context;
        
        expect(await calc(`Rec(2, 30)`, ctx => tmp)).toBe("1.732050808");

        expect(await calc(`Y`, ctx => tmp)).toBe("1");
    });
});