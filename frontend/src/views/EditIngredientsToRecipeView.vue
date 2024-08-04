<template>
  <div>
    <edit-ingredients v-model:ingredients="myIngredients" />
  </div>
</template>

<script setup>
import EditIngredients from '@/components/EditIngredients.vue';
import { ref, watch } from 'vue';

const myIngredients = ref([]);
myIngredients.value = [];
// console.log when myIngredients changes
watch(myIngredients.value, (newValue) => {
  console.log(newValue);
});

</script>