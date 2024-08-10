<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center bg-blue">
        Llista d'ingredients
        <v-spacer></v-spacer>
        <v-btn icon @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-text-field v-model="numberOfPersons" label="Number of Persons" type="number"
          :rules="[rules.required]"></v-text-field>
        <v-list  style="max-height: 300px; overflow-y: auto;">


          <v-list-item v-for="(ingredient, index) in aggregatedIngredients" :key="index">
            <v-list-item-title>
              {{ ingredient.name }}: {{ ingredient.quantity }} {{ ingredient.unit }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import aggregateIngredients from '@/modules/aggregateIngredients';
// Props
const props = defineProps({
  dialog: Boolean,
  menu: Object
});


// Data
const dialog = ref(props.dialog);
const numberOfPersons = ref(1);

const emit = defineEmits(['update:dialog']);

watch(() => props.dialog, (value) => {
  dialog.value = value;
});

watch(dialog, (value) => {
  emit('update:dialog', value);
});


// Validation rules
const rules = {
  required: value => !!value || 'Required.'
};

// Computed property to get aggregated ingredients
const aggregatedIngredients = computed(() => {
  return aggregateIngredients(props.menu, numberOfPersons.value);
});
</script>