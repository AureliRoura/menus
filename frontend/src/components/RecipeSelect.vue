<template>
  <v-row cols="12" md="6" class="mt-1" >
    <v-text-field v-model="filter" label="Filtrar per Nom" outlined clearable></v-text-field>
  </v-row>
  <v-row>
    <v-col cols="12" md="6">
      <v-autocomplete v-model="selectedIngredients" :items="ingredientsList" item-title="name"
        label="Filtrar per Ingredients" multiple clearable chips closable-chips return-object
        @update:model-value="closeDropdownIngredient" ref="autoCompleteRefIngredient">
        <template v-slot:chip="{ props, item }">
          <v-chip v-bind="props" :text="item.raw.name"></v-chip>
        </template>
        <template v-slot:item="{ props, item }">
          <v-list-item v-bind="props" :title="item.raw.name" density="compact"></v-list-item>
        </template>
      </v-autocomplete>
    </v-col>
    <v-col cols="12" md="6">
      <v-autocomplete v-model="selectedCategory" :items="categoriesList" item-title="name" item-value="_id"
        label="Filtrar per Categories" multiple clearable chips closable-chips return-object
        @update:model-value="closeDropdownCategory" ref="autoCompleteRefCategory">
        <template v-slot:chip="{ props, item }">
          <v-chip v-bind="props" :text="item.raw.value"></v-chip>
        </template>
        <template v-slot:item="{ props, item }">
          <v-list-item v-bind="props" :title="item.raw.name" density="compact"
            :class="!item.raw.isDisabled ? 'ml-4' : ''" :disabled="item.raw.isDisabled">
          </v-list-item>
        </template>
      </v-autocomplete>
    </v-col>
  </v-row>
  <slot name="data" v-bind:recipesFiltered = recipesFiltered :count=recipesFiltered.length>

  </slot>
</template>


<script setup>
import { ref, computed, nextTick } from 'vue';
import { useRecipesStore } from '@/stores/recipesStore';



const recipesStore = useRecipesStore();

const autoCompleteRefIngredient = ref(null);
const autoCompleteRefCategory = ref(null);
const recipesList = ref([]);
recipesList.value = recipesStore.recipes;
const selectedIngredients = ref([]);
const selectedCategory = ref([]);

let filter = ref(''); // Valor del filtre

// Computed property per filtrar les receptes
const recipesFiltered = computed(() => {
  // First, filter based on the search text if any
  let filteredBySearch = [];
  if (filter.value) {
    filteredBySearch = recipesList.value.filter(recipe => recipe.name.toLowerCase().includes(filter.value.toLowerCase()));
  } else {
    filteredBySearch = recipesList.value;
  }
  /* 
    // If no ingredients are selected, return the recipes filtered by search
    if (selectedIngredients.value.length !== 0) {
      return filteredBySearch;
    }
   */
  // Further filter recipes that contain all selected ingredients
  let filteredByIngredient = filteredBySearch.filter(recipe => {
    // Convert recipe ingredients to a list of _id for easier comparison
    const recipeIngredientIds = recipe.ingredients.map(ing => ing._id);
    // Check if every selected ingredient is in the recipe's ingredient list
    return selectedIngredients.value.every(selectedIng => recipeIngredientIds.includes(selectedIng._id));
  });

  if (selectedCategory.value.length === 0) {
    return filteredByIngredient;
  }

  let filteredByCategory = filteredByIngredient.filter(recipe => {
    // Ensure recipe.categories exists and is an array before proceeding
    if (!Array.isArray(recipe.categories)) {
      return false; // Skip this recipe if categories are not in the expected format
    }
    // Iterate over each selected category and its values
    return Object.entries(selectedCategory.value).every(([category, selectedValues]) => {
      // Check if the recipe has the category and any of the selected values
      return recipe.categories.some(cat =>
        cat.category === selectedValues.category && cat.values.includes(selectedValues.value)
      );
    });
  });

  return filteredByCategory;

});

// Computed property per obtenir la llista d'ingredients
const ingredientsList = computed(() => {
  return recipesFiltered.value
    .map(recipe => recipe.ingredients)
    .flat()
    .reduce((acc, ingredient) => {
      const isExisting = acc.find(item => item._id === ingredient._id);
      if (!isExisting) {
        acc.push({
          name: ingredient.name,
          _id: ingredient._id
        });
      }
      return acc;
    }, [])
    .sort((a, b) => a.name.localeCompare(b.name)); // Sort the ingredients by name
});

//const categoriesList = ref([]);

const categoriesList = computed(() => {
  const aggregatedCategories = recipesFiltered.value.reduce((acc, recipe) => {
    if (Array.isArray(recipe.categories)) { // Check if categories exists and is an array
      recipe.categories.forEach(category => {
        const existingCategory = acc.find(item => item.category === category.category);
        if (existingCategory) {
          // Merge values arrays without duplicates
          existingCategory.values = [...new Set([...existingCategory.values, ...category.values])];
        } else {
          // Add new category object
          acc.push({
            category: category.category,
            values: category.values
          });
        }
      });
    }
    return acc;
  }, []);
  let pairCategories = [];
  aggregatedCategories.sort((a, b) => a.category.localeCompare(b.category));
  aggregatedCategories.forEach(category => {
    category.values.sort();
    pairCategories.push({ name: category.category, _id: category.category, isDisabled: true });
    category.values.forEach(value => {
      pairCategories.push({ name: '• ' + value, _id: category.category + value, category: category.category, value: value, isDisabled: false });
    });
  });
  return pairCategories;
});


const closeDropdownIngredient = () => {

  nextTick(() => {
    if (autoCompleteRefIngredient.value) {
      autoCompleteRefIngredient.value.blur();
    }
  });

};

const closeDropdownCategory = () => {

  nextTick(() => {
    if (autoCompleteRefCategory.value) {
      autoCompleteRefCategory.value.blur();
    }
  });

};

</script>
