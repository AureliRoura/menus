<template>
      <v-progress-linear
      color="deep-orange"
      :indeterminate = "thinking"
      :acative="thinking"
    ></v-progress-linear>
  <v-row justify="center">
    <edit-recipe v-model:dialog="dialog" :recipe="selectedRecipe" :readonly="readonly" :editable="false" @submit="handleFormSubmit" />
  </v-row>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRecipesStore } from '@/stores/recipesStore';
import EditRecipe from '@/components/EditRecipe.vue';

const route = useRoute();
const router = useRouter();
const recipesStore = useRecipesStore();
const recipeId = ref(null);
const dialog = ref(false);
const selectedRecipe = ref(null);
const readonly = ref(true);
const thinking = ref(true);

const goBack = () => {
  const referrer = document.referrer;
  const currentOrigin = window.location.origin;
  if (referrer.startsWith(currentOrigin)) {
    router.go(-1); // Navigate back to the previous page
  } else {
    router.push({ name: 'Edita Receptes' }); // Navigate to a default route
  }
};

onMounted(() => {
  setTimeout(() => {
    recipeId.value = route.params.recipeId;
    selectedRecipe.value = recipesStore.searchById(recipeId.value)[0];
    if (!selectedRecipe.value) {
      console.log('No s\'ha trobat la recepta');
     router.push({ name: 'Edita Receptes' }); 
    } else {
      dialog.value = true;
    }
    thinking.value = false;
  }, 2000);
});

watch(() => dialog.value, (value) => {
  if (!value) {
    goBack(); // Navigate back to the previous page or to the default route
  }
});

const handleFormSubmit = () => {
  goBack(); // Navigate back to the previous page or to the default route
};

</script>