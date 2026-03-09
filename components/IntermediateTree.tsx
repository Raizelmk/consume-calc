'use client';

import { useState } from 'react';
import Currency from '@/components/Currency';

interface Ingredient {
  name: string;
  amount: number;
}

interface Intermediate {
  name: string;
  quantity: number;
  ingredients: Ingredient[];
  totalCopper: number;
}

interface IntermediateTreeProps {
  intermediate: Intermediate;
}

export default function IntermediateTree({ intermediate }: IntermediateTreeProps) {
  const [expanded, setExpanded] = useState(false);

  // Format ingredient list as readable string
  const formatIngredients = (ingredients: Ingredient[]) => {
    return ingredients
      .map(ing => `${ing.amount % 1 === 0 ? ing.amount : ing.amount.toFixed(2)}x ${ing.name}`)
      .join(', ');
  };

  return (
    <div>
      {/* Compact header row - matches raw materials styling */}
      <div
        className="flex justify-between items-center border-b border-slate-700/50 py-2 cursor-pointer hover:bg-slate-800/30 px-2 rounded transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 flex-1">
          <span className="text-yellow-500 text-sm mr-2">{intermediate.quantity}x</span>
          <span className="text-white font-medium flex-1">{intermediate.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <Currency copper={intermediate.totalCopper} />
          <span className="text-slate-400 text-sm ml-2">{expanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {/* Expandable ingredients detail */}
      {expanded && (
        <div className="bg-slate-800/20 p-3 pl-6 text-slate-300 text-sm border-l-2 border-yellow-600/30 mt-1 rounded">
          <div className="font-semibold text-yellow-600 mb-1">Requires:</div>
          <div>{formatIngredients(intermediate.ingredients)}</div>
        </div>
      )}
    </div>
  );
}
