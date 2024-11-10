import { useIngredientsStore } from "@/stores/ingredientsStore";
import arrxios from './arrxios';

export const getIngredient = async (_id) => { // Removed async since we're directly returning the Promise
  const ingredientsStore = useIngredientsStore();
  return arrxios.get('/api/ingredients/' + _id) // Return the Axios promise
    .then(response => {
      if (response.status !== 200) {
        throw new Error('Failed to get menu');
      }
      const currentIngredient = ingredientsStore.getIndexById(_id);
      ingredientsStore.updateIngredient(currentIngredient, response.data);
      return response.data; // Optionally return data or any other value
    })
    .catch(error => {
      console.error(error);
      throw error; // Rethrow or handle error as needed
    });
}

export const updateIngredient = async (data) => {
  const ingredientsStore = useIngredientsStore();
  return arrxios.put('/api/ingredients/' + data._id, data)
    .then(response => {
      if (response.status !== 200) {
        throw new Error('Failed to update ingredient');
      }
      const currentIngredient = ingredientsStore.getIndexById(data._id);
      ingredientsStore.updateIngredient(currentIngredient, data);
      return response.data;
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
}

export const deleteIngredient = async (_id, index) => {
  console.log(_id, index)
  const ingredientsStore = useIngredientsStore();
  return arrxios.delete('/api/ingredients/' + _id)
    .then(response => {
      if (response.status !== 204) {
        throw new Error('Failed to delete ingredient');
      }
      const IngredientIndex = ingredientsStore.getIndexById(_id);
      if (IngredientIndex !== -1) {
        ingredientsStore.removeIngredient(IngredientIndex)
        };
      return IngredientIndex;
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
}

export const createIngredient = async (data) => {
  const ingredientsStore = useIngredientsStore();
  return arrxios.post('/api/ingredients', data)
    .then(response => {
      if (response.status !== 201) {
        throw new Error('Failed to create ingredient');
      }
      ingredientsStore.addIngredient(response.data);
      return response.data;
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
}

export default {
  getIngredient,
  updateIngredient,
  deleteIngredient,
  createIngredient
}

