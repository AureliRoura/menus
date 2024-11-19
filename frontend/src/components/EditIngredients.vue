<template>
  <v-card>
    <v-card-title>Ingredients
      <v-tooltip text="Afegeix Ingredients" v-if="!props.readonly">
        <template v-slot:activator="{ props }">
          <v-btn icon size="x-small" density="comfortable" @click="selectionActive = !selectionActive" color="primary"
            class="ml-1" v-bind="props">
            <v-icon v-if="!selectionActive">mdi-plus</v-icon>
            <v-icon v-else>mdi-minus</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </v-card-title>
    <v-card-text>
      <div class="d-flex justify-space-between">
        <v-row v-if="selectionActive">
          <v-col cols="12" sm="6" md="4">
            <v-autocomplete ref="refIngredient" v-model="newIngredient._id" :items="filteredIngredients"
              item-title="name" item-value="_id" label="Ingredient" auto-select-first required
              @update:search="updateSearchInput" style="min-width: 200px;">
              <template v-slot:append-inner>
                <v-chip v-if="isEmptyList" @click="appendButton" :disabled="!isEmptyList">
                  <v-icon style="font-size: 12px;">mdi-plus</v-icon>
                  <v-tooltip activator="parent">Crear ingredient</v-tooltip>
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col cols="12" sm="3" md="3">
            <v-text-field v-model="newIngredient.quantity" label="Quantitat" type="number" @change="fixDecimals"
              style="min-width: 100px;"></v-text-field>
          </v-col>
          <v-col cols="12" sm="3" md="3">
            <v-autocomplete v-model="newIngredient.unit" :items="units" item-title="unit" item-value="unit"
              label="Unitats" auto-select-first required style="min-width: 100px;"
              @keyup.enter="addIngredient"></v-autocomplete>
          </v-col>
          <v-col cols="12" sm="12" md="2" style="min-width: 100px;" class="d-flex align-self-center mb-3">
            <v-chip @click="addIngredient" color="primary" :disabled="!valid" class="mr-3">Afegir</v-chip>
          </v-col>
        </v-row>
      </div>
      <v-list :class="['list-container', { 'with-headers': selectionActive }]">
        <v-list-item density="compact" v-for="(ingredient, index) in ingredients" :key="index">
          <div class="d-flex justify-space-between">
            <span>{{ ingredient.name }} - {{ ingredient.quantity }} {{ ingredient.unit }}
            </span>
            <v-list-item-action v-if="!props.readonly">
              <v-icon color="blue" @click="editCurrentIngredient(ingredient, index)" class="mr-2">mdi-pencil</v-icon>
              <v-icon color="red" @click="removeIngredient(index)">mdi-delete</v-icon>
            </v-list-item-action>
          </div>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
  <v-dialog v-model="mDialog" max-width="500px">
    <v-card>
      <v-card-title>Editar Ingredient</v-card-title>
      <v-card-text>
        <v-autocomplete v-model="selectedIngredient._id" :items="filteredIngredients" item-title="name" item-value="_id"
          label="Ingredient" auto-select-first required style="min-width: 200px;" @update:menu="nameUpdate"></v-autocomplete>
        <v-text-field v-model="selectedIngredient.quantity" label="Quantitat" type="number" @change="fixDecimals"
          style="min-width: 100px;"></v-text-field>
        <v-autocomplete v-model="selectedIngredient.unit" :items="units" item-title="unit" item-value="unit"
          label="Unitats" auto-select-first required style="min-width: 100px;"></v-autocomplete>
      </v-card-text>
      <v-card-actions>
        <v-chip color="red" @click="restoreCurrentIngredient()">Cancel·lar</v-chip>
        <v-chip color="blue" :disabled="!updateValidation" @click="mDialog = false">Desar</v-chip>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <edit-ingredient v-model:dialog="dialog" :ingredient="selectedIngredient" @submit="handleFormSubmit">
  </edit-ingredient>
</template>

<script setup>


import { ref, reactive, watch, computed, toRef, nextTick, onMounted } from 'vue';
import { useIngredientsStore } from '@/stores/ingredientsStore';
import { useUnitsStore } from '@/stores/unitsStore';

import EditIngredient from './EditIngredient.vue';
import { addMessage } from '@/modules/arrMessage';
import apiIngredients from '@/modules/apiIngredients';

const props = defineProps({
  ingredients: Array,
  readonly:
  {
    type: Boolean,
    default: false
  }
});

let ingredients = toRef(props, 'ingredients');

let newIngredient = reactive({ _id: '', name: '', quantity: '', unit: '' });
const selectedIngredient = ref(null);
const savedIngredient = ref(null);
const searchInput = ref('');
const dialog = ref(false);
const mDialog = ref(false);
const refIngredient = ref(null);
const selectionActive = ref(false);
let operation = '';
let currentIndex = -1;

const unitsStore = useUnitsStore();

let units = unitsStore.units;

const emit = defineEmits(['update:ingredients']);

onMounted(() => {
  mDialog.value = false;
  dialog.value = false;
});

watch(() => ingredients.value, (newIngredients) => {
  emit('update:ingredients', newIngredients);
});

watch(() => props.readonly, (newVal) => {
  if (newVal) {
    selectionActive.value = false;
  }
});

let valid = computed(() => {
  //search if ingredient exists in Ingredients

  //return Object.values(newIngredient).every(value => value !== '');
  return newIngredient._id !== '' && newIngredient.unit !== '' && (newIngredient.quantity !== '' || newIngredient.unit === 'al gust');
});

let updateValidation = computed(() => {
  return selectedIngredient.value._id !== null && selectedIngredient.value.unit !== null && (selectedIngredient.value.quantity !== "" || selectedIngredient.value.unit === 'al gust');
});

const ingredientsStore = useIngredientsStore();
let globalIngredients = ingredientsStore.ingredients;



const filteredIngredients = computed(() => {
  return globalIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes((searchInput.value || '').toLowerCase())
  );
});

const isEmptyList = computed(() => {
  return filteredIngredients.value.length === 0;
});


watch(() => newIngredient._id, (newId) => {
  const ingredient = ingredientsStore.searchById(newId)[0];
  newIngredient.name = ingredient ? ingredient.name : '';
});

const appendButton = () => {
  operation = 'add';
  selectedIngredient.value = { _id: '', name: searchInput.value, allergenics: [] };
  if (refIngredient.value) {
    refIngredient.value.blur();
  }
  dialog.value = true;
};

const fixDecimals = () => {
  let quantity = parseFloat(newIngredient.quantity);
  if (!isNaN(quantity)) {
    newIngredient.quantity = parseFloat(quantity.toFixed(2));
  }
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
        ingredientsStore.addIngredient(formData)
        addMessage('Ingredient afegit');
        newIngredient._id = updatedIngredient._id;
        newIngredient.name = updatedIngredient.name;
        nextTick(() => {
          refIngredient.value.focus();
        });
      })
      .catch(error => {
        console.error('Error adding ingredient:', error);
      });
  } else {
    api.updateIngredient(formData)
      .then(updatedIngredient => {
        //        console.log('Ingredient updated successfully:', updatedIngredient);
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

const editCurrentIngredient = (ingredient, index) => {
  selectedIngredient.value = ingredient;
  savedIngredient.value = { ...ingredient };
  currentIndex = index;
  mDialog.value = true;
};

const restoreCurrentIngredient = () => {
  ingredients.value[currentIndex] = { ...savedIngredient.value };
  mDialog.value = false;
};

const nameUpdate = () => {
  if (selectedIngredient.value._id === null) {
    selectedIngredient.value.name = '';
    return;
  }
  const ingredient = ingredientsStore.searchById(selectedIngredient.value._id)[0];
  selectedIngredient.value.name = ingredient ? ingredient.name : '';
};

</script>

<style scoped>
.list-container {
  max-height: calc(35vh);
  /* max-height: calc(3em * 3); */
  /* 3 lines of text */
  overflow-y: auto;
  /* Add a vertical scrollbar */
}

.with-headers {
  max-height: calc(35vh - 100px);
  /* Adjust height when headers are shown */
}
</style>