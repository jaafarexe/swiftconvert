import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  Copy, 
  Check, 
  Star, 
  X, 
  ChevronDown, 
  Info, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { CategoryDefinition, UnitDefinition } from '../types/converter';
import { PrecisionMode, getFormulaExplanation } from '../utils/converter';

interface ConverterCardProps {
  category: CategoryDefinition;
  fromUnit: UnitDefinition;
  toUnit: UnitDefinition;
  fromValueStr: string;
  toValueStr: string;
  onFromChange: (val: string) => void;
  onToChange: (val: string) => void;
  onSwapUnits: () => void;
  onOpenFromSelector: () => void;
  onOpenToSelector: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  precision: PrecisionMode;
  onPrecisionChange: (p: PrecisionMode) => void;
  onOpenCurrencyRates?: () => void;
}

export const ConverterCard: React.FC<ConverterCardProps> = ({
  category,
  fromUnit,
  toUnit,
  fromValueStr,
  toValueStr,
  onFromChange,
  onToChange,
  onSwapUnits,
  onOpenFromSelector,
  onOpenToSelector,
  isFavorite,
  onToggleFavorite,
  precision,
  onPrecisionChange,
  onOpenCurrencyRates,
}) => {
  const [copiedType, setCopiedType] = useState<'result' | 'statement' | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);

  const { summary: formulaSummary, formula } = getFormulaExplanation(fromUnit, toUnit);

  const handleCopy = (type: 'result' | 'statement') => {
    let textToCopy = '';
    if (type === 'result') {
      textToCopy = `${toValueStr} ${toUnit.symbol}`;
    } else {
      textToCopy = `${fromValueStr || '0'} ${fromUnit.symbol} = ${toValueStr || '0'} ${toUnit.symbol}`;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  const handleSwapClick = () => {
    setIsSwapping(true);
    onSwapUnits();
    setTimeout(() => setIsSwapping(false), 260);
  };

  const quickPresets = [1, 5, 10, 50, 100, 1000];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-7 relative transition-all">
      {/* Card Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{category.name}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Two-way instant calculation · Offline enabled
          </p>
        </div>

        {/* Favorite & Precision selector */}
        <div className="flex items-center gap-2">
          {/* Favorite Toggle Button */}
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isFavorite
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Pin pair to favorites'}
            aria-label="Toggle favorite"
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{isFavorite ? 'Saved' : 'Save Pair'}</span>
          </button>

          {/* Precision Menu */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70 text-xs">
            <span className="text-[10px] text-slate-400 font-medium px-2 py-1 hidden sm:inline uppercase">
              Decimals:
            </span>
            {(['auto', '2', '4', '6', 'full'] as PrecisionMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => onPrecisionChange(mode)}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  precision === mode
                    ? 'bg-white text-slate-950 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode === 'auto' ? 'Auto' : mode === 'full' ? 'Full' : `.${mode}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Conversion Fields: Responsive 2-column or stacked grid */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
        {/* FROM BLOCK (col 1 to 5) */}
        <div className="lg:col-span-5 bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/70 transition-all focus-within:border-slate-900 focus-within:bg-white focus-within:shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="from-input" className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
              From
            </label>
            <button
              onClick={onOpenFromSelector}
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-800 transition-all shadow-2xs"
            >
              <span className="font-mono text-slate-900">{fromUnit.symbol}</span>
              <span className="text-slate-600 truncate max-w-[110px]">{fromUnit.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
            </button>
          </div>

          <div className="relative mt-2">
            <input
              id="from-input"
              type="text"
              inputMode="decimal"
              value={fromValueStr}
              onChange={(e) => onFromChange(e.target.value)}
              placeholder="0"
              className="w-full text-2xl sm:text-3xl font-mono tabular-nums font-semibold bg-transparent text-slate-900 focus:outline-none pr-8 py-1 tracking-tight"
            />
            {fromValueStr && fromValueStr !== '0' && (
              <button
                onClick={() => onFromChange('0')}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                title="Clear input"
                aria-label="Clear value"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs text-slate-500">
            <span className="truncate">{fromUnit.name}</span>
            <span className="font-mono text-[11px] text-slate-400">{fromUnit.system || 'standard'}</span>
          </div>
        </div>

        {/* SWAP & EQUALS BUTTON (col 6) */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center my-1 lg:my-0">
          <button
            onClick={handleSwapClick}
            className={`w-11 h-11 rounded-full bg-white hover:bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-slate-950 transition-all duration-200 active:scale-95 ${
              isSwapping ? 'rotate-180 duration-300' : ''
            }`}
            title="Swap From and To units"
            aria-label="Swap units"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* TO BLOCK (col 7 to 11) */}
        <div className="lg:col-span-5 bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/70 transition-all focus-within:border-slate-900 focus-within:bg-white focus-within:shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="to-input" className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
              To
            </label>
            <button
              onClick={onOpenToSelector}
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-800 transition-all shadow-2xs"
            >
              <span className="font-mono text-slate-900">{toUnit.symbol}</span>
              <span className="text-slate-600 truncate max-w-[110px]">{toUnit.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
            </button>
          </div>

          <div className="relative mt-2">
            <input
              id="to-input"
              type="text"
              inputMode="decimal"
              value={toValueStr}
              onChange={(e) => onToChange(e.target.value)}
              placeholder="0"
              className="w-full text-2xl sm:text-3xl font-mono tabular-nums font-semibold bg-transparent text-slate-900 focus:outline-none pr-8 py-1 tracking-tight"
            />
            {toValueStr && toValueStr !== '0' && (
              <button
                onClick={() => onToChange('0')}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                title="Clear input"
                aria-label="Clear value"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs text-slate-500">
            <span className="truncate">{toUnit.name}</span>
            <span className="font-mono text-[11px] text-slate-400">{toUnit.system || 'standard'}</span>
          </div>
        </div>
      </div>

      {/* Quick Number Presets */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <span className="text-slate-400 text-[11px] mr-1">Quick values:</span>
        {quickPresets.map((num) => (
          <button
            key={num}
            onClick={() => onFromChange(num.toString())}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs transition-colors"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => onFromChange('0')}
          className="px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 text-xs transition-colors flex items-center gap-1"
          title="Reset to 0"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Conversion Result Actions & Formula */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Mathematical Reference / Formula */}
        <div className="flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-800 flex items-center gap-2">
              <span>{formulaSummary}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Formula: {formula}
            </p>
          </div>
        </div>

        {/* Right: Copy actions */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => handleCopy('result')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              copiedType === 'result'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {copiedType === 'result' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied Result!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Result</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleCopy('statement')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              copiedType === 'statement'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Copy equation e.g. 100 km = 62.1371 mi"
          >
            {copiedType === 'statement' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied Equation!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Full Equation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Currency Category Specific Disclaimer & Rates link */}
      {category.id === 'currency' && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs flex items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-800">Approximate Rates:</span>
            <span className="text-[11px] text-amber-700">
              USD, EUR, GBP, JPY, AED, SAR, SYP & more are calculated via fixed benchmark market rates.
            </span>
          </div>
          {onOpenCurrencyRates && (
            <button
              onClick={onOpenCurrencyRates}
              className="shrink-0 font-medium underline hover:text-amber-950 text-xs"
            >
              View Rate Sheet →
            </button>
          )}
        </div>
      )}
    </div>
  );
};
