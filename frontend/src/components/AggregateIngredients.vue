<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center bg-blue">
        Llista d'ingredients
        <v-spacer></v-spacer>
        <v-btn icon @click="copyToClipboard" class="mr-2">
          <v-icon>mdi-content-copy</v-icon>
        </v-btn>
        <v-btn icon @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-text-field v-model="numberOfPersons" label="Number of Persons" type="number"
          :rules="[rules.required]"></v-text-field>
        <v-list style="max-height: 300px; overflow-y: auto;">
          <v-list-item v-for="(ingredient, index) in aggregatedIngredients" :key="index">
            <v-list-item-title>
              {{ ingredient.name }}: {{ ingredient.quantity }} {{ ingredient.unit }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogList" max-width="400">
    <v-card>
      <v-card-title>Llista</v-card-title>
      <v-card-text>
        <v-textarea v-model="listText" readonly></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-chip class="mr-2" color="green darken-1" text @click="dialogList = false">Tanca</v-chip>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script setup>
import { ref, computed, watch } from 'vue';
import aggregateIngredients from '@/modules/aggregateIngredients';
import { addMessage } from '@/modules/arrMessage';

// Props
const props = defineProps({
  dialog: Boolean,
  menu:
  {
    type: Object,
    default: () => null
  },
  recipeList:
  {
    type: Array,
    default: () => []
  }
});


// Data
const dialog = ref(props.dialog);
const dialogList = ref(false);
const numberOfPersons = ref(1);
const listText = ref('');
const emit = defineEmits(['update:dialog']);

watch(() => props.dialog, (value) => {
  dialog.value = value;
});

watch(dialog, (value) => {
  emit('update:dialog', value);
});

const copyToClipboard = () => {
  try {
    listText.value = aggregatedIngredients.value.map(ingredient => `${ingredient.name}: ${ingredient.quantity} ${ingredient.unit}`).join('\n');
    navigator.clipboard.writeText(listText.value);
    addMessage('Ingredients copiats al porta-retalls', 'success');
  } catch (error) {
    dialogList.value = true;
  }
};

// Validation rules
const rules = {
  required: value => !!value || 'Required.'
};

// Computed property to get aggregated ingredients
const aggregatedIngredients = computed(() => {
  return aggregateIngredients(props.menu, props.recipeList, numberOfPersons.value);
});
</script>