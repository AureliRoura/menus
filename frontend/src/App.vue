<template>
  <v-app>
    <v-main>
      <MainView />
    </v-main>
  </v-app>
</template>

<script setup>
import MainView from '@/views/MainView.vue';
import { confirmMessage } from './modules/arrConfirm';
import { onMounted, provide } from 'vue';
import { useUserStore } from '@/stores/userStore';
import arrxios from '@/modules/arrxios.js';
import ControlLogin from './modules/ControlLogin';
import { loadAllData } from './modules/loadData.js';

console.log(import.meta.env.VITE_APP_TITLE);
provide('confirmMessage', confirmMessage);

const userStore = useUserStore();

if (localStorage.getItem('MenuAccount') && localStorage.getItem('MenuAuthentication')) {
  userStore.setAccount(localStorage.getItem('MenuAccount'));
  userStore.setAuthentication(localStorage.getItem('MenuAuthentication'));
  arrxios.get('/api/checksession')
    .then((response) => {
      if (response.status == 200) {
        userStore.setLoggedIn(true);
        console.log ('userStore.account', userStore.account);
        console.log('userStore.loggedIn', userStore.loggedIn);
        loadAllData();
        console.log('data loaded');
      } else {
        const instaceofControlLogin = new ControlLogin();
        instaceofControlLogin.logout();
      }
    })
    .catch((error) => {
      const instaceofControlLogin = new ControlLogin();
      instaceofControlLogin.logout();
    });
}

 onMounted(() => {
  document});
   
</script>
