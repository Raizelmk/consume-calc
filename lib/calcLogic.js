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
// src/lib/calcLogic.js

export function calculateTotals(selectedItems, recipes, prices) {
  const rawMaterials = {};
  const intermediates = {};

  // We add a 'stack' parameter to track the current path
  function processItem(itemName, quantity, stack = []) {
    // Check if we've already seen this item in the current path
    if (stack.includes(itemName)) {
      console.error(`LOOP DETECTED: ${stack.join(' -> ')} -> ${itemName}`);
      return; // Stop the recursion for this branch
    }

    const recipe = recipes.find(r => r.name === itemName);

    if (!recipe) {
      if (!rawMaterials[itemName]) {
        rawMaterials[itemName] = { quantity: 0, unitPrice: prices[itemName] || 0 };
      }
      rawMaterials[itemName].quantity += quantity;
      return;
    }

    if (!intermediates[itemName]) {
      intermediates[itemName] = { quantity: 0 };
    }
    intermediates[itemName].quantity += quantity;

    recipe.ingredients.forEach(ing => {
      const yieldAmt = recipe.yield || 1;
      const requiredQty = (ing.amount * quantity) / yieldAmt;
      
      // Pass the updated stack into the next call
      processItem(ing.name, requiredQty, [...stack, itemName]);
    });
  }

  // ... rest of the function (selectedItems.forEach) ...
  selectedItems.forEach(goal => {
    processItem(goal.name, goal.quantity);
  });

  return { rawMaterials, intermediates };
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