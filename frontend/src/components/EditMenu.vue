<template>
  <div>
    <h2>
      <slot name="title"></slot>
    </h2>
    <v-autocomplete v-model="selectedDinner" :items="availableRecipes" item-title="name" item-value="_id"
      label="Select a recipe for dinner" @update:model-value="addRecipe(selectedDinner)" closable-chips chips multiple>
    </v-autocomplete>
    <div>
      <v-row justify="center">
        <div style="height: 220px;  flex-wrap: wrap; overflow-y: auto; overflow-x: hidden; width: 100%;">
          <v-col cols="12" v-for="(recipe, index) in menu" :key="index">
            <v-chip class="multiline-chip" @click="removeRecipe(index)">
              {{ recipe.name }}
            </v-chip>
          </v-col>
        </div>
      </v-row>
    </div>
  </div>


</template>

<script setup>
import { ref, computed } from 'vue';
import { useRecipesStore } from '@/stores/recipesStore';

const recipesStore = useRecipesStore();

let recipes = ref();

recipes.value = recipesStore.recipes;

const props = defineProps({
  menu: {
    type: Object,
    default: () => ([])
  },
});

const menu = ref(props.menu);


let selectedDinner = ref(null);

const availableRecipes = computed(() => {
  return recipes.value.filter(recipe => !menu.value.map(r => r._id).includes(recipe._id));
});

// Function to add a recipe to lunch or dinner
const addRecipe = (selected) => {
  console.log('addRecipe', selected);
  console.log('recipes', recipes.value);
  menu.value.push(...recipes.value.filter(recipe => selected.includes(recipe._id)));
  selectedDinner.value = [];
};

// Function to remove a recipe from lunch or dinner
const removeRecipe = (index) => {
  console.log('removeRecipe', index);
  event.stopPropagation();
  menu.value.splice(index, 1);
};
</script>

<style scoped>
.multiline-chip {
  white-space: normal !important;
  height: auto !important;
}
</style>