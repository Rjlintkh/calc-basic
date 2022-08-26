import nerdamer = require("nerdamer");
import { ArgumentError, MathError } from "./errors";
import { Value, ValueNumericType, ValueObjectType } from "./value";
// @ts-ignore
import("nerdamer/Calculus");

const zero = nerdamer("0");
const one = nerdamer("1");
const pi = nerdamer("pi");

function nerdamerCall(name: string, ...args: (nerdamer.Expression|string)[]): nerdamer.Expression {
    return (<any>nerdamer)[name](...args);
}

function nerdamerICall<T>(instance: nerdamer.Expression, name: string, ...args: any[]): T {
    return (<any>instance)[name](...args);
}

function nerdamerIEval(instance: nerdamer.Expression, options: any): nerdamer.Expression {
    return (<any>instance).evaluate(options);
}

export function isRational(q: nerdamer.Expression): boolean {
    if (q.isImaginary()) {
        const re = nerdamerCall("realpart", q);
        const im = nerdamerCall("imagpart", q);
        return isRational(re) && isRational(im);
    }
    const numerator = nerdamerICall<nerdamer.Expression>(q, "numerator").text();
    const denominator = nerdamerICall<nerdamer.Expression>(q, "denominator").text();
    // fraction < 10
    // mixed < 9
    if ((numerator.length + denominator.length) >= 10) return false;
    return true;
}

export enum AngleUnit {
    Deg,
    Rad,
    Gra,
}

export enum NumberBase {
    Binary = 2,
    Octal = 8,
    Decimal = 10,
    Hexadecimal = 16,
}

export namespace M {
    export function sin(a: Value) {
        const retval = nerdamerCall("sin", a.value);
        return new Value(retval, a.numericType);
    }
    export function cos(a: Value) {
        const retval = nerdamerCall("cos", a.value);
        return new Value(retval, a.numericType);
    }
    export function tan(a: Value) {
        const retval = nerdamerCall("tan", a.value);
        return new Value(retval, a.numericType);
    }
    export function asin(a: Value) {
        const retval = nerdamerCall("asin", a.value);
        return new Value(retval, a.numericType);
    }
    export function acos(a: Value) {
        const retval = nerdamerCall("acos", a.value);
        return new Value(retval, a.numericType);
    }
    export function atan(a: Value) {
        const retval = nerdamerCall("atan", a.value);
        return new Value(retval, a.numericType);
    }
    export function sinh(a: Value) {
        const retval = nerdamerCall("sinh", a.value);
        return new Value(retval, a.numericType);
    }
    export function cosh(a: Value) {
        const retval = nerdamerCall("cosh", a.value);
        return new Value(retval, a.numericType);
    }
    export function tanh(a: Value) {
        const retval = nerdamerCall("tanh", a.value);
        return new Value(retval, a.numericType);
    }
    export function asinh(a: Value) {
        const retval = nerdamerCall("asinh", a.value);
        return new Value(retval, a.numericType);
    }
    export function acosh(a: Value) {
        const retval = nerdamerCall("acosh", a.value);
        return new Value(retval, a.numericType);
    }
    export function atanh(a: Value) {
        const retval = nerdamerCall("atanh", a.value);
        return new Value(retval, a.numericType);
    }

    export function sqrt(a: Value) {
        const retval = nerdamerCall("sqrt", a.value);
        return new Value(retval, a.numericType);
    }
    export function cbrt(a: Value) {
        const retval = nerdamerCall("cbrt", a.value);
        return new Value(retval, a.numericType);
    }
    export function factorial(a: Value) {
        if (!a.isInteger() || a.isNegative() || a.gte(70)) throw new MathError();
        const retval = nerdamerCall("factorial", a.value);
        return new Value(retval, ValueNumericType.Decimal);
    }
    export function nPr(a: Value, b: Value) {
        if (!a.gt(0) || !a.isInteger() ||
            !b.gt(0) || !a.isInteger() ||
            !a.gte(b)) throw new MathError();
        return M.factorial(a).div(M.factorial(a.minus(b)));
    }
    export function nCr(a: Value, b: Value) {
        return M.nPr(a, b).div(M.factorial(b));
    }
    export function nHr(a: Value, b: Value) {
        return M.nCr(a.plus(b).minus(1), b);
    }

    export function log(a: Value, b?: Value) {
        if (b == null) {
            if (a.lte(0)) throw new MathError();
            const retval = nerdamerCall("log10", a.value);
            return new Value(retval, ValueNumericType.Decimal);
        } else {
            const retval = nerdamerCall("log", b.value, a.value);
            return new Value(retval, ValueNumericType.Decimal);
        }
    }
    export function ln(a: Value) {
        if (a.lte(0)) throw new MathError();
        const retval = nerdamerCall("log", a.value);
        return new Value(retval, ValueNumericType.Decimal);
    }
    export function exp(a: Value) {
        const retval = nerdamerCall("exp", a.value);
        return new Value(retval, ValueNumericType.Decimal);
    }

    export function numerator(a: Value) {
        const retval = nerdamerICall<nerdamer.Expression>(a.value, "numerator");
        return new Value(retval, ValueNumericType.Decimal);
    }
    export function denominator(a: Value) {
        const retval = nerdamerICall<nerdamer.Expression>(a.value, "denominator");
        return new Value(retval, ValueNumericType.Decimal);
    }

    export function re(a: Value) {
        const retval = nerdamerCall("realpart", a.value.evaluate().expand());
        return new Value(retval, a.numericType);
    }
    export function im(a: Value) {
        const retval = nerdamerCall("imagpart", a.value.evaluate().expand());
        return new Value(retval, a.numericType);
    }
    export function polarComplex(a: Value, b: Value) {
        const re = a.times(M.cos(b)).text();
        const im = a.times(M.sin(b)).text();
        const retval = nerdamer(`${re}+${im}i`);
        return new Value(retval, a.numericType);
    }
    export function conjg(a: Value) {
        if (a.isComplex()) {
            const re = nerdamerCall("realpart", a.value.evaluate().expand());
            const im = nerdamerCall("imagpart", a.value.evaluate().expand());
            const retval = nerdamer(`${re}-${im}i`);
            return new Value(retval, a.numericType);
        }
        return new Value(a.value, a.numericType);
    }
    export function arg(a: Value) {
        const retval = nerdamerCall("arg", a.value);
        return new Value(retval, a.numericType);
    }

    export function or(a: Value, b: Value) {
        return Value.const(+a.value | +b.value);
    }
    export function xor(a: Value, b: Value) {
        return Value.const(+a.value ^ +b.value);
    }
    export function xnor(a: Value, b: Value) {
        return Value.const(~(+a.value ^ +b.value));
    }
    export function and(a: Value, b: Value) {
        return Value.const(+a.value & +b.value);
    }
    export function not(a: Value) {
        let retval = nerdamer(`${~+a.text()}`);
        return new Value(retval, a.numericType);
    }
    export function neg(a: Value) {
        let retval = zero.subtract(a.value);
        return new Value(retval, a.numericType);
    }

    export function ranint(a: Value, b: Value) {
        if (a.gte(b)) throw new ArgumentError();
        const random = Math.random();
        const low =  a.value;
        const high = b.value;
        const retval = nerdamerCall("floor", low.add(high.subtract(low).add(1).multiply(random)));
        return new Value(retval, ValueNumericType.Decimal);
    }
    export function rand() {
        const retval = Math.random();
        return new Value(nerdamer(retval+""), ValueNumericType.Decimal);
    }
    export function lcm(a: Value, b: Value) {
        const retval = nerdamerCall("lcm", a.value, b.value);
        return new Value(retval, ValueNumericType.Decimal);
    }
    export function gcd(a: Value, b: Value) {
        const retval = nerdamerCall("gcd", a.value, b.value);
        return new Value(retval, ValueNumericType.Decimal);
    }
    export function int(a: Value) {
        const retval = nerdamer(`${~~a.value}`);
        return new Value(retval, a.numericType);
    }
    export function ceil(a: Value) {
        const retval = nerdamerCall("ceil", a.value);
        return new Value(retval, a.numericType);
    }
    export function floor(a: Value) {
        const retval = nerdamerCall("floor", a.value);
        return new Value(retval, a.numericType);
    }
    export function abs(a: Value) {
        const retval = nerdamerCall("abs", a.value);
        return new Value(retval, a.numericType);
    }

    export function differentiate(a: Value, b: Value, c?: Value) {
        const derivative = nerdamer.diff(a.value, "X");
        const retval = derivative.sub("X", b.value.text());
        return new Value(retval, a.numericType);
    }
    export function integrate(a: Value, b: Value, c: Value, d?: Value) {
    /*
        const antiderivative = nerdamer.integrate(a.value, "X");
        const high = nerdamerIEval(antiderivative, { X: c.value });
        const low = nerdamerIEval(antiderivative, { X: b.value });
        const retval = high.subtract(low);
    */
        const retval = nerdamerCall("defint", a.value, b.value, c.value, "X");
        return new Value(retval, a.numericType);
    }
    export function sum(a: Value, b: Value, c: Value) {
        if (b.gt(c)) throw new ArgumentError("Start index must be less than or equal to end index");
        const retval = nerdamerCall("sum", a.value, "X", b.value, c.value);
        return new Value(retval, a.numericType);
    }
    export function product(a: Value, b: Value, c: Value) {
        if (b.gt(c)) throw new ArgumentError("Start index must be less than or equal to end index");
        const retval = nerdamerCall("product", a.value, "X", b.value, c.value);
        return new Value(retval, a.numericType);
    }

    export function mod(a: Value, b: Value) {
        const dividend = a.value;
        const divisor = b.value;
        const remainder = nerdamerCall("mod", dividend, divisor);
        const quotient = nerdamerCall("floor", dividend.divide(divisor));
        const retval = new Value(remainder, ValueNumericType.Decimal);
        retval.objectType = ValueObjectType.Multi;
        retval.secondary = new Value(quotient);
        return retval;
    }
}