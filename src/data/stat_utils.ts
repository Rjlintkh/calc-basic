import { NamedCalculation } from "../parsing/tokens";
import { M } from "./math";
import { Table } from "./table";
import { Value } from "./value";

export enum Regression {
    SingleVar,
    Linear, // (y = a + bx)
    Quadratic, // (y = a + bx + cx^2)
    Logarithmic, // (y = a + b ln(x))
    eExponential, // (y = a e^(bx))
    abExponential, // (y = a + b^x)
    Power, // (y = a + x^b)
    Inverse, // (y = a + b/x)

    Unknown = -1
}

export namespace StatUtils {
    export function summary(data: Table, calculation: NamedCalculation): Value {
        switch (calculation) {
            case NamedCalculation.StatXSquareSum:
                return XSquareSum(data);
            case NamedCalculation.StatXSum:
                return XSum(data);
            case NamedCalculation.StatCount:
                return count(data);
            case NamedCalculation.StatYSquareSum:
                return YSquareSum(data);
            case NamedCalculation.StatYSum:
                return YSum(data);
            case NamedCalculation.StatXYSum:
                return XYSum(data);
            case NamedCalculation.StatXSquareYSum:
                return XSquareYSum(data);
            case NamedCalculation.StatXCubeSum:
                return XCubeSum(data);
            case NamedCalculation.StatXFourthPowerSum:
                return XFourthPowerSum(data);

            case NamedCalculation.StatXMean:
                return XMean(data);
            case NamedCalculation.StatXSampleStandardDeviation:
                return XSampleStandardDeviation(data);
            case NamedCalculation.StatXPopulationStandardDeviation:
                return XPopulationStandardDeviation(data);

            case NamedCalculation.StatYMean:
                return YMean(data);
            case NamedCalculation.StatYSampleStandardDeviation:
                return YSampleStandardDeviation(data);
            case NamedCalculation.StatYPopulationStandardDeviation:
                return YPopulationStandardDeviation(data);

            case NamedCalculation.StatCoefficientA:
                return coefficientA(data);
            case NamedCalculation.StatCoefficientB:
                return coefficientB(data);
            case NamedCalculation.StatCoefficientR:
                return coefficientR(data);

            case NamedCalculation.StatMinX:
                return minX(data);
            case NamedCalculation.StatMaxX:
                return maxX(data);
            case NamedCalculation.StatMinY:
                return minY(data);
            case NamedCalculation.StatMaxY:
                return maxY(data);
            default:
                throw new Error(`Method "${calculation}" is not supported`);
        }
    }

    export function XSquareSum(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatXSquareSum);
        if (cache) return cache;
        
        let Σx2 = Value.const(0);

        for (const [x] of data.values()) {
            Σx2 = Σx2.plus(x.pow(2));
        }

        return data.setCache(NamedCalculation.StatXSquareSum, Σx2);
    }

    export function XSum(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatXSum);
        if (cache) return cache;

        let Σx = Value.const(0);

        for (const [x] of data.values()) {
            Σx = Σx.plus(x);
        }

        return data.setCache(NamedCalculation.StatXSum, Σx);
    }

    export function count(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatCount);
        if (cache) return cache;

        let n = Value.const(0);

        for (const [] of data.values()) {
            n = n.plus(1);
        }

        return data.setCache(NamedCalculation.StatCount, n);
    }

    export function YSquareSum(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatYSquareSum);
        if (cache) return cache;

        let Σy2 = Value.const(0);

        for (const [, y] of data.values()) {
            Σy2 = Σy2.plus(y.pow(2));
        }

        return data.setCache(NamedCalculation.StatYSquareSum, Σy2);
    }

    export function YSum(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatYSum);
        if (cache) return cache;

        let Σy = Value.const(0);

        for (const [, y] of data.values()) {
            Σy = Σy.plus(y);
        }

        return data.setCache(NamedCalculation.StatYSum, Σy);
    }

    export function XYSum(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatXYSum);
        if (cache) return cache;

        let Σxy = Value.const(0);

        for (const [x, y] of data.values()) {
            Σxy = Σxy.plus(x.times(y));
        }

        return data.setCache(NamedCalculation.StatXYSum, Σxy);
    }

    export function XSquareYSum(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatXSquareYSum);
        if (cache) return cache;

        let Σx2y = Value.const(0);

        for (const [x, y] of data.values()) {
            Σx2y = Σx2y.plus(x.pow(2).times(y));
        }

        return data.setCache(NamedCalculation.StatXSquareYSum, Σx2y);
    }

    export function XCubeSum(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatXCubeSum);
        if (cache) return cache;

        let Σx3 = Value.const(0);

        for (const [x] of data.values()) {
            Σx3 = Σx3.plus(x.pow(3));
        }

        return data.setCache(NamedCalculation.StatXCubeSum, Σx3);
    }

    export function XFourthPowerSum(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatXFourthPowerSum);
        if (cache) return cache;

        let Σx4 = Value.const(0);

        for (const [x] of data.values()) {
            Σx4 = Σx4.plus(x.pow(4));
        }

        return data.setCache(NamedCalculation.StatXFourthPowerSum, Σx4);
    }

    export function XMean(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatXMean);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const Σx = StatUtils.XSum(data);

        return data.setCache(NamedCalculation.StatXMean, Σx.div(n));
    }

    export function XSampleStandardDeviation(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatXSampleStandardDeviation);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const Σx = StatUtils.XSum(data);
        const Σx2 = StatUtils.XSquareSum(data);
        
        const variance = Σx2.minus(Σx.pow(2).div(n)).div(n.minus(1));
        
        return data.setCache(NamedCalculation.StatXSampleStandardDeviation, M.sqrt(variance));
    }

    export function XPopulationStandardDeviation(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatXPopulationStandardDeviation);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const mean = StatUtils.XMean(data);
        const Σx2 = StatUtils.XSquareSum(data);
        
        const variance = Σx2.div(n).minus(mean.pow(2));
        
        return data.setCache(NamedCalculation.StatXPopulationStandardDeviation, M.sqrt(variance));
    }

    export function YMean(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatYMean);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const Σy = StatUtils.YSum(data);

        return data.setCache(NamedCalculation.StatYMean, Σy.div(n));
    }

    export function YSampleStandardDeviation(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatYSampleStandardDeviation);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const Σy = StatUtils.YSum(data);
        const Σy2 = StatUtils.YSquareSum(data);
        
        const variance = Σy2.minus(Σy.pow(2).div(n)).div(n.minus(1));
        
        return data.setCache(NamedCalculation.StatYSampleStandardDeviation, M.sqrt(variance));
    }

    export function YPopulationStandardDeviation(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatYPopulationStandardDeviation);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const mean = StatUtils.YMean(data);
        const Σy2 = StatUtils.YSquareSum(data);
        
        const variance = Σy2.div(n).minus(mean.pow(2));
        
        return data.setCache(NamedCalculation.StatYPopulationStandardDeviation, M.sqrt(variance));
    }

    function internalSxx(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalSxx);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const Σx = StatUtils.XSum(data);
        const Σx2 = StatUtils.XSquareSum(data);
        
        const Sxx = Σx2.minus(Σx.pow(2).div(n));
        
        return data.setCache(NamedCalculation.StatInternalSxx, Sxx);
    }

    function internalSxy(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalSxy);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const Σx = StatUtils.XSum(data);
        const Σy = StatUtils.YSum(data);
        const Σxy = StatUtils.XYSum(data);
        
        const Sxy = Σxy.minus(Σx.times(Σy).div(n));
        
        return data.setCache(NamedCalculation.StatInternalSxy, Sxy);
    }

    function internalSxx2(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalSxx2);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const Σx = StatUtils.XSum(data);
        const Σx2 = StatUtils.XSquareSum(data);
        const Σx3 = StatUtils.XCubeSum(data);

        const Sxx2 = Σx3.minus(Σx.times(Σx2).div(n));
        
        return data.setCache(NamedCalculation.StatInternalSxx2, Sxx2);
    }

    function internalSx2x2(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalSx2x2);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const Σx2 = StatUtils.XSquareSum(data);
        const Σx4 = StatUtils.XFourthPowerSum(data);
        
        const Sx2x2 = Σx4.minus(Σx2.pow(2).div(n));
        
        return data.setCache(NamedCalculation.StatInternalSx2x2, Sx2x2);
    }

    function internalSx2y(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalSx2y);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const Σx2 = StatUtils.XSquareSum(data);
        const Σy = StatUtils.YSum(data);
        const Σx2y = StatUtils.XSquareYSum(data);
        
        const Sx2y = Σx2y.minus(Σx2.times(Σy).div(n));
        
        return data.setCache(NamedCalculation.StatInternalSx2y, Sx2y);
    }

    function internalΣlnx(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalΣlnx);
        if (cache) return cache;

        let Πx = Value.const(1);

        for (const [x] of data.values()) {
            Πx = Πx.times(x);
        }
        
        const Σlnx = M.ln(Πx);
        
        return data.setCache(NamedCalculation.StatInternalΣlnx, Σlnx);
    }

    function internalΣlnx2(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalΣlnx2);
        if (cache) return cache;
        
        let Σlnx2 = Value.const(0);

        for (const [x] of data.values()) {
            Σlnx2 = Σlnx2.plus(M.ln(x).pow(2));
        }
        
        return data.setCache(NamedCalculation.StatInternalΣlnx2, Σlnx2);
    }

    function internalΣlny(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalΣlny);
        if (cache) return cache;
        
        let Πy = Value.const(1);

        for (const [, y] of data.values()) {
            Πy = Πy.times(y);
        }

        const Σlny = M.ln(Πy);

        return data.setCache(NamedCalculation.StatInternalΣlny, Σlny);
    }

    function internalΣlny2(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalΣlny2);
        if (cache) return cache;
        
        let Σlny2 = Value.const(0);

        for (const [, y] of data.values()) {
            Σlny2 = Σlny2.plus(M.ln(y).pow(2));
        }
        
        return data.setCache(NamedCalculation.StatInternalΣlny2, Σlny2);
    }

    function internalΣxlny(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalΣylnx);
        if (cache) return cache;
        
        let Σxlny = Value.const(0);

        for (const [x, y] of data.values()) {
            Σxlny = Σxlny.plus(x.times(M.ln(y)));
        }
        
        return data.setCache(NamedCalculation.StatInternalΣylnx, Σxlny);
    }

    function internalΣylnx(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalΣylnx);
        if (cache) return cache;
        
        let Σylnx = Value.const(0);

        for (const [x, y] of data.values()) {
            Σylnx = Σylnx.plus(y.times(M.ln(x)));
        }
        
        return data.setCache(NamedCalculation.StatInternalΣylnx, Σylnx);
    }

    function internalΣlnxlny(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalΣlnxlny);
        if (cache) return cache;
        
        let Σlnxlny = Value.const(0);

        for (const [x, y] of data.values()) {
            Σlnxlny = Σlnxlny.plus(M.ln(x).times(M.ln(y)));
        }
        
        return data.setCache(NamedCalculation.StatInternalΣlnxlny, Σlnxlny);
    }

    function internalΣ1Overx(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalΣ1Overx);
        if (cache) return cache;
        
        let Σ1Overx = Value.const(0);

        for (const [x] of data.values()) {
            Σ1Overx = Σ1Overx.plus(x.pow(-1));
        }
        
        return data.setCache(NamedCalculation.StatInternalΣ1Overx, Σ1Overx);
    }

    function internalΣ1Overx2(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalΣ1Overx2);
        if (cache) return cache;

        let Σ1Overx2 = Value.const(0);

        for (const [x] of data.values()) {
            Σ1Overx2 = Σ1Overx2.plus(x.pow(-2));
        }

        return data.setCache(NamedCalculation.StatInternalΣ1Overx2, Σ1Overx2);
    }

    function internalΣyOverx(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalΣyOverx);
        if (cache) return cache;
        
        let ΣyOverx = Value.const(0);

        for (const [x, y] of data.values()) {
            ΣyOverx = ΣyOverx.plus(y.div(x));
        }
        
        return data.setCache(NamedCalculation.StatInternalΣyOverx, ΣyOverx);
    }

    export function coefficientA(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatCoefficientA);
        if (cache) return cache;

        let a!: Value;

        switch (data.regression) {
            case Regression.Linear: {
                const Σx = StatUtils.XSum(data);
                const Σy = StatUtils.YSum(data);
                const b = StatUtils.coefficientB(data);
                const n = StatUtils.count(data);

                a = Σy.minus(b.times(Σx)).div(n);
                break;
            }
            case Regression.Quadratic: {
                const n = StatUtils.count(data);
                const Σx = StatUtils.XSum(data);
                const Σx2 = StatUtils.XSquareSum(data);
                const Σy = StatUtils.YSum(data);
                const b = StatUtils.coefficientB(data);
                const c = StatUtils.coefficientR(data);
                
                a = Σy.minus(b.times(Σx)).minus(c.times(Σx2)).div(n);
                break;
            }
            case Regression.Logarithmic: {
                const n = StatUtils.count(data);
                const Σy = StatUtils.YSum(data);
                const Σlnx = internalΣlnx(data);
                const b = StatUtils.coefficientB(data);
                
                a = Σy.minus(b.times(Σlnx)).div(n);
                break;
            }
            case Regression.eExponential: {
                const n = StatUtils.count(data);
                const Σx = StatUtils.XSum(data);
                const Σlny = internalΣlny(data);
                const b = StatUtils.coefficientB(data);
                
                a = M.exp(Σlny.minus(b.times(Σx)).div(n));
                break;
            }
            case Regression.abExponential: {
                const n = StatUtils.count(data);
                const Σx = StatUtils.XSum(data);
                const Σlny = internalΣlny(data);
                const b = StatUtils.coefficientB(data);
                
                a = M.exp(Σlny.minus(M.ln(b).times(Σx)).div(n));
                break;
            }
            case Regression.Power: {
                const n = StatUtils.count(data);
                const Σlnx = internalΣlnx(data);
                const Σlny = internalΣlny(data);
                const b = StatUtils.coefficientB(data);
                
                a = M.exp(Σlny.minus(b.times(Σlnx)).div(n));
                break;
            }
            case Regression.Inverse: {
                const n = StatUtils.count(data);
                const Σy = StatUtils.YSum(data);
                const Σ1Overx = internalΣ1Overx(data);
                const b = StatUtils.coefficientB(data);

                a = Σy.minus(b.times(Σ1Overx)).div(n);
                break;
            }
        }

        return data.setCache(NamedCalculation.StatCoefficientA, a);
    }

    export function coefficientB(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatCoefficientB);
        if (cache) return cache;

        let b!: Value;

        switch (data.regression) {
            case Regression.Linear: {
                const n = StatUtils.count(data);
                const Σxy = StatUtils.XYSum(data);
                const Σx = StatUtils.XSum(data);
                const Σy = StatUtils.YSum(data);
                const Σx2 = StatUtils.XSquareSum(data);

                const p = n.times(Σxy).minus(Σx.times(Σy));
                const q = n.times(Σx2).minus(Σx.pow(2));

                b = p.div(q);
                break;
            }
            case Regression.Quadratic: {
                const Sxx = internalSxx(data);
                const Sxy = internalSxy(data);
                const Sxx2 = internalSxx2(data);
                const Sx2x2 = internalSx2x2(data);
                const Sx2y = internalSx2y(data);

                const p = Sxy.times(Sx2x2).minus(Sx2y.times(Sxx2));
                const q = Sxx.times(Sx2x2).minus(Sxx2.pow(2));

                b = p.div(q);
                break;
            }
            case Regression.Logarithmic: {
                const n = StatUtils.count(data);
                const Σy = StatUtils.YSum(data);
                const Σlnx = internalΣlnx(data);
                const Σlnx2 = internalΣlnx2(data);
                const Σylnx = internalΣylnx(data);
                
                const p = n.times(Σylnx).minus(Σlnx.times(Σy));
                const q = n.times(Σlnx2).minus(Σlnx.pow(2));

                b = p.div(q);
                break;
            }
            case Regression.eExponential: {
                const n = StatUtils.count(data);
                const Σx = StatUtils.XSum(data);
                const Σx2 = StatUtils.XSquareSum(data);
                const Σlny = internalΣlny(data);
                const Σxlny = internalΣxlny(data);
                
                const p = n.times(Σxlny).minus(Σx.times(Σlny));
                const q = n.times(Σx2).minus(Σx.pow(2));

                b = p.div(q);
                break;
            }
            case Regression.abExponential: {
                const n = StatUtils.count(data);
                const Σx = StatUtils.XSum(data);
                const Σx2 = StatUtils.XSquareSum(data);
                const Σlny = internalΣlny(data);
                const Σxlny = internalΣxlny(data);
                
                const p = n.times(Σxlny).minus(Σx.times(Σlny));
                const q = n.times(Σx2).minus(Σx.pow(2));

                b = M.exp(p.div(q));
                break;
            }
            case Regression.Power: {
                const n = StatUtils.count(data);
                const Σlnx = internalΣlnx(data);
                const Σlnx2 = internalΣlnx2(data);
                const Σlny = internalΣlny(data);
                const Σlnxlny = internalΣlnxlny(data);
                
                const p = n.times(Σlnxlny).minus(Σlnx.times(Σlny));
                const q = n.times(Σlnx2).minus(Σlnx.pow(2));

                b = p.div(q);
                break;
            }
            case Regression.Inverse: {
                const n = StatUtils.count(data);
                const Σy = StatUtils.YSum(data);
                const Σ1Overx = internalΣ1Overx(data);
                const ΣyOverx = internalΣyOverx(data);
                const Σ1Overx2 = internalΣ1Overx2(data);
                
                const Sxx = Σ1Overx2.minus(Σ1Overx.pow(2).div(n));
                const Sxy = ΣyOverx.minus(Σ1Overx.times(Σy).div(n));

                b = Sxy.div(Sxx);
                break;
            }
        }

        return data.setCache(NamedCalculation.StatCoefficientB, b);
    }

    export function coefficientR(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatCoefficientR);
        if (cache) return cache;

        let r!: Value;

        switch (data.regression) {
            case Regression.Linear: {
                const n = StatUtils.count(data);
                const Σxy = StatUtils.XYSum(data);
                const Σx = StatUtils.XSum(data);
                const Σy = StatUtils.YSum(data);
                const Σx2 = StatUtils.XSquareSum(data);
                const Σy2 = StatUtils.YSquareSum(data);
        
                const h = n.times(Σx2).minus(Σx.pow(2));
                const k = n.times(Σy2).minus(Σy.pow(2));

                const p = n.times(Σxy).minus(Σx.times(Σy));
                const q = M.sqrt(h.times(k));
        
                r = p.div(q);
                break;
            }
            case Regression.Quadratic: {
                const Sxx = internalSxx(data);
                const Sxy = internalSxy(data);
                const Sxx2 = internalSxx2(data);
                const Sx2x2 = internalSx2x2(data);
                const Sx2y = internalSx2y(data);

                const p = Sx2y.times(Sxx).minus(Sxy.times(Sxx2));
                const q = Sxx.times(Sx2x2).minus(Sxx2.pow(2));

                r = p.div(q);
                break;
            }
            case Regression.Logarithmic: {
                const n = StatUtils.count(data);
                const Σy = StatUtils.YSum(data);
                const Σy2 = StatUtils.YSquareSum(data);
                const Σlnx = internalΣlnx(data);
                const Σlnx2 = internalΣlnx2(data);
                const Σylnx = internalΣylnx(data);

                const h = n.times(Σlnx2).minus(Σlnx.pow(2));
                const k = n.times(Σy2).minus(Σy.pow(2));

                const p = n.times(Σylnx).minus(Σlnx.times(Σy));
                const q = M.sqrt(h.times(k));

                r = p.div(q);
                break;
            }
            case Regression.eExponential:
            case Regression.abExponential: {
                const n = StatUtils.count(data);
                const Σxlny = internalΣxlny(data);
                const Σx = StatUtils.XSum(data);
                const Σx2 = StatUtils.XSquareSum(data);
                const Σlny = internalΣlny(data);
                const Σlny2 = internalΣlny2(data);

                const h = n.times(Σx2).minus(Σx.pow(2));
                const k = n.times(Σlny2).minus(Σlny.pow(2));

                const p = n.times(Σxlny).minus(Σx.times(Σlny));
                const q = M.sqrt(h.times(k));
                
                r = p.div(q);
                break;
            }
            case Regression.Power: {
                const n = StatUtils.count(data);
                const Σlnx = internalΣlnx(data);
                const Σlnx2 = internalΣlnx2(data);
                const Σlny = internalΣlny(data);
                const Σlny2 = internalΣlny2(data);
                const Σlnxlny = internalΣlnxlny(data);

                const h = n.times(Σlnx2).minus(Σlnx.pow(2));
                const k = n.times(Σlny2).minus(Σlny.pow(2));

                const p = n.times(Σlnxlny).minus(Σlnx.times(Σlny));
                const q = M.sqrt(h.times(k));

                r = p.div(q);
                break;
            }
            case Regression.Inverse: {
                const n = StatUtils.count(data);
                const Σy = StatUtils.YSum(data);
                const Σy2 = StatUtils.YSquareSum(data);
                const Σ1Overx = internalΣ1Overx(data);
                const ΣyOverx = internalΣyOverx(data);
                const Σ1Overx2 = internalΣ1Overx2(data);
                
                const Sxx = Σ1Overx2.minus(Σ1Overx.pow(2).div(n));
                const Syy = Σy2.minus(Σy.pow(2).div(n));
                const Sxy = ΣyOverx.minus(Σ1Overx.times(Σy).div(n));

                r = Sxy.div(M.sqrt(Sxx.times(Syy)));
                break;
            }
        }

        return data.setCache(NamedCalculation.StatCoefficientR, r);
    }

    export function estimatedX(data: Table, y: Value) {
        data.validateLines();

        let x!: Value;

        switch (data.regression) {
            case Regression.Linear: {
                const a = StatUtils.coefficientA(data);
                const b = StatUtils.coefficientB(data);
                x = y.minus(a).div(b);
            }
        }

        return x;
    }

    export function estimatedY(data: Table, x: Value) {
        data.validateLines();

        let y!: Value;

        switch (data.regression) {
            case Regression.Linear: {
                const a = StatUtils.coefficientA(data);
                const b = StatUtils.coefficientB(data);
                y = a.plus(b.times(x));
            }
        }

        return y;
    }

    export function minX(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatMinX);
        if (cache) return cache;

        let min!: Value;

        for (const [x] of data.values()) {
            if (!min || x.lt(min)) min = x;
        }

        return data.setCache(NamedCalculation.StatMinX, min);
    }

    export function maxX(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatMaxX);
        if (cache) return cache;

        let max!: Value;

        for (const [x] of data.values()) {
            if (!max || x.gt(max)) max = x;
        }

        return data.setCache(NamedCalculation.StatMaxX, max);
    }

    export function minY(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatMinY);
        if (cache) return cache;

        let min!: Value;

        for (const [, y] of data.values()) {
            if (!min || y.lt(min)) min = y;
        }

        return data.setCache(NamedCalculation.StatMinY, min);
    }

    export function maxY(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatMaxY);
        if (cache) return cache;

        let max!: Value;

        for (const [, y] of data.values()) {
            if (!max || y.gt(max)) max = y;
        }

        return data.setCache(NamedCalculation.StatMaxY, max);
    }
}