import { useRecipesStore } from "@/stores/recipesStore";
import arrxios from './arrxios';

export const getRecipe = async (_id) => { // Removed async since we're directly returning the Promise
  const recipesStore = useRecipesStore();
  return arrxios.get('/api/recipes/' + _id) // Return the Axios promise
    .then(response => {
      if (response.status !== 200) {
        throw new Error('Failed to get menu');
      }
      const currentRecipe = recipesStore.getIndexById(_id);
      recipesStore.updateRecipe(currentRecipe, response.data);
      return response.data; // Optionally return data or any other value
    })
    .catch(error => {
      console.error(error);
      throw error; // Rethrow or handle error as needed
    });
}

export const updateRecipe = async (data) => {
  const recipesStore = useRecipesStore();
  return arrxios.put('/api/recipes/' + data._id, data)
    .then(response => {
      if (response.status !== 200) {
        throw new Error('Failed to update recipe');
      }
      const currentRecipe = recipesStore.getIndexById(data._id);
      recipesStore.updateRecipe(currentRecipe, data);
      return response.data;
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
}

export const deleteRecipe = async (_id, index) => {
  console.log(_id, index)
  const recipesStore = useRecipesStore();
  console.log(_id)
  return arrxios.delete('/api/recipes/' + _id)
    .then(response => {
      if (response.status !== 204) {
        throw new Error('Failed to delete recipe');
      }
      index = recipesStore.getIndexById(_id);
      recipesStore.removeRecipe(index);
      return index;
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
}

export const createRecipe = async (data) => {
  const recipesStore = useRecipesStore();
  return arrxios.post('/api/recipes', data)
    .then(response => {
      if (response.status !== 201) {
        throw new Error('Failed to create recipe');
      }
      recipesStore.addRecipe(response.data);
      return response.data;
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
}

export default {
  getRecipe,
  updateRecipe,
  deleteRecipe,
  createRecipe
}

