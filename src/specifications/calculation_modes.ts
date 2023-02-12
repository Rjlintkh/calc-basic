import { NumberBase } from "../data/math";
import { PairedVarTable, SingleVarTable, Table } from "../data/table";
import { Regression } from "../data/utils/stat_utils";
import { AlgebraicObject, nan } from "../data/value";
import { Capabilities } from "./capabilities";

export abstract class CalculationMode {
    constructor(public name: string, private desc: string) {}

    allowImaginary = false;
    alwaysInteger = false;
    booleanOutput = false;

    disableFormula = false;

    numberBase = NumberBase.Dec;

    validateRange(value: AlgebraicObject) {
        const abs = Math.abs(value.number());
        return abs === 0 || (abs >= Capabilities.AbsMinValue && abs <= Capabilities.AbsMaxValue);
    }

    gridMode = false;

    regression = Regression.Unknown;
    
    tableMode = false;
    createTable(): Table | null {
        return null;
    }

    specificVariables = false;
    createSpecificVariables(): Record<string, AlgebraicObject> {
        return {};
    }
}

export class CompMode extends CalculationMode {
    constructor() {
        super("COMP", "General calculations");
    }
}

export class ComplxMode extends CalculationMode {
    constructor() {
        super("COMPLX", "Complex number calculations");
        this.allowImaginary = true;
    }
}

export class BaseMode extends CalculationMode {
    constructor() {
        super("BASE", "Calculations involving specific number systems (binary, octal, decimal, hexadecimal)");
        this.alwaysInteger = true;
        this.numberBase = NumberBase.Dec;
    }

    validateRange(value: AlgebraicObject) {
        const num = value.number();
        switch (this.numberBase) {
            case NumberBase.Bin:
                return num >= -0b1000000000 && num < 0b1000000000;
            case NumberBase.Oct:
                return num >= -0o4000000000 && num < 0o4000000000;
            case NumberBase.Dec:
            case NumberBase.Hex:
                return num >= -0x80000000 && num < 0x80000000;
        }
    }
}

class StatMode extends CalculationMode {
    constructor() {
        super("STAT", "Statistical and regression calculations");
        this.tableMode = true;
    }
}

export class SdMode extends CalculationMode {
    constructor() {
        super("SD", "Sample data");
        this.tableMode = true;
        this.createTable = () => {
            const table = new SingleVarTable();
            table.regression = Regression.SingleVar;
            return table;
        }
    }
}

export class RegMode extends CalculationMode {
    constructor() {
        super("REG", "Regression calculations");
        this.tableMode = true;

        this.createTable = () => {
            const table = new PairedVarTable();
            table.regression = this.regression;
            return table;
        }
    }
}

class EqnMode extends CalculationMode {
    constructor() {
        super("EQN", "Equation solution");
        this.gridMode = true;
    }
}

export class MatMode extends CalculationMode {
    constructor() {
        super("MAT", "Matrix calculations");
        this.specificVariables = true;

        this.createSpecificVariables = () => {
            return {
                "MatA": nan,
                "MatB": nan,
                "MatC": nan,
                "MatAns": nan,
            }
        }
    }
}

export class VctMode extends CalculationMode {
    constructor() {
        super("VCT", "Vector calculations");
    }
}

class TableMode extends CalculationMode {
    constructor() {
        super("TABLE", "Generate a number table based on one or two functions");
        this.tableMode = true;
    }
}

class DistMode extends CalculationMode {
    constructor() {
        super("DIST", "Distribution calculations");
        this.tableMode = true;
    }
}

export class PrgmMode extends CalculationMode {
    constructor() {
        super("PRGM", "Program");
    }
}

export namespace CalculationModes {
    export const Comp = new CompMode;
    export const Complx = new ComplxMode;
    export const Base = new BaseMode;
    export const SD = new SdMode;
    export const Reg = new RegMode;
    export const Mat = new MatMode;
}