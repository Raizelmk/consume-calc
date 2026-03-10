"use client";

import { useState, useMemo } from 'react';
import recipes from '@/data/recipes.json';
import prices from '@/data/prices.json';
import { calculateTotals } from '@/lib/calcLogic';
import Currency from '@/components/Currency';
import icons from '@/data/icons.json';
import { useLocalStorage } from '@/lib/useLocalStorage';

const getIconUrl = (itemName: string) => {
  // 1. Check if we have the exact item mapped in icons.json
  const iconName = (icons as Record<string, string>)[itemName];

  if (iconName) {
    return `https://wow.zamimg.com/images/wow/icons/large/${iconName}.jpg`;
  }

  // 2. Smart Fallbacks (If you add a new item but forget to update icons.json)
  if (itemName.includes("Flask")) return "https://wow.zamimg.com/images/wow/icons/large/inv_potion_51.jpg";
  if (itemName.includes("Potion") || itemName.includes("Elixir")) return "https://wow.zamimg.com/images/wow/icons/large/inv_potion_76.jpg";
  if (itemName.includes("Oil")) return "https://wow.zamimg.com/images/wow/icons/large/inv_potion_26.jpg";
  if (itemName.includes("Ore") || itemName.includes("Bar")) return "https://wow.zamimg.com/images/wow/icons/large/inv_ore_copper_01.jpg";
  
  // 3. Ultimate Fallback (Default Herb icon)
  return "https://wow.zamimg.com/images/wow/icons/large/inv_misc_herb_11.jpg";
};

export default function CraftingDashboard() {
  const [goals, setGoals] = useLocalStorage('crafting-goals', [
    { name: 'Flask of the Titans', quantity: 1, completed: false },
  ]);

  // Tracks which materials the user already has (Key = Material Name, Value = boolean)
  const [ownedMaterials, setOwnedMaterials] = useState<Record<string, boolean>>({});

  // Sort order for shopping list
  const [sortOrder, setSortOrder] = useState<'quantity' | 'price' | 'name'>('quantity');

  // Dropdown value for adding items
  const [dropdownValue, setDropdownValue] = useState('');

  // --- LOGIC ---
  // Only calculate materials for goals that are NOT checked off
  const { rawMaterials, intermediates } = useMemo(() => {
    const activeGoals = goals.filter(g => !g.completed);
    return calculateTotals(activeGoals, recipes, prices) as { rawMaterials: Record<string, any>; intermediates: any[] };
  }, [goals]);

  // Calculate grand total, ignoring checked-off materials
  const grandTotal = useMemo(() => {
    return Object.entries(rawMaterials).reduce((sum, [name, data]: [string, any]) => {
      if (ownedMaterials[name]) return sum; // Skip if owned
      return sum + (data.quantity * data.unitPrice);
    }, 0);
  }, [rawMaterials, ownedMaterials]);

  // Sort materials based on sortOrder
  const getSortedMaterials = useMemo(() => {
    const entries = Object.entries(rawMaterials);
    if (sortOrder === 'quantity') {
      return entries.sort(([, a]: [string, any], [, b]: [string, any]) => b.quantity - a.quantity);
    } else if (sortOrder === 'price') {
      return entries.sort(([, a]: [string, any], [, b]: [string, any]) => (b.quantity * b.unitPrice) - (a.quantity * a.unitPrice));
    } else { // name
      return entries.sort(([nameA]: [string, any], [nameB]: [string, any]) => nameA.localeCompare(nameB));
    }
  }, [rawMaterials, sortOrder]);

  const resetDashboard = () => {
    setGoals(goals.map(g => ({ ...g, completed: false })));
    setOwnedMaterials({});
  }

  // --- ACTIONS ---
  const toggleGoal = (index: number) => {
    const newGoals = [...goals];
    newGoals[index].completed = !newGoals[index].completed;
    setGoals(newGoals);
  };

  const updateQuantity = (index: number, newQty: string) => {
    const newGoals = [...goals];
    newGoals[index].quantity = Math.max(1, parseInt(newQty) || 1);
    setGoals(newGoals);
  };

  const addGoal = (itemName: string) => {
    if (!goals.find(g => g.name === itemName)) {
      setGoals([...goals, { name: itemName, quantity: 1, completed: false }]);
    }
  };

  const toggleMaterial = (name: string) => {
    setOwnedMaterials(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleAddGoal = (itemName: string) => {
    addGoal(itemName);
    setDropdownValue('');
  };

return (
  <div className="min-h-screen bg-[#0b1120] text-slate-300 p-4 md:p-2 font-sans">
    <div className="max-w-7xl mx-auto">
      {/* Main Title */}
      <header className="mb-8 flex justify-between items-end border-b border-slate-800 pb-2">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-amber-600">
          Consume Calc v5
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT PANEL: POTIONS */}
        <section className="bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700/50 p-6 flex flex-col">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white mb-2 text-center lg:text-left uppercase tracking-tight">
              Selected Potions & Items
            </h2>
          </div>

          {/* DROPDOWN */}
          <div className="mb-6">
            <select 
              value={dropdownValue}
              onChange={(e) => handleAddGoal(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-700 h-13 px-4 rounded-xl text-slate-300 outline-none focus:border-yellow-500/50 transition-all hover:bg-slate-900 cursor-pointer appearance-none shadow-inner"
            >
              <option value="" disabled>+ Add a potion/item</option>
              {recipes.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
            </select>
          </div>
          
          <div className="space-y-3">
            {goals.map((goal, idx) => (
              <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                  goal.completed ? 'bg-slate-800/30 border-slate-800 opacity-50' : 'bg-[#0f172a] border-slate-700 shadow-sm'
                }`}>
                <img src={getIconUrl(goal.name)} alt="" className="w-10 h-10 rounded-md border border-slate-600 shadow-sm" />
                <div className="flex-1 flex items-center gap-3">
                  <input type="checkbox" checked={goal.completed} onChange={() => toggleGoal(idx)} className="w-5 h-5 rounded border-slate-500 text-blue-500 bg-slate-900" />
                  <span className={`font-medium ${goal.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {goal.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" value={goal.quantity} onChange={(e) => updateQuantity(idx, e.target.value)} disabled={goal.completed} className="w-14 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-center text-sm" />
                  <button onClick={() => setGoals(goals.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-red-400 p-1">✕</button>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ================= RIGHT PANEL: MATERIALS ================= */}
        <section className="bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700/50 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-white text-center lg:text-left uppercase tracking-tight">
              Shopping List
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const orders: Array<'quantity' | 'price' | 'name'> = ['quantity', 'price', 'name'];
                  const currentIndex = orders.indexOf(sortOrder);
                  setSortOrder(orders[(currentIndex + 1) % orders.length]);
                }}
                className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors font-medium text-slate-300"
                title="Cycle through sort options"
              >
                {sortOrder === 'quantity' && 'Qty'}
                {sortOrder === 'price' && 'Price'}
                {sortOrder === 'name' && 'Name'}
              </button>
              <button onClick={resetDashboard} 
                className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors font-medium text-slate-300">
                Reset
              </button>
            </div>
          </div>

          {/* GRAND TOTAL BOX (MOVED UP) */}
          <div className="mb-6 flex justify-between items-center bg-[#0f172a] border border-slate-700 h-13 px-4 rounded-xl shadow-inner overflow-hidden">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Grand Total</span>
            <div className="scale-110">
              <Currency copper={grandTotal} />
            </div>
          </div>

          <div className="space-y-2">
            {getSortedMaterials.map(([name, data]) => {
              const isOwned = ownedMaterials[name];
              return (
                <div key={name} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                    isOwned ? 'bg-slate-800/30 opacity-60' : 'hover:bg-slate-800/50 border-b border-slate-700/30'
                  }`}>
                  <img src={getIconUrl(name)} alt="" className="w-8 h-8 rounded border border-slate-700" />
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-blue-400 font-mono font-medium">{Math.ceil(data.quantity)}x</span>
                    <span className={`text-sm ${isOwned ? 'line-through text-slate-500' : 'text-slate-200'}`}>{name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={isOwned ? 'opacity-30' : 'opacity-100'}>
                      <Currency copper={data.quantity * data.unitPrice} />
                    </div>
                    <input type="checkbox" checked={isOwned || false} onChange={() => toggleMaterial(name)} className="w-5 h-5 rounded border-slate-500 text-green-500 bg-slate-900" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  </div>
  );
}