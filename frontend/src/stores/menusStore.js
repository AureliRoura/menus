import { defineStore } from 'pinia'
import { reactive, computed } from 'vue';

export const useMenusStore = defineStore('menus', () => {
  const state = reactive({
    menus: [],
  });

  const clear = () => {
    state.menus = [];
  };

  const addMenu = (menu) => {
    state.menus.push(menu);
  };

  const removeMenu = (index) => {
    state.menus.splice(index, 1);
  };

  const updateMenu = (index, updatedMenu) => {
    state.menus[index] = updatedMenu;
  };

  const searchByMenu = (searchTerm) => {
    return state.menus.filter(menu => menu.name.toLowerCase() === searchTerm.toLowerCase());
  };

  const searchById = (searchTerm) => {
    return state.menus.filter(menu => menu._id === searchTerm);
  };

  const getIndexById = (searchTerm) => {
    return state.menus.findIndex(menu => menu._id === searchTerm);
  };

  const menus = computed(() => state.menus)

  return {
    clear,
    addMenu,
    removeMenu,
    updateMenu,
    searchByMenu,
    searchById,
    getIndexById,
    menus,
  };
});