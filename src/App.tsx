/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  CATEGORIES, 
  DEFAULT_FAVORITES 
} from './data/categories';
import { 
  CategoryKey, 
  UnitDefinition, 
  ConversionHistoryItem, 
  FavoritePair, 
  CategoryDefinition 
} from './types/converter';
import { 
  convertValue, 
  formatValue, 
  parseCleanNumber, 
  loadStoredHistory, 
  saveStoredHistory, 
  loadStoredFavorites, 
  saveStoredFavorites, 
  PrecisionMode 
} from './utils/converter';
import { Navbar } from './components/Navbar';
import { CategorySelector } from './components/CategorySelector';
import { ConverterCard } from './components/ConverterCard';
import { UnitSelectorModal } from './components/UnitSelectorModal';
import { UnitSearchModal } from './components/UnitSearchModal';
import { CategoryMatrix } from './components/CategoryMatrix';
import { FavoritesSection } from './components/FavoritesSection';
import { HistorySection } from './components/HistorySection';
import { CurrencyRatesModal } from './components/CurrencyRatesModal';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<'converter' | 'matrix' | 'favorites' | 'history'>('converter');
  const [activeCategoryKey, setActiveCategoryKey] = useState<CategoryKey>('length');

  // Active Category Definition
  const currentCategory = useMemo(() => {
    return CATEGORIES.find((c) => c.id === activeCategoryKey) || CATEGORIES[0];
  }, [activeCategoryKey]);

  // Units state
  const [fromUnit, setFromUnit] = useState<UnitDefinition>(() => {
    const cat = CATEGORIES[0];
    return cat.units.find((u) => u.id === cat.defaultFrom) || cat.units[0];
  });

  const [toUnit, setToUnit] = useState<UnitDefinition>(() => {
    const cat = CATEGORIES[0];
    return cat.units.find((u) => u.id === cat.defaultTo) || cat.units[1];
  });

  // Input numerical string values (for smooth live typing)
  const [fromValueStr, setFromValueStr] = useState<string>('1');
  const [toValueStr, setToValueStr] = useState<string>('');
  const [precision, setPrecision] = useState<PrecisionMode>('auto');

  // History & Favorites state
  const [history, setHistory] = useState<ConversionHistoryItem[]>(() => loadStoredHistory());
  const [favorites, setFavorites] = useState<FavoritePair[]>(() => loadStoredFavorites());

  // Modals state
  const [isFromSelectorOpen, setIsFromSelectorOpen] = useState(false);
  const [isToSelectorOpen, setIsToSelectorOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCurrencyRatesOpen, setIsCurrencyRatesOpen] = useState(false);

  // Debounce ref for history saving
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save history helper
  const recordHistory = useCallback((
    category: CategoryKey,
    fUnit: UnitDefinition,
    tUnit: UnitDefinition,
    fVal: number,
    tVal: number
  ) => {
    if (fVal === 0 && tVal === 0) return;

    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }

    historyTimeoutRef.current = setTimeout(() => {
      const newItem: ConversionHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        category,
        fromUnitId: fUnit.id,
        toUnitId: tUnit.id,
        fromValue: fVal,
        toValue: tVal,
        formattedFrom: `${formatValue(fVal, 'auto')} ${fUnit.symbol}`,
        formattedTo: `${formatValue(tVal, 'auto')} ${tUnit.symbol}`,
        timestamp: Date.now(),
      };

      setHistory((prev) => {
        // Avoid duplicate identical immediate consecutive entries
        if (
          prev[0] &&
          prev[0].fromUnitId === newItem.fromUnitId &&
          prev[0].toUnitId === newItem.toUnitId &&
          prev[0].fromValue === newItem.fromValue
        ) {
          return prev;
        }
        const updated = [newItem, ...prev.slice(0, 24)];
        saveStoredHistory(updated);
        return updated;
      });
    }, 1200);
  }, []);

  // Compute conversion from 'From' to 'To'
  const recalculateFromTo = useCallback((
    fStr: string,
    fUnit: UnitDefinition,
    tUnit: UnitDefinition,
    prec: PrecisionMode = precision,
    record: boolean = true
  ) => {
    const num = parseCleanNumber(fStr);
    const result = convertValue(num, fUnit, tUnit);
    const formatted = formatValue(result, prec);
    setToValueStr(formatted);

    if (record && fStr.trim() !== '' && num > 0) {
      recordHistory(fUnit.category, fUnit, tUnit, num, result);
    }
  }, [precision, recordHistory]);

  // Compute conversion from 'To' to 'From' (Two-Way)
  const recalculateToFrom = useCallback((
    tStr: string,
    fUnit: UnitDefinition,
    tUnit: UnitDefinition,
    prec: PrecisionMode = precision,
    record: boolean = true
  ) => {
    const num = parseCleanNumber(tStr);
    // Inverse: from tUnit to fUnit
    const result = convertValue(num, tUnit, fUnit);
    const formatted = formatValue(result, prec);
    setFromValueStr(formatted);

    if (record && tStr.trim() !== '' && num > 0) {
      recordHistory(fUnit.category, fUnit, tUnit, result, num);
    }
  }, [precision, recordHistory]);

  // Initial calculation
  useEffect(() => {
    recalculateFromTo('1', fromUnit, toUnit, precision, false);
  }, []);

  // Handle category switch
  const handleSelectCategory = (catKey: CategoryKey) => {
    if (catKey === activeCategoryKey) return;

    setActiveCategoryKey(catKey);
    const targetCat = CATEGORIES.find((c) => c.id === catKey);
    if (!targetCat) return;

    const newFrom = targetCat.units.find((u) => u.id === targetCat.defaultFrom) || targetCat.units[0];
    const newTo = targetCat.units.find((u) => u.id === targetCat.defaultTo) || targetCat.units[1];

    setFromUnit(newFrom);
    setToUnit(newTo);

    // Keep current numeric value or reset to standard 1
    const currentNum = parseCleanNumber(fromValueStr);
    const numToUse = currentNum > 0 ? fromValueStr : '1';
    setFromValueStr(numToUse);
    recalculateFromTo(numToUse, newFrom, newTo, precision, false);
  };

  // Handle From input typing
  const handleFromChange = (newVal: string) => {
    setFromValueStr(newVal);
    recalculateFromTo(newVal, fromUnit, toUnit, precision, true);
  };

  // Handle To input typing (Two-way!)
  const handleToChange = (newVal: string) => {
    setToValueStr(newVal);
    recalculateToFrom(newVal, fromUnit, toUnit, precision, true);
  };

  // Swap From & To units
  const handleSwapUnits = () => {
    const prevFrom = fromUnit;
    const prevTo = toUnit;
    setFromUnit(prevTo);
    setToUnit(prevFrom);

    // When swapping, re-evaluate with current fromValueStr
    recalculateFromTo(fromValueStr, prevTo, prevFrom, precision, true);
  };

  // Change precision
  const handlePrecisionChange = (newPrec: PrecisionMode) => {
    setPrecision(newPrec);
    recalculateFromTo(fromValueStr, fromUnit, toUnit, newPrec, false);
  };

  // Select a new From unit
  const handleSelectFromUnit = (unit: UnitDefinition) => {
    setFromUnit(unit);
    recalculateFromTo(fromValueStr, unit, toUnit, precision, true);
  };

  // Select a new To unit
  const handleSelectToUnit = (unit: UnitDefinition) => {
    setToUnit(unit);
    recalculateFromTo(fromValueStr, fromUnit, unit, precision, true);
  };

  // Check if current pair is favorite
  const isCurrentPairFavorite = useMemo(() => {
    return favorites.some(
      (f) =>
        f.category === activeCategoryKey &&
        ((f.fromUnitId === fromUnit.id && f.toUnitId === toUnit.id) ||
          (f.fromUnitId === toUnit.id && f.toUnitId === fromUnit.id))
    );
  }, [favorites, activeCategoryKey, fromUnit.id, toUnit.id]);

  // Toggle favorite for current pair
  const handleToggleFavorite = () => {
    if (isCurrentPairFavorite) {
      const updated = favorites.filter(
        (f) =>
          !(
            f.category === activeCategoryKey &&
            ((f.fromUnitId === fromUnit.id && f.toUnitId === toUnit.id) ||
              (f.fromUnitId === toUnit.id && f.toUnitId === fromUnit.id))
          )
      );
      setFavorites(updated);
      saveStoredFavorites(updated);
    } else {
      const newFav: FavoritePair = {
        id: `fav-${Date.now()}`,
        category: activeCategoryKey,
        fromUnitId: fromUnit.id,
        toUnitId: toUnit.id,
        customName: `${fromUnit.name} to ${toUnit.name}`,
      };
      const updated = [newFav, ...favorites];
      setFavorites(updated);
      saveStoredFavorites(updated);
    }
  };

  // Select a favorite pair from list
  const handleSelectFavoritePair = (
    catKey: CategoryKey,
    fUnit: UnitDefinition,
    tUnit: UnitDefinition
  ) => {
    setActiveCategoryKey(catKey);
    setFromUnit(fUnit);
    setToUnit(tUnit);
    setActiveTab('converter');
    recalculateFromTo(fromValueStr || '1', fUnit, tUnit, precision, true);
  };

  // Remove single favorite
  const handleRemoveFavorite = (id: string) => {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    saveStoredFavorites(updated);
  };

  // Reset favorites to default
  const handleResetDefaultFavorites = () => {
    setFavorites(DEFAULT_FAVORITES);
    saveStoredFavorites(DEFAULT_FAVORITES);
  };

  // Select history item to restore
  const handleSelectHistoryItem = (item: ConversionHistoryItem) => {
    const cat = CATEGORIES.find((c) => c.id === item.category);
    if (!cat) return;
    const fUnit = cat.units.find((u) => u.id === item.fromUnitId);
    const tUnit = cat.units.find((u) => u.id === item.toUnitId);
    if (!fUnit || !tUnit) return;

    setActiveCategoryKey(item.category);
    setFromUnit(fUnit);
    setToUnit(tUnit);
    setFromValueStr(item.fromValue.toString());
    setActiveTab('converter');
    recalculateFromTo(item.fromValue.toString(), fUnit, tUnit, precision, false);
  };

  // Clear history
  const handleClearHistory = () => {
    setHistory([]);
    saveStoredHistory([]);
  };

  // Remove history item
  const handleRemoveHistoryItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    saveStoredHistory(updated);
  };

  // Search Jump: selects category and unit
  const handleSearchSelect = (catKey: CategoryKey, unit: UnitDefinition) => {
    setActiveCategoryKey(catKey);
    const targetCat = CATEGORIES.find((c) => c.id === catKey);
    if (!targetCat) return;

    // Set as 'fromUnit' if distinct from 'toUnit', else default 'toUnit'
    setFromUnit(unit);
    const defaultTo = targetCat.units.find((u) => u.id !== unit.id) || targetCat.units[1];
    setToUnit(defaultTo);
    setActiveTab('converter');
    recalculateFromTo(fromValueStr || '1', unit, defaultTo, precision, true);
  };

  // Global keyboard shortcut for Search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col selection:bg-slate-900 selection:text-white">
      {/* Top Bar adhering to Top Bar contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenCurrencyRates={() => setIsCurrencyRatesOpen(true)}
        historyCount={history.length}
        favoritesCount={favorites.length}
        activeCategory={activeCategoryKey}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Category Selector Tabs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Measurement Categories
            </span>
            <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Client-Side Offline Engine</span>
              </span>
              <span>·</span>
              <span>9 Categories · 80+ Units</span>
            </div>
          </div>
          <CategorySelector
            categories={CATEGORIES}
            activeCategory={activeCategoryKey}
            onSelectCategory={handleSelectCategory}
          />
        </div>

        {/* View Switcher: Calculator / Multi-Unit Matrix / Favorites / History */}
        {activeTab === 'converter' && (
          <div className="space-y-6">
            <ConverterCard
              category={currentCategory}
              fromUnit={fromUnit}
              toUnit={toUnit}
              fromValueStr={fromValueStr}
              toValueStr={toValueStr}
              onFromChange={handleFromChange}
              onToChange={handleToChange}
              onSwapUnits={handleSwapUnits}
              onOpenFromSelector={() => setIsFromSelectorOpen(true)}
              onOpenToSelector={() => setIsToSelectorOpen(true)}
              isFavorite={isCurrentPairFavorite}
              onToggleFavorite={handleToggleFavorite}
              precision={precision}
              onPrecisionChange={handlePrecisionChange}
              onOpenCurrencyRates={() => setIsCurrencyRatesOpen(true)}
            />

            {/* Quick Multi-Unit Snapshot below main converter */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CategoryMatrix
                  category={currentCategory}
                  fromUnit={fromUnit}
                  fromValue={parseCleanNumber(fromValueStr)}
                  precision={precision}
                  onSelectAsTarget={handleSelectToUnit}
                />
              </div>

              {/* Side Column: Quick Access Favorites & Recent Items */}
              <div className="space-y-6">
                <FavoritesSection
                  favorites={favorites.slice(0, 4)}
                  onSelectPair={handleSelectFavoritePair}
                  onRemoveFavorite={handleRemoveFavorite}
                  onResetDefaults={handleResetDefaultFavorites}
                />

                <HistorySection
                  history={history.slice(0, 5)}
                  onSelectHistoryItem={handleSelectHistoryItem}
                  onClearHistory={handleClearHistory}
                  onRemoveItem={handleRemoveHistoryItem}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matrix' && (
          <div className="space-y-4">
            <CategoryMatrix
              category={currentCategory}
              fromUnit={fromUnit}
              fromValue={parseCleanNumber(fromValueStr)}
              precision={precision}
              onSelectAsTarget={(unit) => {
                handleSelectToUnit(unit);
                setActiveTab('converter');
              }}
            />
          </div>
        )}

        {activeTab === 'favorites' && (
          <FavoritesSection
            favorites={favorites}
            onSelectPair={handleSelectFavoritePair}
            onRemoveFavorite={handleRemoveFavorite}
            onResetDefaults={handleResetDefaultFavorites}
          />
        )}

        {activeTab === 'history' && (
          <HistorySection
            history={history}
            onSelectHistoryItem={handleSelectHistoryItem}
            onClearHistory={handleClearHistory}
            onRemoveItem={handleRemoveHistoryItem}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <UnitSelectorModal
        isOpen={isFromSelectorOpen}
        onClose={() => setIsFromSelectorOpen(false)}
        units={currentCategory.units}
        selectedUnitId={fromUnit.id}
        onSelectUnit={handleSelectFromUnit}
        title={`Select "From" Unit (${currentCategory.shortName})`}
      />

      <UnitSelectorModal
        isOpen={isToSelectorOpen}
        onClose={() => setIsToSelectorOpen(false)}
        units={currentCategory.units}
        selectedUnitId={toUnit.id}
        onSelectUnit={handleSelectToUnit}
        title={`Select "To" Unit (${currentCategory.shortName})`}
      />

      <UnitSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectUnitAndCategory={handleSearchSelect}
      />

      <CurrencyRatesModal
        isOpen={isCurrencyRatesOpen}
        onClose={() => setIsCurrencyRatesOpen(false)}
        onSelectCurrencyPair={(code) => {
          const cat = CATEGORIES.find((c) => c.id === 'currency');
          const target = cat?.units.find((u) => u.id === code);
          const usdUnit = cat?.units.find((u) => u.id === 'usd');
          if (cat && target && usdUnit) {
            setActiveCategoryKey('currency');
            setFromUnit(usdUnit);
            setToUnit(target);
            recalculateFromTo(fromValueStr || '1', usdUnit, target, precision, true);
          }
        }}
      />

      {/* Clean Human Editorial Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-800">SwiftConvert</span>
            <span aria-hidden="true">·</span>
            <span>Accurate Unit & Currency Conversion</span>
            <span aria-hidden="true">·</span>
            <span>Works 100% Offline</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Length · Weight · Temp · Volume · Area · Speed · Time · Data · Currency</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
