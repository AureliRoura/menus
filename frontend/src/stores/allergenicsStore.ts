import { defineStore } from 'pinia'
import { reactive, computed } from 'vue';

export const useAllergenicsStore = defineStore('allergenics', () => {
  const state = reactive({
    allergenics: [],
  });

  const clear = () => {
    state.allergenics = [];
  };

  const addAlergenic = (alergenic) => {
    state.allergenics.push(alergenic);
  };

  const removeAlergenic = (index) => {
    state.allergenics.splice(index, 1);
  };

  const updateAlergenic = (index, updatedalergenic) => {
    state.allergenics[index] = updatedalergenic;
  };

  const searchByName = (searchTerm) => {
    return state.allergenics.filter(alergenic => alergenic.name.toLowerCase() === searchTerm.toLowerCase());
  };

  const searchById = (searchTerm) => {
    return state.allergenics.filter(alergenic => alergenic._id === searchTerm);
  };

  const allergenics = computed(() => state.allergenics)

  return {
    clear,
    addAlergenic,
    removeAlergenic,
    updateAlergenic,
    searchById,
    searchByName,
    allergenics,
  };
});