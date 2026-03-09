/**
 * calcLogic.js
 * Core logic for breaking down recipes into raw materials and copper costs.
 */

/**
 * Main function to calculate total shopping list
 * @param {Array} selectedItems - List of { name: string, quantity: number }
 * @param {Array} recipes - The JSON array of all recipes
 * @param {Object} prices - Object mapping item names to copper values
 * @returns {Object} Total breakdown of raw materials and costs
 */
export function calculateTotals(selectedItems, recipes, prices) {
  const totals = {};

  // 1. Process each item the user wants to make
  selectedItems.forEach(({ name, quantity }) => {
    const breakdown = getRawMaterials(name, quantity, recipes);
    
    // 2. Merge this breakdown into our master totals list
    Object.keys(breakdown).forEach(material => {
      if (!totals[material]) {
        totals[material] = {
          quantity: 0,
          unitPrice: prices[material] || 0,
          totalCopper: 0
        };
      }
      totals[material].quantity += breakdown[material];
    });
  });

  // 3. Finalize math for each row
  Object.keys(totals).forEach(material => {
    totals[material].totalCopper = totals[material].quantity * totals[material].unitPrice;
  });

  return totals;
}

/**
 * Recursive function to break an item down into its "Base" materials
 */
function getRawMaterials(itemName, quantity, recipes) {
  const recipe = recipes.find(r => r.name === itemName);
  const materials = {};

  // BASE CASE: If there is no recipe for this item, it is a "Raw Material" (Herbs, Vials, etc.)
  if (!recipe) {
    materials[itemName] = quantity;
    return materials;
  }

  // RECURSIVE STEP: If it HAS a recipe, break down each ingredient
  recipe.ingredients.forEach(ing => {
    // Note: Some recipes produce more than 1 item (e.g., Alchemy procs or 1 recipe = 5 potions)
    // We adjust the multiplier based on the 'yield' if your data has it. 
    // Defaulting to 1 for standard vanilla recipes.
    const yieldAmount = recipe.yield || 1;
    const requiredQty = (ing.amount * quantity) / yieldAmount;

    const subBreakdown = getRawMaterials(ing.name, requiredQty, recipes);

    // Merge sub-breakdown into current level
    Object.keys(subBreakdown).forEach(subMat => {
      materials[subMat] = (materials[subMat] || 0) + subBreakdown[subMat];
    });
  });

  return materials;
}

/**
 * Helper to calculate total copper for a final list
 */
export function getTotalCopper(totals) {
  return Object.values(totals).reduce((sum, item) => sum + item.totalCopper, 0);
}