<template>
  <v-card class="mx-auto" color="surface-variant" max-width=400 min-width=200>
    <v-card-title class="d-flex align-center">
      <span class="font-weight-black">{{ apat }}</span>
    </v-card-title>
    <v-card-text class="bg-surface-light pt-4">
      <div v-for="(dish, index) in menu" :key="index" class="border pt-2 pl-2 pr-2 pb-2 mb-2">     
        <show-recipe :recipe="dish" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue';
import ShowRecipe from './ShowRecipe.vue';

const props = defineProps({
  apat: String,
  menu: Array,
});

watch(props.menu, (newMenu) => {
  console.log('New menu', newMenu);
});

</script>
