import React from 'react';
import { X, Coins, Info, Check } from 'lucide-react';
import { CURRENCY_APPROX_DETAILS } from '../data/categories';
import { formatValue } from '../utils/converter';

interface CurrencyRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCurrencyPair?: (code: string) => void;
}

export const CurrencyRatesModal: React.FC<CurrencyRatesModalProps> = ({
  isOpen,
  onClose,
  onSelectCurrencyPair,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Coins className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Approximate Currency Reference Rates
              </h3>
              <p className="text-xs text-slate-500">
                Benchmark rates relative to United States Dollar (USD)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Disclaimer Banner */}
        <div className="px-5 py-3 bg-amber-50/70 border-b border-amber-100 text-xs text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-950">Fixed Reference Rates Notice</p>
            <p className="text-[11px] text-amber-800 mt-0.5">
              These values represent standardized reference rates for common planning and conversion needs (including USD, EUR, GBP, JPY, AED, SAR, and SYP). Exchange rates fluctuate in financial markets; verify exact pricing before financial transactions.
            </p>
          </div>
        </div>

        {/* Rates Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-medium text-[11px] uppercase tracking-wider">
                <th className="py-2 px-3">Currency</th>
                <th className="py-2 px-3">Code</th>
                <th className="py-2 px-3 text-right">1 USD =</th>
                <th className="py-2 px-3 text-right">1 Unit in USD =</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CURRENCY_APPROX_DETAILS.map((curr) => {
                const inverse = curr.ratePerUSD > 0 ? 1 / curr.ratePerUSD : 0;
                return (
                  <tr key={curr.code} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900">{curr.name}</div>
                      <div className="text-[11px] text-slate-400">{curr.note}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-xs px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                        {curr.code}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                      {formatValue(curr.ratePerUSD, 'auto')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                      ${formatValue(inverse, 'auto')}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {onSelectCurrencyPair && curr.code !== 'USD' && (
                        <button
                          onClick={() => {
                            onSelectCurrencyPair(curr.code.toLowerCase());
                            onClose();
                          }}
                          className="px-2 py-1 rounded text-[11px] font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                        >
                          Use
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Fully offline reference database</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
