import nerdamer from "nerdamer";
import { AngleUnit, NumberBase } from "./math";
import { Value } from "./value";

function checkBase(str: string, base: NumberBase): boolean {
    switch (base) {
        case NumberBase.Binary:
            return /^[-01]+$/.test(str);
        case NumberBase.Octal:
            return /^[-0-7]+$/.test(str);
        case NumberBase.Decimal:
            return /^[-0-9]+$/.test(str);
        case NumberBase.Hexadecimal:
            return /^[-0-9a-f]+$/.test(str);
    }
}

function halfRotation(unit: AngleUnit) {
    switch (unit) {
        case AngleUnit.Deg:
            return Value.const(180);
        case AngleUnit.Rad:
            return Value.const("pi");
        case AngleUnit.Gra:
            return Value.const(200);
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

    export function toBase(value: Value, from: NumberBase, to: NumberBase): Value {
        if (from === to) return value;

        let str = value.text();
        if (from === NumberBase.Hexadecimal) str = escapeHex(str);

        if (!checkBase(str, from)) throw new SyntaxError(`${str} is not a valid integer in base ${from}`);

        let result = parseInt(str, from).toString(to);
        
        return new Value(nerdamer(result), value.numericType);
    }

    export function toAngleUnit(value: Value, from: AngleUnit, to: AngleUnit): Value {
        if (from === to) return value;
        return value.times(halfRotation(to)).div(halfRotation(from));
    }
}