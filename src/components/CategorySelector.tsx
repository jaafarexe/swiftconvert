import React from 'react';
import { 
  Ruler, 
  Scale, 
  Thermometer, 
  Beaker, 
  Maximize2, 
  Gauge, 
  Clock, 
  HardDrive, 
  Coins 
} from 'lucide-react';
import { CategoryDefinition, CategoryKey } from '../types/converter';

interface CategorySelectorProps {
  categories: CategoryDefinition[];
  activeCategory: CategoryKey;
  onSelectCategory: (categoryKey: CategoryKey) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Ruler,
  Scale,
  Thermometer,
  Beaker,
  Maximize2,
  Gauge,
  Clock,
  HardDrive,
  Coins
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x focus:outline-none">
        {categories.map((cat) => {
          const IconComponent = ICON_MAP[cat.iconName] || Ruler;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`snap-start flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 border ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-200/90'
              }`}
              title={cat.description}
            >
              <IconComponent 
                className={`w-4 h-4 transition-transform ${
                  isActive ? 'text-amber-400 scale-105' : 'text-slate-500'
                }`} 
              />
              <span>{cat.shortName}</span>
              {cat.id === 'currency' && (
                <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                  isActive ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-500'
                }`}>
                  Rates
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
