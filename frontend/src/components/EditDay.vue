<template >
  <v-dialog v-model="state.dialog" >
    <v-card  fluid fill-height ref="dialogRef">
      <v-card-title class="d-flex align-center wrap">
        <span>
          <slot name="day" class="display-1"></slot>
        </span>
        <v-tabs v-model="tab" bg-color="primary" grow rounded class="ml-2">
        <v-tab value="lunch">Dinar</v-tab>
        <v-tab value="dinner">Sopar</v-tab>
      </v-tabs>
      </v-card-title>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="lunch">
        <v-card-item>
          <recipe-filter v-model:selectedRecipes="lunch">
            <template v-slot:action>
              <span></span>
            </template>
          </recipe-filter>
        </v-card-item>
        </v-tabs-window-item>
        <v-tabs-window-item value="dinner">
        <v-card-item>
          <recipe-filter v-model:selectedRecipes="dinner">
            <template v-slot:action>
              <span></span>
            </template>
          </recipe-filter>
        </v-card-item>
        </v-tabs-window-item>
      </v-tabs-window>
      <v-card-actions class="absolute bottom-0 w-full justify-end">
        <v-chip class="mr-2" color="red darken-1" @click="cancelMenu">Cancel</v-chip>
        <v-chip class="mr-2" color="green darken-1" @click="saveMenu">Save</v-chip>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import RecipeFilter from './RecipeFilter.vue';
import { ref, reactive, watch, onMounted, nextTick } from 'vue';

const props = defineProps({
  dialog: Boolean,
  menusDay: {
    type: Object,
    default: () => ({}),
  },
});

const menusDay = ref(props.menusDay || {});
const lunch = ref([]);
const dinner = ref([]);
const tab = ref('lunch');
const dialogRef = ref(null);
const dialogHeight = ref(0);

let state = reactive({
  dialog: props.dialog,
});

onMounted(() => {
  tab.value = 'lunch';
  lunch.value = menusDay.value['lunch'] || [];
  dinner.value = menusDay.value['dinner'] || [];
/*   watch(() => state.dialog, async (value) => {
    if (value) {
      await nextTick();
      if (dialogRef.value) {
        dialogHeight.value = dialogRef.value.$el.clientHeight;
        console.log('Dialog height 1:', dialogHeight.value);
      }
    }
  }); */
});

watch(() => props.dialog, (value) => {
  state.dialog = value;
  if (value) {
    lunch.value = menusDay.value['lunch'] || [];
    dinner.value = menusDay.value['dinner'] || [];
  }
});

watch(() => props.menusDay, (value) => {
  menusDay.value = value;
  lunch.value = value['lunch'] || [];
  dinner.value = value['dinner'] || [];
});

watch(() => state.dialog, (value) => {
  emit('update:dialog', value);
});


const emit = defineEmits(['update:dialog', 'submit', 'update:menusDay']);

// Function to save the menu
const saveMenu = () => {
  menusDay.value = {
    ...menusDay.value,
    lunch: lunch.value,
    dinner: dinner.value,
  };
  emit('update:menusDay', menusDay.value);
  state.dialog = false;
};

// Function to cancel the menu
const cancelMenu = () => {

  state.dialog = false;
};

</script>