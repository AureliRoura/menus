import { useIngredientsStore } from "@/stores/ingredientsStore";
import { useCategoriesStore } from "@/stores/categoriesStore";
import { useUnitsStore } from "@/stores/unitsStore";
import { useRecipesStore } from "@/stores/recipesStore";
import { useMenusStore } from "@/stores/menusStore";
import { useAlergenicsStore } from "@/stores/allergenicsStore";
import arrxios from './arrxios';

export const loadIngredients = async () => {
  const ingredientsStore = useIngredientsStore();
  ingredientsStore.clear();
  arrxios.get('/api/ingredients')
    .then(response => {
      for (const ingredient of response.data) {
        ingredientsStore.addIngredient(ingredient);
      }
    })
    .catch(error => {
      console.error(error);
    });
};

export const loadCategories = async () => {
  const categoriesStore = useCategoriesStore();
  categoriesStore.clear();
  arrxios.get('/api/categories')
    .then(response => {
      for (const category of response.data) {
        categoriesStore.addCategory(category);
      }
    })
    .catch(error => {
      console.error(error);
    });
};

export const loadUints = async () => {
  const unitsStore = useUnitsStore();
  unitsStore.clear();
  arrxios.get('/api/units')
    .then(response => {
      for (const unit of response.data) {
        unitsStore.addunit(unit);
      }
    })
    .catch(error => {
      console.error(error);
    });
};

export const loadAlergenics = async () => {
  const allergenicsStore = useAlergenicsStore();
  allergenicsStore.clear();
  arrxios.get('/api/allergenics')
    .then(response => {
      for (const alergenic of response.data) {
        allergenicsStore.addAlergenic(alergenic);
      }
    })
    .catch(error => {
      console.error(error);
    });
}

export const loadRecipes = async () => {
  const recipesStore = useRecipesStore();
  recipesStore.clear();
  arrxios.get('/api/recipes')
    .then(response => {
      for (const recipe of response.data) {
        recipesStore.addRecipe(recipe);
      }
    })
    .catch(error => {
      console.error(error);
    });
}

export const loadMenus = async () => {
  const menusStore = useMenusStore();
  menusStore.clear();
  arrxios.get('/api/menus/list')
    .then(response => {
      for (const menu of response.data) {
        menusStore.addMenu(menu);
      }
    })
    .catch(error => {
      console.error(error);
    });
}

export const loadAllData = async () => {
  loadCategories();
  loadIngredients();
  loadUints();
  loadAlergenics();
  loadRecipes();
  loadMenus();
}

export default {
  loadCategories,
  loadIngredients,
  loadUints,
  loadRecipes,
  loadMenus,
  loadAllData,
};
