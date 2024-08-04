const menu = db.getCollection("menus").findOne({ name: /wilson/i });

const updateRecipeCategories = (menu) => {
  const days = Object.keys(menu.menu);
  days.forEach(day => {
    const meals = Object.keys(menu.menu[day]);
    meals.forEach(meal => {
      menu.menu[day][meal].forEach(recipe => {
        db.getCollection("recipes").updateOne(
          { _id: recipe._id },
          { $addToSet: { categories: { category: 'Wilson', values: ['Si'] } } }
        );
      });
    });
  });
};
