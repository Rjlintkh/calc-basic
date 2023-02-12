import { MathError } from "../data/errors";
import { NumberBase } from "../data/math";
import { FormattedTable, Table } from "../data/table";
import { Regression } from "../data/utils/stat_utils";
import { AlgebraicObject, Field, zero } from "../data/value";
import { CalculationMode } from "../specifications/calculation_modes";
import { Config, ConfigProperty } from "./config";
import { FormattedCluster, Formatter } from "./formatter";

export class Context {
    constructor() {
        this.initMemory();
    }

    private variables: Record<string, AlgebraicObject> = {};

    secondaryValueVariable: "Y" | "F" = "Y";

    private formulaVariables: Record<string, AlgebraicObject> = {};

    public modeSpecificVariables: Record<string, AlgebraicObject> = {};

    public table: Table | null = null;

    getVariableAny(name: string) {
        if (this.variables[name] != null) return this.getVariable(name);

        // if (this.formulaVariables[name] != null) return this.getFormulaVariable(name);

        if (this.modeSpecificVariables[name] != null) return this.getModeSpecificVariable(name);

        throw new ReferenceError(`${name} is not defined`);
    }

    getVariable(name: string) {
        const value = this.variables[name];
        if (value == null) throw new ReferenceError(`${name} is not defined`);
        return value;
    }

    setVariable(name: string, value: AlgebraicObject) {
        this.getVariable(name);
        this.variables[name] = value;
    }

    getFormulaVariable(name: string) {
        const value = this.formulaVariables[name];
        if (value == null) throw new ReferenceError(`${name} is not defined`);
        return value;
    }

    setFormulaVariable(name: string, value: AlgebraicObject) {
        if (this.formulaVariables[name] != null){
            this.formulaVariables[name] = value;
        }
        throw new ReferenceError(`${name} is not defined`);
    }

    getModeSpecificVariable(name: string) {
        const value = this.modeSpecificVariables[name] ?? null;
        if (value == null) throw new ReferenceError(`${name} is not defined`);
        return value;
    }

    setModeSpecificVariable(name: string, value: AlgebraicObject) {
        const original = this.modeSpecificVariables[name];
        if (original == null) throw new ReferenceError(`${name} is not defined`);
        if (!original.sameField(value)) throw new TypeError(`Cannot assign ${value.field} to ${original.field}`);
        this.modeSpecificVariables[name] = value;
    }

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

    initMemory() { // ClrMemory
        this.initVariableMemory();
        this.initAnswerMemory();
        this.initIndependentMemory();
    }
    
    initModeSpecificVariables() {
        if (this.getModeProperty("specificVariables")) {
            this.modeSpecificVariables = this.getModeProperty("createSpecificVariables")();
        }
    }

    initTable() { // ClrStat
        if (this.getModeProperty("tableMode")) {
            this.table = this.getModeProperty("createTable")();
        }
    }

    newAnswer(value: AlgebraicObject) {
        this.variables.PreAns = this.variables.Ans;
        this.variables.Ans = value;
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
        this.initModeSpecificVariables();
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

    format(data: AlgebraicObject): string;
    format(data: Table): FormattedTable;
    format(data: any): any {
        const formatted = this.formatter.format(data);
        if (formatted instanceof FormattedCluster) {
            return formatted.stringify();
        }
        return formatted;
    }

    formatToCluster(data: AlgebraicObject) {
        return this.formatter.format(data);
    }

    validateRange(value: AlgebraicObject) {
        const mode = this.config[ConfigProperty.CalculationMode];
        if (value.field !== Field.Real) return;
        const valid = mode.validateRange(value);
        if (!valid) throw new MathError(`Value is out of range`);
    }
}