import arrxios from './arrxios';


export default function apiIngredients() {
  const addIngredient = async (ingredient) => {
    if (!ingredient._id) {
      try {
        const response = await arrxios.post('/api/ingredients', ingredient);
        if (response.status !== 201) {
          console.error('Failed to add ingredient:', ingredient);
          throw new Error('Failed to add ingredient');
        }
        ingredient._id = response.data._id;
        return ingredient; // Return the updated ingredient with _id
      } catch (error) {
        console.error(error);
        throw error; // Rethrow the error to be caught by the caller
      }
    }
  };

  const updateIngredient = async (ingredient) => {
    if (ingredient._id) {
      try {
        const response = await arrxios.put(`/api/ingredients/${ingredient._id}`, ingredient);
        if (response.status !== 200) {
          console.error('Failed to update ingredient:', ingredient);
          throw new Error('Failed to update ingredient');
        }
        return ingredient; // Return the updated ingredient
      } catch (error) {
        console.error(error);
        throw error; // Rethrow the error to be caught by the caller
      }
    }
  }
  return {
    addIngredient,
    updateIngredient,
  };
}