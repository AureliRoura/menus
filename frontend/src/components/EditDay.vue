<template>
  <v-dialog v-model="state.dialog">
    <v-card fluid fill-height class="d-flex flex-column">
      <v-card-title>
        <span>
          <slot name="day" class="display-1">hola</slot>
        </span>
      </v-card-title>
      <v-card-text>
        <v-row class="flex-grow-1">
          <v-col cols="12" sm="6">
            <edit-menu :menu="lunch" #title>
              Dinar
            </edit-menu>
          </v-col>
          <v-col cols="12" sm="6">
            <edit-menu :menu="dinner" #title>
              Sopar
            </edit-menu>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="absolute bottom-0 w-full justify-end">
        <v-chip class="mr-2" color="red darken-1" @click="cancelMenu">Cancel</v-chip>
        <v-chip class="mr-2" color="green darken-1" @click="saveMenu">Save</v-chip>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import EditMenu from '@/components/EditMenu.vue';
import { ref, reactive, watch } from 'vue';

const props = defineProps({
  dialog: Boolean,
  menusDay: {
    type: Object,
    default: () => ({}),
  },
});



const menusDay = ref(props.menusDay || {});
const lunch = ref(JSON.parse(JSON.stringify(menusDay.value['lunch'] || [])));
const dinner = ref(JSON.parse(JSON.stringify(menusDay.value['dinner'] || [])));

let state = reactive({
  dialog: props.dialog,
});
watch(() => props.dialog, (value) => {
  state.dialog = value;
  if (value) {
    lunch.value = JSON.parse(JSON.stringify(menusDay.value['lunch'] || []));
    dinner.value = JSON.parse(JSON.stringify(menusDay.value['dinner'] || []));
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