import React, { useState } from 'react';
import { Copy, Check, ArrowRight, Search } from 'lucide-react';
import { CategoryDefinition, UnitDefinition } from '../types/converter';
import { convertValue, formatValue, PrecisionMode } from '../utils/converter';

interface CategoryMatrixProps {
  category: CategoryDefinition;
  fromUnit: UnitDefinition;
  fromValue: number;
  precision: PrecisionMode;
  onSelectAsTarget: (unit: UnitDefinition) => void;
}

export const CategoryMatrix: React.FC<CategoryMatrixProps> = ({
  category,
  fromUnit,
  fromValue,
  precision,
  onSelectAsTarget,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const units = category.units;

  const filteredUnits = units.filter((u) => {
    const q = filterQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.symbol.toLowerCase().includes(q) ||
      u.aliases?.some((a) => a.toLowerCase().includes(q))
    );
  });

  const handleCopy = (unit: UnitDefinition, formattedValue: string) => {
    navigator.clipboard.writeText(`${formattedValue} ${unit.symbol}`);
    setCopiedId(unit.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {category.name} Multi-Unit Breakdown
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Equivalent values for{' '}
            <span className="font-semibold text-slate-900 font-mono">
              {formatValue(fromValue, precision)} {fromUnit.symbol}
            </span>{' '}
            ({fromUnit.name}) across all standard units
          </p>
        </div>

        {/* Filter input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter units..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-medium text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3">Unit</th>
              <th className="py-2.5 px-3">Symbol</th>
              <th className="py-2.5 px-3">Standard / System</th>
              <th className="py-2.5 px-3 text-right">Equivalent Value</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUnits.map((unit) => {
              const converted = convertValue(fromValue, fromUnit, unit);
              const formattedVal = formatValue(converted, precision);
              const isCurrentBase = unit.id === fromUnit.id;

              return (
                <tr
                  key={unit.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isCurrentBase ? 'bg-slate-50/90 font-medium' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 font-medium">{unit.name}</span>
                      {isCurrentBase && (
                        <span className="text-[10px] text-slate-600 bg-white border border-slate-200 px-1.5 py-0.2 rounded font-mono">
                          Source
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold">
                      {unit.symbol}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 capitalize">
                    {unit.system || 'standard'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-slate-900 text-sm">
                    {formattedVal}
                  </td>
                  <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => handleCopy(unit, formattedVal)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] border transition-colors ${
                        copiedId === unit.id
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Copy value"
                    >
                      {copiedId === unit.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {!isCurrentBase && (
                      <button
                        onClick={() => onSelectAsTarget(unit)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                        title="Set as target in converter"
                      >
                        <span>Set Target</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
