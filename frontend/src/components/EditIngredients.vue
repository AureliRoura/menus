<template>
  <v-card>
    <v-card-title>Ingredients</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6" md="4">
          <v-autocomplete v-model="newIngredient._id" :items="globalIngredients" item-title="name" item-value="_id"
            label="Ingredient" auto-select-first required @input="selectIngredientsButton"
            @update:search="updateSearchInput" style="min-width: 200px;">
          </v-autocomplete>
        </v-col>
        <v-col cols="12" sm="3" md="3">
          <v-text-field v-model="newIngredient.quantity" label="Cuantitat" type="number" required @change="fixDecimals"
            style="min-width: 100px;"></v-text-field>
        </v-col>
        <v-col cols="12" sm="3" md="3">
          <v-autocomplete v-model="newIngredient.unit" :items="units" item-title="unit" item-value="unit"
            label="Unitats" auto-select-first required style="min-width: 100px;"
            @keyup.enter="addIngredient"></v-autocomplete>
        </v-col>
        <v-col cols="12" sm="12" md="2" style="min-width: 100px;" class="d-flex align-self-center mb-3">
          <v-chip @click="addIngredient" color="primary" :disabled="!valid"  class="mr-3">Add</v-chip>
          <v-chip color="primary" @click="addGlobalIngredient" :disabled="!newIngredientbutton" >
            <v-icon>mdi-plus</v-icon>
          </v-chip>
        </v-col>
      </v-row>

      <v-list class="list-container">
        <v-list-item density="compact" v-for="(ingredient, index) in ingredients" :key="index">
          <div class="d-flex justify-space-between">
            <span>{{ ingredient.name }} - {{ ingredient.quantity }} {{ ingredient.unit }}
            </span>
            <v-list-item-action>
              <v-icon color="red" @click="removeIngredient(index)">mdi-delete</v-icon>
            </v-list-item-action>
          </div>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
  <edit-ingredient v-model:dialog="dialog" :ingredient="selectedIngredient" @submit="handleFormSubmit">
  </edit-ingredient>

</template>

<script setup>


import { ref, reactive, watch, computed, toRef } from 'vue';
import { useIngredientsStore } from '@/stores/ingredientsStore';
import { useUnitsStore } from '@/stores/unitsStore';

import EditIngredient from './EditIngredient.vue';
import { addMessage } from '@/modules/arrMessage';
import apiIngredients from '@/modules/apiIngredients';



const props = defineProps({
  ingredients: Array
});

let ingredients = toRef(props, 'ingredients');



//let valid = ref(false);
let newIngredient = reactive({ _id: '', name: '', quantity: '', unit: '' });
const selectedIngredient = ref(null);
const searchInput = ref('');
const dialog = ref(false);
let operation = '';

const unitsStore = useUnitsStore();

let units = unitsStore.units;

//let units = [{ unit: 'grams' }, { unit: 'liters' }, { unit: 'pieces' }];
//let units = ['grams', 'liters', 'pieces'];

const emit = defineEmits(['update:ingredients']);

watch(() => ingredients.value, (newIngredients) => {
  emit('update:ingredients', newIngredients);
});


let valid = computed(() => {
  //search if ingredient exists in Ingredients

  return Object.values(newIngredient).every(value => value !== '');
});

let newIngredientbutton = ref(true);

const ingredientsStore = useIngredientsStore();
let globalIngredients = ingredientsStore.ingredients;


watch(() => newIngredient._id, (newId) => {
  const ingredient = ingredientsStore.searchById(newId)[0];
  newIngredient.name = ingredient ? ingredient.name : '';
  newIngredientbutton.value = false;
});



const fixDecimals = () => {
  let quantity = parseFloat(newIngredient.quantity);
  if (!isNaN(quantity)) {
    newIngredient.quantity = parseFloat(quantity.toFixed(2));
  }
};

const selectIngredientsButton = (value) => {
  if (value.target.value === '') {
    newIngredientbutton.value = true;
  } else {
    if (ingredientsStore.searchByIngredient(value.target.value).length === 0) {
      newIngredientbutton.value = true;
    } else {
      newIngredientbutton.value = false;
    }
  }
  return true;
}

const addGlobalIngredient = () => {
  operation = 'add';
  selectedIngredient.value = { _id: '', name: searchInput.value, alergenics: [] };
  dialog.value = true;
};

const handleFormSubmit = (formData) => {
  const api = apiIngredients();
  const ingredientExists = globalIngredients.some(ingredient => ingredient.name === formData.name);
  if (operation === 'add') {
    if (ingredientExists) {
      addMessage("L'ingredient ja exieteix", 'error');
      return;
    }
    api.addIngredient(formData)
      .then(updatedIngredient => {
        console.log('Ingredient added successfully:', updatedIngredient);
        ingredientsStore.addIngredient(formData)
        addMessage('Ingredient afegit');
      })
      .catch(error => {
        console.error('Error adding ingredient:', error);
      });
  } else {
    api.updateIngredient(formData)
      .then(updatedIngredient => {
        console.log('Ingredient updated successfully:', updatedIngredient);
        ingredientsStore.updateIngredient(formData);
        addMessage('Ingredient actualitzat');
      })
      .catch(error => {
        console.error('Error updating ingredient:', error);
        addMessage('Error actualitzant ingredient', 'error');
      });
  }
}

const addIngredient = () => {

  const newIngredientExists = ingredients.value.some(ingredient => ingredient._id === newIngredient._id);
  if (newIngredientExists) {
    addMessage("L'ingredient ja exieteix a la recepte", 'error');
    return;
  }
  if (valid.value) {
    ingredients.value.push({ ...newIngredient });
    newIngredient._id = '';
    newIngredient.name = '';
    newIngredient.quantity = '';
    newIngredient.unit = '';
  }
}

const updateSearchInput = (value) => {
  searchInput.value = value;
};

const removeIngredient = (index) => {
  ingredients.value.splice(index, 1);
};
</script>

<style scoped>
.list-container {
  max-height: calc(3em * 3);
  /* 3 lines of text */
  overflow-y: auto;
  /* Add a vertical scrollbar */
}
</style>