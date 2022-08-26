import { calc } from ".";

describe("Degree, Minute, Second (Sexagesimal) Calculations", () => {
    test("To input 2°30´30˝", async () => {
        expect(await calc(`2″ 30″ 30″`)).toBe("2″30″30");
    });

    test("2°20´30˝ + 39´30˝ = 3°00´00˝", async () => {
        expect(await calc(`2″ 20″ 30″ + 0″ 39″ 30″`)).toBe("3″0″0");
    });

    test("2°20´00˝ × 3.5 = 8°10´00", async () => {
        expect(await calc(`2″ 20″ * 3.5`)).toBe("8″10″0");
    });
});