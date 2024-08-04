<template>
  <v-btn @click="dialog = !dialog">Open Dialog</v-btn>
  {{ menusDay }}
<edit-day v-model:dialog="dialog" :menusDay="menusDay" @update:menusDay="newMenusDay => menusDay = newMenusDay" #day>
  Dia
</edit-day>

</template>

<script setup>
import EditDay from '@/components/EditDay.vue';
import { ref } from 'vue';

const dialog = ref(false);
const menusDay = ref([]);


console.log('menusDay', menusDay.value);
console.log('dialog', dialog.value);
</script>