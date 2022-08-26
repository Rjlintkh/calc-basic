import { calc } from ".";

describe("Percent Calculations", () => {
    test("2 % = 0.02", async () => {
        expect(await calc(`2%`)).toBe("0.02");
    });

    test("150 × 20% = 30", async () => {
        expect(await calc(`150 * 20%`)).toBe("30");
    });

    test("What percent of 880 is 660?", async () => {
        expect(await calc(`660 / 880%`)).toBe("75");
    });

    test("Increase 2,500 by 15%.", async () => {
        expect(await calc(`2500 + 2500 * 15%`)).toBe("2875");
    });

    test("Reduce 3,500 by 25%.", async () => {
        expect(await calc(`3500 - 3500 * 25%`)).toBe("2625");
    });

    test("Reduce the sum of 168, 98, and 734 by 20%.", async () => {
        expect(await calc(`168 + 98 + 734: Ans - Ans * 20%`)).toBe("800");
    });

    test("If 300 grams are added to a test sample originally weighing 500 grams, what is the percentage increase in weight?", async () => {
        expect(await calc(`(500 + 300) / 500%`)).toBe("160");
    });

    test("What is the percentage change when a value is increased from 40 to 46? How about to 48?", async () => {
        expect(await calc(`(46 - 40) / 40%`)).toBe("15");

        expect(await calc(`(48 - 40) / 40%`)).toBe("20");
    });
});