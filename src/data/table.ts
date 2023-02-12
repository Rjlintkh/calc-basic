import { NamedCalculation } from "../parsing/tokens";
import { Capabilities } from "../specifications/capabilities";
import { MathError } from "./errors";
import { M } from "./math";
import { Regression } from "./utils/stat_utils";
import { AlgebraicObject, zero } from "./value";

export interface Line {
    frequency: AlgebraicObject;
}

export interface SingleVarLine extends Line {
    x: AlgebraicObject;
}

export interface PairedVarLine extends Line {
    x: AlgebraicObject;
    y: AlgebraicObject;
}

export type FormattedLine = {
    "x": string;
    "freq": string;
}

export type FormattedTable = FormattedLine[];

export abstract class Table {
    protected lines = new Array<Line>();

    protected calculationCache: Partial<Record<NamedCalculation, AlgebraicObject>> = {};
    
    regression = Regression.Unknown;

    constructor() {
    }

    abstract maxLineNumber(frequency: boolean): number;

    abstract newLine(...args: AlgebraicObject[]): number;

    abstract setLineAt(lineNumber: number, ...args: AlgebraicObject[]): void;

    abstract values(): Generator<AlgebraicObject[], void, unknown>;

    getLastLine() {
        if (!this.lines.length) return null;
        return this.lines[this.lines.length - 1];
    }

    clearCache() {
        this.calculationCache = {};
    }

    getCache(name: NamedCalculation) {
        return this.calculationCache[name] ?? null;
    }

    setCache(name: NamedCalculation, value: AlgebraicObject) {
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

    validateNumberRange(value: AlgebraicObject) {
        const abs = M.abs(value);
        const valid = abs.lt(1e50);
        if (!valid) throw new MathError("Value is too large");
    }
}

export class SingleVarTable extends Table {
    protected lines = new Array<SingleVarLine>();

    maxLineNumber(frequency: boolean): number {
        return frequency ? Capabilities.SingleVarTableMaxRowsFreq : Capabilities.SingleVarTableMaxRows;
    }

    newLine(x: AlgebraicObject, frequency: AlgebraicObject) {
        this.validateNumberRange(x);
        const line = { x, frequency };
        this.lines.push(line);
        this.clearCache();
        return this.lines.length;
    }

    setLineAt(lineNumber: number, x: AlgebraicObject, frequency: AlgebraicObject) {
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
        return frequency ? Capabilities.PairedVarTableMaxRowsFreq : Capabilities.PairedVarTableMaxRows;
    }

    newLine(x: AlgebraicObject, y: AlgebraicObject, frequency: AlgebraicObject) {
        this.validateNumberRange(x);
        this.validateNumberRange(y);
        const line = { x, y, frequency };
        this.lines.push(line);
        this.clearCache();
        return this.lines.length;
    }

    setLineAt(lineNumber: number, x: AlgebraicObject, y: AlgebraicObject, frequency: AlgebraicObject) {
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