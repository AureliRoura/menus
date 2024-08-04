import { defineStore } from 'pinia'
import { reactive, computed } from 'vue';

export const useRecipesStore = defineStore('recipes', () => {
  const state = reactive({
    recipes: [],
  });

  const clear = () => {
    state.recipes = [];
  };

  const addRecipe = (recipe) => {
    state.recipes.push(recipe);
  };

  const removeRecipe = (index) => {
    state.recipes.splice(index, 1);
  };

  const updateRecipe = (index, updatedRecipe) => {
    state.recipes[index] = updatedRecipe;
  };

  const searchByRecipe = (searchTerm) => {
    return state.recipes.filter(recipe => recipe.name.toLowerCase() === searchTerm.toLowerCase());
  };

  const searchById = (searchTerm) => {
    return state.recipes.filter(recipe => recipe._id === searchTerm);
  };

  const getIndexById = (_id) => {
    return state.recipes.findIndex(recipe => recipe._id === _id);
  };

  const recipes = computed(() => state.recipes)

  return {
    clear,
    addRecipe,
    removeRecipe,
    updateRecipe,
    searchByRecipe,
    searchById,
    getIndexById,
    recipes,
  };
});