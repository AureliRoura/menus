import { useMenusStore } from "@/stores/menusStore";
import arrxios from './arrxios';

export const getMenu = (_id) => { // Removed async since we're directly returning the Promise
  const menusStore = useMenusStore();
  return arrxios.get('/api/menus/withrecipes/' + _id) // Return the Axios promise
    .then(response => {
      if (response.status !== 200) {
        throw new Error('Failed to get menu');
      }
      const currentMenu = menusStore.getIndexById(_id);
      menusStore.updateMenu(currentMenu, response.data);
      return response.data; // Optionally return data or any other value
    })
    .catch(error => {
      console.error(error);
      throw error; // Rethrow or handle error as needed
    });
}

export const createMenu = async (data) => {
  const menusStore = useMenusStore();
  return arrxios.post('/api/menus', data)
    .then(response => {
      if (response.status !== 201) {
        throw new Error('Failed to create menu');
      }
      console.log(response.data);
      menusStore.addMenu(response.data);
      return response.data;
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
}

export const deleteMenu = async (_id, index) => {
  const menusStore = useMenusStore();
  return arrxios.delete('/api/menus/' + _id)
    .then(response => {
      if (response.status == 404) {
        throw new Error('Menu no trobat');
      }
      if (response.status !== 204) {
        throw new Error('Error al eliminar el menu');
      }
      menusStore.removeMenu(index);
      return response.data;
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
}

export default {
  getMenu,
  createMenu,
  deleteMenu,
}

