<template>
  <div>  
        <span class="hover-cursor" @click="showText = !showText">
          <v-table>
            <tbody>
              <tr class="bg-grey text-black">
                <td>{{ recipe.name }}</td>
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
import { ref, watch } from 'vue';

const showText = ref(false);

const props = defineProps({
  recipe : Object,
});

const recipe = ref(props.recipe);

watch(() => props.recipe, (newRecipe) => {
  recipe.value = newRecipe;
  showText.value = false;
});
</script>

<style scoped>
.hover-cursor {
  cursor: pointer;
}
</style>