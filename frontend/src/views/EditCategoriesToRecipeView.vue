<template>
  <div>
    <edit-categories v-model:categories="myCategories" />
  </div>
</template>

<script setup>

import EditCategories from '@/components/EditCategories.vue';
import { ref, watch } from 'vue';

const myCategories = ref([]);
myCategories.value = [];
// console.log when myIngredients changes
watch(myCategories.value, (newValue) => {
  console.log(newValue);
});

</script>