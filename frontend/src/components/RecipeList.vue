<template>
  <v-card>
    <recipe-select>
      <template #data="{ recipesFiltered }">
        <v-list>
          <v-list-item class="text-h6 bg-primary" density="compact" rounded>
            <div class="d-flex justify-space-between">
              Receptes ({{ recipesFiltered.length }})
              <v-list-item-action>
                <v-icon @click="addRecipe()">mdi-plus</v-icon>
              </v-list-item-action>
            </div>
          </v-list-item>
          <!-- <div style="max-height: calc(100vh - 370px); overflow-y: auto;"> -->
          <div :style="{ maxHeight: maxHeight, overflowY: 'auto'}">
          <!-- <div style="max-height: 50vh; overflow-y: auto;"> -->
            <!-- Utilitzem recipesFiltered en lloc de recipesList -->
            <v-list-item v-for="(recipe, index) in recipesFiltered" :key="recipe.id" @mouseover="hover = index"
              @mouseleave="hover = null" :class="hover === index ? 'bg-blue-grey-darken-1' : ''" rounded
              density="compact">
              <div class="d-flex justify-space-between">
                <div class="d-flex align-left align-center ">
                  <select-rating :rating="recipe?.rating?.[userStore.account] ?? {'value': 0, 'date': new Date().toISOString() }" :ratingList="recipe?.rating ?? {}"
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
        </v-list>
        <edit-recipe v-model:dialog="dialog" :recipe="selectedRecipe" :readonly="readonly" :showStepsIngredients=true @submit="handleFormSubmit" />
      </template>
    </recipe-select>

  </v-card>
</template>

<script setup>
import { ref, inject, reactive, computed } from 'vue';
import { useRecipesStore } from '@/stores/recipesStore';
import { useUserStore } from '@/stores/userStore';
import { addMessage } from '@/modules/arrMessage';
import EditRecipe from '@/components/EditRecipe.vue';
import recipes from '@/modules/recipes';
import SelectRating from '@/components/SelectRating.vue'
import arrxios from '@/modules/arrxios';
import RecipeSelect from './RecipeSelect.vue';
import { useBreakpoint } from '@/modules/usebreakpoint';

const recipesStore = useRecipesStore();
const userStore = useUserStore();
const { isMdAndUp } = useBreakpoint();

const confirmMessage = inject('confirmMessage');
const recipesList = ref([]);
recipesList.value = recipesStore.recipes;
const readonly = ref(true);
// const maxHeight = ref('calc(100vh - 370px)'); // 'calc(100vh - 370px)';

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

const maxHeight = computed(() => {
  if (isMdAndUp.value) {
    return '50vh';
  }
  return 'calc(100vh - 470px)';
});

const selectRecipe = (recipe) => {
  operation = 'edit';
  readonly.value = true;
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
    desc: '',
    time: '',
    ingredients: [],
    categories: [],
    rating: {}
  });

  readonly.value = false;
  selectedRecipe.value = recipe;
  dialog.value = true;
  //console.log('addRecipe');
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
