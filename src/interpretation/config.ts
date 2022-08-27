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