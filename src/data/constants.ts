import { Value } from "./value";


export class WrappedValue {
    constructor(public identifier: string, public value: Value, public alias: string[] = []) {
    }
}

const predefinedConstants = [
    new WrappedValue("e", Value.const("e")),
    new WrappedValue("pi", Value.const("pi"), ["π"]),
    
];

export function getConstant(identifier: string) {
    for (const constant of Object.values(predefinedConstants)) {
        if (constant.identifier === identifier || constant.alias.includes(identifier)) {
            return constant;
        }
    }
    return null;
}