import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Check } from 'lucide-react';
import { UnitDefinition } from '../types/converter';

interface UnitSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: UnitDefinition[];
  selectedUnitId: string;
  onSelectUnit: (unit: UnitDefinition) => void;
  title: string;
}

export const UnitSelectorModal: React.FC<UnitSelectorModalProps> = ({
  isOpen,
  onClose,
  units,
  selectedUnitId,
  onSelectUnit,
  title,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Group and filter units
  const filteredUnits = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return units;

    return units.filter((u) => {
      const matchName = u.name.toLowerCase().includes(q);
      const matchSymbol = u.symbol.toLowerCase().includes(q);
      const matchAliases = u.aliases?.some(a => a.toLowerCase().includes(q));
      return matchName || matchSymbol || matchAliases;
    });
  }, [units, searchQuery]);

  // Group by system for easier scanning
  const groupedUnits = useMemo(() => {
    const groups: { [key: string]: UnitDefinition[] } = {};
    for (const unit of filteredUnits) {
      const system = unit.system || 'standard';
      const label = 
        system === 'metric' ? 'Metric' :
        system === 'imperial' ? 'Imperial / US Customary' :
        system === 'binary' ? 'Binary (IEC: 1024)' :
        system === 'decimal' ? 'Decimal (SI: 1000)' :
        'Units';

      if (!groups[label]) groups[label] = [];
      groups[label].push(unit);
    }
    return groups;
  }, [filteredUnits]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">Select a unit to convert</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, symbol, or alias (e.g. mi, lb, fl oz)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Unit list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {Object.keys(groupedUnits).length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No matching units found for "{searchQuery}".
            </div>
          ) : (
            Object.entries(groupedUnits).map(([groupName, groupList]) => (
              <div key={groupName} className="space-y-1">
                <div className="text-[11px] font-semibold tracking-wider text-slate-400 px-2 py-1 uppercase">
                  {groupName}
                </div>
                <div className="space-y-0.5">
                  {groupList.map((unit) => {
                    const isSelected = unit.id === selectedUnitId;
                    return (
                      <button
                        key={unit.id}
                        onClick={() => {
                          onSelectUnit(unit);
                          onClose();
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-slate-900 text-white font-medium'
                            : 'text-slate-800 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`font-mono text-xs px-2 py-0.5 rounded font-semibold ${
                              isSelected
                                ? 'bg-slate-800 text-amber-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {unit.symbol}
                          </span>
                          <span>{unit.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
