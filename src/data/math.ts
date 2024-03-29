import nerdamer from "nerdamer";
import { Capabilities } from "../specifications/capabilities";
import { ArgumentError, DimensionError, MathError } from "./errors";
import { MatrixUtils } from "./utils/matrix_utils";
import { AlgebraicObject, Field, NumericRepresentation } from "./value";
// @ts-ignore
import("nerdamer/Calculus");

const zero = nerdamer("0"); 

function nerdamerCall(name: string, ...args: (nerdamer.Expression|string)[]): nerdamer.Expression {
    return (<any>nerdamer)[name](...args);
}

function nerdamerICall<T>(instance: nerdamer.Expression, name: string, ...args: any[]): T {
    return (<any>instance)[name](...args);
}

export function isRational(q: nerdamer.Expression): boolean {
    if (q.isImaginary()) {
        const re = nerdamerCall("realpart", q.evaluate().expand());
        const im = nerdamerCall("imagpart", q.evaluate().expand());
        return isRational(re) && isRational(im);
    }
    const numerator = nerdamerICall<nerdamer.Expression>(q, "numerator").text();
    const denominator = nerdamerICall<nerdamer.Expression>(q, "denominator").text();
    
    if ((numerator.length + 1 + denominator.length) > Capabilities.MaxFractionDigits) return false;
    return true;
}

export enum AngleUnit {
    Deg,
    Rad,
    Gra,
}

export enum NumberBase {
    Bin = 2,
    Oct = 8,
    Dec = 10,
    Hex = 16,
}

export namespace M {
    export function sin(a: AlgebraicObject) {
        const retval = nerdamerCall("sin", a.value);
        return new AlgebraicObject(retval, a.format);
    }
    export function cos(a: AlgebraicObject) {
        const retval = nerdamerCall("cos", a.value);
        return new AlgebraicObject(retval, a.format);
    }
    export function tan(a: AlgebraicObject) {
        const retval = nerdamerCall("tan", a.value);
        return new AlgebraicObject(retval, a.format);
    }
    export function asin(a: AlgebraicObject) {
        const retval = nerdamerCall("asin", a.value);
        return new AlgebraicObject(retval, a.format);
    }
    export function acos(a: AlgebraicObject) {
        const retval = nerdamerCall("acos", a.value);
        return new AlgebraicObject(retval, a.format);
    }
    export function atan(a: AlgebraicObject) {
        const retval = nerdamerCall("atan", a.value);
        return new AlgebraicObject(retval, a.format);
    }
    export function sinh(a: AlgebraicObject) {
        const retval = nerdamerCall("sinh", a.value);
        return new AlgebraicObject(retval, a.format);
    }
    export function cosh(a: AlgebraicObject) {
        const retval = nerdamerCall("cosh", a.value);
        return new AlgebraicObject(retval, a.format);
    }
    export function tanh(a: AlgebraicObject) {
        const retval = nerdamerCall("tanh", a.value);
        return new AlgebraicObject(retval, a.format);
    }
    export function asinh(a: AlgebraicObject) {
        const retval = nerdamerCall("asinh", a.value);
        return new AlgebraicObject(retval, a.format);
    }
    export function acosh(a: AlgebraicObject) {
        const retval = nerdamerCall("acosh", a.value);
        return new AlgebraicObject(retval, a.format);
    }
    export function atanh(a: AlgebraicObject) {
        const retval = nerdamerCall("atanh", a.value);
        return new AlgebraicObject(retval, a.format);
    }

    export function sqrt(a: AlgebraicObject) {
        const retval = nerdamerCall("sqrt", a.value);
        return new AlgebraicObject(retval, a.format);
    }
    export function cbrt(a: AlgebraicObject) {
        const retval = nerdamerCall("cbrt", a.value);
        return new AlgebraicObject(retval, a.format);
    }
    export function factorial(a: AlgebraicObject) {
        if (!a.isInteger() || a.isNegative() || a.gte(70)) throw new MathError();
        const retval = nerdamerCall("factorial", a.value);
        return new AlgebraicObject(retval, NumericRepresentation.Decimal);
    }
    export function nPr(a: AlgebraicObject, b: AlgebraicObject) {
        if (!a.gt(0) || !a.isInteger() ||
            !b.gt(0) || !a.isInteger() ||
            !a.gte(b)) throw new MathError();
        return M.factorial(a).div(M.factorial(a.minus(b)));
    }
    export function nCr(a: AlgebraicObject, b: AlgebraicObject) {
        return M.nPr(a, b).div(M.factorial(b));
    }
    export function nHr(a: AlgebraicObject, b: AlgebraicObject) {
        return M.nCr(a.plus(b).minus(1), b);
    }

    export function log(a: AlgebraicObject, b?: AlgebraicObject) {
        if (b == null) {
            if (a.lte(0)) throw new MathError();
            const retval = nerdamerCall("log10", a.value);
            return new AlgebraicObject(retval, NumericRepresentation.Decimal);
        } else {
            const retval = nerdamerCall("log", b.value, a.value);
            return new AlgebraicObject(retval, NumericRepresentation.Decimal);
        }
    }
    export function ln(a: AlgebraicObject) {
        if (a.lte(0)) throw new MathError();
        const retval = nerdamerCall("log", a.value);
        return new AlgebraicObject(retval, NumericRepresentation.Decimal);
    }
    export function exp(a: AlgebraicObject) {
        const retval = nerdamerCall("exp", a.value);
        return new AlgebraicObject(retval, NumericRepresentation.Decimal);
    }

    export function numerator(a: AlgebraicObject) {
        const retval = nerdamerICall<nerdamer.Expression>(a.value, "numerator");
        return new AlgebraicObject(retval, NumericRepresentation.Decimal);
    }
    export function denominator(a: AlgebraicObject) {
        const retval = nerdamerICall<nerdamer.Expression>(a.value, "denominator");
        return new AlgebraicObject(retval, NumericRepresentation.Decimal);
    }

    export function re(a: AlgebraicObject) {
        const retval = nerdamerCall("realpart", a.value);
        return new AlgebraicObject(retval, a.tupleFormats[0]);
    }
    export function im(a: AlgebraicObject) {
        const retval = nerdamerCall("imagpart", a.value);
        if (!Number.isInteger(retval.valueOf()) && a.tupleFormats[1] === NumericRepresentation.Integer) {
            return new AlgebraicObject(retval, NumericRepresentation.Fraction);
        }
        return new AlgebraicObject(retval, a.tupleFormats[1] ?? NumericRepresentation.Integer);
    }
    export function rcis(a: AlgebraicObject, b: AlgebraicObject) {
        const re = a.times(M.cos(b)).text();
        const im = a.times(M.sin(b)).text();
        const retval = nerdamer(`${re}+${im}i`);
        return new AlgebraicObject(retval, a.format);
    }
    export function complex(a: AlgebraicObject, b: AlgebraicObject) {
        const retval = nerdamer(`${a.text()}+${b.text()}i`);
        return new AlgebraicObject(retval, a.format, b.format);
    }
    export function conjg(a: AlgebraicObject) {
        if (a.isComplex()) {
            const re = nerdamerCall("realpart", a.value);
            const im = nerdamerCall("imagpart", a.value);
            const retval = nerdamer(`${re}-${im}i`);
            return new AlgebraicObject(retval, ...a.tupleFormats);
        }
        return new AlgebraicObject(a.value, a.format);
    }
    export function arg(a: AlgebraicObject) {
        const retval = nerdamerCall("arg", a.value);
        return new AlgebraicObject(retval, NumericRepresentation.Decimal);
    }

    export function or(a: AlgebraicObject, b: AlgebraicObject) {
        return AlgebraicObject.const(+a.value | +b.value);
    }
    export function xor(a: AlgebraicObject, b: AlgebraicObject) {
        return AlgebraicObject.const(+a.value ^ +b.value);
    }
    export function xnor(a: AlgebraicObject, b: AlgebraicObject) {
        return AlgebraicObject.const(~(+a.value ^ +b.value));
    }
    export function and(a: AlgebraicObject, b: AlgebraicObject) {
        return AlgebraicObject.const(+a.value & +b.value);
    }
    export function not(a: AlgebraicObject) {
        let retval = nerdamer(`${~+a.text()}`);
        return new AlgebraicObject(retval, a.format);
    }
    export function neg(a: AlgebraicObject) {
        let retval = zero.subtract(a.value);
        return new AlgebraicObject(retval, a.format);
    }

    export function ranint(a: AlgebraicObject, b: AlgebraicObject) {
        if (a.gte(b) || a.abs().gte(1e10) || b.abs().gte(1e10)) throw new ArgumentError();
        const random = Math.random();
        const low =  a.value;
        const high = b.value;
        const retval = nerdamerCall("floor", low.add(high.subtract(low).add(1).multiply(random)));
        return new AlgebraicObject(retval, NumericRepresentation.Decimal);
    }
    export function rand() {
        const retval = Math.random();
        return new AlgebraicObject(nerdamer(retval+""), NumericRepresentation.Decimal);
    }
    export function lcm(a: AlgebraicObject, b: AlgebraicObject) {
        const retval = nerdamerCall("lcm", a.value, b.value);
        return new AlgebraicObject(retval, NumericRepresentation.Decimal);
    }
    export function gcd(a: AlgebraicObject, b: AlgebraicObject) {
        const retval = nerdamerCall("gcd", a.value, b.value);
        return new AlgebraicObject(retval, NumericRepresentation.Decimal);
    }
    export function int(a: AlgebraicObject) {
        const retval = nerdamer(`${~~a.value}`);
        return new AlgebraicObject(retval, a.format);
    }
    export function ceil(a: AlgebraicObject) {
        const retval = nerdamerCall("ceil", a.value);
        return new AlgebraicObject(retval, a.format);
    }
    export function floor(a: AlgebraicObject) {
        const retval = nerdamerCall("floor", a.value);
        return new AlgebraicObject(retval, a.format);
    }
    export function abs(a: AlgebraicObject) {
        const retval = nerdamerCall("abs", a.value);
        return new AlgebraicObject(retval, a.format);
    }

    export function differentiate(a: AlgebraicObject, b: AlgebraicObject, c?: AlgebraicObject) {
        const derivative = nerdamer.diff(a.value, "X");
        const retval = derivative.sub("X", b.value.text());
        return new AlgebraicObject(retval, a.format);
    }
    export function integrate(a: AlgebraicObject, b: AlgebraicObject, c: AlgebraicObject, d?: AlgebraicObject) {
    /*
        const antiderivative = nerdamer.integrate(a.value, "X");
        const high = nerdamerIEval(antiderivative, { X: c.value });
        const low = nerdamerIEval(antiderivative, { X: b.value });
        const retval = high.subtract(low);
    */
        const retval = nerdamerCall("defint", a.value, b.value, c.value, "X");
        return new AlgebraicObject(retval, a.format);
    }
    export function sum(a: AlgebraicObject, b: AlgebraicObject, c: AlgebraicObject) {
        if (b.gt(c)) throw new ArgumentError("Start index must be less than or equal to end index");
        const retval = nerdamerCall("sum", a.value, "X", b.value, c.value);
        return new AlgebraicObject(retval, a.format);
    }
    export function product(a: AlgebraicObject, b: AlgebraicObject, c: AlgebraicObject) {
        if (b.gt(c)) throw new ArgumentError("Start index must be less than or equal to end index");
        const retval = nerdamerCall("product", a.value, "X", b.value, c.value); 
        return new AlgebraicObject(retval, a.format);
    }

    export function mod(a: AlgebraicObject, b: AlgebraicObject) {
        const dividend = a.value;
        const divisor = b.value;
        const remainder = nerdamerCall("mod", dividend, divisor);
        const quotient = nerdamerCall("floor", dividend.divide(divisor));
        const retval = new AlgebraicObject(remainder, NumericRepresentation.Decimal);
        retval.field = Field.Multi;
        retval.addAdditionalValue(new AlgebraicObject(quotient));
        return retval;
    }

    export function inverse(a: AlgebraicObject) {
        const [m, n] = MatrixUtils.getMatrixDimensions(a);
        const retval = nerdamerCall("invert", a.value);
        return new AlgebraicObject(retval, ...Array(m * n).fill(NumericRepresentation.Fraction));
    }

    export function determinant(a: AlgebraicObject) {
        if (!MatrixUtils.isMatrixSquare(a)) throw new DimensionError("Matrix must be square");
        if (MatrixUtils.getMatrixDimensions(a)[0] === 1) return a.ij(1, 1);
        const retval = nerdamerCall("determinant", a.value);
        return new AlgebraicObject(retval, NumericRepresentation.Fraction);
    }

    export function rowEchelonForm(a: AlgebraicObject) {
        const clone = a.clone();
        const [m, n] = MatrixUtils.getMatrixDimensions(clone);
        const pivotPositionsGlobal = new Array<number>();

        for (let l = 0; l < m; l++) { // ignore the lth row and column, to reduce the scope
            const pivotsScoped = new Array<AlgebraicObject>();
            // make all rows have pivot of 1
            for (let i = 1 + l; i <= m; i++) { // check from lth column to last column
                // pivot is first non zero element in row
                let pivot = AlgebraicObject.const(0);
                let pivotPosition = -1;
                
                for (let j = 1; j <= n; j++) {
                    const element = clone.ij(i, j);
                    if (element.eq(0)) continue;
                    pivot = element;
                    pivotPosition = j;
                    break;
                }
                pivotsScoped.push(pivot);
                pivotPositionsGlobal[i - 1] = pivotPosition;
                
                // divide row by pivot to make it 1
                if (pivot.eq(0) || pivot.eq(1)) continue;
                for (let j = 1; j <= n; j++) {
                    const element = clone.ij(i, j);
                    const quotient = element.div(pivot);
                    clone.ij(i, j, quotient);
                }
            }

            // check all pivots are 1
            let isRef = true;
            // check all pivot positions are higher than previous pivot positions
            for (let i = 2; i <= m; i++) {
                if (pivotPositionsGlobal[i - 2] < pivotPositionsGlobal[i - 1]) continue;
                isRef = false;
            }
            if (isRef) break;
    
            // find the row of largest pivot
            let largestPivotIndexScoped = l; // 0-based
            let largestPivotScoped = pivotsScoped[l];
            for (let i = 1 + l; i < pivotsScoped.length; i++) {
                const pivot = pivotsScoped[i];
                if (pivot.gt(largestPivotScoped)) {
                    largestPivotScoped = pivot;
                    largestPivotIndexScoped = i;
                }
            }

            const largestPivotRowScoped = new Array<AlgebraicObject>(); // 0-based
            const largestPivotRowNumberScoped = largestPivotIndexScoped + 1; // 0-based to 1-based
            
            for (let j = 1; j <= n; j++) {
                largestPivotRowScoped.push(clone.ij(largestPivotRowNumberScoped, j));
            }
    
            // all other non-zero rows minus this row
            for (let i = 1 + l; i <= m; i++) {
                if (i === largestPivotRowNumberScoped) continue;
                
                let allZeros = true;
                for (let j = 1; j <= n; j++) {
                    const element = clone.ij(i, j);
                    if (!element.eq(0)) allZeros = false;
                }
                if (allZeros) continue;

                for (let j = 1; j <= n; j++) {
                    const element = clone.ij(i, j);
                    const largestPivotRowElement = largestPivotRowScoped[j - 1]; // 1-based to 0-based
                    clone.ij(i, j, element.minus(largestPivotRowElement));
                }
            }
    
            // make the row with pivot 1 the lth + 1 row
            if (largestPivotRowNumberScoped !== 1) {
                for (let j = 1; j <= n; j++) {
                    const originalRowElement = clone.ij(l + 1, j);
                    clone.ij(largestPivotRowNumberScoped, j, originalRowElement);
                    
                    const largestPivotRowElement = largestPivotRowScoped[j - 1]; // 1-based to 0-based
                    clone.ij(l + 1, j, largestPivotRowElement);
                }
            }
        }
        return clone;
    }
}