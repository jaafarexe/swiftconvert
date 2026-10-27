export type CategoryKey = 
  | 'length'
  | 'weight'
  | 'temperature'
  | 'volume'
  | 'area'
  | 'speed'
  | 'time'
  | 'digital'
  | 'currency';

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  category: CategoryKey;
  // For linear conversions: multiplier relative to base unit (1 unit = multiplier * baseUnit)
  multiplier?: number;
  // Custom conversion functions for non-linear (e.g. Temperature)
  toBase?: (val: number) => number;
  fromBase?: (val: number) => number;
  system?: 'metric' | 'imperial' | 'binary' | 'decimal' | 'standard' | 'regional';
  description?: string;
  aliases?: string[];
}

export interface CategoryDefinition {
  id: CategoryKey;
  name: string;
  shortName: string;
  iconName: string;
  description: string;
  baseUnitId: string;
  defaultFrom: string;
  defaultTo: string;
  units: UnitDefinition[];
  formulaSummary?: (from: UnitDefinition, to: UnitDefinition) => string;
}

export interface ConversionHistoryItem {
  id: string;
  category: CategoryKey;
  fromUnitId: string;
  toUnitId: string;
  fromValue: number;
  toValue: number;
  formattedFrom: string;
  formattedTo: string;
  timestamp: number;
}

export interface FavoritePair {
  id: string;
  category: CategoryKey;
  fromUnitId: string;
  toUnitId: string;
  customName?: string;
}
