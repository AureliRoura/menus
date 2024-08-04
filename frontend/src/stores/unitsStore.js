import { defineStore } from 'pinia'
import { reactive, computed } from 'vue';

export const useUnitsStore = defineStore('units', () => {
  const state = reactive({
    units: [],
  });

  const clear = () => {
    state.units = [];
  };

  const addunit = (unit) => {
    state.units.push(unit);
  };

  const removeunit = (index) => {
    state.units.splice(index, 1);
  };

  const updateunit = (index, updatedunit) => {
    state.units[index] = updatedunit;
  };

  const searchByunit = (searchTerm) => {
    return state.units.filter(unit => unit.name.toLowerCase() === searchTerm.toLowerCase());
  };

  const searchById = (searchTerm) => {
    return state.units.filter(unit => unit._id === searchTerm);
  };

  const units = computed(() => state.units)

  return {
    clear,
    addunit,
    removeunit,
    updateunit,
    searchByunit,
    searchById,
    units,
  };
});