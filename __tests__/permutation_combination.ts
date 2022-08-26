import { calc } from ".";

describe("Permutation / Combination", () => {
    test("How many four-person permutations and combinations are possible for a group of 10 people?", async () => {
        expect(await calc(`10 permute 4`)).toBe("5040");

        expect(await calc(`10 choose 4`)).toBe("210");
    });
});