import React from 'react';
import { Plane, Droplets, Trash2, Bus, Plus, X, Info } from 'lucide-react';
import {
  FlightCategory,
  FlightLeg,
  Scope3Input,
  TransitMode,
  WasteDisposalMethod,
} from '@carbonlens/core';

interface Scope3FormProps {
  value: Scope3Input;
  onChange: (val: Scope3Input) => void;
}

export const Scope3Form: React.FC<Scope3FormProps> = ({ value, onChange }) => {
  const flights = value.flights || [];

  const handleAddFlight = () => {
    const newFlight: FlightLeg = {
      category: 'SHORT_HAUL',
      passengers: 1,
      roundTrip: true,
    };
    onChange({ ...value, flights: [...flights, newFlight] });
  };

  const handleRemoveFlight = (index: number) => {
    const updated = flights.filter((_, i) => i !== index);
    onChange({ ...value, flights: updated });
  };

  const handleFlightChange = (index: number, field: string, val: any) => {
    const updated = [...flights];
    updated[index] = { ...updated[index]!, [field]: val };
    onChange({ ...value, flights: updated });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Escopo 3 — Cadeia de Valor & Consumo</h3>
            <p className="text-xs text-slate-400">
              Tratamento de água, destinação de resíduos sólidos, voos comerciais e transporte público
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Water */}
        <div className="bg-slate-850 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <label className="text-xs font-semibold text-slate-200">
              Consumo de Água Tratada (Litros)
            </label>
          </div>
          <p className="text-[10px] text-slate-400">
            Fator SABESP / Water UK: captação, cloração, bombeamento e esgotamento sanitário (0.344 kg CO2e / m³)
          </p>
          <div className="relative pt-1">
            <input
              type="number"
              min="0"
              step="1000"
              value={value.waterLiters ?? ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  waterLiters: e.target.value === '' ? 0 : parseFloat(e.target.value),
                })
              }
              placeholder="Ex: 10000"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <span className="absolute right-3 top-3 text-[11px] text-slate-400 font-mono">
              Litros
            </span>
          </div>
        </div>

        {/* Public Transit */}
        <div className="bg-slate-850 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Bus className="w-4 h-4 text-indigo-400" />
            <label className="text-xs font-semibold text-slate-200">
              Transporte Público / Coletivo (km)
            </label>
          </div>
          <p className="text-[10px] text-slate-400">
            Deslocamento de funcionários ou uso pessoal em modais públicos
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <select
              value={value.publicTransitMode || 'BUS_URBAN_DIESEL'}
              onChange={(e) =>
                onChange({ ...value, publicTransitMode: e.target.value as TransitMode })
              }
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="BUS_URBAN_DIESEL">Ônibus Urbano Diesel (89 g/km)</option>
              <option value="BUS_BRT_ELECTRIC">BRT / Ônibus Elétrico (28 g/km)</option>
              <option value="METRO_SUBWAY_TRAIN">Metrô / Trem (24 g/km)</option>
              <option value="CYCLING_WALKING">Bicicleta / Caminhada (0 g/km)</option>
            </select>

            <input
              type="number"
              min="0"
              step="10"
              value={value.publicTransitKm ?? ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  publicTransitKm: e.target.value === '' ? 0 : parseFloat(e.target.value),
                })
              }
              placeholder="Ex: 250 km"
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Solid Waste Management */}
      <div className="bg-slate-850 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Trash2 className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Gestão e Destinação de Resíduos Sólidos
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Organic Waste */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Resíduos Orgânicos (Restos de alimentos) — kg
            </label>
            <input
              type="number"
              min="0"
              step="5"
              value={value.wasteOrganicKg ?? ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  wasteOrganicKg: e.target.value === '' ? 0 : parseFloat(e.target.value),
                })
              }
              placeholder="Ex: 30"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
            />

            <label className="text-[11px] font-medium text-slate-400 block pt-1">
              Método de Destinação:
            </label>
            <select
              value={value.wasteOrganicDisposal || 'LANDFILL_NO_METHANE_CAPTURE'}
              onChange={(e) =>
                onChange({
                  ...value,
                  wasteOrganicDisposal: e.target.value as WasteDisposalMethod,
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="LANDFILL_NO_METHANE_CAPTURE">
                Aterro Sanitário comum sem queima (0.850 kg CO2e/kg - Alto CH4)
              </option>
              <option value="LANDFILL_WITH_FLARING">
                Aterro com Queima/Biogás (0.380 kg CO2e/kg)
              </option>
              <option value="COMPOSTING">
                Compostagem Orgânica (0.070 kg CO2e/kg - Recomendado)
              </option>
            </select>
          </div>

          {/* Recyclable Waste */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Resíduos Recicláveis Secos (Papel, plástico, vidro, metal) — kg
            </label>
            <input
              type="number"
              min="0"
              step="5"
              value={value.wasteRecyclableKg ?? ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  wasteRecyclableKg: e.target.value === '' ? 0 : parseFloat(e.target.value),
                })
              }
              placeholder="Ex: 20"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
            />

            <label className="text-[11px] font-medium text-slate-400 block pt-1">
              Destinação dos Recicláveis:
            </label>
            <select
              value={value.wasteRecyclableDisposal || 'RECYCLING'}
              onChange={(e) =>
                onChange({
                  ...value,
                  wasteRecyclableDisposal: e.target.value as WasteDisposalMethod,
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="RECYCLING">
                Coleta Seletiva / Reciclagem Efetiva (0.040 kg CO2e/kg)
              </option>
              <option value="LANDFILL_NO_METHANE_CAPTURE">
                Descartado em Aterro / Lixo Comum (0.450 kg CO2e/kg)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Commercial Flights */}
      <div className="border-t border-slate-800 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Viagens Aéreas a Negócios / Passageiros
            </h4>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={value.useRadiativeForcing ?? true}
                onChange={(e) =>
                  onChange({ ...value, useRadiativeForcing: e.target.checked })
                }
                className="rounded accent-emerald-500"
              />
              <span title="Aplica o fator RFI 1.9x recomendado pelo IPCC/DEFRA para emissões de alta altitude">
                Forçamento Radiativo (RFI 1.9x)
              </span>
            </label>

            <button
              type="button"
              onClick={handleAddFlight}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 border border-sky-500/30 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Adicionar Voo
            </button>
          </div>
        </div>

        {flights.length === 0 ? (
          <div className="text-center py-4 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
            Nenhum voo comercial registrado neste período.
          </div>
        ) : (
          <div className="space-y-2">
            {flights.map((flight, idx) => (
              <div
                key={idx}
                className="bg-slate-850 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row md:items-center gap-3"
              >
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-slate-400">Categoria de Rota</label>
                  <select
                    value={flight.category}
                    onChange={(e) =>
                      handleFlightChange(idx, 'category', e.target.value as FlightCategory)
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="SHORT_HAUL">
                      Curta distância (&lt; 500 km, ex: Rio-SP) ~400 km
                    </option>
                    <option value="MEDIUM_HAUL">
                      Média distância (500 - 3.700 km, ex: SP-Nordeste) ~1.500 km
                    </option>
                    <option value="LONG_HAUL">
                      Longa distância (&gt; 3.700 km, Internacional) ~8.500 km
                    </option>
                  </select>
                </div>

                <div className="w-24 space-y-1">
                  <label className="text-[10px] text-slate-400">Passageiros</label>
                  <input
                    type="number"
                    min="1"
                    value={flight.passengers}
                    onChange={(e) =>
                      handleFlightChange(idx, 'passengers', parseInt(e.target.value, 10) || 1)
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 md:pt-4">
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flight.roundTrip}
                      onChange={(e) => handleFlightChange(idx, 'roundTrip', e.target.checked)}
                      className="rounded accent-sky-500"
                    />
                    Ida e Volta
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemoveFlight(idx)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
        <span>
          O Escopo 3 frequentemente representa mais de 70% da pegada total de empresas de tecnologia e serviços. A compostagem de resíduos e a redução de voos comerciais são medidas com alto retorno de descarbonização.
        </span>
      </div>
    </div>
  );
};
