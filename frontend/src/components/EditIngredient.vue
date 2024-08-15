<template>
  <v-dialog v-model="state.dialog">
    <v-card>
      <v-card-title>Edit Ingredient</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="submit">
          <v-text-field v-model="state.ingredient.name" label="Name" required></v-text-field>
          <v-select v-model="selectedAlergenicsModel" :items="allergenics" item-value="_id" item-title="name"
            label="Alergenics" multiple clearable chips return-object/>
        </v-form>
      </v-card-text>
      <v-card-actions class="absolute bottom-0 w-full justify-end">
        <v-spacer></v-spacer>
        <v-chip class="mr-2" color="red darken-1" text @click="state.dialog = false;">Close</v-chip>
        <v-chip class="mr-2" color="green darken-1" text @click="submit">Save</v-chip>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { useAllergenicsStore } from '@/stores/allergenicsStore';

const allergenicsStore = useAllergenicsStore();
const allergenics = allergenicsStore.allergenics;



const props = defineProps({
  dialog: Boolean,
  ingredient: {
    type: Object,
    default: () => ({ _id: '', name: '', allergenics: [] }),
  },
});


const selectedAlergenics = ref([]);

const selectedAlergenicsModel = computed({
  get() {
    return selectedAlergenics.value;
  },
  set(value) {
    // Assuming you want to store only _id and name for each selected item
    selectedAlergenics.value = value.map(item => ({
      _id: item._id,
      name: item.name
    }));
    // Update the state or emit an event as necessary
    //state.ingredient.allergenics = selectedAlergenics.value;
  }
});

// Watch for changes in props.ingredient.allergenics and update selectedAlergenics accordingly
watch (() => props.ingredient, (newVal) => {
  if (!newVal.allergenics) {
    selectedAlergenics.value = [];
    return;
  }
  selectedAlergenics.value = newVal.allergenics.map(item => ({
    _id: item._id,
    name: item.name
  }));
});

let state = reactive({
  dialog: props.dialog,
  ingredient: props.ingredient || { _id: '', name: '', allergenics: [] },
});
let valid = ref(false);

watch(() => props.dialog, (value) => {
  state.dialog = value;
});

watch(() => props.ingredient, (value) => {
  state.ingredient = value;
});

watch(() => state.dialog, (value) => {
  emit('update:dialog', value);
});



const emit = defineEmits(['update:dialog', 'submit']);

const submit = () => {
  if (valid.value) {
    state.ingredient.allergenics = selectedAlergenics.value;
    emit('submit', state.ingredient);
    emit('update:dialog', false);
    
  }
};

defineExpose({
  dialog: state.dialog
});
</script>
