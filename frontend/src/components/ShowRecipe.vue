<template>
  <div>
    <span class="hover-cursor" @click="showText = !showText">
      <v-table>
        <tbody>
          <tr class="bg-grey text-black d-flex">
            {{ recipe.name }}
            <span v-if="allergenics.length" class="allergenics-container">
              <div v-for="(allergenic, index) in allergenics" :key="index" class="symbol-text">
                <div  style="min-width: 30px;">
                  {{ allergenic.symbol }}
                </div>
                  <v-tooltip bottom activator="parent">
                    <div class="bg-primary">
                      {{ allergenic.name }}
                    </div>
                  </v-tooltip>
              </div>
            </span>
          </tr>
        </tbody>
      </v-table>
    </span>
    <v-slide-y-transition>
      <div v-if="showText">
        <div v-if="recipe.ingredients && recipe.ingredients.length">
          <h3>Ingredients:</h3>
          <v-list density="compact" class="text-justify">
            <v-list-item v-for="(value, key) in recipe.ingredients" :key="key">
              {{ key + 1 + ': ' + value.name + ' - ' }}
              <span v-if="value.quantity > 0"> {{ value.quantity + ' ' }}</span>
              <span> {{ value.unit }} </span>
            </v-list-item>
          </v-list>
        </div>
        <div v-if="recipe.steps && recipe.steps.length">
          <h3>Passos:</h3>
          <v-list density="compact" class="text-justify">
            <v-list-item v-for="(step, index) in recipe.steps" :key="index">
              {{ index + 1 }}. {{ step }}
            </v-list-item>
          </v-list>
        </div>
        <div v-if="recipe.desc">

          <br>
          <p v-html="recipe.desc.replace(/\./g, '.<br>')"></p>
          <br>
        </div>
        <p>Temps de cocció: {{ recipe.time }}</p>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useIngredientsStore } from '@/stores/ingredientsStore';
import { useAllergenicsStore } from '@/stores/allergenicsStore';

const showText = ref(false);
const ingredientsStore = useIngredientsStore();
const allergenicsStore = useAllergenicsStore();

const props = defineProps({
  recipe: Object,
});

const recipe = ref(props.recipe);

watch(() => props.recipe, (newRecipe) => {
  recipe.value = newRecipe;
  showText.value = false;
});

const allergenics = computed(() => {
  // get all aleregincs from ingredients without duplicates

  let allergenics = [];
  if (recipe.value.ingredients) {
    recipe.value.ingredients.forEach(ingredient => {
      const allergenicsIngredient = ingredientsStore.getAllergenics(ingredient._id);
      if (allergenicsIngredient) {
        allergenicsIngredient.forEach(allergenic => {
          const allergen = allergenicsStore.searchById(allergenic._id)[0]
          if (!allergenics.includes(allergen)) {
            allergenics.push(allergen);
          }
        });
      }
    });
  }
  return allergenics;
});

</script>

<style scoped>
.hover-cursor {
  cursor: pointer;
}

.allergenics-container {
  display: flex;
  flex-wrap: wrap;

}

.symbol-text {
  display: flex;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  width: 50%; /* Each item takes up 50% of the container width */
}
</style>