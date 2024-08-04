use menudb;

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const meals = ['lunch', 'dinner'];

// Función para buscar la receta y actualizar el menú
function findAndUpdateRecipe(menuId, day, meal, recipe) {
  print (menuId, day, meal, recipe._id, recipe.name);  
  let recipeDetails = db.recipes.findOne({ _id: ObjectId(recipe._id) });

  if (!recipeDetails) {
    // Si no se encuentra por _id, buscar por name
    print (menu._id, day, meal, recipe._id, recipe.name);
    recipeDetails = db.recipes.findOne({ name: recipe.name });
    if (recipeDetails) {
      // Actualizar el menú con el nuevo _id de la receta
      print (menu._id, day, meal, recipe._id, recipe.name, recipeDetails._id)
      db.menus.updateOne(
        { _id: ObjectId(menuId), [`menu.${day}.${meal}._id`]: recipe._id },
        { $set: { [`menu.${day}.${meal}.$[elem]._id`]: ObjectId(recipeDetails._id) } },
        { arrayFilters: [{ 'elem._id': recipe._id }] }
      );
    }
  }
}

// Obtener todos los menús
const menus = db.menus.find().toArray();

menus.forEach(menu => {
  days.forEach(day => {
    meals.forEach(meal => {
      if (menu.menu[`${day}`] && menu.menu[`${day}`][`${meal}`]) {
        menu.menu[`${day}`][`${meal}`].forEach(recipe => {
          findAndUpdateRecipe(menu._id, day, meal, recipe);
        });
      }
    });
  });
});

print("Menús actualizados con detalles de recetas");
