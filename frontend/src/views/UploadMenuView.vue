<template>
  <v-card class="mt-2">
    <v-tabs v-model="tab" bg-color="secondary">
      <v-tab value="two">Receptes</v-tab>
      <v-tab value="one">Menus</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="one">
          <upload-menu />
        </v-tabs-window-item>

        <v-tabs-window-item value="two">
          <upload-recipe />
        </v-tabs-window-item>

      </v-tabs-window>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import UploadMenu from '@/components/UploadMenu.vue';
import UploadRecipe from '@/components/UploadRecipe.vue';

const tab = ref(null);
</script>