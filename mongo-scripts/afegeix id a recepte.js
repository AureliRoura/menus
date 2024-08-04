
// Defineix la funció per afegir l'_id de la recepta al menú
function updateMenusWithRecipeIds() {
    // Obtenir tots els menús
    const menus = db.menus.find().toArray();
    
    menus.forEach(menu => {
        const days = Object.keys(menu.menu);
        
        days.forEach(day => {
            const meals = ['lunch', 'dinner'];
            
            meals.forEach(meal => {
                const recipes = menu.menu[day][meal];
                
                recipes.forEach(recipe => {
                    // Trobar l'objecte de la recepta a la col·lecció de receptes
                    const recipeDoc = db.recipes.findOne({ name: recipe.name });
                    
                    if (recipeDoc) {
                        // Afegir l'_id de la recepta al menú
                        recipe._id = recipeDoc._id;
                    }
                });
            });
        });
        
        // Actualitzar el menú amb els _id de les receptes
        db.menus.updateOne(
            { _id: menu._id },
            { $set: { menu: menu.menu } }
        );
    });
}

// Executar la funció
updateMenusWithRecipeIds();
