import { M, NumberBase } from "../data/math";
import { FormattedTable, PairedVarLine, PairedVarTable, SingleVarLine, Table } from "../data/table";
import { ConversionUtils } from "../data/utils/conversion_utils";
import { AlgebraicObject, Field, NumericRepresentation } from "../data/value";
import { ConfigProperty, FractionDisplayFormat } from "./config";
import { Context } from "./context";

export class FormattedRaw {
    protected output = "";

    prefix?: string; // prefix like +, -, sqrt

    exponent?: string; // for m*10^n, checked for scientific notation
    integer?: string;
    decimals?: string;

    numerator?: string; // checked for fraction
    denominator?: string;

    // hour is also regarded as the integer, seconds can have decimals
    minutes?: string; // checked for sexagesimal
    seconds?: string;

    suffix?: string; // suffix like i, pi

    isEmpty() {
        return this.integer == null && this.numerator == null;
    }

    protected appendSign() {
        if (this.prefix) {
            this.output += this.prefix;
        }
    }

    protected appendInteger() {
        if (this.integer) {
            this.output += this.integer;
        }
    }

    protected appendDecimals() {
        if (this.decimals) {
            this.output += `.${this.decimals}`;
        }
    }
    
    protected appendExponent() {
        if (this.exponent) {
            this.output += `×₁₀${this.exponent}`;
        }
    }

    protected appendFraction() { // Assume `this.nominator && this.denominator`
        if (this.integer) this.output += "⌟";
        this.output += `${this.numerator}⌟${this.denominator}`;
    }

    protected appendMinutes() { // Assume `this.minutes`
        this.output += `″${this.minutes}`;
    }

    protected appendSeconds() {
        if (this.seconds) {
            this.output += `″${this.seconds}`;
        }
    }

    protected appendImaginaryUnit() {
        if (this.suffix) {
            this.output += this.suffix;
        }
    }

    stringify() {
        this.output = "";
        this.appendSign();
        this.appendInteger();
        if (this.numerator) {
            this.appendFraction();
        } else if (this.minutes) {
            this.appendMinutes();
            this.appendSeconds();
            this.appendDecimals();
        } else {
            this.appendDecimals();
            this.appendExponent();
        }
        this.appendImaginaryUnit();
        return this.output;
    }
}

export class FormattedCluster {
    constructor() {

    }

    a?: FormattedRaw;
    b?: FormattedRaw;

    real() {
        return this.a?.stringify() ?? "";
    }

    imaginary() {
        return this.b?.stringify() ?? "";
    }

    complex() {
        return this.real() + this.imaginary();
    }
}

const plusOne: Record<string, string> = {
    "0": "1",
    "1": "2",
    "2": "3",
    "3": "4",
    "4": "5",
    "5": "6",
    "6": "7",
    "7": "8",
    "8": "9",
    "9": "0",
}

function shouldRound(digit: string) {
    if (/[5-9]/.test(digit)) return true;
    return false;
}

export class Formatter {
    protected output!: FormattedCluster;

    constructor(protected ctx: Context) {
        
    }

    format(data: AlgebraicObject): FormattedCluster;
    format(data: Table): FormattedTable;
    format(data: AlgebraicObject | Table) {
        
        if (data instanceof Table) return this.table(data);

        this.output = new FormattedCluster();

        switch (data.field) {
            case Field.Error:
                this.output.a = this.error(data);
                break;
            case Field.Complex: {
                const re = M.re(data);
                const im = M.im(data);

                this.output.a = this.re(re);
                this.output.b = this.im(im);
            }
                break;
            case Field.Real:
                this.output.a = this.any(data);
                break;
        }

        return this.output;
    }

    trim(digits: string, max: number) { // wont accept "-"
        if (digits.length > max) {
            let output = "";
            let checkNextDigit: boolean | undefined;

            if (digits.indexOf(".") !== -1) max += 1;

            const weirdRound = digits.startsWith("0.") && digits.length >= max + 2;

            if (weirdRound) {
                digits = digits.slice(0, max + 2); // preserve 2 more digits for rounding

                let lastDigitRounded: boolean | undefined;
                let secondLastDigitRounded: boolean | undefined;

                for (let i = digits.length - 1; i >= 0; i--) { // start from the last digit
                    let d = digits[i];

                    if (d === ".") {
                        output = d + output;
                        continue;
                    }

                    if (lastDigitRounded == null) { // last digit in string
                        lastDigitRounded = shouldRound(d);
                        checkNextDigit = lastDigitRounded;
                    }
                    
                    else if (secondLastDigitRounded == null) { // second last digit in string
                        if (checkNextDigit && d === "9") { // idk why it only rounds when it is 9, ask casio
                            secondLastDigitRounded = shouldRound(d);
                        } else {
                            secondLastDigitRounded = false;
                        }
                        checkNextDigit = secondLastDigitRounded;
                    }
                    
                    else {
                        if (checkNextDigit) {
                            d = plusOne[d];
                            if (d !== "0") {
                                checkNextDigit = false;
                            }
                        }
                        if (output === "" && d === "0") continue; // last digit is 0
                        output = d + output;
                    }
                }
            } else {
                digits = digits.slice(0, max + 1); // preserve 1 more digit for rounding
    
                for (let i = digits.length - 1; i >= 0; i--) { // start from the last digit
                    let d = digits[i];
                    
                    if (d === ".") {
                        output = d + output;
                        continue;
                    }
                    
                    if (checkNextDigit == null) { // last digit in string
                        checkNextDigit = shouldRound(d);
                    }
                    
                    else {
                        if (checkNextDigit) {
                            d = plusOne[d];
                            if (d !== "0") {
                                checkNextDigit = false;
                            }
                        }
                        if (output === "" && d === "0") continue; // last digit is 0
                        output = d + output;
                    }
                }
            }
            return output;
        }
        return digits;
    }
    
    protected table(data: Table): FormattedTable {
        return data.getLines().map((line, i) => {
            const formattedLine = {} as any;
            formattedLine[`x`] = this.format((<SingleVarLine>line).x).complex();

            if (data instanceof PairedVarTable) {
                formattedLine[`y`] = this.format((<PairedVarLine>line).y).complex();
            }

            formattedLine[`freq`] = this.format(line.frequency).complex();
            return formattedLine;
        });
    }

    protected error(data: AlgebraicObject) {
        const raw = new FormattedRaw();
        raw.integer = "NaN";
        return raw;
    }

    protected re(data: AlgebraicObject) {
        if (data.eq(0)) return new FormattedRaw();
        return this.any(data);
    }

    protected im(data: AlgebraicObject) {
        const plus = !this.output.a?.isEmpty();

        if (data.eq(0)) return new FormattedRaw();

        const raw = this.any(data);

        if (raw.integer === "1") raw.integer = "";

        if (raw.prefix == null && plus) raw.prefix = "+";

        raw.suffix = "i";
        return raw;
    }

    protected any(data: AlgebraicObject) {
        switch (data.format) {
            case NumericRepresentation.Integer:
            case NumericRepresentation.Decimal:
                return this.decimal(data);
            case NumericRepresentation.Fraction:
                return this.fraction(data);
            case NumericRepresentation.Sexagesimal:
                return this.sexagesimal(data);
        }
    }

    protected sexagesimal(data: AlgebraicObject) {
        const raw = new FormattedRaw();
        
        let acc: AlgebraicObject;
        const h = M.int(data);
        acc = data.minus(h);

        const m = M.int(acc.times(60));
        acc = acc.minus(m.div(60));

        const s = acc.times(3600);

        if (h.isNegative()) raw.prefix = "-";

        raw.integer = h.digits();
        raw.minutes = m.digits();
        const [seconds, decimals] = s.digits().split(".");
        raw.seconds = seconds;
        raw.decimals = decimals ? this.trim(decimals, 2) : "";

        return raw;
    }

    protected fraction(data: AlgebraicObject) {
        const raw = new FormattedRaw();
        
        const num = M.numerator(data);
        const den = M.denominator(data);

        if (num.gte(den) && this.ctx.getConfigProperty(ConfigProperty.FractionDisplayFormat) === FractionDisplayFormat.Mixed) { // mixed fraction
            const q = M.floor(num.div(den));
            const r = num.minus(q.times(den));

            raw.integer = q.digits();
            raw.numerator = r.digits();
        } else {
            raw.numerator = num.digits();
        }
        raw.denominator = den.digits();
        return raw;
    }

    protected scientific(data: AlgebraicObject): FormattedRaw {
        const raw = new FormattedRaw();

        const alwaysInteger = this.ctx.getModeProperty("alwaysInteger"); // actually should always be false, but just in case

        let digits = data.digits();
        
        const defaultDPPos = 1; // after first digit
        let integer = "";
        let decimals = "";
        let zeros = "";
        let oldDPPos: number | undefined;
        let newDPPos: number | undefined;

        for (let i = 0; i < digits.length; i++) {
            const d = digits[i];

            if (d === ".") {
                oldDPPos = i + 1;
                continue;
            }

            if (d === "0") { // leading zeros will not be passed
                if (integer) {
                    zeros += d;
                }
                continue;
            }
            
            if (/[1-9]/.test(d)) {
                if (integer.length + decimals.length + zeros.length >= 10) break; // enough digits
                
                decimals += zeros;
                zeros = "";
                if (newDPPos != null) {
                    decimals += d;
                } else {
                    integer += d;
                    if (integer.length === defaultDPPos) {
                        newDPPos = i + 1; // add decimal point if there is second digit
                    }
                }
            }
        }

        oldDPPos ??= digits.length;
        newDPPos ??= defaultDPPos;

        raw.exponent = (oldDPPos - newDPPos).toString();
        raw.integer = integer;
        if (!alwaysInteger) raw.decimals = decimals;

        return raw;
    }

    protected decimal(data: AlgebraicObject) {
        const base = this.ctx.getModeProperty("numberBase");
        if (base !== NumberBase.Dec) {
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
            data = ConversionUtils.toBase(data, NumberBase.Dec, base);
        }
        
        const value = data.number();
        const abs = Math.abs(value);
        if (abs !== 0 && (abs >= 1e10 || abs < 1e-3)) { // 1e-10 for NORM 2
            return this.scientific(data);
        }

        const raw = new FormattedRaw();

        const alwaysInteger = this.ctx.getModeProperty("alwaysInteger");

        let digits = data.digits();

        if (digits[0] === "-") {
            raw.prefix = "-";
            digits = digits.slice(1);
        }

        digits = this.trim(digits, 10);

        const [integer, decimals] = digits.split(".");
        raw.integer = integer;
        if (!alwaysInteger) {
            raw.decimals = decimals;
        }

        return raw;
    }
}