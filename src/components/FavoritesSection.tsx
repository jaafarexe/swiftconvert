import React from 'react';
import { Star, ArrowRight, Trash2, RotateCcw } from 'lucide-react';
import { FavoritePair, CategoryKey, UnitDefinition } from '../types/converter';
import { CATEGORIES } from '../data/categories';
import { convertValue, formatValue } from '../utils/converter';

interface FavoritesSectionProps {
  favorites: FavoritePair[];
  onSelectPair: (category: CategoryKey, fromUnit: UnitDefinition, toUnit: UnitDefinition) => void;
  onRemoveFavorite: (id: string) => void;
  onResetDefaults: () => void;
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({
  favorites,
  onSelectPair,
  onRemoveFavorite,
  onResetDefaults,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900">Saved Favorite Pairs</h3>
          <span className="text-xs text-slate-400">({favorites.length})</span>
        </div>

        <button
          onClick={onResetDefaults}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          title="Restore recommended default favorites"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12 px-4 space-y-3">
          <Star className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">No favorite pairs saved yet.</p>
          <p className="text-[11px] text-slate-400">
            Click the star icon in the calculator card to save frequently used conversion pairs.
          </p>
          <button
            onClick={onResetDefaults}
            className="mt-2 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800"
          >
            Load Recommended Pairs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {favorites.map((fav) => {
            const cat = CATEGORIES.find((c) => c.id === fav.category);
            const fromUnit = cat?.units.find((u) => u.id === fav.fromUnitId);
            const toUnit = cat?.units.find((u) => u.id === fav.toUnitId);

            if (!cat || !fromUnit || !toUnit) return null;

            const sampleOne = convertValue(1, fromUnit, toUnit);
            const formattedFactor = formatValue(sampleOne, 'auto');

            return (
              <div
                key={fav.id}
                className="group p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <span className="font-medium text-slate-500">{cat.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavorite(fav.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                    <span>{fromUnit.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>{toUnit.name}</span>
                  </div>

                  <div className="text-xs font-mono text-slate-600 mt-1">
                    1 {fromUnit.symbol} ≈ {formattedFactor} {toUnit.symbol}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {fromUnit.symbol} ⇄ {toUnit.symbol}
                  </span>
                  <button
                    onClick={() => onSelectPair(fav.category, fromUnit, toUnit)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-colors"
                  >
                    Convert Now →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
