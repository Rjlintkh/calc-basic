import nerdamer = require("nerdamer");
import { MathError } from "./errors";
import { M } from "./math";

const cache = new Map<string, Value>();

function anyIsNegative(x: Value | number) {
    return x instanceof Value ? x.isNegative() : x < 0;
}

function anyIsInteger(x: Value | number) {
    return x instanceof Value ? x.isInteger() : Number.isInteger(x);
}

function anyIsComplex(x: Value | number): x is Value {
    return x instanceof Value ? x.isComplex() :false;
}

function isMatrix(x: nerdamer.Expression) {
    return (x as any)?.symbol?.augment;
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

export enum ValueObjectType {
    Real,
    Complex,
    Vector,
    Matrix,

    DummyVariable,

    Multi,
    Error,
}

export enum ValueNumericType {
    Decimal,
    Fraction,
    Sexagesimal
}

export class Value {
    static const(value: Value | number | string, numericType = ValueNumericType.Decimal): Value {
        if (value instanceof Value) return value;
        
        const key = value+"";
        const cached = cache.get(key);
        if (cached != null) return cached;
        const newValue = new Value(nerdamer(key), numericType);
        cache.set(key, newValue);
        return newValue;
    }

    static objectType({value, secondary, tertiary}: Value) {
        if (secondary || tertiary) return ValueObjectType.Multi;

        const evaluated = value.evaluate();

        if (evaluated.isNumber()) return ValueObjectType.Real;
        if (evaluated.isImaginary()) return ValueObjectType.Complex;
        if (isVector(evaluated)) return ValueObjectType.Vector;
        if (isMatrix(evaluated)) return ValueObjectType.Matrix;

        if (containsDummyVariable(evaluated)) return ValueObjectType.DummyVariable;
        
        if (isError(evaluated)) return ValueObjectType.Error;
        
        throw new Error(`Unsupported mathematical object: ${value.text()}`);
    }

    static numericType(value: Value) {
        if (value.isFraction() && M.denominator(value).eq(1)) return ValueNumericType.Decimal;
        return value.numericType;
    }

    secondary?: Value;
    tertiary?: Value;

    objectType: ValueObjectType;
    numericType: ValueNumericType;

    constructor(public value: nerdamer.Expression, numericType = ValueNumericType.Decimal) {
        this.objectType = Value.objectType(this);
        
        this.numericType = numericType ?? ValueNumericType.Decimal;
        this.numericType = Value.numericType(this);
    }

    isNaN() {
        return this.objectType === ValueObjectType.Error;
    }

    isError() {
        return this.objectType === ValueObjectType.Error;
    }

    isDecimal() {
        return this.numericType === ValueNumericType.Decimal;
    }

    isFraction() {
        return this.numericType === ValueNumericType.Fraction;
    }
    
    isSexagesimal() {
        return this.numericType === ValueNumericType.Sexagesimal;
    }

    isReal() {
        return this.objectType === ValueObjectType.Real;
    }

    isComplex() {
        return this.objectType === ValueObjectType.Complex;
    }

    isVector() {
        return this.objectType === ValueObjectType.Vector;
    }

    isMatrix() {
        return this.objectType === ValueObjectType.Matrix;
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

    plus(rhs: Value | number) {
        const retval = this.value.add(rhs.valueOf());
        return new Value(retval, Value.typeTwoTerms(this, Value.const(rhs)));
    }

    minus(rhs: Value | number) {
        const retval = this.value.subtract(rhs.valueOf());
        return new Value(retval, Value.typeTwoTerms(this, Value.const(rhs)));
    }

    times(rhs: Value | number): Value {
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
        return new Value(retval, Value.typeSameTerm(this, Value.const(rhs)));
    }

    div(rhs: Value | number): Value {
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
        return new Value(retval, Value.typeSameTerm(this, Value.const(rhs)));
    }

    over(rhs: Value | number): Value {
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
        return new Value(retval, Value.fractionOutcome(this, Value.const(rhs)))
    }

    pow(rhs: Value | number): Value {
        if (this.isComplex()) {
            const power = Value.const(rhs);
            if (power.eq(negOne)) {
                return one.div(this);
            } else if (power.eq(two)) {
                return this.times(this);
            } else if (power.eq(three)) {
                return this.times(this).times(this);
            } else throw new MathError();
        }
        const retval = this.value.pow(rhs.valueOf());
        return new Value(retval, anyIsInteger(rhs) ? this.numericType : ValueNumericType.Decimal);
    }

    root(rhs: Value | number) {
        if (this.isComplex()) {
            throw new MathError();
        }
        const pow = one.div(rhs);
        const retval = this.value.pow(pow.value);
        return new Value(retval, anyIsInteger(rhs) ? this.numericType : ValueNumericType.Decimal);
    }

    eq(rhs: Value | number) {
        return this.value.eq(rhs.valueOf());
    }

    gt(rhs: Value | number) {
        return this.value.gt(rhs.valueOf());
    }

    lt(rhs: Value | number) {
        return this.value.lt(rhs.valueOf());
    }

    gte(rhs: Value | number) {
        return this.value.gte(rhs.valueOf());
    }

    lte(rhs: Value | number) {
        return this.value.lte(rhs.valueOf());
    }

    text(): string {
        return this.value.text();
    }

    eval() {
        return this.value.evaluate();
    }

    valueOf() {
        return this.value;
    }

    static fractionOutcome(lhs: Value, rhs: Value): ValueNumericType {
        const lhsOk = lhs.isFraction() || lhs.isInteger();
        const rhsOk = rhs.isFraction() || rhs.isInteger();
        return lhsOk && rhsOk ? ValueNumericType.Fraction : ValueNumericType.Decimal;
    }

    static typeTwoTerms(lhs: Value, rhs: Value): ValueNumericType {
        // TODO: Optimize this
        const lhsReal = lhs.isReal(), rhsReal = rhs.isReal();
        const lhsDecimal = lhs.isDecimal(), rhsDecimal = rhs.isDecimal();
        const lhsFraction = lhs.isFraction(), rhsFraction = rhs.isFraction();
        const lhsInteger = lhs.isInteger(), rhsInteger = rhs.isInteger();
        const lhsSexagesimal = lhs.isSexagesimal(), rhsSexagesimal = rhs.isSexagesimal();
        if (lhsReal && rhsReal) {
            if ((lhsDecimal && !lhsInteger) || (rhsDecimal && !rhsInteger)) return ValueNumericType.Decimal;
            if ((lhsFraction || lhsInteger) && rhsFraction) return ValueNumericType.Fraction;
            if (lhsFraction && (rhsFraction || rhsInteger)) return ValueNumericType.Fraction;
            if (lhsSexagesimal || lhsSexagesimal) {
                if (lhsSexagesimal && rhsSexagesimal) return ValueNumericType.Sexagesimal;
                return ValueNumericType.Decimal;
            }
        } else {
        }
        return lhs.numericType;
    }

    static typeSameTerm(lhs: Value, rhs: Value) {
        const lhsSexagesimal = lhs.isSexagesimal(), rhsSexagesimal = rhs.isSexagesimal();
        if (lhsSexagesimal || rhsSexagesimal) return ValueNumericType.Sexagesimal;
        return Value.typeTwoTerms(lhs, rhs);
    }
}

export const negOne = Value.const(-1);
export const zero = Value.const(0);
export const one = Value.const(1);
export const two = Value.const(2);
export const three = Value.const(3);