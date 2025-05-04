<template>
  <v-dialog v-model="mDialog" max-width="500px">
    <v-card>
      <v-card-title>Editar Ingredient</v-card-title>
      <v-card-text>
        <v-autocomplete ref="refIngredientRecipe" v-model="selectedIngredient._id" auto-select-first :items="filteredIngredients" item-title="name" item-value="_id"
          label="Ingredient" required style="min-width: 200px;" @update:menu="nameUpdate" @update:search="searchInput = $event">
          <template v-slot:append-inner>
            <v-chip v-if="isEmptyList" @click="appendButton" :disabled="!isEmptyList">
              <v-icon style="font-size: 12px;">mdi-plus</v-icon>
              <v-tooltip activator="parent">Crear ingredient</v-tooltip>
            </v-chip>
          </template>
        </v-autocomplete>
        <v-text-field v-model="selectedIngredient.quantity" label="Quantitat" type="number" @change="fixDecimals"
          style="min-width: 100px;"></v-text-field>
        <v-autocomplete v-model="selectedIngredient.unit" :items="units" item-title="unit" item-value="unit"
          label="Unitats" auto-select-first required style="min-width: 100px;" @update:search="selectedIngredient.unit=$event"></v-autocomplete>
      </v-card-text>
      <v-card-actions>
        <v-chip color="red" @click="cancelIngredient()">Cancel·lar</v-chip>
        <v-chip color="blue" :disabled="!updateValidation" @click="updateIngredient()">Desar</v-chip>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <edit-ingredient v-model:dialog="dialog" :ingredient="selectedIngredient" @submit="handleFormSubmit"></edit-ingredient>
</template>

<script setup>
import { useIngredientsStore } from '@/stores/ingredientsStore';
import { useUnitsStore } from '@/stores/unitsStore';
import { ref, toRef, computed, watch, nextTick } from 'vue';
import apiIngredients from '@/modules/apiIngredients';
import EditIngredient from './EditIngredient.vue';
import { addMessage } from '@/modules/arrMessage';

const unitsStore = useUnitsStore();
const ingredientsStore = useIngredientsStore();
const props = defineProps({
  ingredient: {
    type: Object,
    default: () => ({ _id: '', name: '', quantity: '', unit: '' })
  },
  dialog: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:ingredient', 'update:dialog']);

let mDialog = ref(props.dialog);
let selectedIngredient = toRef({ ...props.ingredient });
let units = unitsStore.units;
let globalIngredients = ingredientsStore.ingredients;
let searchInput = ref('');
const refIngredientRecipe = ref(null);
let operation = '';
const dialog = ref(false);

watch(() => props.ingredient, (newVal) => {
  selectedIngredient.value = { ...newVal };
});

watch(() => props.dialog, (newVal) => {
  mDialog.value = newVal;
});

watch(mDialog, (newVal) => {
  emit('update:dialog', newVal);
});

const cancelIngredient = () => {
  emit('update:dialog', false);
};

const updateIngredient = () => {
  console.log('updateIngredient', selectedIngredient.value);
  emit('update:ingredient', selectedIngredient.value);
  emit('update:dialog', false);
};

const isEmptyList = computed(() => {
  return filteredIngredients.value.length === 0;
});

const filteredIngredients = computed(() => {
  return globalIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes((searchInput.value || '').toLowerCase())
  ).filter((ingredient, index, self) => self.findIndex(t => t.name === ingredient.name) === index);
});

let updateValidation = computed(() => {
  return selectedIngredient.value._id !== null && selectedIngredient.value.unit !== null && (selectedIngredient.value.quantity !== "" || selectedIngredient.value.unit === 'al gust');
});

const fixDecimals = () => {
  let quantity = parseFloat(selectedIngredient.quantity);
  if (!isNaN(quantity)) {
    selectedIngredient.quantity = parseFloat(quantity.toFixed(2));
  }
};

const nameUpdate = () => {
  console.log('nameUpdate', selectedIngredient.value._id);

  if (operation === 'add') {
    return;
  }
  if (selectedIngredient.value._id === null) {
    selectedIngredient.value.name = '';
    return;
  }
  const ingredient = ingredientsStore.searchById(selectedIngredient.value._id)[0];
  console.log('nameUpdate', ingredient);
  selectedIngredient.value.name = ingredient ? ingredient.name : '';
};

const appendButton = () => {
  operation = 'add';
  console.log('appendButton', searchInput.value);
  selectedIngredient.value = { _id: '', name: searchInput.value, allergenics: [] };
  if (refIngredientRecipe.value) {
    refIngredientRecipe.value.blur();
  }
  dialog.value = true;
};

const handleFormSubmit = (formData) => {
  const api = apiIngredients();
  const ingredientExists = globalIngredients.some(ingredient => ingredient.name === formData.name);
  if (operation === 'add') {
    operation = '';
    if (ingredientExists) {
      addMessage("L'ingredient ja exieteix", 'error');
      return;
    }
    api.addIngredient(formData)
      .then(updatedIngredient => {
        ingredientsStore.addIngredient(formData)
        addMessage('Ingredient afegit');  
        selectedIngredient.value._id = updatedIngredient._id;
        selectedIngredient.value.name = updatedIngredient.name;
        nextTick(() => {
          refIngredientRecipe.value.focus();
        });
      })
      .catch(error => {
        console.error('Error adding ingredient:', error);
      });
  } else {
    operation = '';
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


</script>