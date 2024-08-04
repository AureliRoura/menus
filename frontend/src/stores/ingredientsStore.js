import { defineStore } from 'pinia'
import { reactive, computed } from 'vue';
import arrxios from '@/modules/arrxios.js';

export const useIngredientsStore = defineStore('ingredients', () => {
  const state = reactive({
    ingredients: [],
  });

  const clear = () => {
    state.ingredients = [];
  };

  const addIngredient = (ingredient) => {
    if (ingredient._id && ingredient._id.length > 0) {
      state.ingredients.push(ingredient);
    } else {
      console.error('Failed to add ingredient:', ingredient);
    }
  };

  const removeIngredient = (index) => {
    state.ingredients.splice(index, 1);
  };

  const updateIngredient = (index, updatedIngredient) => {
    state.ingredients[index] = updatedIngredient;
  };

  const searchByIngredient = (searchTerm) => {
    return state.ingredients.filter(ingredient => ingredient.name.toLowerCase() === searchTerm.toLowerCase());
  };

  const searchById = (searchTerm) => {
    return state.ingredients.filter(ingredient => ingredient._id === searchTerm);
  };

  const getIndexById = (searchTerm) => {
  return state.ingredients.findIndex(ingredient => ingredient._id === searchTerm);
};

  const getAllergens = (_id) => {
    const ingredient = state.ingredients.find(ingredient => ingredient._id === _id);
    return ingredient ? ingredient.allergens : [];
  };

  return {
    ingredients: computed(() => state.ingredients),
    clear,
    addIngredient,
    removeIngredient,
    updateIngredient,
    searchByIngredient,
    searchById,
    getAllergens,
    getIndexById,
  };
});