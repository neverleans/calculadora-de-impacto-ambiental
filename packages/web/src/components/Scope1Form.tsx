import React from 'react';
import { Car, Flame, Info, Plus, Trash2 } from 'lucide-react';
import { FuelType, Scope1Input } from '@carbonlens/core';

interface Scope1FormProps {
  value: Scope1Input;
  onChange: (val: Scope1Input) => void;
}

const FUEL_OPTIONS: { value: FuelType; label: string; desc: string }[] = [
  {
    value: 'GASOLINE_C',
    label: 'Gasolina Comum C (Mistura E27 Brasil)',
    desc: 'Contém 27% de etanol anidro. Fator: 0.1624 kg CO2e/km fóssil',
  },
  {
    value: 'ETHANOL_HYD',
    label: 'Etanol Hidratado (E100 Biocombustível)',
    desc: 'Ciclo biogênico neutro. Emissão fóssil direta Scope 1 quase zero',
  },
  {
    value: 'DIESEL_S10',
    label: 'Diesel S10 (Mistura B14 Biodiesel)',
    desc: 'Veículos utilitários / comerciais. Fator: 0.2450 kg CO2e/km fóssil',
  },
  {
    value: 'CNG_GNV',
    label: 'Gás Natural Veicular (GNV)',
    desc: 'Combustível fóssil limpo. Fator: 0.1780 kg CO2e/km',
  },
  {
    value: 'HEV_GASOLINE',
    label: 'Híbrido Gasolina/Elétrico (HEV)',
    desc: 'Alta eficiência regenerativa. Fator: 0.0950 kg CO2e/km',
  },
  {
    value: 'BEV_ELECTRIC',
    label: '100% Elétrico (BEV)',
    desc: 'Emissão de escapamento = 0 (Eletricidade apurada no Escopo 2)',
  },
  {
    value: 'MOTORCYCLE_GAS',
    label: 'Motocicleta (Gasolina)',
    desc: 'Veículo de duas rodas 125-250cc. Fator: 0.0750 kg CO2e/km',
  },
];

export const Scope1Form: React.FC<Scope1FormProps> = ({ value, onChange }) => {
  const vehicles = value.vehicles || [];
  const stationary = value.stationary || {};

  const handleAddVehicle = () => {
    onChange({
      ...value,
      vehicles: [...vehicles, { fuelType: 'GASOLINE_C', distanceKm: 100 }],
    });
  };

  const handleRemoveVehicle = (index: number) => {
    const updated = vehicles.filter((_, i) => i !== index);
    onChange({ ...value, vehicles: updated });
  };

  const handleVehicleChange = (index: number, field: string, val: any) => {
    const updated = [...vehicles];
    updated[index] = { ...updated[index]!, [field]: val };
    onChange({ ...value, vehicles: updated });
  };

  const handleStationaryChange = (field: 'lpgKg' | 'dieselGeneratorsLiters', val: number) => {
    onChange({
      ...value,
      stationary: {
        ...stationary,
        [field]: val,
      },
    });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Escopo 1 — Combustão Direta</h3>
            <p className="text-xs text-slate-400">
              Fontes operacionais próprias: frota corporativa/individual, GLP e geradores
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddVehicle}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/30 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar Veículo
        </button>
      </div>

      {/* Vehicles list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Veículos da Frota / Uso Particular
          </label>
          <span className="text-xs text-slate-500">
            {vehicles.length} {vehicles.length === 1 ? 'veículo cadastrado' : 'veículos cadastrados'}
          </span>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
            Nenhum veículo cadastrado no Escopo 1. Clique em "Adicionar Veículo" acima caso utilize veículos próprios.
          </div>
        ) : (
          vehicles.map((veh, index) => {
            const selectedInfo = FUEL_OPTIONS.find((f) => f.value === veh.fuelType);
            return (
              <div
                key={index}
                className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center gap-3 transition-all hover:border-slate-700"
              >
                <div className="flex-1 space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">
                    Tipo de Combustível / Motor
                  </label>
                  <select
                    value={veh.fuelType}
                    onChange={(e) =>
                      handleVehicleChange(index, 'fuelType', e.target.value as FuelType)
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                  >
                    {FUEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500">{selectedInfo?.desc}</p>
                </div>

                <div className="w-full md:w-36 space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Distância (km)</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={veh.distanceKm ?? ''}
                    onChange={(e) =>
                      handleVehicleChange(
                        index,
                        'distanceKm',
                        e.target.value === '' ? 0 : parseFloat(e.target.value)
                      )
                    }
                    placeholder="Ex: 500"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div className="pt-2 md:pt-5">
                  <button
                    type="button"
                    onClick={() => handleRemoveVehicle(index)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remover veículo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stationary Combustion */}
      <div className="border-t border-slate-800 pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Combustão Estacionária (GLP e Geradores)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <label className="text-xs font-medium text-slate-200">
                  Gás GLP de Cozinha (kg)
                </label>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  1 botijão padrão P13 equivale a 13 kg de GLP (~38.8 kg CO2e)
                </p>
              </div>
            </div>
            <input
              type="number"
              min="0"
              step="1"
              value={stationary.lpgKg ?? ''}
              onChange={(e) =>
                handleStationaryChange(
                  'lpgKg',
                  e.target.value === '' ? 0 : parseFloat(e.target.value)
                )
              }
              placeholder="Ex: 13 (1 botijão)"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="bg-slate-850 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <label className="text-xs font-medium text-slate-200">
                  Diesel para Gerador Estacionário (Litros)
                </label>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Geradores de emergência / backup (Fator: 2.68 kg CO2e/L)
                </p>
              </div>
            </div>
            <input
              type="number"
              min="0"
              step="5"
              value={stationary.dieselGeneratorsLiters ?? ''}
              onChange={(e) =>
                handleStationaryChange(
                  'dieselGeneratorsLiters',
                  e.target.value === '' ? 0 : parseFloat(e.target.value)
                )
              }
              placeholder="Ex: 50"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400">
        <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>
          O GHG Protocol exige que as emissões biogênicas (como o CO2 proveniente de etanol e biodiesel) sejam reportadas em linha separada e não somadas ao total fóssil.
        </span>
      </div>
    </div>
  );
};
