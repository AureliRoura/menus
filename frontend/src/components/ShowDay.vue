<template>
  <div class="d-flex justify-center align-center">
    <v-card width=400>
      <v-card-title class="d-flex justify-space-between align-center">
        <h2>{{ day }}</h2>
        <v-chip small icon round color="primary" @click="dialog = !dialog">
          <v-icon>mdi-pencil</v-icon>
        </v-chip>
        <edit-day v-model:dialog="dialog" :menusDay="menusDay" @update:menusDay="updateMenusDay" #day>
          {{ day }}
        </edit-day>
      </v-card-title>
      <div class="justify-content-center">
        <show-menu class="my-2" apat="Dinar" :menu="lunch" />
        <show-menu class="my-2" apat="Sopar" :menu="dinner" />
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ShowMenu from '@/components/ShowMenu.vue';
import EditDay from '@/components/EditDay.vue';

const props = defineProps({
  day: String,
  menuDay: Object,
});

const emit = defineEmits(['update:menusDay']);

const dialog = ref(false);
const menusDay = ref(props.menuDay);
const lunch = ref(menusDay.value.lunch);
const dinner = ref(menusDay.value.dinner);


const updateMenusDay = (newMenusDay) => {
  menusDay.value = newMenusDay;
  lunch.value = menusDay.value.lunch;
  dinner.value = menusDay.value.dinner;
  console.log('updateMenusDay', newMenusDay);
  emit('update:menusDay', menusDay.value);
};
</script>
