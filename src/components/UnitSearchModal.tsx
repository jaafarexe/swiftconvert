import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { CategoryKey, UnitDefinition } from '../types/converter';

interface UnitSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUnitAndCategory: (categoryKey: CategoryKey, unit: UnitDefinition) => void;
}

export const UnitSearchModal: React.FC<UnitSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectUnitAndCategory,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Aggregate search across all categories
  const allResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      // Suggest popular units when empty
      return [
        { category: CATEGORIES[0], unit: CATEGORIES[0].units[0] }, // km
        { category: CATEGORIES[0], unit: CATEGORIES[0].units[6] }, // mi
        { category: CATEGORIES[1], unit: CATEGORIES[1].units[1] }, // kg
        { category: CATEGORIES[1], unit: CATEGORIES[1].units[5] }, // lb
        { category: CATEGORIES[2], unit: CATEGORIES[2].units[0] }, // °C
        { category: CATEGORIES[2], unit: CATEGORIES[2].units[1] }, // °F
        { category: CATEGORIES[8], unit: CATEGORIES[8].units[0] }, // USD
        { category: CATEGORIES[8], unit: CATEGORIES[8].units[1] }, // EUR
        { category: CATEGORIES[8], unit: CATEGORIES[8].units[6] }, // SYP
        { category: CATEGORIES[7], unit: CATEGORIES[7].units[4] }, // GB
      ];
    }

    const matches: Array<{ category: typeof CATEGORIES[0]; unit: UnitDefinition }> = [];

    for (const cat of CATEGORIES) {
      const catMatch = cat.name.toLowerCase().includes(q) || cat.shortName.toLowerCase().includes(q);

      for (const unit of cat.units) {
        const nameMatch = unit.name.toLowerCase().includes(q);
        const symbolMatch = unit.symbol.toLowerCase().includes(q);
        const aliasMatch = unit.aliases?.some(a => a.toLowerCase().includes(q));

        if (nameMatch || symbolMatch || aliasMatch || catMatch) {
          matches.push({ category: cat, unit });
        }
      }
    }

    return matches.slice(0, 20);
  }, [query]);

  // Handle keyboard arrow navigation & enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1 < allResults.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : allResults.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allResults[selectedIndex]) {
          const item = allResults[selectedIndex];
          onSelectUnitAndCategory(item.category.id, item.unit);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allResults, selectedIndex, onSelectUnitAndCategory, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[75vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type any unit (e.g., pound, celsius, syp, knot, gb)..."
            className="w-full text-sm bg-transparent border-0 focus:outline-none placeholder:text-slate-400 text-slate-900"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-50">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {query ? `Search Results (${allResults.length})` : 'Popular Units & Quick Jump'}
          </div>

          {allResults.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No units found matching "{query}". Try "meter", "kg", "celsius", or "usd".
            </div>
          ) : (
            allResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={`${item.category.id}-${item.unit.id}`}
                  onClick={() => {
                    onSelectUnitAndCategory(item.category.id, item.unit);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-slate-100/90 text-slate-950 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs px-2 py-0.5 rounded font-semibold bg-white border border-slate-200 text-slate-800">
                      {item.unit.symbol}
                    </span>
                    <div>
                      <span className="font-medium text-slate-900">{item.unit.name}</span>
                      <span className="text-[11px] text-slate-400 ml-2">in {item.category.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                      {item.unit.id}
                    </span>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
                        Select <CornerDownLeft className="w-3 h-3" />
                      </span>
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>SwiftConvert Offline Database</span>
        </div>
      </div>
    </div>
  );
};
