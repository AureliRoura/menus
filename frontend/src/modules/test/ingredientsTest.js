import { useIngredientsStore } from '@/stores/ingredientsStore';

export default function useIngredientsTest() {
  const store = useIngredientsStore();

  store.clear();
  store.addIngredient({ id: 1, name: 'Ingredient 1', allergens: ['A1', 'A2'] });
  store.addIngredient({ id: 2, name: 'Ingredient 2', allergens: ['A2', 'A3'] });
  store.addIngredient({ id: 3, name: 'Ingredient 3', allergens: ['A1', 'A3'] });
  store.addIngredient({ id: 4, name: 'Ingredient 4', allergens: ['A2', 'A4'] });

}


