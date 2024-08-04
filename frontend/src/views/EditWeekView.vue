<template>
  {{ menusDay }}
  <div v-for="(day, index) in days" :key="index">
    <v-btn @click="dialog[day] = !dialog[day]">{{day}}</v-btn>
    <edit-day v-model:dialog="dialog[day]" :menusDay="menusDay[day]"
      @update:menusDay="newMenusDay => menusDay[day] = newMenusDay" #day>
      {{ day }}
    </edit-day>
  </div>
</template>

<script setup>
import EditDay from '@/components/EditDay.vue';
import { reactive } from 'vue';

const dialog = reactive({
  Monday: false,
  Tuesday: false,
  Wednesday: false,
  Thursday: false,
  Friday: false,
  Saturday: false,
  Sunday: false,
});
const menusDay = reactive({
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
});
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

console.log('menusDay', menusDay);
console.log('dialog', dialog);
</script>