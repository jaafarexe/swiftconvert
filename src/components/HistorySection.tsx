import React from 'react';
import { History, Trash2, ArrowRight, Copy, Check, RotateCcw } from 'lucide-react';
import { ConversionHistoryItem, CategoryKey, UnitDefinition } from '../types/converter';
import { CATEGORIES } from '../data/categories';

interface HistorySectionProps {
  history: ConversionHistoryItem[];
  onSelectHistoryItem: (item: ConversionHistoryItem) => void;
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  onSelectHistoryItem,
  onClearHistory,
  onRemoveItem,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const formatTimeAgo = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 30) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleCopy = (item: ConversionHistoryItem) => {
    const text = `${item.formattedFrom} = ${item.formattedTo}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-700" />
          <h3 className="text-base font-bold text-slate-900">Recent Conversions</h3>
          <span className="text-xs text-slate-400">({history.length})</span>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
            title="Clear all saved history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 px-4 space-y-2">
          <History className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">No conversion history yet.</p>
          <p className="text-[11px] text-slate-400">
            Conversions you perform will automatically appear here for quick reference and recall.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {history.map((item) => {
            const cat = CATEGORIES.find((c) => c.id === item.category);

            return (
              <div
                key={item.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2.5 transition-colors group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-600">{cat?.name || item.category}</span>
                    <span>·</span>
                    <span>{formatTimeAgo(item.timestamp)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 font-mono tabular-nums">
                    <span>{item.formattedFrom}</span>
                    <span className="text-slate-400 font-sans">⇄</span>
                    <span className="text-slate-950 font-bold">{item.formattedTo}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleCopy(item)}
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      copiedId === item.id
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Copy full equation"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => onSelectHistoryItem(item)}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-800 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100 rounded-lg flex items-center gap-1 transition-colors"
                    title="Load back into calculator"
                  >
                    <span>Restore</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
