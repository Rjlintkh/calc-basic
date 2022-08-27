import { NamedCalculation } from "../parsing/tokens";
import { MathError } from "./errors";
import { M } from "./math";
import { Regression } from "./stat_utils";
import { Value } from "./value";

export interface Line {
    frequency: Value;
}

export interface SingleVarLine extends Line {
    x: Value;
}

export interface PairedVarLine extends Line {
    x: Value;
    y: Value;
}

export type FormattedLine = {
    "x": string;
    "freq": string;
}

export type FormattedTable = FormattedLine[];

export abstract class Table {
    protected lines = new Array<Line>();

    protected calculationCache: Partial<Record<NamedCalculation, Value>> = {};
    
    regression = Regression.Unknown;

    constructor() {
    }

    clearCache() {
        this.calculationCache = {};
    }

    getCache(name: NamedCalculation) {
        return this.calculationCache[name] ?? null;
    }

    setCache(name: NamedCalculation, value: Value) {
        this.calculationCache[name] = value;
        return value;
    }

    clearLines() {
        this.lines = [];
        this.clearCache();
    }

    getLineAt(lineNumber: number) {
        return this.lines[lineNumber - 1];
    }

    getLines() {
        return this.lines;
    }

    getLineNumber() {
        return this.lines.length;
    }

    isEmpty() {
        return this.lines.length > 0;
    }

    validateLines() {
        const lineNumber = this.lines.length;
        if (this instanceof SingleVarTable) {
            if (!lineNumber) throw new MathError("Table is empty");
        } else {
            if (!lineNumber) throw new MathError("Table is empty");
            if (lineNumber < 2) throw new MathError("Table must have at least two lines");
        }
    }

    validateNumberRange(value: Value) {
        const abs = M.abs(value);
        const valid = abs.lt(1e50);
        if (!valid) throw new MathError("Value is too large");
    }

    abstract maxLineNumber(frequency: boolean): number;

    abstract newLine(...args: Value[]): number;

    abstract setLineAt(lineNumber: number, ...args: Value[]): void;

    abstract values(): Generator<Value[], void, unknown>;
}

export class SingleVarTable extends Table {
    protected lines = new Array<SingleVarLine>();

    maxLineNumber(frequency: boolean): number {
        return frequency ? 40 : 80;
    }

    newLine(x: Value, frequency: Value) {
        this.validateNumberRange(x);
        const line = { x, frequency };
        this.lines.push(line);
        this.clearCache();
        return this.lines.length;
    }

    setLineAt(lineNumber: number, x: Value, frequency: Value) {
        this.validateNumberRange(x);
        const line = { x, frequency };
        this.lines[lineNumber - 1] = line;
        this.clearCache();
    }

    *values() {
        for (const {x, frequency} of this.lines) {
            for (let i = 0; frequency.gt(i); i++) {
                yield [x];
            }
        }
    }
}

export class PairedVarTable extends Table {
    protected lines = new Array<PairedVarLine>();

    maxLineNumber(frequency: boolean): number {
        return frequency ? 26 : 40;
    }

    newLine(x: Value, y: Value, frequency: Value) {
        this.validateNumberRange(x);
        this.validateNumberRange(y);
        const line = { x, y, frequency };
        this.lines.push(line);
        this.clearCache();
        return this.lines.length;
    }

    setLineAt(lineNumber: number, x: Value, y: Value, frequency: Value) {
        this.validateNumberRange(x);
        this.validateNumberRange(y);
        const line = { x, y, frequency };
        this.lines[lineNumber - 1] = line;
        this.clearCache();
    }

    *values() {
        for (const {x, y, frequency} of this.lines) {
            for (let i = 0; frequency.gt(i); i++) {
                yield [x, y];
            }
        }
    }
}