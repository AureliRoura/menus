<template>
  <v-card>
    <recipe-select>
      <template #data="{ recipesFiltered }">
        <div class="d-flex justify-space-between text-h6 bg-primary rounded">
          <span class="ml-2">Receptes Seleccionades({{ selectedRecipes.length }})</span>
          <v-btn icon class="mr-2" round size="x-small" @click="dialog = true" :disabled="!selectedRecipes.length">
            <v-icon>mdi-list-box-outline</v-icon>
          </v-btn>
        </div>
        <v-list>
          <div style="height: 120px; overflow-y: auto;" class="border-md">
            <div class="content-container ">
              <v-list-item v-for="(selectedRecipe, index) in selectedRecipes" :key="selectedRecipe.id"
                @mouseover="hover = index" @mouseleave="hover = null"
                :class="hover === index ? 'bg-blue-grey-darken-1' : ''" rounded density="compact">
                <div class="d-flex align-left align-center justify-space-between cursor-pointer"
                  @click="toggleRecipeSelection(selectedRecipe)">
                  <v-list-item-title class=" ml-3 text-wrap" v-text="selectedRecipe.name">
                  </v-list-item-title>
                </div>
              </v-list-item>
            </div>
          </div>
        </v-list>
        <v-list>
          <div style="max-height: calc(100vh - 370px); overflow-y: auto;">
            <!-- Utilitzem recipesFiltered -->
            <v-list-item v-for="(recipe, index) in recipesFiltered" :key="recipe.id" @mouseover="hover2 = index"
              @mouseleave="hover2 = null" :class="hover2 === index ? 'bg-blue-grey-darken-1' : ''" rounded
              density="compact">
              <div class="d-flex flex-row   cursor-pointer"
                @click="toggleRecipeSelection(recipe)">
                <select-rating :rating="recipe?.rating?.[userStore.account] ?? 0" :ratingList="recipe?.rating ?? {}"
                 :readonly="true"></select-rating>
                <v-list-item-title class=" ml-3 text-wrap">
                  <span class="checkmark-container">
                    <span v-if="isSelected(recipe)" class="text-green">✔</span>
                    <span v-else>&nbsp;</span>
                  </span>
                  {{ recipe.name }}
                </v-list-item-title>
              </div>
            </v-list-item>
          </div>
        </v-list>
      </template>
    </recipe-select>
    <aggregate-ingredients v-model:dialog="dialog" :recipeList="selectedRecipes" />
  </v-card>
</template>


<script setup>
import { ref, computed } from 'vue';
import RecipeSelect from './RecipeSelect.vue';
import AggregateIngredients from './AggregateIngredients.vue';
import SelectRating from './SelectRating.vue';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();

let selectedRecipes = ref([]);
let hover = ref(null);
let hover2 = ref(null);
let dialog = ref(false);

const selectedIds = computed(() => selectedRecipes.value.map(recipe => recipe._id));

const isSelected = (recipe) => {
  return selectedIds.value.includes(recipe._id);
};

const toggleRecipeSelection = (recipe) => {
  if (isSelected(recipe)) {
    selectedRecipes.value = selectedRecipes.value.filter(selected => selected._id !== recipe._id);
    hover.value = null;
  } else {
    selectedRecipes.value.push(recipe);
  }
};


</script>

<style scoped>
.text-wrap {
  white-space: normal;
  /* Allows text to wrap */
  word-wrap: break-word;
  /* Breaks long words */

  .checkmark-container {
    display: inline-block;
    width: 1em;
    /* Adjust the width as needed */
    text-align: center;
  }
}
</style>
