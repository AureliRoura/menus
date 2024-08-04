import { defineStore } from 'pinia'
import { reactive, computed } from 'vue';

export const useCategoriesStore = defineStore('categories', () => {
  const state = reactive({
    categories: [],
  });

  const clear = () => {
    state.categories = [];
  };

  const addCategory = (category) => {
    if (category.category && category.category.length > 0) {
      state.categories.push(category);
    } else {
      console.error('Failed to add category:', category);
    }
  };

  const removeCategory = (index) => {
    state.categories.splice(index, 1);
  };

  const updateCategory = (index, updatedCategory) => {
    state.categories[index] = updatedCategory;
  };

  const searchByCategory = (searchTerm) => {
    return state.categories.filter(category => category.category.toLowerCase() === searchTerm.toLowerCase());
  };


  const getIndexByCategory = (searchTerm) => {
/*
     console.log('getIndexByCategory:', searchTerm);
    console.log('getIndexByCategory:', state.categories);
    console.log('getIndexByCategory:', state.categories.findIndex(category => category.category === searchTerm));
 */
    return state.categories.findIndex(category => category.category === searchTerm);
  };

const addValueToCategory = (category, value) => {
  const index = getIndexByCategory(category);
  if (index > -1) {
    addValueToCategoryByIndex(index, value);
  } else {
    console.error('Failed to add value to category:', category, value);
  }
}


const addValueToCategoryByIndex = (categoryIndex, value) => {
  state.categories[categoryIndex].values.push(value);
}

  return {
    categories: computed(() => state.categories),
    clear,
    addCategory,
    removeCategory,
    updateCategory,
    searchByCategory,
    getIndexByCategory,
    addValueToCategory,
    addValueToCategoryByIndex,
  };
});