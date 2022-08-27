import { Value } from "./value";


export class WrappedValue {
    constructor(public identifier: string, public value: Value, public alias: string[] = []) {
    }
}

const predefinedConstants = [
    new WrappedValue("e", Value.const("e")),
    new WrappedValue("pi", Value.const("pi"), ["π"]),
] as const;

const scientificConstants = [ // 2000 CODATA recommended values
    new WrappedValue("proton_mass", Value.const(1.672621777e-27)),
    new WrappedValue("neutron_mass", Value.const(1.674927351e-27)),
    new WrappedValue("electron_mass", Value.const(9.10938291e-31)),
    new WrappedValue("muon_mass", Value.const(1.883531475e-28)),
    new WrappedValue("Bohr_radius", Value.const(5.291772109e-11)),
    new WrappedValue("Planck_constant", Value.const(6.62606957e-34)),
    new WrappedValue("nuclear_magneton", Value.const(5.05078353e-27)),
    new WrappedValue("Bohr_magneton", Value.const(9.27400968e-24)),
    new WrappedValue("Planck_constant_rationalized", Value.const(1.054571726e-34)),
    new WrappedValue("fine-structure_constant", Value.const(7.29735257e-3)),
    new WrappedValue("classical_electron_radius", Value.const(2.817940327e-15)),
    new WrappedValue("Compton_wavelength", Value.const(2.426310239e-12)),
    new WrappedValue("proton_gyromagnetic_ratio", Value.const(267522200.5)),
    new WrappedValue("proton_Compton_wavelength", Value.const(1.321409856e-15)),
    new WrappedValue("neutron_Compton_wavelength", Value.const(1.319590907e-15)),
    new WrappedValue("Rydberg_constant", Value.const(10973731.57)),
    new WrappedValue("atomic_mass_constant", Value.const(1.660538921e-27)),
    new WrappedValue("proton_magnetic_moment", Value.const(1.410606743e-26)),
    new WrappedValue("electron_magnetic_moment", Value.const(-9.2847643e-24)),
    new WrappedValue("neutron_magnetic_moment", Value.const(-9.6623647e-27)),
    new WrappedValue("muon_magnetic_moment", Value.const(-4.49044807e-26)),
    new WrappedValue("Faraday_constant", Value.const(96485.3365)),
    new WrappedValue("elementary_charge", Value.const(1.602176565e-19)),
    new WrappedValue("Avogadro_constant", Value.const(6.02214129e23)),
    new WrappedValue("Boltzmann_constant", Value.const(1.3806488e-23)),
    new WrappedValue("molar_volume_of_ideal_gas", Value.const(2.2710953e-2)),
    new WrappedValue("molar_gas_constant", Value.const(8.3144621)),
    new WrappedValue("speed_of_light_in_vacuum", Value.const(299792458)),
    new WrappedValue("first_radiation_constant", Value.const(3.74177153e-16)),
    new WrappedValue("second_radiation_constant", Value.const(1.438777e-2)),
    new WrappedValue("Stefan_Boltzmann_constant", Value.const(5.670373e-8)),
    new WrappedValue("electric_constant", Value.const(8.854187817e-12)),
    new WrappedValue("magnetic_constant", Value.const(1.256637061e-6)),
    new WrappedValue("magnetic_flux_quantum", Value.const(2.067833758e-15)),
    new WrappedValue("standard_acceleration_of_gravity", Value.const(9.80665)),
    new WrappedValue("conductance_quantum", Value.const(7.748091735-5)),
    new WrappedValue("characteristic_impedance_of_vacuum", Value.const(376.7303135)),
    new WrappedValue("Celsius_temperature", Value.const(273.15)),
    new WrappedValue("Newtonian_constant_of_gravitation", Value.const(6.67384-11)),
    new WrappedValue("standard_atmosphere", Value.const(101325)),
] as const;

const combinedConstants = [
    ...predefinedConstants,
    ...scientificConstants,
];

export function getConstant(identifier: string) {
    for (const constant of Object.values(combinedConstants)) {
        if (constant.identifier === identifier || constant.alias.includes(identifier)) {
            return constant;
        }
    }
    return null;
}

export function getScientificConstant(index: number) {
    return scientificConstants[index - 1];
}