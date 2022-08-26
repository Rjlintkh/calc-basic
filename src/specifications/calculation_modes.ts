import { M, NumberBase } from "../data/math";
import { Regression } from "../data/stat_utils";
import { PairedVarTable, SingleVarTable, Table } from "../data/table";
import { Value } from "../data/value";

export abstract class CalculationMode {
    constructor(protected name: string, private desc: string) {}

    allowImaginary = false;
    alwaysInteger = false;
    booleanOutput = false;

    disableFormula = false;

    numberBase = NumberBase.Decimal;

    validateRange(value: Value) {
        const abs = M.abs(value);
        return abs.eq(0) || (abs.gt(1e-100) && abs.lt(1e100));
    }

    gridMode = false;

    regression = Regression.Unknown;
    
    tableMode = false;
    createTable(): Table | null {
        return null;
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
        this.numberBase = NumberBase.Decimal;
    }

    validateRange(value: Value) {
        switch (this.numberBase) {
            case NumberBase.Binary:
                return value.gte(-512) && value.lt(512);
            case NumberBase.Octal:
                return value.gte(-536870912) && value.lt(536870912);
            case NumberBase.Decimal:
                return value.gt(-2147483648) && value.lt(2147483648);
            case NumberBase.Hexadecimal:
                return value.gt(-2147483648) && value.lt(2147483648);
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

export class PgrmMode extends CalculationMode {
    constructor() {
        super("PGRM", "Program");
    }
}

export namespace CalculationModes {
    export const Comp = new CompMode;
    export const Complx = new ComplxMode;
    export const Base = new BaseMode;
    export const SD = new SdMode;
    export const Reg = new RegMode;
}