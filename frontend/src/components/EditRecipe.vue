<template>
  <v-dialog v-model="state.dialog" >
    <v-card>

      <v-card-title>Recepta</v-card-title>
      <v-tabs v-model="tab" bg-color="primary">
        <v-tab value="general">General </v-tab>
        <v-tab value="category">Cats ({{ numCategories }})</v-tab>
        <v-tab value="steps">Passos ({{ numSteps }})</v-tab>
      </v-tabs>
      <div class="content-container">
        <v-card-text>

          <v-form v-model="valid" @submit.prevent="submit" :disabled="props.readonly">
            <v-tabs-window v-model="tab">
              <v-tabs-window-item value="general">
                <v-row>
                  <v-col cols="12" sm="12" md="9">
                    <v-text-field v-model="state.recipe.name" label="Nom" required></v-text-field>
                  </v-col>
                  <v-col cols="8" sm="8" md="2">
                    <v-text-field v-model="state.recipe.time" label="Temps de Cocció" required></v-text-field>
                  </v-col>
                  <v-col cols="4" sm="4" md="1" class="d-flex align-center justify-center">
                    <v-sheet class="pa-2 border mb-4" elevation="4" rounded>
                      <select-rating :rating="state.recipe?.rating?.[userStore.account] ?? 0"
                        :ratingList="state.recipe?.rating ?? {}"
                        @update:rating="state.recipe.rating[userStore.account] = $event"></select-rating>
                    </v-sheet>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-textarea v-model="state.recipe.desc" label="Descripció" required rows="3">
                    </v-textarea>
                  </v-col>
                </v-row>
                <edit-ingredients v-model:ingredients="state.recipe.ingredients"></edit-ingredients>
              </v-tabs-window-item>
              <v-tabs-window-item value="category">
                <edit-categories v-model:categories="state.recipe.categories"></edit-categories>
              </v-tabs-window-item>
              <v-tabs-window-item value="steps">
                <edit-steps v-model:steps="state.recipe.steps"></edit-steps>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-form>
        </v-card-text>
      </div>
      <v-card-actions class="justify-end">
        <v-chip class="mr-2" color="red darken-1" text @click="state.dialog = false">Close</v-chip>
        <v-chip class="mr-2" color="green darken-1" text @click="submit">Save</v-chip>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed, readonly } from 'vue';
import EditIngredients from './EditIngredients.vue';
import EditCategories from './EditCategories.vue';
import EditSteps from './EditSteps.vue';
import SelectRating from './SelectRating.vue';
import rating from '@/modules/rating.js';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();


const props = defineProps({
  dialog: Boolean,
  recipe: {
    type: Object,
    default: () => ({ name: '', desc: '', time: '', ingredients: [], categories: [], steps: [], rating: [] }),
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});

let state = reactive({
  dialog: props.dialog,
  recipe: props.recipe || { name: '', desc: '', time: '', ingredients: [], categories: [],  steps: [], rating: [] },
});
const valid = ref(false);
const tab = ref('general');


const ratingOptions = ref(rating)

watch(() => props.dialog, (value) => {
  state.dialog = value;
});

watch(() => props.recipe, (value) => {
  state.recipe = value;
  if (state.recipe.categories === undefined) {
    state.recipe.categories = [];
  }
  if (state.recipe.rating === undefined) {
    state.recipe.rating = {};
  }
  if (state.recipe.rating[userStore.account] === undefined) {
    state.recipe.rating[userStore.account] = 0;
  }
  if (state.recipe.steps === undefined) {
    state.recipe.steps = [];
  }
});

watch(() => state.dialog, (value) => {
  emit('update:dialog', value);
  tab.value = 'general';
});

const numCategories = computed(() => state.recipe.categories.length);
const numSteps = computed(() => state.recipe.steps.length);

const emit = defineEmits(['update:dialog', 'submit']);

const submit = () => {
  if (valid.value) {
    emit('submit', state.recipe);
    emit('update:dialog', false);
  }
};

defineExpose({
  dialog: state.dialog
});
</script>

<style>
/* Add styles to make the content scrollable */
.content-container {
  height: calc(100vh - 200px);
  /* Adjust the 200px based on your header/footer size */
  overflow-y: auto;
}

.custom-bg {
  background-color: var(--v-theme-background);
}
</style>