import nerdamer from "nerdamer";
import { AngleUnit, NumberBase } from "../math";
import { AlgebraicObject } from "../value";

function checkBase(str: string, base: NumberBase): boolean {
    switch (base) {
        case NumberBase.Bin:
            return /^[-01]+$/.test(str);
        case NumberBase.Oct:
            return /^[-0-7]+$/.test(str);
        case NumberBase.Dec:
            return /^[-0-9]+$/.test(str);
        case NumberBase.Hex:
            return /^[-0-9a-f]+$/.test(str);
    }
}

function halfRotation(unit: AngleUnit) {
    switch (unit) {
        case AngleUnit.Deg:
            return AlgebraicObject.const(180);
        case AngleUnit.Rad:
            return AlgebraicObject.const("pi");
        case AngleUnit.Gra:
            return AlgebraicObject.const(200);
    }
}

export namespace ConversionUtils {
    export function escapeHex(str: string) {
        return str
            .replace(/𝗔/g, "a")
            .replace(/𝗕/g, "b")
            .replace(/𝗖/g, "c")
            .replace(/𝗗/g, "d")
            .replace(/𝗘/g, "e")
            .replace(/𝗙/g, "f")
            .replace(/\*/g, "");
    }
    
    export function unescapeHex(str: string) {
        return str
            .replace(/a/g, "𝗔")
            .replace(/b/g, "𝗕")
            .replace(/c/g, "𝗖")
            .replace(/d/g, "𝗗")
            .replace(/e/g, "𝗘")
            .replace(/f/g, "𝗙");
    }

    export function toBase(value: AlgebraicObject, from: NumberBase, to: NumberBase): AlgebraicObject {
        if (from === to) return value;

        let str = value.text();
        if (from === NumberBase.Hex) str = escapeHex(str);

        if (!checkBase(str, from)) throw new SyntaxError(`${str} is not a valid integer in base ${from}`);

        let result = parseInt(str, from).toString(to);
        
        return new AlgebraicObject(nerdamer(result), value.format);
    }

    export function toAngleUnit(value: AlgebraicObject, from: AngleUnit, to: AngleUnit): AlgebraicObject {
        if (from === to) return value;
        return value.times(halfRotation(to)).div(halfRotation(from));
    }
}