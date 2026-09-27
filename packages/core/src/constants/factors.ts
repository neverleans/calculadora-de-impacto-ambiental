/**
 * CarbonLens — Official GHG Emission Factors Database
 * Sources:
 * - MCTI (Ministério da Ciência, Tecnologia e Inovação do Brasil) - Fator Médio do SIN
 * - Programa Brasileiro GHG Protocol (FGVces / WRI Brasil)
 * - CONPET / INMETRO PBE Veicular (Programa Brasileiro de Etiquetagem)
 * - UK DEFRA / DESNZ (Department for Environment, Food & Rural Affairs)
 * - US EPA eGRID (Emissions & Generation Resource Integrated Database)
 * - IPCC AR6 (Sixth Assessment Report, Working Group III)
 */

import { ElectricityGrid, FlightCategory, FuelType, TransitMode, WasteDisposalMethod } from '../types/index.js';

export const EMISSION_FACTORS = {
  /**
   * Scope 1: Direct Combustion
   * Brazilian Fleet & Standard Stationary Combustion
   */
  VEHICLES_PER_KM: {
    // Gasolina C Brasileira (com 27% etanol anidro - E27): 0.1624 kg CO2e/km (Média PBE Veicular)
    GASOLINE_C: {
      fossilKgPerKm: 0.1624,
      biogenicKgPerKm: 0.0465,
      source: 'INMETRO PBE Veicular & GHG Protocol Brasil (Gasolina C com 27% etanol)',
      standardFuelEfficiencyKmPerLiter: 11.2,
    },
    // Etanol Hidratado (E100): Combustão direta de biocombustível tem emissão fóssil Scope 1 quase nula
    ETHANOL_HYD: {
      fossilKgPerKm: 0.0050, // Traços residuais de partida a frio / ciclo fóssil estrito
      biogenicKgPerKm: 0.1780, // CO2 neutro biogênico reportado em linha separada GHG Protocol
      source: 'GHG Protocol Brasil & RenovaBio (Etanol Hidratado de Cana-de-Açúcar)',
      standardFuelEfficiencyKmPerLiter: 8.1,
    },
    // Diesel S10 (B14 blend): Veículos comerciais leves / SUVs
    DIESEL_S10: {
      fossilKgPerKm: 0.2450,
      biogenicKgPerKm: 0.0380,
      source: 'MME / BEN & ANP (Diesel S10 com mistura obrigatória de Biodiesel)',
      standardFuelEfficiencyKmPerLiter: 10.5,
    },
    // GNV (Gás Natural Veicular): por km médio
    CNG_GNV: {
      fossilKgPerKm: 0.1780,
      biogenicKgPerKm: 0.0,
      source: 'Comgás & ANP Fatores de Emissão de Combustão Veicular',
      standardFuelEfficiencyKmPerM3: 12.0,
    },
    // Híbrido Gasolina/Elétrico (HEV)
    HEV_GASOLINE: {
      fossilKgPerKm: 0.0950,
      biogenicKgPerKm: 0.0270,
      source: 'INMETRO PBE Veicular (Média Veículos Híbridos Classe A)',
      standardFuelEfficiencyKmPerLiter: 19.5,
    },
    // Elétrico Puro (BEV) - Scope 1 é zero, eletricidade contabilizada no Escopo 2
    BEV_ELECTRIC: {
      fossilKgPerKm: 0.0,
      biogenicKgPerKm: 0.0,
      source: 'GHG Protocol Corporate Standard (Zero Scope 1 Tailpipe Emissions)',
      standardFuelEfficiencyKmPerLiter: 0,
    },
    // Motocicleta Gasolina comum
    MOTORCYCLE_GAS: {
      fossilKgPerKm: 0.0750,
      biogenicKgPerKm: 0.0210,
      source: 'CETESB & INMETRO (Motocicletas 125-250cc)',
      standardFuelEfficiencyKmPerLiter: 35.0,
    },
  } as Record<FuelType, { fossilKgPerKm: number; biogenicKgPerKm: number; source: string; standardFuelEfficiencyKmPerLiter?: number; standardFuelEfficiencyKmPerM3?: number }>,

  /**
   * Scope 1: Fuel Combustion by Volume (Liters or m³ or kg)
   */
  FUEL_BY_VOLUME: {
    // 1 litro de Gasolina C fóssil pura componente
    GASOLINE_C_PER_LITER: {
      fossilKgCO2ePerLiter: 1.685,
      biogenicKgCO2PerLiter: 0.540,
      source: 'ANP / Balanço Energético Nacional (BEN)',
    },
    // 1 litro de Etanol Hidratado
    ETHANOL_HYD_PER_LITER: {
      fossilKgCO2ePerLiter: 0.040,
      biogenicKgCO2PerLiter: 1.520,
      source: 'RenovaBio / GHG Protocol Brasil',
    },
    // 1 litro de Diesel S10
    DIESEL_S10_PER_LITER: {
      fossilKgCO2ePerLiter: 2.280,
      biogenicKgCO2PerLiter: 0.370,
      source: 'ANP / BEN (considerando B14)',
    },
    // 1 m³ de GNV
    CNG_GNV_PER_M3: {
      fossilKgCO2ePerM3: 1.980,
      biogenicKgCO2PerM3: 0.0,
      source: 'IPCC Guidelines for National GHG Inventories / ANP',
    },
    // 1 kg de GLP (Gás liquefeito de petróleo / Botijão de cozinha 13kg)
    LPG_GLP_PER_KG: {
      fossilKgCO2ePerKg: 2.984,
      source: 'MME / Balanço Energético Nacional (BEN) & IPCC',
    },
    // Gerador a Diesel estacionário
    STATIONARY_DIESEL_PER_LITER: {
      fossilKgCO2ePerLiter: 2.680,
      source: 'EPA AP-42 / DEFRA Stationary Combustion',
    },
  },

  /**
   * Scope 2: Purchased Electricity Grid Factors (kg CO2e / kWh)
   */
  ELECTRICITY_GRIDS: {
    // Brasil: Sistema Interligado Nacional (MCTI Fator Médio Anual)
    BRAZIL_SIN: {
      kgCO2ePerKwh: 0.0617,
      label: 'Brasil (SIN / MCTI - Fator Médio Oficial)',
      source: 'MCTI - Ministério da Ciência, Tecnologia e Inovação (SIRENE Brasil)',
    },
    // Estados Unidos: EPA eGRID National Average
    USA_EGRID: {
      kgCO2ePerKwh: 0.3712,
      label: 'Estados Unidos (US EPA eGRID Média Nacional)',
      source: 'US EPA eGRID (Emissions & Generation Resource Integrated Database)',
    },
    // Reino Unido: DEFRA / DESNZ National Grid
    UK_DEFRA: {
      kgCO2ePerKwh: 0.2070,
      label: 'Reino Unido (UK DEFRA / DESNZ National Grid)',
      source: 'UK Department for Energy Security and Net Zero / DEFRA',
    },
    // União Europeia: Média EEA
    EU_EEA: {
      kgCO2ePerKwh: 0.2310,
      label: 'União Europeia (EEA Grid Average)',
      source: 'European Environment Agency (EEA Greenhouse Gas Intensity)',
    },
    // China: Grid nacional
    CHINA_GRID: {
      kgCO2ePerKwh: 0.5550,
      label: 'China (National Grid Average)',
      source: 'IEA / National Development and Reform Commission',
    },
    // Fonte 100% Renovável rastreada (I-REC / Geração Solar Própria)
    RENEWABLE_ZERO: {
      kgCO2ePerKwh: 0.0000,
      label: '100% Renovável Auditada (I-REC / Solar Fotovoltaica Própria)',
      source: 'GHG Protocol Scope 2 Market-Based Guidance (Zero emissions)',
    },
    CUSTOM: {
      kgCO2ePerKwh: 0.0000,
      label: 'Fator Personalizado (Auditoria Local)',
      source: 'Auditoria de Terceiros / Concessionária Específica',
    },
  } as Record<ElectricityGrid, { kgCO2ePerKwh: number; label: string; source: string }>,

  /**
   * Scope 3: Indirect Activities (Waste, Water, Aviation, Commute)
   */
  WASTE: {
    // Resíduo orgânico em aterro sem queima de metano (anaeróbico)
    LANDFILL_NO_METHANE_CAPTURE: {
      kgCO2ePerKg: 0.850,
      source: 'IPCC Waste Model / EPA WARM (Metano fugitivo alto)',
    },
    // Resíduo orgânico em aterro moderno com queima/biogás
    LANDFILL_WITH_FLARING: {
      kgCO2ePerKg: 0.380,
      source: 'IPCC Waste Model (Queima de metano com eficiência de 75%)',
    },
    // Compostagem de resíduo orgânico (aeróbico)
    COMPOSTING: {
      kgCO2ePerKg: 0.070,
      source: 'IPCC Guidelines for Waste Composting (Decomposição aeróbica controlada)',
    },
    // Reciclagem de materiais secos (vidro, papel, plástico, alumínio)
    RECYCLING: {
      kgCO2ePerKg: 0.040, // Energia de transporte e triagem
      avoidedKgCO2ePerKg: 1.250, // Emissões evitadas pela substituição de matéria-prima virgem
      source: 'DEFRA Waste Factors & CEMPRE Brasil',
    },
  } as Record<WasteDisposalMethod, { kgCO2ePerKg: number; source: string; avoidedKgCO2ePerKg?: number }>,

  /**
   * Scope 3: Water Treatment & Distribution
   */
  WATER: {
    kgCO2ePerLiter: 0.000344, // 0.344 kg CO2e / m³ (1 m³ = 1000 litros)
    source: 'SABESP Relatório de Sustentabilidade & Water UK Carbon Accounting Guidance',
  },

  /**
   * Scope 3: Commercial Flights (per passenger-km)
   */
  FLIGHTS: {
    // Voo curto (< 500 km): Maior intensidade por pkm devido a decolagem/subida
    SHORT_HAUL: {
      kgCO2ePerPkm: 0.215,
      defaultDistanceKm: 400,
      source: 'ICAO Carbon Emissions Calculator & DEFRA Business Travel Flights',
    },
    // Voo médio (500 - 3700 km)
    MEDIUM_HAUL: {
      kgCO2ePerPkm: 0.155,
      defaultDistanceKm: 1500,
      source: 'ICAO Carbon Emissions Calculator & DEFRA Business Travel Flights',
    },
    // Voo longo (> 3700 km)
    LONG_HAUL: {
      kgCO2ePerPkm: 0.125,
      defaultDistanceKm: 8500,
      source: 'ICAO Carbon Emissions Calculator & DEFRA Business Travel Flights',
    },
    // Multiplicador de Forçamento Radiativo (RFI - Radiative Forcing Index)
    // Contabiliza o impacto climático adicional de vapor d'água, aerossóis e cirros em alta altitude
    RADIATIVE_FORCING_MULTIPLIER: 1.9,
  } as Record<FlightCategory, { kgCO2ePerPkm: number; defaultDistanceKm: number; source: string }> & { RADIATIVE_FORCING_MULTIPLIER: number },

  /**
   * Scope 3: Commute / Public Transit Alternatives (per passenger-km)
   */
  PUBLIC_TRANSIT: {
    BUS_URBAN_DIESEL: {
      kgCO2ePerPkm: 0.0890,
      label: 'Ônibus Urbano a Diesel',
      source: 'NTU Brasil / DEFRA Local Bus Standard',
    },
    BUS_BRT_ELECTRIC: {
      kgCO2ePerPkm: 0.0280,
      label: 'BRT / Ônibus Elétrico',
      source: 'EMBARQ / WRI Brasil Mobilidade Sustentável',
    },
    METRO_SUBWAY_TRAIN: {
      kgCO2ePerPkm: 0.0240,
      label: 'Metrô / Trem Urbano',
      source: 'Companhia do Metrô de SP & DEFRA Light Rail and Tram',
    },
    CYCLING_WALKING: {
      kgCO2ePerPkm: 0.0000,
      label: 'Bicicleta / Caminhada',
      source: 'Emissão Direta Zero',
    },
  } as Record<TransitMode, { kgCO2ePerPkm: number; label: string; source: string }>,

  /**
   * Forestry Offset & Voluntary Carbon Market Benchmarks
   */
  OFFSETS: {
    // 1 árvore nativa da Mata Atlântica restaura e sequestra ~150kg de CO2 em seu ciclo de vida (20-30 anos)
    MATA_ATLANTICA_TREE_LIFETIME_SEQUESTRATION_KG: 150.0,
    // Taxa anual de sequestro médio por árvore em crescimento
    MATA_ATLANTICA_TREE_ANNUAL_SEQUESTRATION_KG: 15.6,
    // Área aproximada de restauração: 4 m² por muda florestal (2500 árvores / hectare)
    TREE_DENSITY_M2_PER_TREE: 4.0,
    SCIENTIFIC_CITATION:
      'Sobral et al. (2018) / Pacto pela Restauração da Mata Atlântica & Embrapa Florestas',

    // Preços de Mercado Voluntário de Carbono (VCM - Voluntary Carbon Market) em USD por tCO2e
    VCM_PRICING_USD_PER_TON: {
      LOW: 12.0,      // Projetos de energia renovável e conservação florestal padrão
      AVERAGE: 18.0,  // Restauração florestal certificada (VCS Verra / Gold Standard)
      HIGH_CDR: 45.0, // Remoção de carbono durável de alta integridade (CDR / Biochar / E-Tree)
    },
    DEFAULT_USD_TO_BRL_RATE: 5.5,
  },
} as const;
