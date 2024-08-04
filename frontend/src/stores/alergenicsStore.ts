import { defineStore } from 'pinia'
import { reactive, computed } from 'vue';

export const useAlergenicsStore = defineStore('alergenics', () => {
  const state = reactive({
    alergenics: [],
  });

  const clear = () => {
    state.alergenics = [];
  };

  const addAlergenic = (alergenic) => {
    state.alergenics.push(alergenic);
  };

  const removeAlergenic = (index) => {
    state.alergenics.splice(index, 1);
  };

  const updateAlergenic = (index, updatedalergenic) => {
    state.alergenics[index] = updatedalergenic;
  };

  const searchByName = (searchTerm) => {
    return state.alergenics.filter(alergenic => alergenic.name.toLowerCase() === searchTerm.toLowerCase());
  };

  const searchById = (searchTerm) => {
    return state.alergenics.filter(alergenic => alergenic.id === searchTerm);
  };

  const alergenics = computed(() => state.alergenics)

  return {
    clear,
    addAlergenic,
    removeAlergenic,
    updateAlergenic,
    searchById,
    searchByName,
    alergenics,
  };
});