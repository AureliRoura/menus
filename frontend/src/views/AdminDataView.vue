<template>
  <v-card class="mt-2">
    <v-tabs
      v-model="tab"
      bg-color="secondary"
    >
      <v-tab value="one">Receptes</v-tab>
      <v-tab value="two">Ingredients</v-tab>
      <v-tab value="three">Unitats</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="one">
          <rename-recipe />
        </v-tabs-window-item>

        <v-tabs-window-item value="two">
          <rename-ingredient />
        </v-tabs-window-item>

        <v-tabs-window-item value="three">
          <rename-unit />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue';
import RenameUnit from '@/components/RenameUnit.vue';
import RenameIngredient from '@/components/RenameIngredient.vue';
import RenameRecipe from '@/components/RenameRecipe.vue';


const tab = ref(null);
</script>