import nerdamer from "nerdamer";
import { MathError } from "./errors";
import { isRational, M } from "./math";
import { MatrixUtils } from "./utils/matrix_utils";

const cache = new Map<string, AlgebraicObject>();

function anyIsNegative(x: AlgebraicObject | number) {
    return x instanceof AlgebraicObject ? x.isNegative() : x < 0;
}

function anyIsInteger(x: AlgebraicObject | number) {
    return x instanceof AlgebraicObject ? x.isInteger() : Number.isInteger(x);
}

function anyIsComplex(x: AlgebraicObject | number): x is AlgebraicObject {
    return x instanceof AlgebraicObject ? x.isComplex() : false;
}

function isMatrix(x: nerdamer.Expression) {
    return (x as any)?.symbol?.augment;
}

function anyIsMatrix(x: AlgebraicObject | number): x is AlgebraicObject {
    return x instanceof AlgebraicObject ? x.isMatrix() : false;
}

function isVector(x: nerdamer.Expression) {
    return (x as any)?.symbol?.isParallelTo;
}

function isError(x: nerdamer.Expression) {
    return (<string>(x as any)?.symbol?.value).indexOf("NaN") !== -1;
}

function containsDummyVariable(x: nerdamer.Expression) {
    return x.variables().includes("X");
}

function fixNerdamerRidiculouslyLargeMantissa(x: nerdamer.Expression) {
    /*
        Happens when `(74499982/74216053)^350` is evaluated.
        Results in BigInteger with 394 chunks of numbers.
    */
    const any = x as any;
    if (!any?.symbol?.multiplier) return;

    const num = <{value: number[]}>any.symbol.multiplier.num;
    const numLen = num.value.length;
    if (!Array.isArray(num.value) || numLen <= 3) return;

    const den = <{value: number[]}>any.symbol.multiplier.den;
    const denLen = den.value.length;
    if (!Array.isArray(den.value) || denLen <= 3) return;

    const reduced = x.text();
    any.symbol = (nerdamer(reduced) as any).symbol;

    // console.info(`Fixed, (${numLen} + ${denLen})`);
}

export enum Field {
    Real = "R",
    Complex = "C",
    Vector = "V",
    Matrix = "M",

    DummyVariable = "X",

    Multi = "+",
    Error = "!",
}

export enum NumericRepresentation {
    Integer = "Z",
    Decimal = "D",
    Fraction = "F",
    Sexagesimal = "S",
}

export class AlgebraicObject {
    static const(value: AlgebraicObject | number | string, numericType = NumericRepresentation.Decimal): AlgebraicObject {
        if (value instanceof AlgebraicObject) return value;
        
        const key = value+"";
        const cached = cache.get(key);
        if (cached != null) return cached;

        const newValue = new AlgebraicObject(nerdamer(key), numericType);
        
        cache.set(key, newValue);
        return newValue;
    }

    static inferField({value, additionalValues}: AlgebraicObject) {
        if (additionalValues) return Field.Multi;

        const evaluated = value.evaluate();

        if (isVector(evaluated)) return Field.Vector;
        if (isMatrix(evaluated)) return Field.Matrix;
        if (evaluated.isNumber()) return Field.Real;
        if (evaluated.isImaginary()) return Field.Complex;

        if (containsDummyVariable(evaluated)) return Field.DummyVariable;
        
        if (isError(evaluated)) return Field.Error;
        
        throw new Error(`Unsupported mathematical object: ${value.text()}`);
    }

    static validateFormatAgreement(value: AlgebraicObject) {
        let format = value.format;

        if (value.field === Field.Real || value.field === Field.Complex) {
            if (format === NumericRepresentation.Fraction && M.denominator(value).eq(1)) format = NumericRepresentation.Decimal;
        }

        if (format === NumericRepresentation.Sexagesimal) {
            const abs = Math.abs(value.number());
            if (abs >= 1e7) format = NumericRepresentation.Decimal;
            return format; // skip integer check
        }
        
        const Z = Number.isInteger(+value.text());
        if (Z) return NumericRepresentation.Integer;
        else if (format === NumericRepresentation.Integer) format = NumericRepresentation.Decimal;
        
        return format;
    }
    
    sameField(other: AlgebraicObject) {
        return (this.field === other.field) || (this.field === Field.Error);
    }

    value: nerdamer.Expression;

    field: Field;
    tupleFormats = new Array<NumericRepresentation>();
    get format() {
        return this.tupleFormats[0];
    }
    set format(value: NumericRepresentation) {
        this.tupleFormats[0] = value;
    }

    additionalValues?: AlgebraicObject[];

    addAdditionalValue(value: AlgebraicObject) {
        if (!this.additionalValues) this.additionalValues = [];
        this.additionalValues.push(value);
    }

    constructor(value: nerdamer.Expression, ...formats: NumericRepresentation[]) {
        this.value = value;
        fixNerdamerRidiculouslyLargeMantissa(this.value);
        this.field = AlgebraicObject.inferField(this);
        
        this.tupleFormats = formats.length ? formats : [NumericRepresentation.Decimal];
        if (this.isComplex()) {
            this.tupleFormats = [M.re(this).format, M.im(this).format];
        } else {
            this.format = AlgebraicObject.validateFormatAgreement(this);
        }
    }

    clone() {
        return new AlgebraicObject(this.value.add(0), ...this.tupleFormats);
    }

    isNaN() {
        return this.field === Field.Error;
    }

    isError() {
        return this.field === Field.Error;
    }

    isDecimal() {
        return this.format === NumericRepresentation.Decimal;
    }

    isFraction() {
        return this.format === NumericRepresentation.Fraction;
    }

    isRational() {
        return isRational(this.value);
    }
    
    isSexagesimal() {
        return this.format === NumericRepresentation.Sexagesimal;
    }

    isReal() {
        return this.field === Field.Real;
    }

    isComplex() {
        return this.field === Field.Complex;
    }

    isVector() {
        return this.field === Field.Vector;
    }

    isMatrix() {
        return this.field === Field.Matrix;
    }

    isInteger() {
        return Number.isInteger(+this.text());
    }

    isPositive() {
        return this.value.gt(0);
    }

    isNegative() {
        return this.value.lt(0);
    }

    plus(rhs: AlgebraicObject | number) {
        const retval = this.value.add(rhs.valueOf());
        return new AlgebraicObject(retval, ...AlgebraicObject.typeTwoTerms(this, AlgebraicObject.const(rhs)));
    }

    minus(rhs: AlgebraicObject | number) {
        const retval = this.value.subtract(rhs.valueOf());
        return new AlgebraicObject(retval, ...AlgebraicObject.typeTwoTerms(this, AlgebraicObject.const(rhs)));
    }

    times(rhs: AlgebraicObject | number): AlgebraicObject {
        if (anyIsComplex(this) && anyIsComplex(rhs)) { // Fix nerdamer bug
            const A = M.re(this);
            const B = M.im(this);
            const C = M.re(rhs);
            const D = M.im(rhs);
            const re = A.times(C).minus(B.times(D));
            const im = A.times(D).plus(B.times(C));
            return M.complex(re, im);
        }
        const retval = this.value.multiply(rhs.valueOf());
        return new AlgebraicObject(retval, ...AlgebraicObject.typeSameTerm(this, AlgebraicObject.const(rhs)));
    }

    div(rhs: AlgebraicObject | number): AlgebraicObject {
        if (anyIsComplex(rhs)) { // Fix nerdamer bug
            const A = M.re(this);
            const B = M.im(this);
            const C = M.re(rhs);
            const D = M.im(rhs);
            const denominator = C.pow(2).plus(D.pow(2));
            const re = A.times(C).plus(B.times(D)).div(denominator);
            const im = B.times(C).minus(A.times(D)).div(denominator);
            return M.complex(re, im);
        }
        const retval = this.value.divide(rhs.valueOf());
        return new AlgebraicObject(retval, ...AlgebraicObject.typeSameTerm(this, AlgebraicObject.const(rhs)));
    }

    over(rhs: AlgebraicObject | number): AlgebraicObject {
        if (anyIsComplex(rhs)) { // Fix nerdamer bug
            const A = M.re(this);
            const B = M.im(this);
            const C = M.re(rhs);
            const D = M.im(rhs);
            const denominator = C.pow(2).plus(D.pow(2));
            const re = A.times(C).plus(B.times(D)).over(denominator);
            const im = B.times(C).minus(A.times(D)).over(denominator);
            return M.complex(re, im);
        }
        const retval = this.value.divide(rhs.valueOf());
        return new AlgebraicObject(retval, AlgebraicObject.fractionOutcome(this, AlgebraicObject.const(rhs)))
    }

    pow(rhs: AlgebraicObject | number): AlgebraicObject {
        if (this.isComplex()) {
            const power = AlgebraicObject.const(rhs);
            if (power.eq(negOne)) {
                return one.div(this);
            } else if (power.eq(two)) {
                return this.times(this);
            } else if (power.eq(three)) {
                return this.times(this).times(this);
            } else throw new MathError();
        } else if (this.isMatrix()) {
            const power = AlgebraicObject.const(rhs);
            if (power.eq(negOne)) {
                return M.inverse(this);
            }
        }
        const retval = this.value.pow(rhs.valueOf());
        return new AlgebraicObject(retval, anyIsInteger(rhs) ? this.format : NumericRepresentation.Decimal);
    }

    root(rhs: AlgebraicObject | number) {
        if (this.isComplex()) {
            throw new MathError();
        }
        const pow = one.div(rhs);
        const retval = this.value.pow(pow.value);
        return new AlgebraicObject(retval, anyIsInteger(rhs) ? this.format : NumericRepresentation.Decimal);
    }

    eq(rhs: AlgebraicObject | number) {
        return this.value.eq(rhs.valueOf());
    }

    gt(rhs: AlgebraicObject | number) {
        return this.value.gt(rhs.valueOf());
    }

    lt(rhs: AlgebraicObject | number) {
        return this.value.lt(rhs.valueOf());
    }

    gte(rhs: AlgebraicObject | number) {
        return this.value.gte(rhs.valueOf());
    }

    lte(rhs: AlgebraicObject | number) {
        return this.value.lte(rhs.valueOf());
    }

    ij(i: number, j: number): AlgebraicObject;
    ij(i: number, j: number, value: AlgebraicObject | number): void;
    ij(i: number, j: number, value?: AlgebraicObject | number) {
        if (!this.isMatrix()) throw new MathError();
        if (value == null) {
            return MatrixUtils.getMatrixElement(this, i, j);
        } else {
            MatrixUtils.setMatrixElement(this, i, j, value);
        }
    }

    abs() {
        return M.abs(this);
    }

    text(): string {
        return this.value.text();
    }

    eval() {
        return this.value.evaluate();
    }

    private cacheNum: number | undefined;

    number() {
        if (this.cacheNum != null) return this.cacheNum;
        return this.cacheNum = <number>this.value.evaluate().valueOf();
    }

    digits() {
        return <string>(this.value.evaluate().text as any)("decimals", 100);
    }

    valueOf() {
        return this.value;
    }

    static fractionOutcome(lhs: AlgebraicObject, rhs: AlgebraicObject): NumericRepresentation {
        const lhsOk = lhs.isFraction() || lhs.isInteger();
        const rhsOk = rhs.isFraction() || rhs.isInteger();
        return lhsOk && rhsOk ? NumericRepresentation.Fraction : NumericRepresentation.Decimal;
    }

    static typeTwoTerms(lhs: AlgebraicObject, rhs: AlgebraicObject): NumericRepresentation[] {
        const Z = NumericRepresentation.Integer;
        const D = NumericRepresentation.Decimal;
        const F = NumericRepresentation.Fraction;
        const S = NumericRepresentation.Sexagesimal;
        
        const map: Record<string, NumericRepresentation[]> = { // Additive Typing
            "Z Z": [Z], // 1 + 1 = 2
            "Z D": [D], // 1 + 0.5 = 1.5
            "Z F": [F], // 1 + 1/2 = 3/2
            "Z S": [D], // 1 + 5'6' = 6.1

            "D Z": [D], // 1.1 + 1 = 2.1
            "D D": [D], // 1.1 + 1.2 = 2.3
            "D F": [D], // 1.1 + 1/2 = 1.6
            "D S": [D], // 1.1 + 5'6' = 6.2

            "F Z": [F], // 1/2 + 1 = 3/2
            "F D": [D], // 1/2 + 1.1 = 1.6
            "F F": [F], // 2/3 + 2/3 = 4/3
            "F S": [D], // 1/2 + 5'6' = 5.6
            
            "S Z": [D], // 5'6' + 1 = 6.1
            "S D": [D], // 5'6' + 1.1 = 6.2
            "S F": [D], // 5'6' + 1/2 = 5.6
            "S S": [S], // 1'2' + 1'2' = 2'4'0
        }
        if (lhs.isComplex() || rhs.isComplex()) {
            const L = [lhs.tupleFormats[0], lhs.tupleFormats[1] ?? Z];
            const R = [rhs.tupleFormats[0], rhs.tupleFormats[1] ?? Z];

            const key1 = `${L[0]} ${R[0]}`;
            const key2 = `${L[1]} ${R[1]}`;

            return [map[key1][0], map[key2][0]];
        } else {
            const L = lhs.format[0];
            const R = rhs.format[0];

            const key = `${L} ${R}`;
            return map[key];
        }
    }

    static typeSameTerm(lhs: AlgebraicObject, rhs: AlgebraicObject) {
        const lhsSexagesimal = lhs.isSexagesimal(), rhsSexagesimal = rhs.isSexagesimal();
        if (lhsSexagesimal || rhsSexagesimal) return [NumericRepresentation.Sexagesimal];
        return AlgebraicObject.typeTwoTerms(lhs, rhs);
    }
}

export const negOne = AlgebraicObject.const(-1);
export const zero = AlgebraicObject.const(0);
export const one = AlgebraicObject.const(1);
export const two = AlgebraicObject.const(2);
export const three = AlgebraicObject.const(3);
export const pi = AlgebraicObject.const("pi");
export const nan = AlgebraicObject.const("NaN");