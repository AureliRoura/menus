<template>
      <v-progress-linear
        :active="working"
        :indeterminate="working"
        color="deep-orange"
        absolute
        bottom
      ></v-progress-linear>
  <v-list>
    <!-- Camp de filtre -->
    <v-text-field v-model="filter" label="Filtrar Menús" outlined dense></v-text-field>
    <v-list-item class="text-h6 bg-primary">
      <div class="d-flex justify-space-between">
        Menus
        <v-list-item-action>
          <v-icon @click="addMenu()">mdi-plus</v-icon>
        </v-list-item-action>
      </div>
    </v-list-item>
    <!-- Utilitzem menusFiltered en lloc de menusWeek -->
    <v-list-item v-for="(menu, index) in menusFiltered" :key="menu._id" @mouseover="hover = index"
      @mouseleave="hover = null" :class="hover === index ? 'bg-blue-grey-darken-1' : ''" rounded>
      <div class="d-flex justify-space-between">
        <div>
          <v-list-item-title class="cursor-pointer" v-text="menu.name" @click="selectMenu(menu)"></v-list-item-title>
        </div>
        <div class="d-flex">
          <v-list-item-action>
            <v-icon class="mr-4" @click="showList(menu)">mdi-list-box-outline</v-icon>
          </v-list-item-action>
          <v-list-item-action>
            <v-icon color="red" @click="deleteMenu(menu, index)">mdi-delete</v-icon>
          </v-list-item-action>
        </div>
      </div>
    </v-list-item>
    <new-menu v-model:dialog="dialog" @submit="createMenu" />
    <aggregate-ingredients v-model:dialog="dialogList" :menu="menuList" />
  </v-list>

</template>


<script setup>
import NewMenu from './NewMenu.vue';
import AggregateIngredients from './AggregateIngredients.vue';
import { ref, inject, computed } from 'vue';
import { useMenusStore } from '@/stores/menusStore';
import { addMessage } from '@/modules/arrMessage';
import menus from '@/modules/menus';
import { useRouter } from 'vue-router';


const router = useRouter();
const menusStore = useMenusStore();
const confirmMessage = inject('confirmMessage');
const menusWeek = ref([]);
const working = ref(false);


menusWeek.value = menusStore.menus;
const filter = ref(''); // Valor del filtre

// Computed property per filtrar els menús
const menusFiltered = computed(() => {
  if (!filter.value) {
    return menusWeek.value;
  }
  return menusWeek.value.filter(menu => menu.name.toLowerCase().includes(filter.value.toLowerCase()));
});

const selectedMenu = ref(null);
const hover = ref(null);
const dialog = ref(false);
const dialogList = ref(false);
const menuList = ref({});
let operation = '';

const createMenu = (formData) => {
  var menu = {
    "menu": {
      "monday": {
        "lunch": [],
        "dinner": []
      },
      "tuesday": {
        "lunch": [],
        "dinner": []
      },
      "wednesday": {
        "lunch": [],
        "dinner": []
      },
      "thursday": {
        "lunch": [],
        "dinner": []
      },
      "friday": {
        "lunch": [],
        "dinner": []
      },
      "saturday": {
        "lunch": [],
        "dinner": []
      },
      "sunday": {
        "lunch": [],
        "dinner": []
      }
    },
    "name": formData.name
  };
  dialog.value = false;
  menus.createMenu(menu)
    .then(() => {
      addMessage('Menu creat');
    })
    .catch(() => {
      addMessage('Error creant el menu', 'error');
    });

};

const selectMenu = (menu) => {
  working.value = true;
  operation = 'edit';
  selectedMenu.value = menu;
  menus.getMenu(selectedMenu.value._id)
    .then(() => {
      router.push(`/menuweek/${selectedMenu.value._id}`)
    })
    .catch(() => {
      addMessage('Error carregant el menu', 'error');
    });

};

const deleteMenu = (menu, index) => {
  operation = 'delete';
  confirmMessage(`Estas segur que vols elminar el menu: ${menu.name}?`)
    .then((result) => {
      if (result) {
        menus.deleteMenu(menu._id, index)
          .then(() => {
            addMessage('Menu eliminada');
          })
          .catch((error) => {
            addMessage(error, 'error');
          });
      }
    })
    .catch((error) => {
      addMessage(`Error eliminant el menu: ${error}`, 'error');
    });
};

const addMenu = () => {
  operation = 'add';
  dialog.value = true;
};

const showList = (menuSel) => {
  menus.getMenu(menuSel._id)
    .then((response) => {
      menuList.value = response.menu;
      dialogList.value = true;
    })
    .catch((error) => {
      addMessage(`Error carregant el menu: ${error}`, 'error');
    });
};

defineExpose({
  menusStore,
  dialog,
  selectedMenu,
  selectMenu,
});

</script>