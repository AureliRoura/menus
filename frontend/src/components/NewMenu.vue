<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">New Menu</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field label="Menu Name" v-model="newMenuName"></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions class="absolute bottom-0 w-full justify-end">
        <v-spacer></v-spacer>
        <v-chip class="mr-2" color="red darken-1" text @click="dialog = false;">Close</v-chip>
        <v-chip class="mr-2" color="green darken-1" text @click="saveMenu">Save</v-chip>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  dialog: Boolean,
});

const emit = defineEmits(['update:dialog', 'submit']);

const dialog = ref(props.dialog);
const newMenuName = ref('');

watch(() => props.dialog, (newVal) => {
  dialog.value = newVal;
});

watch(() => dialog.value, (newVal) => {
  emit('update:dialog', newVal);
});


function saveMenu() {
  console.log('Saving new menu:', newMenuName.value);
  emit('submit', { name: newMenuName.value });
  // Add your save logic here
  dialog.value = false; // Close dialog after save
}
</script>