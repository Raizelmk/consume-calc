"use client"; // Required in Next.js for interactive components

import { useMemo } from 'react';
import recipes from '@/data/recipes.json';
import prices from '@/data/prices.json';
import { calculateTotals } from '@/lib/calcLogic';
import { useLocalStorage } from '@/lib/useLocalStorage';
import Currency from '@/components/Currency';

export default function CraftingDashboard() {
  // 1. State: The list of items the user wants to craft (persisted in localStorage)
  const [goals, setGoals] = useLocalStorage('crafting-goals', [
    { name: "Flask of Supreme Power", quantity: 0 }
  ]);

  // 2. Logic: Recalculate everything whenever 'goals' change
  const shoppingList = useMemo(() => {
    return calculateTotals(goals, recipes, prices);
  }, [goals]);

  // 3. Actions: Add, Remove, or Update quantities
  interface Goal {
    name: string;
    quantity: number;
  }

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
          <h2 className="text-xl mb-4 font-semibold text-green-400">Total Materials Needed</h2>
          
          <div className="space-y-2">
            {Object.entries(shoppingList).map(([name, data]) => (
              <div key={name} className="flex justify-between border-b border-slate-700/50 py-2">
                <div>
                  <span className="text-slate-400 text-sm mr-2">{data.quantity}x</span>
                  <span>{name}</span>
                </div>
                <Currency copper={data.totalCopper} />
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t-2 border-slate-600 flex justify-between items-center">
            <span className="text-lg font-bold">Total Cost:</span>
            <div className="text-xl">
              <Currency copper={Object.values(shoppingList).reduce((sum, i) => sum + i.totalCopper, 0)} />
            </div>
          </div>
        </section>
        
      </div>
    </div>
  );
}