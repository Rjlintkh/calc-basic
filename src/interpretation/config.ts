import { AngleUnit } from "../data/math";
import { CompMode } from "../specifications/calculation_modes";

export enum ConfigProperty {
    CalculationMode = "calculation_mode",
    AngleUnit = "angle_unit",
    ExponentialDisplayFormat = "exponential_display_format",
    ComplexNumberDisplayFormat = "complex_number_display_format",
    FractionDisplayFormat = "fraction_display_format",
    DecimalPointCharacter = "decimal_point_character",
    FrequencySetting = "frequency_setting",
}

export enum FractionDisplayFormat {
    Mixed, // ab/c
    Improper, // d/c
}

export enum ComplexNumberDisplayFormat {
    Rectangular, // a+bi
    Polar, // r∠θ
}

export enum DecimalPointCharacter {
    Dot = ".",
    Comma = ",",
}

export enum FrequencySetting {
    FreqOff,
    FreqOn,
}

export class Config {
    [ConfigProperty.CalculationMode] = new CompMode;
    [ConfigProperty.AngleUnit] = AngleUnit.Deg;
    [ConfigProperty.ExponentialDisplayFormat] = "Norm 1, EngOFF";
    [ConfigProperty.ComplexNumberDisplayFormat] = "a+bi";
    [ConfigProperty.FractionDisplayFormat] = FractionDisplayFormat.Mixed;
    [ConfigProperty.DecimalPointCharacter] = DecimalPointCharacter.Dot;
    [ConfigProperty.FrequencySetting] = FrequencySetting.FreqOn;
}

/*
1EngON    2EngOFF    Specifies whether engineering symbols are used (EngON) or not used (EngOFF) during value input. The “Eng” indicator is displayed while EngON is selected.
1a+b  i    2r  ∠  􀀁  (CMPLX Mode/EQN Mode only)   Specifies either rectangular coordinates ( a + b  i ) or polar coordinates ( r  ∠  􀀁 ) for CMPLX Mode/EQN Mode solutions. The “r ∠  􀀁 ” indicator is displayed while polar coordinates ( r  ∠  􀀁 ) are selected. 
1ab/c    2d/c    Specifies either mixed fraction (ab/c) or improper fraction (d/c) for display of fractions in calculation results. 
1Dot    2Comma    Specifies whether to display a dot or a comma for the calculation result decimal point. A dot is always displayed during input.
   Dot:  Period decimal point, comma separator
 Comma: Comma decimal point, period separator 
*/