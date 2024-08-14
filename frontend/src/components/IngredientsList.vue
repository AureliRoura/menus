<template>
  <v-card>
    <v-container>
      <v-text-field v-model="filter" label="Filtrar Receptes" outlined dense class="rounded"></v-text-field>
      <v-list>
        <v-list-item class="text-h6 bg-primary rounded">
          <div class="d-flex justify-space-between">
            Ingredients
            <v-list-item-action>
              <v-icon @click="addIngredient()">mdi-plus</v-icon>
            </v-list-item-action>
          </div>
        </v-list-item>
        <div style="max-height: calc(100vh - 300px); overflow-y: auto;" class="fill-height">
          <v-list-item v-for="(ingredient, index) in ingredientsFiltered" :key="ingredient._id" @mouseover="hover = index"
            @mouseleave="hover = null" :class="hover === index ? 'bg-blue-grey-darken-1' : ''" rounded>
            <div class="d-flex justify-space-between">
              <v-list-item-title class="cursor-pointer" v-text="ingredient.name"
                @click="selectIngredient(ingredient, index)"></v-list-item-title>
              <v-list-item-action>
                <v-icon color="red" @click="deleteIngredient(ingredient, index)">mdi-delete</v-icon>
              </v-list-item-action>
            </div>
          </v-list-item>
        </div>
      </v-list>
    </v-container>
  </v-card>
  <edit-ingredient v-model:dialog="dialog" :ingredient="selectedIngredient" @submit="handleFormSubmit" />
</template>


<script setup>
import { ref, inject, reactive, computed } from 'vue';
import { useIngredientsStore } from '@/stores/ingredientsStore';
import { addMessage } from '@/modules/arrMessage';
import ingredients from '@/modules/ingredients';
import { useRouter } from 'vue-router';
import EditIngredient from './EditIngredient.vue';

const router = useRouter();
const ingredientsStore = useIngredientsStore();
const confirmMessage = inject('confirmMessage');
const ingredientList = ref([]);

const filter = ref('');

ingredientList.value = ingredientsStore.ingredients;

const ingredientsFiltered = computed(() => {
  if (!filter.value) {
    return ingredientList.value;
  }
  return ingredientList.value.filter(ingredient => ingredient.name.toLowerCase().includes(filter.value.toLowerCase()));
});

let selectedIngredient = ref(null);
let hover = ref(null);
let dialog = ref(false);
let operation = '';

const handleFormSubmit = (formData) => {
  try {
    if (operation === 'add') {
      ingredients.createIngredient(formData);
      addMessage('Ingredient afegit!!');
    } else {
      ingredients.updateIngredient(formData);
      addMessage('Ingredient modificat');
    }
  } catch (error) {
    addMessage('Error guardant el ingredient', 'error');
  }
};
const selectIngredient = (ingredient, index) => {
  operation = 'edit';
  selectedIngredient.value = ingredient;
  dialog.value = true;
  /*
  getIngredient(selectedIngredient.value._id)
    .then(() => {
      console.log('getIngredient', selectedIngredient.value);
    })
    .catch(() => {
      addMessage('Error carregant el ingredient', 'error');
    });
*/
};

const deleteIngredient = (ingredient, index) => {
  operation = 'delete';
  confirmMessage(`Estas segur que vols elminar el ingredient: ${ingredient.name}?`)
    .then((result) => {
      if (result) {
        ingredients.deleteIngredient(ingredient._id, index)
          .then(() => {
            addMessage('Ingredient eliminat');
          })
          .catch(() => {
            addMessage('Error eliminant el ingredient', 'error');
          });
      }
    })
    .catch(() => {
      addMessage('Error eliminant el ingredient', 'error');
    });
};

const addIngredient = () => {
  operation = 'add';
  const ingredient = reactive({
    _id: '',
    name: '',
    allergenics: []
  });

  selectedIngredient.value = ingredient;
  dialog.value = true;
};

defineExpose({
  ingredientsStore,
  dialog,
  selectedIngredient,
  selectIngredient,
});

</script>