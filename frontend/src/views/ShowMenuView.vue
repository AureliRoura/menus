<template>
  <div>
    <show-day :menuDay="showDay" :day="day" /> 
  </div>
</template>

<script setup>
import ShowDay from '@/components/ShowDay.vue';
import { useMenusStore } from '@/stores/menusStore';
import { ref } from 'vue';

const menus = useMenusStore();

const menu = menus.searchById(1);
const day = ref('monday');
console.log(menu[0].name);  // 'Menu 1'
console.log(menu[0].menu.monday.dinner);  // {…}

const showDay = ref(menu[0].menu.monday);

/* 
const lunch = ref(menu.menu.monday.lunch);
const dinner = ref(menu.menu.monday.dinner);

console.log(lunch.value);
console.log(dinner.value);

 */


console.log(menu);

defineExpose({ ShowDay });
</script>