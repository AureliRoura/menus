<template>
  <v-card>
    <v-card-title>Passos
      <v-tooltip text="Edita Passos" v-if="!props.readonly && props.showIngredients"  location="top" open-delay="500">
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
      <v-row v-if="selectionActive">
        <v-col cols="12" md="10">
          <v-textarea v-model="newStep" label="Pas" required></v-textarea>
        </v-col>
        <v-col cols="12" md="2" ensity="compact">
          <v-chip @click="addStep" :disabled="!valid" color="primary">Afegir Pas</v-chip>
        </v-col>
      </v-row>

      <v-list class="list-container flex-grow-1">
        <template v-if="steps.length > 0">
          <v-list-item v-for="(step, index) in steps" :key="index" density="compact">
            <div class="d-flex justify-space-between">
              <template v-if="editIndex === index">
                <v-row>
                  <v-col cols="12" md="9">
                    <v-textarea v-model="editedStep" label="Edita Pas" density="compact"></v-textarea>
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-chip @click="cancelEdit" color="red" class="ml-2">Cancel</v-chip>
                    <v-chip @click="saveStep(index)" color="primary" class="ml-2">Save</v-chip>
                  </v-col>
                </v-row>
              </template>
              <template v-else>
                <v-col
                  :class="{ 'text-decoration-line-through text-red-lighten-1': stepDone[index], 'cursor-pointer': true }">
                  <span>
                    <v-icon @click="showToolTip[index] = !showToolTip[index]">mdi-format-list-bulleted class = "mr-2"
                    </v-icon>
                  </span>
                  <span @click="stepDone[index] = !stepDone[index]">
                    {{ index + 1 }}.
                    {{ step }}

                    <template v-if="props.showIngredients">
                      <v-tooltip v-model=showToolTip[index] v-if="ingredientsList(step)" location="top"
                        :disabled="!showToolTip" activator="parent">{{
                          ingredientsList(step) }}</v-tooltip>
                    </template>
                    
                  </span>
                </v-col>
                <v-list-item-action v-if="selectionActive">
                  <v-icon :disabled="index == 0" color="green" @click="upStep(index)">mdi-arrow-up</v-icon>
                  <v-icon :disabled="index == steps.length - 1" color="green" @click="downStep(index)"
                    class="mr-4">mdi-arrow-down</v-icon>
                  <v-icon color="blue" @click="editStep(index, step)">mdi-pencil</v-icon>
                  <v-icon color="red" @click="removeStep(index)" class="ml-4">mdi-delete</v-icon>
                </v-list-item-action>
              </template>
            </div>
          </v-list-item>
        </template>
        <template v-else>
          <v-list-item>
            <v-col class="text-center">
              <span>No steps available. Add a new step to get started.</span>
            </v-col>
          </v-list-item>
        </template>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch, computed, toRef } from 'vue';
import { addMessage } from '@/modules/arrMessage';

const props = defineProps({
  steps: {
    type: Array,
    default: () => [] // Ensure steps is initialized as an empty array if not provided
  },
  ingredients: {
    type: Array,
    default: () => []
  },
  readonly: {
    type: Boolean,
    default: false
  },
  showIngredients: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:steps']); // Ensure emits are properly defined

const steps = ref(props.steps); // Create a reactive copy of props.steps
const newStep = ref('');
const editIndex = ref(-1);
const editedStep = ref('');
const selectionActive = ref(false);
const stepDone = ref([]);
const showToolTip = ref([]);

watch(() => props.readonly, (newVal) => {
  if (newVal) {
    selectionActive.value = false;
  }
});

watch(() => props.steps, (newVal) => {
  console.log('props.steps', newVal); // Debugging line to check updated steps value
  steps.value = [...newVal]; // Update steps when props.steps changes
});

watch(steps.value, (newVal) => {
  console.log('steps', newVal); // Debugging line to check updated steps value
  emit('update:steps', newVal); // Emit updated steps when the reactive steps array changes
});

const valid = computed(() => {
  return newStep.value.trim() !== ''; // Ensure the step is not empty or whitespace
});

const addStep = () => {
  if (valid.value) {
    steps.value.push(newStep.value.trim()); // Add trimmed step to the list
    newStep.value = '';
    addMessage('Pas afegit');
  }
};

const removeStep = (index) => {
  steps.value.splice(index, 1); // Remove the step from the list
  addMessage('Pas eliminat');
};

const editStep = (index, step) => {
  editIndex.value = index;
  editedStep.value = step;
};

const saveStep = (index) => {
  if (editIndex.value !== -1 && editedStep.value.trim() !== '') {
    steps.value[index] = editedStep.value.trim(); // Save the edited step
    addMessage('Pas editat');
    editIndex.value = -1;
    editedStep.value = '';
  }
};

const cancelEdit = () => {
  editIndex.value = -1;
  editedStep.value = '';
};

const upStep = (index) => {
  if (index > 0) {
    const temp = steps.value[index];
    steps.value[index] = steps.value[index - 1];
    steps.value[index - 1] = temp;
  }
};

const downStep = (index) => {
  if (index < steps.value.length - 1) {
    const temp = steps.value[index];
    steps.value[index] = steps.value[index + 1];
    steps.value[index + 1] = temp;
  }
};

const ingredientsList = (step) => {
  try {
    // List of stop words (articles, prepositions, and adjectives) in Catalan
    const stopWords = [
      'a', 'amb', 'd', 'de', 'del', 'dels', 'el', 'els', 'en', 'entre', 'i', 'l', 'la', 'les', 'o', 'per', 'pel', 'pels', 
      'que', 'se', 'un', 'una', 'uns', 'unes', 'sobre', 'sota', 'fins', 'cap', 'contra', 'durant', 'abans', 'després', 
      'entre', 'sense', 'vers', 'malgrat', 'segons',
      // Common Catalan adjectives
      'gran', 'petit', 'llarg', 'curt', 'alt', 'baix', 'nou', 'vell', 'bo', 'dolent', 'calent', 'fred', 'clar', 'fosc', 
      'sec', 'humit', 'dur', 'tou', 'lleuger', 'pesat', 'ràpid', 'lent', 'fort', 'feble', 'ample', 'estret'
    ];

    // Escape special characters in a string
    const escapeRegExp = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    // Normalize words by removing plural suffixes
    const normalizeWord = (word) => {
      return word.replace(/(es|s)$/i, ''); // Remove common plural suffixes
    };

    // Normalize the step text
    const normalizedStep = step
      .toLowerCase()
      .split(' ')
      .filter(word => !stopWords.includes(word)) // Remove stop words
      .map(normalizeWord) // Normalize words
      .join(' ');

    return props.ingredients
      .filter(ingredient => {
        const words = ingredient.name
          .toLowerCase()
          .split(' ')
          .filter(word => !stopWords.includes(word)) // Remove stop words
          .map(normalizeWord); // Normalize words
        return words.some(word => {
          const escapedWord = escapeRegExp(word); // Escape the word
          const regex = new RegExp(`\\b${escapedWord}\\b`, 'g');
          return regex.test(normalizedStep); // Compare with normalized step
        });
      })
      .map(ingredient => {
        const quantity = ingredient.quantity ? `${ingredient.quantity} ` : ''; // Exclude null quantities
        return `${ingredient.name} (${quantity}${ingredient.unit})`;
      })
      .join(', ');
  } catch (error) {
    console.error('Error in ingredientsList:', error);
    return ''; // Return an empty string or handle the error as needed
  }
};
</script>

<style scoped>
.list-container {
  overflow-y: auto;
  /* Add a vertical scrollbar */
}

.cursor-pointer {
  cursor: pointer;
}
</style>