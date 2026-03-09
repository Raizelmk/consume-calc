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

/**
 * Get detailed breakdown with hierarchical intermediates
 * @param {Array} selectedItems - List of { name: string, quantity: number }
 * @param {Array} recipes - The JSON array of all recipes
 * @param {Object} prices - Object mapping item names to copper values
 * @returns {Object} { intermediates: Array, rawMaterials: Object }
 */
export function getDetailedBreakdown(selectedItems, recipes, prices) {
  const intermediatesMap = new Map(); // Track intermediates with their quantities
  const rawMaterials = {};

  // Build a set of all item names that have recipes (potential intermediates)
  const recipeNames = new Set(recipes.map(r => r.name));

  // Process each selected item
  selectedItems.forEach(({ name, quantity }) => {
    processItemHierarchy(name, quantity, recipes, recipeNames, intermediatesMap, rawMaterials);
  });

  // Convert intermediatesMap to array and calculate costs
  const intermediates = Array.from(intermediatesMap.values()).map(intermediate => ({
    ...intermediate,
    totalCopper: intermediate.quantity * (prices[intermediate.name] || 0)
  }));

  // Calculate costs for raw materials
  Object.keys(rawMaterials).forEach(material => {
    rawMaterials[material] = {
      quantity: rawMaterials[material],
      unitPrice: prices[material] || 0,
      totalCopper: rawMaterials[material] * (prices[material] || 0)
    };
  });

  return { intermediates, rawMaterials };
}

/**
 * Process an item recursively to identify intermediates vs raw materials
 */
function processItemHierarchy(itemName, quantity, recipes, recipeNames, intermediatesMap, rawMaterials) {
  const recipe = recipes.find(r => r.name === itemName);

  // BASE CASE: No recipe = raw material
  if (!recipe) {
    rawMaterials[itemName] = (rawMaterials[itemName] || 0) + quantity;
    return;
  }

  // INTERMEDIATE: This item has a recipe, so track it
  if (!intermediatesMap.has(itemName)) {
    intermediatesMap.set(itemName, {
      name: itemName,
      quantity: 0,
      ingredients: []
    });
  }

  const intermediate = intermediatesMap.get(itemName);
  intermediate.quantity += quantity;

  // RECURSIVE: Process each ingredient
  recipe.ingredients.forEach(ing => {
    const yieldAmount = recipe.yield || 1;
    const requiredQty = (ing.amount * quantity) / yieldAmount;

    if (recipeNames.has(ing.name)) {
      // This ingredient is itself an intermediate
      processItemHierarchy(ing.name, requiredQty, recipes, recipeNames, intermediatesMap, rawMaterials);
      // Track it in the intermediate's ingredients list
      const existingIng = intermediate.ingredients.find(i => i.name === ing.name);
      if (existingIng) {
        existingIng.amount += requiredQty;
      } else {
        intermediate.ingredients.push({ name: ing.name, amount: requiredQty });
      }
    } else {
      // This ingredient is a raw material
      rawMaterials[ing.name] = (rawMaterials[ing.name] || 0) + requiredQty;
      // Also track it in the intermediate's ingredients list
      const existingIng = intermediate.ingredients.find(i => i.name === ing.name);
      if (existingIng) {
        existingIng.amount += requiredQty;
      } else {
        intermediate.ingredients.push({ name: ing.name, amount: requiredQty });
      }
    }
  });
}