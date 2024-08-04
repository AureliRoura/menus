// Conjunto de días y comidas que necesitamos procesar
const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const meals = ['lunch', 'dinner'];

// Obtener todos los documentos en la colección 'menus'
db.menus.find().forEach(menu => {
  let updated = false;

  // Iterar sobre cada día de la semana
  days.forEach(day => {
    if (menu.menu && menu.menu[day]) {
      // Iterar sobre cada tipo de comida (lunch, dinner)
      meals.forEach(meal => {
        if (menu.menu[day][meal]) {
          // Convertir los _id de cada receta dentro del array a ObjectId si es necesario
          menu.menu[day][meal] = menu.menu[day][meal].map(recipe => {
            if (recipe._id && typeof recipe._id === 'string') {
              recipe._id = ObjectId(recipe._id);
              updated = true;
            }
            return recipe;
          });
        }
      });
    }
  });

  // Actualizar el documento si se ha hecho algún cambio
  if (updated) {
    db.menus.updateOne({ _id: menu._id }, { $set: { menu: menu.menu } });
    print(`Documento con _id: ${menu._id} actualizado`);
  }
});

print("Actualización completada");

