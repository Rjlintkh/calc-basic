import { MathError } from "../data/errors";
import { NumberBase } from "../data/math";
import { Regression } from "../data/stat_utils";
import { FormattedTable, Table } from "../data/table";
import { Value, zero } from "../data/value";
import { CalculationMode } from "../specifications/calculation_modes";
import { Config, ConfigProperty } from "./config";
import { Formatter } from "./formatter";

export class Context {
    constructor() {
        this.initMemory();
    }

    private variables: Record<string, Value> = {};

    getVariable(name: string) {
        const value = this.variables[name] ?? null;
        if (value == null) throw new ReferenceError(`${name} is not defined`);
        return value;
    }

    setVariable(name: string, value: Value) {
        this.getVariable(name);
        this.variables[name] = value;
    }

    secondaryValueVariable: "Y" | "F" = "Y";

    private initVariableMemory() {
        this.variables.A = zero;
        this.variables.B = zero;
        this.variables.C = zero;
        this.variables.D = zero;
        this.variables.E = zero;
        this.variables.F = zero;
        this.variables.X = zero;
        this.variables.Y = zero;
    }

    private initAnswerMemory() {
        this.variables.Ans = zero;
        this.variables.PreAns = zero;
    }

    private initIndependentMemory() {
        this.variables.M = zero;
    }

    initMemory() {
        this.initVariableMemory();
        this.initAnswerMemory();
        this.initIndependentMemory();
    }

    newAnswer(value: Value) {
        this.variables.PreAns = this.variables.Ans;
        this.variables.Ans = value;
    }

    public table: Table | null = null;

    initTable() {
        if (this.getModeProperty("tableMode")) {
            this.table = this.getModeProperty("createTable")();
        }
    }

    private config = new Config();

    getConfigProperty<K extends keyof Config>(property: K): Config[K] {
        return this.config[property];
    }

    setConfigProperty<K extends keyof Config>(property: K, value: Config[K]) {
        this.config[property] = value;
    }

    setMode(mode: CalculationMode) {
        this.setConfigProperty(ConfigProperty.CalculationMode, mode);

        this.initTable();
    }

    selectNumberBase(base: NumberBase) {
        this.setModeProperty("numberBase", base);
    }

    selectRegression(regression: Regression) {
        this.setModeProperty("regression", regression);

        this.table!.regression = regression;
        this.table!.clearCache();
    }

    getModeProperty<K extends keyof CalculationMode>(property: K): CalculationMode[K] {
        return this.config[ConfigProperty.CalculationMode][property];
    }

    setModeProperty<K extends keyof CalculationMode>(property: K, value: CalculationMode[K]) {
        this.config[ConfigProperty.CalculationMode][property] = value;
    }

    private formatter = new Formatter(this);

    format(data: Value): string;
    format(data: Table): FormattedTable;
    format(data: any): any {
        return this.formatter.format(data);
    }

    validateRange(value: Value) {
        const mode = this.config[ConfigProperty.CalculationMode];
        const valid = mode.validateRange(value);
        if (!valid) throw new MathError(`Value is out of range`);
    }
}