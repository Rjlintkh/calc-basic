import nerdamer from "nerdamer";
import { AlgebraicObject, NumericRepresentation } from "../value";

const nerdamerVector = (nerdamer as any).vector;
const nerdamerMatrix = (nerdamer as any).matrix;
const nerdamerMatget = (nerdamer as any).matget; // 0-based indexing
const nerdamerMatset = (nerdamer as any).matset; // 0-based indexing

export namespace MatrixUtils {
    export function constructMatrix(...rows: (AlgebraicObject | number)[][]) {
        const rowVectors = new Array<(nerdamer.Expression | number)[]>();
        const formats = new Array<NumericRepresentation>();

        for (const row of rows) {
            const rowExpression = new Array<nerdamer.Expression | number>();
            for (const element of row) {
                if (element instanceof AlgebraicObject) {
                    rowExpression.push(element.value);
                    formats.push(element.format);
                } else {
                    rowExpression.push(element);
                    formats.push(NumericRepresentation.Decimal);
                }
            }
            rowVectors.push(nerdamerVector(...rowExpression));
        }
        
        const matrix = nerdamerMatrix(...rowVectors);
        return new AlgebraicObject(matrix, ...formats);
    }

    export function isMatrixSquare(data: AlgebraicObject) {
        const matrix = data.value as any;
        const symbol = matrix.symbol;

        return symbol.isSquare();
    }

    export function getMatrixDimensions(data: AlgebraicObject): [number, number] {
        const matrix = data.value as any;
        const symbol = matrix.symbol;

        const m = symbol.rows();
        const n = symbol.cols();
        return [m, n];
    }

    export function getMatrixElement(data: AlgebraicObject, row: number, column: number) { // row and column are 1-based
        const matrix = data.value;
        const [, n] = getMatrixDimensions(data);

        const element = nerdamerMatget(matrix, row - 1, column - 1);
        const format = data.tupleFormats[
            (row - 1) * n + (column - 1)
        ]; // 0-based indexing

        return new AlgebraicObject(element, format);
    }

    export function setMatrixElement(data: AlgebraicObject, row: number, column: number, value: AlgebraicObject | number) { // row and column are 1-based
        const matrix = data.value as any;
        const [, n] = getMatrixDimensions(data);

        // data.value = nerdamerMatset(matrix, row - 1, column - 1, value.valueOf());
        matrix.symbol.set(row - 1, column - 1, value.valueOf());
        data.tupleFormats[
            (row - 1) * n + (column - 1)
        ] = value instanceof AlgebraicObject ? value.format : NumericRepresentation.Decimal // 0-based indexing
    }

    export function getMatrixElements(data: AlgebraicObject) {
        const matrix = data.value;
        const [m, n] = getMatrixDimensions(data);
        const formats = [...data.tupleFormats];

        const elements = new Array<AlgebraicObject>();
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                const element = nerdamerMatget(matrix, i - 1, j - 1);
                const format = formats.shift()!;

                elements.push(new AlgebraicObject(element, format));
            }
        }

        return elements;
    }
}