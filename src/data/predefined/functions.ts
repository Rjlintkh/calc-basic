import { Context } from "../../interpretation/context";
import { ArgumentError, MathError } from "../errors";
import { M } from "../math";
import { Angle, Complex, Expression, Integer, Param, Real } from "../param";
import { AlgebraicObject } from "../value";

export class WrappedFunction {
    arity: [number, number];
    constructor(public identifier: string, public params: (typeof Param | [typeof Param])[], public result: typeof Param, private func: (this: Context, ...args: AlgebraicObject[]) => AlgebraicObject) {
        this.arity = this.computeArity();
    }

    call(ctx: Context, ...args: AlgebraicObject[]) {
        for (const [i, arg] of args.entries()) {
            let Type = this.params[i];
            if (Array.isArray(Type)) {
                Type = Type[0];
            }
            if (!Type.prototype.validate(arg, ctx)) throw new ArgumentError(`Argument ${arg.text()} is not a valid ${(new Type).constructor.name}`);
            args[i] = Type.prototype.convertArg(arg, ctx);
        }
        const result = this.func.call(ctx, ...args);
        if (!this.result.prototype.validate(result, ctx)) throw new MathError(`Result ${result.text()} is not a valid ${(new this.result).constructor.name}`);
        const retval = this.result.prototype.convertResult(result, ctx);
        return retval;
    }

    private computeArity(): [number, number] {
        let min = 0;
        let max = 0;
        let optionalStarted = false;
        for (const param of this.params) {
            if (Array.isArray(param)) {
                max++;
                optionalStarted = true;
            } else {
                if (optionalStarted) throw new TypeError(`A required parameter cannot follow an optional parameter`);
                min++;
                max++;
            }
        }
        return [min, max];
    }

    isExpressional() {
        return this.params[0] === Expression;
    }

    mustRequireParthenesis() {
        return this.arity[0] > 1;
    }
}

const predefinedFunctions = [
    new WrappedFunction("sin", [Angle], Real, M.sin),
    new WrappedFunction("cos", [Angle], Real, M.cos),
    new WrappedFunction("tan", [Angle], Real, M.tan),
    new WrappedFunction("asin", [Real], Angle, M.asin),
    new WrappedFunction("acos", [Real], Angle, M.acos),
    new WrappedFunction("atan", [Real], Angle, M.atan),
    new WrappedFunction("sinh", [Real], Real, M.sinh),
    new WrappedFunction("cosh", [Real], Real, M.cosh),
    new WrappedFunction("tanh", [Real], Real, M.tanh),
    new WrappedFunction("asinh", [Real], Real, M.asinh),
    new WrappedFunction("acosh", [Real], Real, M.acosh),
    new WrappedFunction("atanh", [Real], Real, M.atanh),
    new WrappedFunction("sqrt", [Real], Complex, M.sqrt),
    new WrappedFunction("cbrt", [Real], Real, M.cbrt),
    new WrappedFunction("log", [Real, [Real]], Real, M.log),
    new WrappedFunction("ln", [Real], Real, M.ln),
    new WrappedFunction("Abs", [Complex], Real, M.abs),
    new WrappedFunction("Conjg", [Complex], Complex, M.conjg),
    new WrappedFunction("arg", [Complex], Angle, M.arg),
    new WrappedFunction("Not", [Real], Real, M.not),
    new WrappedFunction("Neg", [Real], Real, M.neg),
    new WrappedFunction("Rnd", [Real], Real, a => a),
    new WrappedFunction("RanInt", [Integer, Integer], Real, M.ranint),
    new WrappedFunction("LCM", [Integer, Integer], Integer, M.lcm),
    new WrappedFunction("GCD", [Integer, Integer], Integer, M.gcd),
    new WrappedFunction("Int", [Real], Integer, M.int),
    new WrappedFunction("Intg", [Real], Integer, M.floor),
    new WrappedFunction("d/dx", [Expression, Real, [Real]], Real, M.differentiate),
    new WrappedFunction("∫", [Expression, Real, Real, [Real]], Real, M.integrate),
    new WrappedFunction("Σ", [Expression, Integer, Integer], Real, M.sum),
    new WrappedFunction("Π", [Expression, Integer, Integer], Real, M.product),
    new WrappedFunction("Pol", [Real, Real], Real, function(a, b) {
        const r = M.sqrt(a.pow(2).plus(b.pow(2)));
        const theta = M.atan(b.over(a));
        this.setVariable("X", r);
        this.setVariable(this.secondaryValueVariable, Angle.prototype.convertResult(theta, this));
        return r;
    }),
    new WrappedFunction("Rec", [Real, Angle], Real, function(a, b) {
        const x = a.times(M.cos(b));
        const y = a.times(M.sin(b));
        this.setVariable("X", x);
        this.setVariable(this.secondaryValueVariable, y);
        return x;
    }),
];

export function getFunction(identifier: string) {
    for (const func of predefinedFunctions) {
        if (func.identifier === identifier) {
            return func;
        }
    }
    return null;
}