<template>
  <v-container min-width="400px">
    <v-progress-linear :active="working" :indeterminate="working" color="deep-orange" absolute
      bottom></v-progress-linear>
    <v-row>
      <v-col cols="12" md="6">
        <v-autocomplete v-model="selectedFromRecipe" :items="recipesItems" label="Recepta a Renombrar"
          item-title="name" item-value="_id" return-object></v-autocomplete>
      </v-col>

      <v-col cols="12" md="6">
        <v-autocomplete v-model="selectedToRecipe" :items="recipesItemsTo" label="Nova Recepta"
          item-title="name" item-value="_id" return-object></v-autocomplete>
      </v-col>

      <v-col cols="12" class="text-right">
        <v-chip @click="renameRecipe" color="primary" :disabled="!correctData">Renombrar</v-chip>
      </v-col> 
    </v-row> 
  </v-container>

</template>

<script setup>
import { ref, computed, watch , inject} from 'vue';
import { useRecipesStore } from '@/stores/recipesStore';
import arrxios from '@/modules/arrxios';
import { addMessage } from '@/modules/arrMessage';


const confirmMessage = inject('confirmMessage');

const recipesStore = useRecipesStore();

const selectedFromRecipe = ref(null);
const selectedToRecipe = ref(null);
const working = ref(false);


// Assuming your store has a computed property or a state array called 'recipes'
// that returns an array of recipe objects with 'id' and 'name' properties
const recipesItems = computed(() => recipesStore.recipes);
// computed that explude the selectedFromRecipe from the recipeItems
const recipesItemsTo = computed(() => {
  if (!selectedFromRecipe.value) return recipesStore.recipes;
  return recipesStore.recipes.filter(recipe => recipe._id !== selectedFromRecipe.value._id);
});

// verify from and to recipes are informed
const correctData = computed(() => selectedFromRecipe.value && selectedToRecipe.value);

watch(() => selectedFromRecipe.value, (value) => {
  if (selectedToRecipe.value && selectedToRecipe.value._id === value._id) {
    selectedToRecipe.value = null;
  }
});

const renameRecipe = () => {
  console.log('Rename recipe', selectedFromRecipe.value, selectedToRecipe.value);

  confirmMessage('Estàs segur que vols renombrar la recipe?')
    .then((result) => {
      if (result) {
        working.value = true;
        arrxios.put('/api/recipes/rename', { oldUniName: selectedFromRecipe.value.name, newRecipeName: selectedToRecipe.value.name })
          .then((response) => {
            console.log(response);
            if (response.status === 200) {
              addMessage('Recipe renombrada correctament', 'success');
              selectedFromRecipe.value = null;
              selectedToRecipe.value = null;
            } else {
              addMessage('Error al renombrar l\'Recipe', 'error');
            }
          })
          .catch((error) => {
            console.error(error);
            addMessage('Error al renombrar l\'Recipe', 'error');
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
      addMessage('Error al renombrar l\'Recipe', 'error');
    });
};


</script>