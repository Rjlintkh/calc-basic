import { calc } from ".";
import { MatrixUtils } from "../src/data/utils/matrix_utils";
import { Context } from "../src/interpretation/context";
import { CalculationModes } from "../src/specifications/calculation_modes";

describe("Matrix Calculations", () => {
    const tmp = new Context;
    tmp.setMode(CalculationModes.Mat);

    test("To obtain the row echelon form of matrix", async () => {
        expect(await calc(`Ref(MatA)`, ctx => {
            tmp.setModeSpecificVariable("MatA", MatrixUtils.constructMatrix(
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9],
            ));
            return tmp;
        })).toBe(`┌ 1 1.1428 1.2857 ┐\n` +
                 `│ 0      1      2 │\n` +
                 `└ 0      0      0 ┘`);

        expect(await calc(`Ref(MatA)`, ctx => {
            tmp.setModeSpecificVariable("MatA", MatrixUtils.constructMatrix(
                [1, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
            ));
            return tmp;
        })).toBe(`┌ 1 0 0 ┐\n` +
                 `│ 0 1 0 │\n` +
                 `└ 0 0 1 ┘`);

        expect(await calc(`Ref(MatA)`, ctx => {
            tmp.setModeSpecificVariable("MatA", MatrixUtils.constructMatrix(
                [1, 7],
                [2, 4],
                [3, 7],
            ));
            return tmp;
        })).toBe(`┌ 1 2.3333 ┐\n` +
                 `│ 0      1 │\n` +
                 `└ 0      0 ┘`);

        expect(await calc(`Ref(MatA)`, ctx => {
            tmp.setModeSpecificVariable("MatA", MatrixUtils.constructMatrix(
                [5, 6, 7],
            ));
            return tmp;
        })).toBe(`[ 1 1.2 1.4 ]`);
    });
});