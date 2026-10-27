import React from 'react';
import { Search, History, Star, Coins } from 'lucide-react';
import { CategoryKey } from '../types/converter';

interface NavbarProps {
  activeTab: 'converter' | 'matrix' | 'favorites' | 'history';
  setActiveTab: (tab: 'converter' | 'matrix' | 'favorites' | 'history') => void;
  onOpenSearch: () => void;
  onOpenCurrencyRates: () => void;
  historyCount: number;
  favoritesCount: number;
  activeCategory: CategoryKey;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenCurrencyRates,
  historyCount,
  favoritesCount,
  activeCategory,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setActiveTab('converter')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg tracking-wider shadow-sm group-hover:bg-slate-800 transition-colors">
                <span className="text-amber-400 font-mono text-sm">⇄</span>
              </div>
              <div className="leading-tight">
                <span className="text-lg font-bold tracking-tight text-slate-900 block">
                  SwiftConvert
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:block">
                  Universal Unit & Currency Converter
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation views */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab('converter')}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'converter'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Calculator
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'matrix'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Multi-Unit Table
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'favorites'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Favorites</span>
              {favoritesCount > 0 && (
                <span className="text-[10px] font-mono text-slate-500 bg-slate-200/60 px-1.5 py-0.2 rounded">
                  {favoritesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
              {historyCount > 0 && (
                <span className="text-[10px] font-mono text-slate-500 bg-slate-200/60 px-1.5 py-0.2 rounded">
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {activeCategory === 'currency' && (
              <button
                onClick={onOpenCurrencyRates}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 rounded-lg transition-colors whitespace-nowrap"
                title="View approximate currency rates & details"
              >
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>Reference Rates</span>
              </button>
            )}

            <button
              onClick={onOpenSearch}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
              aria-label="Search all units"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Search Units</span>
              <kbd className="hidden lg:inline-block text-[10px] bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-500 font-mono shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-medium">
          <button
            onClick={() => setActiveTab('converter')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'converter' ? 'text-slate-950 font-semibold bg-slate-100' : 'text-slate-600'
            }`}
          >
            Converter
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'matrix' ? 'text-slate-950 font-semibold bg-slate-100' : 'text-slate-600'
            }`}
          >
            Table Matrix
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
              activeTab === 'favorites' ? 'text-slate-950 font-semibold bg-slate-100' : 'text-slate-600'
            }`}
          >
            <Star className="w-3 h-3 text-amber-500" />
            <span>Saved ({favoritesCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
              activeTab === 'history' ? 'text-slate-950 font-semibold bg-slate-100' : 'text-slate-600'
            }`}
          >
            <History className="w-3 h-3" />
            <span>History ({historyCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
