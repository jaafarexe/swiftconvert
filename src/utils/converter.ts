import { CategoryDefinition, ConversionHistoryItem, FavoritePair, UnitDefinition } from '../types/converter';
import { CATEGORIES, DEFAULT_FAVORITES } from '../data/categories';

export type PrecisionMode = 'auto' | '2' | '4' | '6' | 'full';

/**
 * Converts a numerical value from one unit to another within the same category
 */
export function convertValue(
  value: number,
  fromUnit: UnitDefinition,
  toUnit: UnitDefinition
): number {
  if (isNaN(value)) return 0;
  if (fromUnit.id === toUnit.id) return value;

  // Handle non-linear conversions (e.g., temperature)
  if (fromUnit.toBase && toUnit.fromBase) {
    const inBase = fromUnit.toBase(value);
    return toUnit.fromBase(inBase);
  }

  // Handle standard multiplier-based conversions
  const fromMultiplier = fromUnit.multiplier ?? 1;
  const toMultiplier = toUnit.multiplier ?? 1;

  if (toMultiplier === 0) return 0;

  const inBase = value * fromMultiplier;
  return inBase / toMultiplier;
}

/**
 * Format a number cleanly for display with commas, scientific notation if extreme, and smart decimals
 */
export function formatValue(value: number, precision: PrecisionMode = 'auto'): string {
  if (isNaN(value)) return '0';
  if (value === 0) return '0';

  const abs = Math.abs(value);

  // Very large or very tiny values -> use scientific notation if auto or full
  if (abs >= 1e15 || (abs > 0 && abs < 1e-9)) {
    return value.toExponential(4);
  }

  switch (precision) {
    case '2':
      return formatWithCommas(value.toFixed(2));
    case '4':
      return formatWithCommas(value.toFixed(4));
    case '6':
      return formatWithCommas(value.toFixed(6));
    case 'full':
      return formatWithCommas(value.toString());
    case 'auto':
    default: {
      // Smart rounding to clean up floating point inaccuracies (e.g. 0.30000000000000004)
      let formatted: string;
      if (abs >= 1000) {
        // Larger numbers: at most 4 decimals
        formatted = Number(value.toFixed(4)).toString();
      } else if (abs >= 1) {
        // Normal range: at most 6 decimals
        formatted = Number(value.toFixed(6)).toString();
      } else {
        // Small numbers < 1: up to 8 decimals
        formatted = Number(value.toFixed(8)).toString();
      }
      return formatWithCommas(formatted);
    }
  }
}

/**
 * Adds thousand separator commas to numbers while preserving decimals
 */
export function formatWithCommas(numStr: string): string {
  if (numStr.includes('e')) return numStr;
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

/**
 * Strips commas and parses string input safely to float
 */
export function parseCleanNumber(input: string): number {
  const clean = input.replace(/,/g, '').trim();
  if (clean === '' || clean === '-' || clean === '.') return 0;
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Generates an accurate, human-readable formula or conversion factor
 */
export function getFormulaExplanation(
  fromUnit: UnitDefinition,
  toUnit: UnitDefinition
): { summary: string; formula: string } {
  if (fromUnit.id === toUnit.id) {
    return {
      summary: `1 ${fromUnit.symbol} = 1 ${toUnit.symbol}`,
      formula: 'Identical units'
    };
  }

  // Temperature specific human readable formulas
  if (fromUnit.category === 'temperature') {
    if (fromUnit.id === 'c' && toUnit.id === 'f') {
      return {
        summary: '1 °C = 33.8 °F',
        formula: '(°C × 9/5) + 32 = °F'
      };
    }
    if (fromUnit.id === 'f' && toUnit.id === 'c') {
      return {
        summary: '1 °F = -17.22 °C',
        formula: '(°F − 32) × 5/9 = °C'
      };
    }
    if (fromUnit.id === 'c' && toUnit.id === 'k') {
      return {
        summary: '1 °C = 274.15 K',
        formula: '°C + 273.15 = K'
      };
    }
    if (fromUnit.id === 'k' && toUnit.id === 'c') {
      return {
        summary: '1 K = -272.15 °C',
        formula: 'K − 273.15 = °C'
      };
    }
    if (fromUnit.id === 'f' && toUnit.id === 'k') {
      return {
        summary: '1 °F = 255.93 K',
        formula: '((°F − 32) × 5/9) + 273.15 = K'
      };
    }
    if (fromUnit.id === 'k' && toUnit.id === 'f') {
      return {
        summary: '1 K = -457.87 °F',
        formula: '((K − 273.15) × 9/5) + 32 = °F'
      };
    }
  }

  // Linear formula
  const oneFromInTo = convertValue(1, fromUnit, toUnit);
  const formattedFactor = formatValue(oneFromInTo, 'auto');

  const summary = `1 ${fromUnit.symbol} ≈ ${formattedFactor} ${toUnit.symbol}`;
  const formula = `Multiply the ${fromUnit.name} value by ${formattedFactor}`;

  return { summary, formula };
}

// LocalStorage Keys
const HISTORY_KEY = 'swiftconvert_history_v1';
const FAVORITES_KEY = 'swiftconvert_favorites_v1';

export function loadStoredHistory(): ConversionHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredHistory(history: ConversionHistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
  } catch (e) {
    console.error('Failed to save conversion history', e);
  }
}

export function loadStoredFavorites(): FavoritePair[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(DEFAULT_FAVORITES));
      return DEFAULT_FAVORITES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_FAVORITES;
  }
}

export function saveStoredFavorites(favorites: FavoritePair[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error('Failed to save favorites', e);
  }
}

export function findCategory(catId: string): CategoryDefinition | undefined {
  return CATEGORIES.find(c => c.id === catId);
}

export function findUnit(catId: string, unitId: string): UnitDefinition | undefined {
  const cat = findCategory(catId);
  return cat?.units.find(u => u.id === unitId);
}
