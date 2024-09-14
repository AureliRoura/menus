export default function aggregateIngredients(menuData, numberOfPersons) {
  const result = {};
  
  Object.values(menuData).forEach(day => {
    Object.values(day).forEach(meals => {
      meals.forEach(recipe => {
        if (!recipe.servings || recipe.servings < 1) {
          recipe.servings = 1;
        }
        recipe.ingredients.forEach(ingredient => {
          // Create a composite key using ingredient name and unit
          const key = `${ingredient.name}_${ingredient.unit}`;
          if (!result[key]) {
            result[key] = { name: ingredient.name, quantity: 0, unit: ingredient.unit };
          }
          // Multiply ingredient quantity by the number of persons
          result[key].quantity += ingredient.quantity / recipe.servings * numberOfPersons;
        });
      });
    });
  });

  // Convert the result object into an array of ingredient objects
  const ingredientsArray = Object.values(result);

  // Ordena l'array per nom d'ingredient
  ingredientsArray.sort((a, b) => a.name.localeCompare(b.name));

  return ingredientsArray;
}
