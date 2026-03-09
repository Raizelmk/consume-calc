"use client"; // Required in Next.js for interactive components

import { useMemo, useState } from 'react';
import recipes from '@/data/recipes.json';
import prices from '@/data/prices.json';
import { getDetailedBreakdown } from '@/lib/calcLogic';
import { useLocalStorage } from '@/lib/useLocalStorage';
import Currency from '@/components/Currency';
import IntermediateTree from '@/components/IntermediateTree';

interface Goal {
  name: string;
  quantity: number;
}

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

interface RawMaterial {
  quantity: number;
  unitPrice: number;
  totalCopper: number;
}

interface Breakdown {
  intermediates: Intermediate[];
  rawMaterials: Record<string, RawMaterial>;
}

export default function CraftingDashboard() {
  // 1. State: The list of items the user wants to craft (persisted in localStorage)
  const [goals, setGoals] = useLocalStorage('crafting-goals', [
    { name: "Flask of Supreme Power", quantity: 0 }
  ]);

  // Sort mode state
  const [sortMode, setSortMode] = useState<'number' | 'name' | 'cost'>('name');

  // 2. Logic: Recalculate everything whenever 'goals' change
  const breakdown: Breakdown = useMemo(() => {
    return getDetailedBreakdown(goals, recipes, prices) as Breakdown;
  }, [goals]);

  // 3. Sort function for materials
  const getSortedItems = () => {
    const sortedIntermediates = [...breakdown.intermediates];
    const sortedRawEntries = Object.entries(breakdown.rawMaterials);

    // Sort by selected criteria
    if (sortMode === 'number') {
      sortedIntermediates.sort((a, b) => b.quantity - a.quantity);
      sortedRawEntries.sort((a, b) => b[1].quantity - a[1].quantity);
    } else if (sortMode === 'name') {
      sortedIntermediates.sort((a, b) => a.name.localeCompare(b.name));
      sortedRawEntries.sort((a, b) => a[0].localeCompare(b[0]));
    } else if (sortMode === 'cost') {
      sortedIntermediates.sort((a, b) => b.totalCopper - a.totalCopper);
      sortedRawEntries.sort((a, b) => b[1].totalCopper - a[1].totalCopper);
    }

    return { sortedIntermediates, sortedRawEntries };
  };

  const { sortedIntermediates, sortedRawEntries } = getSortedItems();

  // 4. Actions: Add, Remove, or Update quantities
  const updateQuantity = (index: number, newQty: number | string) => {
    const newGoals: Goal[] = [...goals];
    newGoals[index].quantity = Math.max(1, parseInt(newQty as string) || 0);
    setGoals(newGoals);
  };

  const addItem = (itemName: string): void => {
    if (!goals.find((g: Goal) => g.name === itemName)) {
      setGoals([...goals, { name: itemName, quantity: 1 }]);
    }
  };

  return (
    <div className="max-w-8xl mx-auto p-6 bg-slate-950 text-white min-h-screen">
      <header className="border-b border-slate-700 pb-4 mb-8">
        <h1 className="text-3xl font-bold text-yellow-500">Consume Calc v5</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: INPUTS */}
        <section className="bg-slate-800/50 p-6 rounded-xl">
          <h2 className="text-xl mb-4 font-semibold">What are you making?</h2>
          
          <div className="space-y-3">
            {goals.map((goal, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-800 p-3 rounded-1g border border-slate-700">
                <span className="flex-1 font-medium">{goal.name}</span>
                <input 
                  type="number"
                  value={goal.quantity}
                  onChange={(e) => updateQuantity(idx, e.target.value)}
                  className="w-16 bg-slate-900 border border-slate-600 rounded px-2 py-.5 text-center"
                />
                <button 
                  onClick={() => setGoals(goals.filter((_, i) => i !== idx))}
                  className="text-slate-400 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <select 
            onChange={(e) => addItem(e.target.value)}
            className="mt-6 w-full bg-slate-800 border border-yellow-600 p-2 rounded text-slate-300"
            defaultValue=""
          >
            <option value="" disabled>+ Add another potion/item</option>
            {recipes.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
          </select>
        </section>

        {/* RIGHT COLUMN: OUTPUT (THE SHOPPING LIST) */}
        <section className="bg-slate-800/50 p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-rose-400">Total Materials Needed</h2>
            <select 
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as 'number' | 'name' | 'cost')}
              className="bg-slate-800 border border-yellow-600/50 text-yellow-500 px-3 py-1 rounded text-sm hover:border-yellow-600 cursor-pointer"
            >
              <option value="name">Sort: Name</option>
              <option value="number">Sort: Quantity</option>
              <option value="cost">Sort: Cost</option>
            </select>
          </div>
          
          <div className="space-y-4">
            {/* INTERMEDIATES SECTION */}
            {sortedIntermediates.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-yellow-500 mb-3 uppercase tracking-wide">Craft These First</h3>
                <div className="space-y-2">
                  {sortedIntermediates.map((intermediate) => (
                    <IntermediateTree key={intermediate.name} intermediate={intermediate} />
                  ))}
                </div>
              </div>
            )}

            {/* DIVIDER */}
            {sortedIntermediates.length > 0 && sortedRawEntries.length > 0 && (
              <div className="border-t border-slate-600 my-4"></div>
            )}

            {/* RAW MATERIALS SECTION */}
            {sortedRawEntries.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">Gather Raw Materials</h3>
                <div className="space-y-2">
                  {sortedRawEntries.map(([name, data]) => (
                    <div key={name} className="flex justify-between border-b border-slate-700/50 py-2">
                      <div>
                        <span className="text-slate-400 text-sm mr-2">{data.quantity % 1 === 0 ? data.quantity : data.quantity.toFixed(2)}x</span>
                        <span>{name}</span>
                      </div>
                      <Currency copper={data.totalCopper} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TOTAL COST */}
          <div className="mt-8 pt-4 border-t-2 border-slate-600 flex justify-between items-center">
            <span className="text-lg font-bold">Total Cost:</span>
            <div className="text-xl">
              <Currency copper={
                sortedIntermediates.reduce((sum, i) => sum + i.totalCopper, 0) +
                sortedRawEntries.reduce((sum, [_, data]) => sum + data.totalCopper, 0)
              } />
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
}