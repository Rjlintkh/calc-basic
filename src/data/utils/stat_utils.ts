import { NamedCalculation } from "../../parsing/tokens";
import { MathError } from "../errors";
import { M } from "../math";
import { Table } from "../table";
import { AlgebraicObject, zero } from "../value";

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
    export function summary(data: Table, calculation: NamedCalculation): AlgebraicObject {
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
        
        let ??x2 = AlgebraicObject.const(0);

        for (const [x] of data.values()) {
            ??x2 = ??x2.plus(x.pow(2));
        }

        return data.setCache(NamedCalculation.StatXSquareSum, ??x2);
    }

    export function XSum(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatXSum);
        if (cache) return cache;

        let ??x = AlgebraicObject.const(0);

        for (const [x] of data.values()) {
            ??x = ??x.plus(x);
        }

        return data.setCache(NamedCalculation.StatXSum, ??x);
    }

    export function count(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatCount);
        if (cache) return cache;

        let n = AlgebraicObject.const(0);

        for (const [] of data.values()) {
            n = n.plus(1);
        }

        return data.setCache(NamedCalculation.StatCount, n);
    }

    export function YSquareSum(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatYSquareSum);
        if (cache) return cache;

        let ??y2 = AlgebraicObject.const(0);

        for (const [, y] of data.values()) {
            ??y2 = ??y2.plus(y.pow(2));
        }

        return data.setCache(NamedCalculation.StatYSquareSum, ??y2);
    }

    export function YSum(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatYSum);
        if (cache) return cache;

        let ??y = AlgebraicObject.const(0);

        for (const [, y] of data.values()) {
            ??y = ??y.plus(y);
        }

        return data.setCache(NamedCalculation.StatYSum, ??y);
    }

    export function XYSum(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatXYSum);
        if (cache) return cache;

        let ??xy = AlgebraicObject.const(0);

        for (const [x, y] of data.values()) {
            ??xy = ??xy.plus(x.times(y));
        }

        return data.setCache(NamedCalculation.StatXYSum, ??xy);
    }

    export function XSquareYSum(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatXSquareYSum);
        if (cache) return cache;

        let ??x2y = AlgebraicObject.const(0);

        for (const [x, y] of data.values()) {
            ??x2y = ??x2y.plus(x.pow(2).times(y));
        }

        return data.setCache(NamedCalculation.StatXSquareYSum, ??x2y);
    }

    export function XCubeSum(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatXCubeSum);
        if (cache) return cache;

        let ??x3 = AlgebraicObject.const(0);

        for (const [x] of data.values()) {
            ??x3 = ??x3.plus(x.pow(3));
        }

        return data.setCache(NamedCalculation.StatXCubeSum, ??x3);
    }

    export function XFourthPowerSum(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatXFourthPowerSum);
        if (cache) return cache;

        let ??x4 = AlgebraicObject.const(0);

        for (const [x] of data.values()) {
            ??x4 = ??x4.plus(x.pow(4));
        }

        return data.setCache(NamedCalculation.StatXFourthPowerSum, ??x4);
    }

    export function XMean(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatXMean);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const ??x = StatUtils.XSum(data);

        return data.setCache(NamedCalculation.StatXMean, ??x.div(n));
    }

    export function XSampleStandardDeviation(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatXSampleStandardDeviation);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const ??x = StatUtils.XSum(data);
        const ??x2 = StatUtils.XSquareSum(data);
        
        const variance = ??x2.minus(??x.pow(2).div(n)).div(n.minus(1));
        
        return data.setCache(NamedCalculation.StatXSampleStandardDeviation, M.sqrt(variance));
    }

    export function XPopulationStandardDeviation(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatXPopulationStandardDeviation);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const mean = StatUtils.XMean(data);
        const ??x2 = StatUtils.XSquareSum(data);
        
        const variance = ??x2.div(n).minus(mean.pow(2));
        
        return data.setCache(NamedCalculation.StatXPopulationStandardDeviation, M.sqrt(variance));
    }

    export function YMean(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatYMean);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const ??y = StatUtils.YSum(data);

        return data.setCache(NamedCalculation.StatYMean, ??y.div(n));
    }

    export function YSampleStandardDeviation(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatYSampleStandardDeviation);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const ??y = StatUtils.YSum(data);
        const ??y2 = StatUtils.YSquareSum(data);
        
        const variance = ??y2.minus(??y.pow(2).div(n)).div(n.minus(1));
        
        return data.setCache(NamedCalculation.StatYSampleStandardDeviation, M.sqrt(variance));
    }

    export function YPopulationStandardDeviation(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatYPopulationStandardDeviation);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const mean = StatUtils.YMean(data);
        const ??y2 = StatUtils.YSquareSum(data);
        
        const variance = ??y2.div(n).minus(mean.pow(2));
        
        return data.setCache(NamedCalculation.StatYPopulationStandardDeviation, M.sqrt(variance));
    }

    function internalSxx(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalSxx);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const ??x = StatUtils.XSum(data);
        const ??x2 = StatUtils.XSquareSum(data);
        
        const Sxx = ??x2.minus(??x.pow(2).div(n));
        
        return data.setCache(NamedCalculation.StatInternalSxx, Sxx);
    }

    function internalSxy(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalSxy);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const ??x = StatUtils.XSum(data);
        const ??y = StatUtils.YSum(data);
        const ??xy = StatUtils.XYSum(data);
        
        const Sxy = ??xy.minus(??x.times(??y).div(n));
        
        return data.setCache(NamedCalculation.StatInternalSxy, Sxy);
    }

    function internalSxx2(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalSxx2);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const ??x = StatUtils.XSum(data);
        const ??x2 = StatUtils.XSquareSum(data);
        const ??x3 = StatUtils.XCubeSum(data);

        const Sxx2 = ??x3.minus(??x.times(??x2).div(n));
        
        return data.setCache(NamedCalculation.StatInternalSxx2, Sxx2);
    }

    function internalSx2x2(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalSx2x2);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const ??x2 = StatUtils.XSquareSum(data);
        const ??x4 = StatUtils.XFourthPowerSum(data);
        
        const Sx2x2 = ??x4.minus(??x2.pow(2).div(n));
        
        return data.setCache(NamedCalculation.StatInternalSx2x2, Sx2x2);
    }

    function internalSx2y(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternalSx2y);
        if (cache) return cache;

        const n = StatUtils.count(data);
        const ??x2 = StatUtils.XSquareSum(data);
        const ??y = StatUtils.YSum(data);
        const ??x2y = StatUtils.XSquareYSum(data);
        
        const Sx2y = ??x2y.minus(??x2.times(??y).div(n));
        
        return data.setCache(NamedCalculation.StatInternalSx2y, Sx2y);
    }

    function internal??lnx(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternal??lnx);
        if (cache) return cache;

        let ??x = AlgebraicObject.const(1);

        for (const [x] of data.values()) {
            ??x = ??x.times(x);
        }
        
        const ??lnx = M.ln(??x);
        
        return data.setCache(NamedCalculation.StatInternal??lnx, ??lnx);
    }

    function internal??lnx2(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternal??lnx2);
        if (cache) return cache;
        
        let ??lnx2 = AlgebraicObject.const(0);

        for (const [x] of data.values()) {
            ??lnx2 = ??lnx2.plus(M.ln(x).pow(2));
        }
        
        return data.setCache(NamedCalculation.StatInternal??lnx2, ??lnx2);
    }

    function internal??lny(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternal??lny);
        if (cache) return cache;
        
        let ??y = AlgebraicObject.const(1);

        for (const [, y] of data.values()) {
            ??y = ??y.times(y);
        }

        const ??lny = M.ln(??y);

        return data.setCache(NamedCalculation.StatInternal??lny, ??lny);
    }

    function internal??lny2(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternal??lny2);
        if (cache) return cache;
        
        let ??lny2 = AlgebraicObject.const(0);

        for (const [, y] of data.values()) {
            ??lny2 = ??lny2.plus(M.ln(y).pow(2));
        }
        
        return data.setCache(NamedCalculation.StatInternal??lny2, ??lny2);
    }

    function internal??xlny(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternal??ylnx);
        if (cache) return cache;
        
        let ??xlny = AlgebraicObject.const(0);

        for (const [x, y] of data.values()) {
            ??xlny = ??xlny.plus(x.times(M.ln(y)));
        }
        
        return data.setCache(NamedCalculation.StatInternal??ylnx, ??xlny);
    }

    function internal??ylnx(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternal??ylnx);
        if (cache) return cache;
        
        let ??ylnx = AlgebraicObject.const(0);

        for (const [x, y] of data.values()) {
            ??ylnx = ??ylnx.plus(y.times(M.ln(x)));
        }
        
        return data.setCache(NamedCalculation.StatInternal??ylnx, ??ylnx);
    }

    function internal??lnxlny(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternal??lnxlny);
        if (cache) return cache;
        
        let ??lnxlny = AlgebraicObject.const(0);

        for (const [x, y] of data.values()) {
            ??lnxlny = ??lnxlny.plus(M.ln(x).times(M.ln(y)));
        }
        
        return data.setCache(NamedCalculation.StatInternal??lnxlny, ??lnxlny);
    }

    function internal??1Overx(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternal??1Overx);
        if (cache) return cache;
        
        let ??1Overx = AlgebraicObject.const(0);

        for (const [x] of data.values()) {
            ??1Overx = ??1Overx.plus(x.pow(-1));
        }
        
        return data.setCache(NamedCalculation.StatInternal??1Overx, ??1Overx);
    }

    function internal??1Overx2(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternal??1Overx2);
        if (cache) return cache;

        let ??1Overx2 = AlgebraicObject.const(0);

        for (const [x] of data.values()) {
            ??1Overx2 = ??1Overx2.plus(x.pow(-2));
        }

        return data.setCache(NamedCalculation.StatInternal??1Overx2, ??1Overx2);
    }

    function internal??yOverx(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatInternal??yOverx);
        if (cache) return cache;
        
        let ??yOverx = AlgebraicObject.const(0);

        for (const [x, y] of data.values()) {
            ??yOverx = ??yOverx.plus(y.div(x));
        }
        
        return data.setCache(NamedCalculation.StatInternal??yOverx, ??yOverx);
    }

    export function coefficientA(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatCoefficientA);
        if (cache) return cache;

        let a!: AlgebraicObject;

        switch (data.regression) {
            case Regression.Linear: {
                const ??x = StatUtils.XSum(data);
                const ??y = StatUtils.YSum(data);
                const b = StatUtils.coefficientB(data);
                const n = StatUtils.count(data);

                a = ??y.minus(b.times(??x)).div(n);
                break;
            }
            case Regression.Quadratic: {
                const n = StatUtils.count(data);
                const ??x = StatUtils.XSum(data);
                const ??x2 = StatUtils.XSquareSum(data);
                const ??y = StatUtils.YSum(data);
                const b = StatUtils.coefficientB(data);
                const c = StatUtils.coefficientR(data);
                
                a = ??y.minus(b.times(??x)).minus(c.times(??x2)).div(n);
                break;
            }
            case Regression.Logarithmic: {
                const n = StatUtils.count(data);
                const ??y = StatUtils.YSum(data);
                const ??lnx = internal??lnx(data);
                const b = StatUtils.coefficientB(data);
                
                a = ??y.minus(b.times(??lnx)).div(n);
                break;
            }
            case Regression.eExponential: {
                const n = StatUtils.count(data);
                const ??x = StatUtils.XSum(data);
                const ??lny = internal??lny(data);
                const b = StatUtils.coefficientB(data);
                
                a = M.exp(??lny.minus(b.times(??x)).div(n));
                break;
            }
            case Regression.abExponential: {
                const n = StatUtils.count(data);
                const ??x = StatUtils.XSum(data);
                const ??lny = internal??lny(data);
                const b = StatUtils.coefficientB(data);
                
                a = M.exp(??lny.minus(M.ln(b).times(??x)).div(n));
                break;
            }
            case Regression.Power: {
                const n = StatUtils.count(data);
                const ??lnx = internal??lnx(data);
                const ??lny = internal??lny(data);
                const b = StatUtils.coefficientB(data);
                
                a = M.exp(??lny.minus(b.times(??lnx)).div(n));
                break;
            }
            case Regression.Inverse: {
                const n = StatUtils.count(data);
                const ??y = StatUtils.YSum(data);
                const ??1Overx = internal??1Overx(data);
                const b = StatUtils.coefficientB(data);

                a = ??y.minus(b.times(??1Overx)).div(n);
                break;
            }
        }

        return data.setCache(NamedCalculation.StatCoefficientA, a);
    }

    export function coefficientB(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatCoefficientB);
        if (cache) return cache;

        let b!: AlgebraicObject;

        switch (data.regression) {
            case Regression.Linear: {
                const n = StatUtils.count(data);
                const ??xy = StatUtils.XYSum(data);
                const ??x = StatUtils.XSum(data);
                const ??y = StatUtils.YSum(data);
                const ??x2 = StatUtils.XSquareSum(data);

                const p = n.times(??xy).minus(??x.times(??y));
                const q = n.times(??x2).minus(??x.pow(2));

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
                const ??y = StatUtils.YSum(data);
                const ??lnx = internal??lnx(data);
                const ??lnx2 = internal??lnx2(data);
                const ??ylnx = internal??ylnx(data);
                
                const p = n.times(??ylnx).minus(??lnx.times(??y));
                const q = n.times(??lnx2).minus(??lnx.pow(2));

                b = p.div(q);
                break;
            }
            case Regression.eExponential: {
                const n = StatUtils.count(data);
                const ??x = StatUtils.XSum(data);
                const ??x2 = StatUtils.XSquareSum(data);
                const ??lny = internal??lny(data);
                const ??xlny = internal??xlny(data);
                
                const p = n.times(??xlny).minus(??x.times(??lny));
                const q = n.times(??x2).minus(??x.pow(2));

                b = p.div(q);
                break;
            }
            case Regression.abExponential: {
                const n = StatUtils.count(data);
                const ??x = StatUtils.XSum(data);
                const ??x2 = StatUtils.XSquareSum(data);
                const ??lny = internal??lny(data);
                const ??xlny = internal??xlny(data);
                
                const p = n.times(??xlny).minus(??x.times(??lny));
                const q = n.times(??x2).minus(??x.pow(2));

                b = M.exp(p.div(q));
                break;
            }
            case Regression.Power: {
                const n = StatUtils.count(data);
                const ??lnx = internal??lnx(data);
                const ??lnx2 = internal??lnx2(data);
                const ??lny = internal??lny(data);
                const ??lnxlny = internal??lnxlny(data);
                
                const p = n.times(??lnxlny).minus(??lnx.times(??lny));
                const q = n.times(??lnx2).minus(??lnx.pow(2));

                b = p.div(q);
                break;
            }
            case Regression.Inverse: {
                const n = StatUtils.count(data);
                const ??y = StatUtils.YSum(data);
                const ??1Overx = internal??1Overx(data);
                const ??yOverx = internal??yOverx(data);
                const ??1Overx2 = internal??1Overx2(data);
                
                const Sxx = ??1Overx2.minus(??1Overx.pow(2).div(n));
                const Sxy = ??yOverx.minus(??1Overx.times(??y).div(n));

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

        let r!: AlgebraicObject;

        switch (data.regression) {
            case Regression.Linear: {
                const n = StatUtils.count(data);
                const ??xy = StatUtils.XYSum(data);
                const ??x = StatUtils.XSum(data);
                const ??y = StatUtils.YSum(data);
                const ??x2 = StatUtils.XSquareSum(data);
                const ??y2 = StatUtils.YSquareSum(data);
        
                const h = n.times(??x2).minus(??x.pow(2));
                const k = n.times(??y2).minus(??y.pow(2));

                const p = n.times(??xy).minus(??x.times(??y));
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
                const ??y = StatUtils.YSum(data);
                const ??y2 = StatUtils.YSquareSum(data);
                const ??lnx = internal??lnx(data);
                const ??lnx2 = internal??lnx2(data);
                const ??ylnx = internal??ylnx(data);

                const h = n.times(??lnx2).minus(??lnx.pow(2));
                const k = n.times(??y2).minus(??y.pow(2));

                const p = n.times(??ylnx).minus(??lnx.times(??y));
                const q = M.sqrt(h.times(k));

                r = p.div(q);
                break;
            }
            case Regression.eExponential:
            case Regression.abExponential: {
                const n = StatUtils.count(data);
                const ??xlny = internal??xlny(data);
                const ??x = StatUtils.XSum(data);
                const ??x2 = StatUtils.XSquareSum(data);
                const ??lny = internal??lny(data);
                const ??lny2 = internal??lny2(data);

                const h = n.times(??x2).minus(??x.pow(2));
                const k = n.times(??lny2).minus(??lny.pow(2));

                const p = n.times(??xlny).minus(??x.times(??lny));
                const q = M.sqrt(h.times(k));
                
                r = p.div(q);
                break;
            }
            case Regression.Power: {
                const n = StatUtils.count(data);
                const ??lnx = internal??lnx(data);
                const ??lnx2 = internal??lnx2(data);
                const ??lny = internal??lny(data);
                const ??lny2 = internal??lny2(data);
                const ??lnxlny = internal??lnxlny(data);

                const h = n.times(??lnx2).minus(??lnx.pow(2));
                const k = n.times(??lny2).minus(??lny.pow(2));

                const p = n.times(??lnxlny).minus(??lnx.times(??lny));
                const q = M.sqrt(h.times(k));

                r = p.div(q);
                break;
            }
            case Regression.Inverse: {
                const n = StatUtils.count(data);
                const ??y = StatUtils.YSum(data);
                const ??y2 = StatUtils.YSquareSum(data);
                const ??1Overx = internal??1Overx(data);
                const ??yOverx = internal??yOverx(data);
                const ??1Overx2 = internal??1Overx2(data);
                
                const Sxx = ??1Overx2.minus(??1Overx.pow(2).div(n));
                const Syy = ??y2.minus(??y.pow(2).div(n));
                const Sxy = ??yOverx.minus(??1Overx.times(??y).div(n));

                r = Sxy.div(M.sqrt(Sxx.times(Syy)));
                break;
            }
        }

        return data.setCache(NamedCalculation.StatCoefficientR, r);
    }

    export function estimatedX(data: Table, y: AlgebraicObject) {
        data.validateLines();

        let x!: AlgebraicObject;
        const a = StatUtils.coefficientA(data);
        const b = StatUtils.coefficientB(data);

        switch (data.regression) {
            case Regression.Linear: {
                x = y.minus(a).div(b);
                break;
            }
            case Regression.Quadratic: {
                const c = StatUtils.coefficientR(data);

                const ?? = b.pow(2).minus(c.times(4).times(a.minus(y)));
                x = zero.minus(b).plus(??.root(2)).div(c.times(2));
                break;
            }
            case Regression.Logarithmic: {
                x = M.exp(y.minus(a).div(b));
                break;
            }
            case Regression.eExponential: {
                x = M.ln(y.div(a)).div(b);
                break;
            }
            case Regression.abExponential: {
                x = M.ln(y.div(a)).div(M.ln(b));
                break;
            }
            case Regression.Power: {
                x = M.exp(M.ln(y.div(a)).div(b));
                break;
            }
            case Regression.Inverse: {
                x = b.div(y.minus(a));
                break;
            }
        }

        return x;
    }

    export function estimatedY(data: Table, x: AlgebraicObject) {
        data.validateLines();

        let y!: AlgebraicObject;
        const a = StatUtils.coefficientA(data);
        const b = StatUtils.coefficientB(data);

        switch (data.regression) {
            case Regression.Linear: {
                y = a.plus(b.times(x));
                break;
            }
            case Regression.Quadratic: {
                const c = StatUtils.coefficientR(data);

                y = a.plus(b.times(x)).plus(c.times(x.pow(2)));
                break;
            }
            case Regression.Logarithmic: {
                y = a.plus(b.times(M.ln(x)));
                break;
            }
            case Regression.eExponential: {
                y = a.times(M.exp(b.times(x)));
                break;
            }
            case Regression.abExponential: {
                y = a.times(b.pow(x));
                break;
            }
            case Regression.Power: {
                y = a.times(x.pow(b));
                break;
            }
            case Regression.Inverse: {
                y = a.plus(b.div(x));
                break;
            }
        }
        return y;
    }

    export function estimatedX2(data: Table, y: AlgebraicObject) {
        data.validateLines();

        let x!: AlgebraicObject;2
        const a = StatUtils.coefficientA(data);
        const b = StatUtils.coefficientB(data);

        switch (data.regression) {
            case Regression.Quadratic: {
                const c = StatUtils.coefficientR(data);

                const ?? = b.pow(2).minus(c.times(4).times(a.minus(y)));
                x = zero.minus(b).minus(??.root(2)).div(c.times(2));
                break;
            }
            default:
                throw new MathError(`Regression ${data.regression} not implemented`);
        }

        return x;
    }

    export function minX(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatMinX);
        if (cache) return cache;

        let min!: AlgebraicObject;

        for (const [x] of data.values()) {
            if (!min || x.lt(min)) min = x;
        }

        return data.setCache(NamedCalculation.StatMinX, min);
    }

    export function maxX(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatMaxX);
        if (cache) return cache;

        let max!: AlgebraicObject;

        for (const [x] of data.values()) {
            if (!max || x.gt(max)) max = x;
        }

        return data.setCache(NamedCalculation.StatMaxX, max);
    }

    export function minY(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatMinY);
        if (cache) return cache;

        let min!: AlgebraicObject;

        for (const [, y] of data.values()) {
            if (!min || y.lt(min)) min = y;
        }

        return data.setCache(NamedCalculation.StatMinY, min);
    }

    export function maxY(data: Table) {
        data.validateLines();
        const cache = data.getCache(NamedCalculation.StatMaxY);
        if (cache) return cache;

        let max!: AlgebraicObject;

        for (const [, y] of data.values()) {
            if (!max || y.gt(max)) max = y;
        }

        return data.setCache(NamedCalculation.StatMaxY, max);
    }
}