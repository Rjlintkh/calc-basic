import { ConfigProperty } from "../interpretation/config";
import { Context } from "../interpretation/context";
import { ConversionUtils } from "./conversion_utils";
import { AngleUnit } from "./math";
import { Value } from "./value";

export class Param {
    validate(v: Value, ctx: Context): boolean {
        return true;
    }

    convertArg(v: Value, ctx: Context): Value {
        return v;
    }

    convertResult(v: Value, ctx: Context): Value {
        return v;
    }
}

export class Complex extends Param {
    validate(v: Value, ctx: Context) {
        return v.isReal() || (v.isComplex() && ctx.getModeProperty("allowImaginary"));
    }
}

export class Real extends Param {
    validate(v: Value) {
        return v.isReal();
    }
}

export class Integer extends Param {
    validate(v: Value) {
        return v.isReal() && v.isInteger();
    }
}

export class Angle extends Param {
    validate(v: Value) {
        if (v.isComplex()) return false;
        return true;
    }
    /** Convert to radians */
    convertArg(v: Value, ctx: Context) {
        return ConversionUtils.toAngleUnit(v, ctx.getConfigProperty(ConfigProperty.AngleUnit), AngleUnit.Rad);
    }
    /** Convert from radians */
    convertResult(v: Value, ctx: Context) {
        return ConversionUtils.toAngleUnit(v, AngleUnit.Rad, ctx.getConfigProperty(ConfigProperty.AngleUnit));
    }
}

export class Expression extends Param {}