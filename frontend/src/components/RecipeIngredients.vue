<template>
  <v-card>
    <recipe-filter v-model:selectedRecipes="selectedRecipes">
      <template v-slot:action>
        <v-btn icon class="mr-2" round size="x-small" @click="dialog = true" :disabled="!selectedRecipes.length">
          <v-icon>mdi-list-box-outline</v-icon>
        </v-btn>
      </template>
    </recipe-filter>
    <aggregate-ingredients v-model:dialog="dialog" :recipeList="selectedRecipes" />
  </v-card>
</template>


<script setup>
import { ref } from 'vue';
import AggregateIngredients from './AggregateIngredients.vue';
import RecipeFilter from './RecipeFilter.vue';


let dialog = ref(false);
const selectedRecipes = ref([]);

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
