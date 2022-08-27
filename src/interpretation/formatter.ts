import { ConversionUtils } from "../data/conversion_utils";
import { M, NumberBase } from "../data/math";
import { FormattedTable, PairedVarLine, PairedVarTable, SingleVarLine, Table } from "../data/table";
import { Value } from "../data/value";
import { Operators } from "../parsing/tokens";
import { ConfigProperty, FractionDisplayFormat } from "./config";
import { Context } from "./context";

export class Formatter {
    constructor(private ctx: Context) {
    }
    format(data: Value): string;
    format(value: Table): FormattedTable;
    format(value: Value | Table): any {
        if (value == null) return "NULL";
        
        if (value instanceof Table) return this.table(value);

        if (value.isNaN()) return "NaN";
        
        if (value.isFraction()) return this.fraction(value);

        if (value.isComplex()) return this.complex(value);

        if (value.isSexagesimal()) return this.sexagesimal(value);

        const base = this.ctx.getModeProperty("numberBase");
        if (base !== NumberBase.Dec) return this.base(value, base);

        return this.float(value);
    }
    table(data: Table): FormattedTable {
        return data.getLines().map((line, i) => {
            const formattedLine = {} as any;
            formattedLine[`x`] = this.format((<SingleVarLine>line).x);

            if (data instanceof PairedVarTable) {
                formattedLine[`y`] = this.format((<PairedVarLine>line).y);
            }

            formattedLine[`freq`] = this.format(line.frequency);
            return formattedLine;
        });
    }
    float(data: Value): string {
        const text = data.eval().text();

        const abs = Math.abs(+text);
        const outOfBounds = abs !== 0 && (abs >= 1e10 || abs < 1e-3); // 1e-10 for NORM 2

        const int = this.ctx.getModeProperty("alwaysInteger") && data.isFraction();
        
        const sigfig10 = new Intl.NumberFormat("en-US", {
            notation: outOfBounds ? "scientific" : "standard",
            maximumSignificantDigits: 10,
            useGrouping: false
        }).format(int ? ~~text : +text);//.replace(/E/g, "×₁₀");

        let digits = 0;
        let fraction = false;
        let exp = false;
        let final = "";
        for (let c of sigfig10) {
            if (/\d/.test(c)) {
                digits++;
                if (digits > 10) {
                    continue;
                }
            }
            if (c === ".") {
                c = this.ctx.getConfigProperty(ConfigProperty.DecimalPointCharacter);
                fraction = true;
            }
            if (c === "E") {
                if (fraction && final.at(-1) === "0") {
                    final = final.slice(0, -1);
                }
                c = "×₁₀";
                exp = true;
            }
            final += c;
        }
            
        if (!exp && fraction && final.at(-1) === "0") {
            final = final.slice(0, -1);
        }
        return final;
    }
    fraction(data: Value): string {
        const numerator = M.numerator(data);
        const denominator = M.denominator(data);
        if (numerator.gt(denominator) && this.ctx.getConfigProperty(ConfigProperty.FractionDisplayFormat) === FractionDisplayFormat.Mixed) {
            const integer = M.floor(numerator.div(denominator));
            const remainder = numerator.minus(integer.times(denominator));
            return `${integer.text()}${Operators.Level4}${remainder.text()}${Operators.Level4}${denominator.text()}`;
        }
        return `${numerator.text()}${Operators.Level4}${denominator.text()}`;
    }
    complex(data: Value): string {
        const re  = M.re(data);
        const im = M.im(data);
        return `${this.termConstant(re)}${this.binaryPlus(re, im)}${this.termCoefficient(im)}i`;
    }
    sexagesimal(data: Value): string {
        let clone: Value;
        const h = M.int(data);
        clone = data.minus(h);
        const m = M.int(clone.times(60));
        clone = clone.minus(m.div(60));
        const s = clone.times(3600);

        const last = +parseFloat(s.text()).toFixed(2);
        return `${h.text()}${Operators.SexagesimalOperator}${m.text()}${Operators.SexagesimalOperator}${last}`;
    }
    base(data: Value, base: NumberBase) {
        if (data.isNegative()) {
            switch (base) {
                case NumberBase.Bin:
                    data = data.plus(0b10000000000);
                    break;
                case NumberBase.Oct:
                    data = data.plus(0o10000000000);
                    break;
                case NumberBase.Hex:
                    data = data.plus(0x10000000000);
                    break;
            }
        }
        const based = ConversionUtils.toBase(data, NumberBase.Dec, base);
        return based.eval().text();
    }
    termCoefficient(data: Value): string {
        if (data.eq(1)) return "";
        if (data.eq(-1)) return "-";
        return this.float(data);
    }
    termConstant(data: Value): string {
        if (data.eq(0)) return "";
        return this.float(data);
    }
    binaryPlus(left: Value, right: Value): string {
        if (left.eq(0)) return "";
        return right.gte(0) ? "+" : "";
    }
}