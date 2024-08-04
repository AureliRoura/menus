<template>
  <div class="mt-2 mb-2">
    <!-- button to back -->
    <v-chip @click="router.back()" class="mr-4">
      <v-icon>mdi-arrow-left</v-icon>
      Tornar
    </v-chip>
    <v-chip @click="dialog = true" class="mr-4">
      <v-icon>mdi-list-box-outline</v-icon>
      Ingredients
    </v-chip>
  </div>

  <div v-if="isMenuDefined">
    <v-container style="max-height: calc(100vh - 180px); overflow-y: auto;">
      <v-row class="justify-center ">
        <v-col cols="12" sm="6" md="4" lg="3" xl="2" v-for="(day, index) in days" :key="index" class="my-2">
          <show-day :day="day.catalan" :menuDay="menu[day.english]"
            @update:menusDay="(menusDay) => updateMenus(menusDay, day.english)" />

        </v-col>
      </v-row>
    </v-container>
  </div>
  <aggregate-ingredients v-model:dialog="dialog" :menu="menu" />
</template>

<script setup>
import ShowDay from '@/components/ShowDay.vue';
import AggregateIngredients from '@/components/AggregateIngredients.vue';
import { useMenusStore } from '@/stores/menusStore';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import arrxios from '@/modules/arrxios';
import { addMessage } from '@/modules/arrMessage';
import { useRouter } from 'vue-router';


// get menu as prop
const menus = useMenusStore();
const route = useRoute();
const router = useRouter();
const menuId = route.params.menuId;

const menu = ref({});
const dialog = ref(false);

if (!menuId) {
  console.log('menuId is required');
  router.push('/menuweeklist');
} else {
  const searchMenu = menus.searchById(menuId);
  if (searchMenu.length === 0) {
    console.log('menu not found');
    router.push('/menuweeklist');
    addMessage('Menu not found', 'error');
  } else {
    menu.value = searchMenu[0].menu;
  }
};
const isMenuDefined = computed(() => Object.keys(menu.value).length > 0);
const days = getWeekDays();


function getWeekDays() {
  const days = [
    { english: 'monday', catalan: 'Dilluns' },
    { english: 'tuesday', catalan: 'Dimarts' },
    { english: 'wednesday', catalan: 'Dimecres' },
    { english: 'thursday', catalan: 'Dijous' },
    { english: 'friday', catalan: 'Divendres' },
    { english: 'saturday', catalan: 'Dissabte' },
    { english: 'sunday', catalan: 'Diumenge' },
  ];
  return days;
}

const updateMenus = (newMenusDay, day) => {
  console.log('newMenu', newMenusDay);
  console.log('day', day);
  menu.value[day] = newMenusDay;
  console.log('menu', menu.value);
  arrxios.put(`/api/menus/day/${menuId}/${day}`, newMenusDay)
    .then((response) => {
      addMessage('Menu actualitzat');
    })
    .catch((error) => {
      console.log('error', error);
      addMessage('Error actualitzant el menu', 'error');
    });
};




</script>
