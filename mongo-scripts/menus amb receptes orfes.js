use menudb;

var menus = db.menus.find().toArray();
var missingRecipes = [];

menus.forEach(function(menu) {
    var days = Object.keys(menu.menu);
    days.forEach(function(day) {
        ['lunch', 'dinner'].forEach(function(meal) {
            menu.menu[day][meal].forEach(function(recipe) {
                if (!recipe._id || !ObjectId.isValid(recipe._id)) {
                    if (missingRecipes.indexOf(recipe.name) === -1) {
                        missingRecipes.push(recipe.name);
                    }
                } else {
                    var foundRecipe = db.recipes.findOne({ _id: recipe._id });
                    if (!foundRecipe) {
                        if (missingRecipes.indexOf(recipe.name) === -1) {
                            missingRecipes.push(recipe.name);
                        }
                    }
                }
            });
        });
    });
});

printjson(missingRecipes);