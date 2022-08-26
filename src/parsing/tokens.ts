export namespace Delimiters {
    export const Whitespace = [" ", "\t", "\n", "\r"];
    export const Word = /[A-Za-zΑ-Ωα-ω∫]|[#/?+-]/;

    export const Number = /[0-9𝗔𝗕𝗖𝗗𝗘𝗙]/;
    export const Dot = ".";

    export const Quote = "'";
    export const DoubleQuote = "\"";

    export const InputPrompt = "?";
    export const Output = "◢";
    export const ConditionalJump = "⇒";

    export const Fraction = "⌟";
    export const DotProduct = "⋅";
}

export namespace Operators {
    export const Separator = [":", Delimiters.Output, Delimiters.ConditionalJump];
    export const Comma = ",";
    export const LeftParenthesis = "(";
    export const RightParenthesis = ")";

    export const Level13 = ["or", "xnor", "xor"]; // Logical OR, XNOR, XOR
    export const Level12 = ["and"]; // Logical AND
    export const Level11 = ["=", "≠", ">", "<", "≥", "≤"]; // Relational Operators
    export const Level10 = ["+", "-"]; // Addition, Subtraction// export const Level1 = Parentheical Functions
    export const Level9 = ["*", "/", "mod"]; // Multiplication, Division, Modulus
    export const Level8 = [Delimiters.DotProduct]; // Dot Product
    export const Level7 = ["choose", "permute", "∠"]; // Permutation, Combination, Complex Number  Polar Coordinate Symbol
    export const Level6 = ["ẍ", "ÿ"]; // Statistical Estimated Value Calculations
    export const Level5 = ["d", "h", "b", "o"]; // Prefix Symbols
    export const Level4 = [Delimiters.Fraction]; // Fractions
    export const Level3 = ["^", "ˣ√"]; // Power, Power Root
    export const Level2 = ["²", "³", "⁻¹", "!", "°", "ʳ", "ᵍ", "%"]; // Functions Preceded by Values
    // export const Level1 = Parentheical Functions

    export const ExponentialOperator = "ᴇ";
    export const SexagesimalOperator = "″";
    export const AssignmentOperator = "→";
    export const FrequencyOperator = ";";
    export const DataInputOperator = "DT";
}

export enum TokenType {
    Unknown = -1,
    
    Number,
    String,
    Symbol,
    Keyword,
    
    Separator,
    Comma,
    LeftParenthesis,
    RightParenthesis,
    
    // Level 1,
    Level2,
    Level3,
    Level4,
    Level5,
    Level6,
    Level7,
    // Level8,
    Level9,
    Level10,
    Level11,
    Level12,
    Level13,

    ExponentialOperator,
    SexagesimalOperator,
    AssignmentOperator,
    FrequencyOperator,
    DataInputOperator,
}

export enum Keyword {
    If = "If",
    Then = "Then",
    Else = "Else",
    IfEnd = "IfEnd",

    Goto = "Goto",
    Lbl = "Lbl",

    For = "For",
    To = "To",
    Step = "Step",
    Next = "Next",

    While = "While",
    WhileEnd = "WhileEnd",

    Break = "Break",

    ClrMemory = "ClrMemory",
    ClrStat = "ClrStat",

    Deg = "Deg",
    Rad = "Rad",
    Gra = "Gra",

    Dec = "Dec",
    Hex = "Hex",
    Bin = "Bin",
    Oct = "Oct",
}

export enum NamedCalculation {
    RandomNumber = "Ran#",

    StatXSquareSum = "StatXSquareSum",
    StatXSum = "StatXSum",
    StatCount = "StatCount",
    StatYSquareSum = "StatYSquareSum",
    StatYSum = "StatYSum",
    StatXYSum = "StatXYSum",
    StatXSquareYSum = "StatXSquareYSum",
    StatXCubeSum = "StatXCubeSum",
    StatXFourthPowerSum = "StatXFourthPowerSum",

    StatXMean = "StatXMean",
    StatXSampleStandardDeviation = "StatXSampleStandardDeviation",
    StatXPopulationStandardDeviation = "StatXPopulationStandardDeviation",
    StatYMean = "StatYMean",
    StatYSampleStandardDeviation = "StatYSampleStandardDeviation",
    StatYPopulationStandardDeviation = "StatYPopulationStandardDeviation",

    StatCoefficientA = "StatCoefficientA",
    StatCoefficientB = "StatCoefficientB",
    StatCoefficientC = "StatCoefficientC",
    StatCoefficientR = "StatCoefficientR",

    StatInternalSxx = "StatInternalSxx",
    StatInternalSxy = "StatInternalSxy",
    StatInternalSxx2 = "StatInternalSxx2",
    StatInternalSx2x2 = "StatInternalSx2x2",
    StatInternalSx2y = "StatInternalSx2y",

    StatInternalΣlnx = "StatInternalΣlnx",
    StatInternalΣlnx2 = "StatInternalΣlnx2",
    StatInternalΣlny = "StatInternalΣlny",
    StatInternalΣlny2 = "StatInternalΣlny2",
    StatInternalΣxlny = "StatInternalΣxlny",
    StatInternalΣylnx = "StatInternalΣylnx",
    StatInternalΣlnxlny = "StatInternalΣlnxlny",

    StatInternalΣ1Overx = "StatInternalΣ1Overx",
    StatInternalΣ1Overx2 = "StatInternalΣ1Overx2",
    StatInternalΣyOverx = "StatInternalΣyOverx",

    StatMinX = "StatMinX",
    StatMaxX = "StatMaxX",
    StatMinY = "StatMinY",
    StatMaxY = "StatMaxY",
}

export class Token {
    constructor(public type: TokenType, public value: string, public start: number, public end: number) {
    }
}