<template>
  <v-row class="fill-height">
    <v-col>
      <v-card class="fill-height">
        <v-card-title class="bg-blue">
<!--           <v-btn icon class="float-right">
            <v-icon>mdi-magnify</v-icon>
          </v-btn> -->
          <v-btn icon class="float-right mr-3" v-bind="login">
            <v-icon v-if="loggedIn" color="green">mdi-account-check</v-icon>
            <v-icon v-else>mdi-account </v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <span class="float-right mr-3 mt-2">{{ userStore.account }} </span>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
            </template>
            <v-list>
              <div v-for="(item, i) in items" :key="i" @click="selectItem(i)">
                <router-link :to="item.link" v-if="!('loggedIn' in item) || item.loggedIn === userStore.loggedIn">
                  <v-list-item :active="item.selected">
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                  </v-list-item>
                </router-link>
              </div>
            </v-list>
          </v-menu>
          <span class="ml-3  text-h5">{{ $route.name }}</span>
        </v-card-title>
        <v-card-text class="fill-height">
          <router-view></router-view>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>

import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/userStore';

//const store = useStore();
const userStore = useUserStore();
let items = ref([
  { title: 'Home', link: '/', selected: false },
  //  { title: 'Show Menu', link: '/menu', selected: false},
  //  { title: 'Show Weekly Menu', link: '/showweekview', selected: false},
  { title: 'Menús', link: '/menuweeklist', selected: false, loggedIn: true },
  { title: 'Ingredients', link: '/editingredients', selected: false, loggedIn: true },
  { title: 'Receptes', link: '/editrecipes', selected: false, loggedIn: true },
  { title: 'Carrega des de JSON', link: '/uploadmenu', selected: false, loggedIn: true },
  { title: 'Adminstració de Components', link: '/admindata', selected: false, loggedIn: true },
  //  { title: 'Edita Categories', link: '/editcategoriestorecipe', selected: false, loggedIn: true},
  //  { title: 'Edit Day', link: '/editday', selected: false},
  //  { title: 'Edit Week', link: '/editweek', selected: false}, 
  //  { title: 'New User', link: '/newuser', selected: false, loggedIn: false},
  { title: 'Canvi de Password', link: '/changepassword', selected: false, loggedIn: true },
  { title: 'Activa MFA', link: '/register/' + userStore.account, selected: false, loggedIn: true },
  { title: 'About', link: '/about', selected: false },
  { title: 'Login', link: '/login', selected: false, loggedIn: false },
  //  { title: 'Admin', link: '/admin', selected: false , loggedIn: true},
  { title: 'Logout', link: '/logout', selected: false, loggedIn: true },
])


//const loggedIn = computed(() => store.getters.loggedIn);

const loggedIn = computed(() => userStore.loggedIn);
const account = computed(() => userStore.account);

const login = {
  to: '/logout',
  icon: 'mdi-account',
}
const selectItem = (index) => {
  items.value.forEach((item, i) => {
    item.selected = i === index
  })
}

</script>