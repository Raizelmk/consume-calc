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
  // Format ingredient list as readable string
  const formatIngredients = (ingredients: Ingredient[]) => {
    return ingredients
      .map(ing => `${ing.amount % 1 === 0 ? ing.amount : ing.amount.toFixed(2)}x ${ing.name}`)
      .join(', ');
  };

  return (
    <div className="border-l-2 border-yellow-600/40 pl-4 py-2">
      {/* Intermediate item header */}
      <div className="bg-slate-700/50 p-3 rounded-lg border border-yellow-600/20 mb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 font-semibold">{intermediate.quantity}x</span>
              <span className="text-white font-medium">{intermediate.name}</span>
            </div>
            <div className="text-slate-400 text-sm mt-1">
              Requires: {formatIngredients(intermediate.ingredients)}
            </div>
          </div>
          <Currency copper={intermediate.totalCopper} />
        </div>
      </div>
    </div>
  );
}
