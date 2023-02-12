import { ConfigProperty } from "../interpretation/config";
import { Context } from "../interpretation/context";
import { AngleUnit } from "./math";
import { ConversionUtils } from "./utils/conversion_utils";
import { AlgebraicObject } from "./value";

export class Param {
    validate(v: AlgebraicObject, ctx: Context): boolean {
        return true;
    }

    convertArg(v: AlgebraicObject, ctx: Context): AlgebraicObject {
        return v;
    }

    convertResult(v: AlgebraicObject, ctx: Context): AlgebraicObject {
        return v;
    }
}

export class Complex extends Param {
    validate(v: AlgebraicObject, ctx: Context) {
        return v.isReal() || (v.isComplex() && ctx.getModeProperty("allowImaginary"));
    }
}

export class Real extends Param {
    validate(v: AlgebraicObject) {
        return v.isReal();
    }
}

export class Integer extends Param {
    validate(v: AlgebraicObject) {
        return v.isReal() && v.isInteger();
    }
}

export class Matrix extends Param {
    validate(v: AlgebraicObject) {
        return v.isMatrix();
    }
}

export class Angle extends Param {
    validate(v: AlgebraicObject) {
        if (v.isComplex()) return false;
        return true;
    }
    /** Convert to radians */
    convertArg(v: AlgebraicObject, ctx: Context) {
        return ConversionUtils.toAngleUnit(v, ctx.getConfigProperty(ConfigProperty.AngleUnit), AngleUnit.Rad);
    }
    /** Convert from radians */
    convertResult(v: AlgebraicObject, ctx: Context) {
        return ConversionUtils.toAngleUnit(v, AngleUnit.Rad, ctx.getConfigProperty(ConfigProperty.AngleUnit));
    }
}

export class Expression extends Param {}