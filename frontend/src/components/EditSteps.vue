<template>
  <v-card>
    <v-card-title>Passos
      <v-tooltip text="Edita Passos">
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
              {{ index + 1 }}. {{ step }}
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
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch, computed, toRef } from 'vue';
import { addMessage } from '@/modules/arrMessage';

const props = defineProps({
  steps: Array
});


let steps = toRef(props, 'steps');

//let valid = ref(false);
let newStep = ref('');
const editIndex = ref(-1);
let editedStep = ref('');
const selectionActive = ref(false);

const emit = defineEmits(['update:steps']);

watch(() => steps, (newVal) => {
  emit('update:steps', newVal);
});

let valid = computed(() => {
  // verifty if the step is not empty
  return newStep.value !== '';
});

let newStepbutton = ref(true);

const addStep = () => {
  // add the step to the list
  steps.value.push(newStep.value);
  newStep.value = '';
  addMessage('Pas afegit');
};

const removeStep = (index) => {
  // remove the step from the list
  steps.value.splice(index, 1);
  addMessage('Pas eliminat');
};

const editStep = (index, step) => {
  editIndex.value = index;
  editedStep.value = step;
};

const saveStep = (index) => {
  if (editIndex.value !== -1) {
    steps.value[index] = editedStep.value;
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
</script>

<style scoped>
.list-container {
  overflow-y: auto;
  /* Add a vertical scrollbar */
}
</style>