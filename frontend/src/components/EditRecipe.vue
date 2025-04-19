<template>
  <v-dialog v-model="state.dialog">
    <v-card>
      <div class="d-flex justify-space-between align-center">
        <v-card-title>Recepta</v-card-title>
        <div>
          <v-tooltip text="Copy Link">
            <template v-slot:activator="{ props }">
              <v-btn icon size="x-small" round class="mr-2" @click="copyLink" v-bind="props">
                <v-icon>mdi-content-copy</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip v-if="props.readonly" :text="readonly ? 'Edita' : 'Bloqueja'">
            <template v-slot:activator="{ props }">
              <v-btn v-if="editable" icon size="x-small" round class="mr-2" @click="readonly = !readonly"
                v-bind="props">
                <v-icon>{{ readonly ? 'mdi-pencil-off' : 'mdi-pencil' }}</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </div>
      <template v-if="isMdAndUp">
        <v-tabs v-model="tab" bg-color="primary" show-arrows>
          <v-tab value="general">General</v-tab>
          <v-tab value="steps">Passos ({{ numSteps }})</v-tab>
          <v-tab value="category">Cats ({{ numCategories }})</v-tab>
          <v-tab value="notes">Notes ({{ numNotes }})</v-tab>
          <!-- <v-tab value="images">Imatges</v-tab> -->
        </v-tabs>
      </template>
      <template v-else>
        <v-tabs v-model="tab" bg-color="primary" show-arrows
        density="compact" align-tabs="center" stacked>
          <v-tab value="general">
            <v-icon>mdi-home</v-icon>
          </v-tab>
          <v-tab value="steps">
            <v-icon :color="numSteps > 0 ? 'red' : ''">mdi-format-list-bulleted</v-icon>
          </v-tab>
          <v-tab value="category">
            <v-icon :color="numCategories > 0 ? 'red' : ''">mdi-tag-multiple</v-icon>
          </v-tab>
          <v-tab value="notes">
            <v-icon :color="numNotes > 0 ? 'red' : ''">mdi-note</v-icon>
          </v-tab>
          <!-- <v-tab value="images">Imatges</v-tab> -->
        </v-tabs>
      </template>
      <div class="content-container">
        <v-card-text>
          <v-form v-model="valid" @submit.prevent="submit" :disabled="readonly">
            <v-tabs-window v-model="tab">
              <v-tabs-window-item value="general">
                <v-row>
                  <v-col cols="12" sm="12" md="9" class="py-0">
                    <v-text-field v-model="state.recipe.name" label="Nom" required></v-text-field>
                  </v-col>
                  <v-col cols="8" sm="8" md="2" class="py-0">
                    <v-text-field v-model="state.recipe.time" label="Temps de Cocció" required></v-text-field>
                  </v-col>
                  <v-col cols="4" sm="4" md="1" class="d-flex align-center justify-center py-0">
                    <v-sheet class="pa-2 border mb-4" elevation="4" rounded>
                      <select-rating :rating="state.recipe?.rating?.[userStore.account] ?? 0"
                        :ratingList="state.recipe?.rating ?? {}"
                        @update:rating="state.recipe.rating[userStore.account] = $event" :readonly="readonly">
                      </select-rating>
                    </v-sheet>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="12" md="10">
                    <v-textarea v-model="state.recipe.desc" label="Descripció" required rows="3">
                    </v-textarea>
                  </v-col>
                  <v-col cols="12" sm="12" md="2" v-if="isMdAndUp">
                    <v-row class="mr-2">
                      <v-text-field v-model="state.recipe.servings" label="Comensals" required type="number"
                        min="1"></v-text-field>
                    </v-row>
                    <v-row class="mr-2">
                      <v-select v-model="state.recipe.difficulty" label="Dificultat" :items="difficulty"
                        item-value="value" item-title="label" required></v-select>
                    </v-row>
                  </v-col>
                  <v-col v-else>
                    <v-row>
                      <v-col cols="6">
                        <v-text-field v-model="state.recipe.servings" label="Comensals" required type="number"
                          min="1"></v-text-field>
                      </v-col>
                      <v-col cols="6">
                        <v-select v-model="state.recipe.difficulty" label="Dificultat" :items="difficulty"
                          item-value="value" item-title="label" required></v-select>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <edit-ingredients v-model:ingredients="state.recipe.ingredients" :readonly="readonly">
                </edit-ingredients>
              </v-tabs-window-item>
              <v-tabs-window-item value="category">
                <edit-categories v-model:categories="state.recipe.categories" :readonly="readonly"></edit-categories>
              </v-tabs-window-item>
              <v-tabs-window-item value="steps">
                <edit-steps v-model:steps="state.recipe.steps" :ingredients="state.recipe.ingredients"
                  :readonly="readonly"></edit-steps>
              </v-tabs-window-item>
              <v-tabs-window-item value="notes">
                <edit-notes v-model:recipe-id="state.recipe._id" :onNoteChange="onNoteChange"></edit-notes>
              </v-tabs-window-item>

            </v-tabs-window>
          </v-form>
        </v-card-text>
      </div>
      <v-card-actions class="justify-end">
        <v-chip class="mr-2" color="red darken-1" text @click="state.dialog = false">Tanca</v-chip>
        <v-chip v-if="!readonly" class="mr-2" color="green darken-1" text @click="submit">Guarda</v-chip>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogUrl" max-width="400">
    <v-card>
      <v-card-title>Copia Link</v-card-title>
      <v-card-text>
        <v-textarea v-model="url" readonly></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-chip class="mr-2" color="green darken-1" text @click="dialogUrl = false">Tanca</v-chip>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from 'vue';
import EditIngredients from './EditIngredients.vue';
import EditCategories from './EditCategories.vue';
import EditSteps from './EditSteps.vue';
import EditNotes from './EditNotes.vue';
import SelectRating from './SelectRating.vue';
import { useUserStore } from '@/stores/userStore';
import difficulty from '@/modules/difficulty.js';
import { useBreakpoint } from '@/modules/usebreakpoint';
import { addMessage } from '@/modules/arrMessage';
import arrxios from '@/modules/arrxios';

const userStore = useUserStore();
const { isMdAndUp } = useBreakpoint();

const props = defineProps({
  dialog: Boolean,
  recipe: {
    type: Object,
    default: () => ({ name: '', desc: '', time: '', ingredients: [], categories: [], steps: [], rating: [], difficulty: '', servings: 1 }),
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  editable: {
    type: Boolean,
    default: true,
  },
});

const readonly = ref(props.readonly);
const editable = ref(props.editable);

let state = reactive({
  dialog: props.dialog,
  recipe: props.recipe || { name: '', desc: '', time: '', ingredients: [], categories: [], steps: [], rating: [], difficulty: '', servings: 1 },
});
const dialogUrl = ref(false);
const valid = ref(false);
const tab = ref('general');
let url = '';

const emit = defineEmits(['update:dialog', 'submit']); // Ensure emits are properly defined

// Ensure props are correctly passed and reactive
watch(() => props.dialog, (value) => {
  state.dialog = value;
  if (value) {
    readonly.value = props.readonly;
  }
});

// Ensure props.recipe is properly initialized
watch(() => props.recipe, (value) => {
  state.recipe = value || { name: '', desc: '', time: '', ingredients: [], categories: [], steps: [], rating: [], difficulty: '', servings: 1 };
  if (!state.recipe.categories) state.recipe.categories = [];
  if (!state.recipe.rating) state.recipe.rating = {};
  if (!state.recipe.rating[userStore.account]) {
    state.recipe.rating[userStore.account] = { value: 0, date: new Date().toISOString() };
  }
  if (!state.recipe.steps) state.recipe.steps = [];
});

watch(() => props.readonly, (value) => {
  readonly.value = value;
});

watch(() => state.dialog, (value) => {
  emit('update:dialog', value);
  tab.value = 'general';
});

watch(() => state.recipe, (value) => {
  fetchNoteCount(value);
}, { deep: true });

const numCategories = computed(() => state.recipe.categories.length);
const numSteps = computed(() => state.recipe.steps.length);
const numNotes = ref(0);

const fetchNoteCount = async (value) => {
  try {
    if (!value || !value._id) {
      numNotes.value = 0;
      return;
    }
    // Fetch the number of notes for the recipe
    const response = await arrxios.get(`/api/recipes/countnotes/${value._id}`);
    numNotes.value = response.data;
  } catch (error) {
    console.error('Error fetching note count:', error);
    numNotes.value = 0;
  }
};

const onNoteChange = () => {
  fetchNoteCount(state.recipe);
};

// Removed duplicate declaration of emit

const submit = () => {
  if (valid.value) {
    emit('submit', state.recipe);
    emit('update:dialog', false);
  }
};

const copyLink = () => {
  url = `${window.location.origin}/menus/showrecipe/${state.recipe._id}`;
  try {
    navigator.clipboard.writeText(url);
    addMessage(`Link copiat: ${url}`);
  } catch (error) {
    dialogUrl.value = true;
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