// Iterar sobre cada receta en la colección 'recipes'
db.recipes.find().forEach(recipe => {
  let updated = false;

  // Iterar sobre cada ingrediente en la receta
  recipe.ingredients.forEach(ingredient => {
    if (!ingredient._id) {
      // Buscar el ingrediente en la colección 'ingredients' por 'name'
      let ingredientDoc = db.ingredients.findOne({ name: ingredient.name });

      if (ingredientDoc) {
        // Actualizar el _id del ingrediente en la receta
        ingredient._id = ingredientDoc._id;
        updated = true;
      } else {
        // Si no se encuentra, agregar el ingrediente a la colección 'ingredients'
        const newIngredientId = new ObjectId();
        db.ingredients.insertOne({
          _id: newIngredientId,
          name: ingredient.name,
          alergenics: []
        });

        // Asignar el nuevo _id al ingrediente en la receta
        ingredient._id = newIngredientId;
        updated = true;

        print(`Ingrediente añadido: ${ingredient.name} con _id: ${newIngredientId}`);
      }
    }
  });

  // Actualizar la receta en la colección 'recipes' si algún ingrediente fue actualizado
  if (updated) {
    db.recipes.updateOne({ _id: recipe._id }, { $set: { ingredients: recipe.ingredients } });
    print(`Receta actualizada: ${recipe._id}`);
  }
});

print("Actualización completada");
