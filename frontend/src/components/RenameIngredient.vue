<template>
  <v-container min-width="400px">
    <v-progress-linear :active="working" :indeterminate="working" color="deep-orange" absolute
      bottom></v-progress-linear>
    <v-row>
      <v-col cols="12" md="6">
        <v-autocomplete v-model="selectedFromIngredient" :items="ingredientsItems" label="Ingredient a Renombrar"
          item-title="name" item-value="_id" return-object></v-autocomplete>
      </v-col>

      <v-col cols="12" md="6">
        <v-autocomplete v-model="selectedToIngredient" :items="ingredientsItemsTo" label="Nou Ingredient"
          item-title="name" item-value="_id" return-object></v-autocomplete>
      </v-col>

      <v-col cols="12" class="text-right">
        <v-chip @click="renameIngredient" color="primary" :disabled="!correctData">Renombrar</v-chip>
      </v-col> 
    </v-row> 
  </v-container>

</template>

<script setup>
import { ref, computed, watch , inject} from 'vue';
import { useIngredientsStore } from '@/stores/ingredientsStore';
import arrxios from '@/modules/arrxios';
import { addMessage } from '@/modules/arrMessage';


const confirmMessage = inject('confirmMessage');

const ingredientsStore = useIngredientsStore();

const selectedFromIngredient = ref(null);
const selectedToIngredient = ref(null);
const working = ref(false);


// Assuming your store has a computed property or a state array called 'ingredients'
// that returns an array of ingredient objects with 'id' and 'name' properties
const ingredientsItems = computed(() => ingredientsStore.ingredients);
// computed that explude the selectedFromIngredient from the ingredientItems
const ingredientsItemsTo = computed(() => {
  if (!selectedFromIngredient.value) return ingredientsStore.ingredients;
  return ingredientsStore.ingredients.filter(ingredient => ingredient._id !== selectedFromIngredient.value._id);
});

// verify from and to ingredients are informed
const correctData = computed(() => selectedFromIngredient.value && selectedToIngredient.value);

watch(() => selectedFromIngredient.value, (value) => {
  if (selectedToIngredient.value && selectedToIngredient.value._id === value._id) {
    selectedToIngredient.value = null;
  }
});

const renameIngredient = () => {
  console.log('Rename ingredient', selectedFromIngredient.value, selectedToIngredient.value);

  confirmMessage('Estàs segur que vols renombrar la ingredient?')
    .then((result) => {
      if (result) {
        working.value = true;
        arrxios.put('/api/ingredients/rename', { oldUniName: selectedFromIngredient.value.name, newIngredientName: selectedToIngredient.value.name })
          .then((response) => {
            console.log(response);
            if (response.status === 200) {
              addMessage('Ingredient renombrada correctament', 'success');
              selectedFromIngredient.value = null;
              selectedToIngredient.value = null;
            } else {
              addMessage('Error al renombrar l\'Ingredient', 'error');
            }
          })
          .catch((error) => {
            console.error(error);
            addMessage('Error al renombrar l\'Ingredient', 'error');
          })
          .finally(() => {
            working.value = false;
          });
      } else {
        addMessage('Operació cancel·lada', 'warning');
      }
    })
    .catch((error) => {
      console.error(error);
      addMessage('Error al renombrar l\'Ingredient', 'error');
    });
};


</script>