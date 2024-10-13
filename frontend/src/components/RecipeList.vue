<template>
  <v-card>
    <v-row cols="12" md="6">
      <v-text-field v-model="filter" label="Filtrar per Nom" outlined></v-text-field>
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
    <v-list>
      <v-list-item class="text-h6 bg-primary" density="compact" rounded>
        <div class="d-flex justify-space-between">
          Receptes ({{ recipesFiltered.length }})
          <v-list-item-action>
            <v-icon @click="addRecipe()">mdi-plus</v-icon>
          </v-list-item-action>
        </div>
      </v-list-item>
      <div style="max-height: calc(100vh - 370px); overflow-y: auto;">
        <!-- Utilitzem recipesFiltered en lloc de recipesList -->
        <v-list-item v-for="(recipe, index) in recipesFiltered" :key="recipe.id" @mouseover="hover = index"
          @mouseleave="hover = null" :class="hover === index ? 'bg-blue-grey-darken-1' : ''" rounded density="compact">
          <div class="d-flex justify-space-between">
            <div class="d-flex align-left align-center">
              <select-rating :rating="recipe?.rating?.[userStore.account] ?? 0" :ratingList="recipe?.rating ?? {}"
                @update:rating="updateRating($event, recipe._id)"></select-rating>
              <v-list-item-title class="cursor-pointer ml-3 text-wrap" v-text="recipe.name"
                @click="selectRecipe(recipe)"></v-list-item-title>
            </div>
            <v-list-item-action>
              <v-icon color="red" @click="deleteRecipe(recipe, index)">mdi-delete</v-icon>
            </v-list-item-action>
          </div>
        </v-list-item>
      </div>
      <edit-recipe v-model:dialog="dialog" :recipe="selectedRecipe" :readonly="true" @submit="handleFormSubmit" />
    </v-list>
  </v-card>
</template>


<script setup>
import { ref, inject, reactive, computed, nextTick } from 'vue';
import { useRecipesStore } from '@/stores/recipesStore';
import { useUserStore } from '@/stores/userStore';
import { addMessage } from '@/modules/arrMessage';
import EditRecipe from '@/components/EditRecipe.vue';
import recipes from '@/modules/recipes';
import SelectRating from '@/components/SelectRating.vue'
import arrxios from '@/modules/arrxios';

const recipesStore = useRecipesStore();
const userStore = useUserStore();

const confirmMessage = inject('confirmMessage');
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
  let filteredBySearch = recipesList.value;
  if (filter.value) {
    filteredBySearch = recipesList.value.filter(recipe => recipe.name.toLowerCase().includes(filter.value.toLowerCase()));
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


let selectedRecipe = ref(null);
let hover = ref(null);
let dialog = ref(false);
let operation = '';

const handleFormSubmit = (formData) => {
  if (operation === 'add') {
    recipes.createRecipe(formData);
    addMessage('Recepta afegida');
  } else {
    recipes.updateRecipe(formData);
    addMessage('Recepta actualitzada');
  }

  //console.log('handleFormSubmit', formData);
};

const selectRecipe = (recipe) => {
  operation = 'edit';
  selectedRecipe.value = recipe;
  dialog.value = true;
};

const deleteRecipe = (recipe, index) => {
  operation = 'delete';
  confirmMessage(`Estas segur que vols elminar la recepte: ${recipe.name}?`)
    .then((result) => {
      if (result) {
        recipes.deleteRecipe(recipe._id, index)
          .then(() => {
            addMessage('Recepta eliminada');
          })
          .catch(() => {
            addMessage('Error eliminant la recepta', 'error');
          });
      }
    })
    .catch(() => {
      addMessage('Error eliminant la recepta', 'error');
    });
};

const addRecipe = () => {
  operation = 'add';
  const recipe = reactive({
    id: '',
    name: '',
    description: '',
    time: '',
    ingredients: [],
    categories: [],
    rating: {}
  });

  selectedRecipe.value = recipe;
  dialog.value = true;
  //console.log('addRecipe');
};

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
const updateRating = (newRating, recipeId) => {
  const aux = `rating.${userStore.account}`;
  arrxios.put(`/api/recipes/${recipeId}`, { [aux]: newRating })
    .then(() => {
      addMessage('Valoració actualitzada');
      const rec = recipesStore.searchById(recipeId)[0];
      if (!rec.rating) {
        rec.rating = {};
      }
      rec.rating[userStore.account] = newRating;
    })
    .catch((error) => {
      console.log(error);
      addMessage('Error al modificar la valoració', 'error');
    });
}

</script>

<style scoped>
.text-wrap {
  white-space: normal;
  /* Allows text to wrap */
  word-wrap: break-word;
  /* Breaks long words */
}
</style>
