<template>
  <div>
    <div v-if="returnedUrl">
      <v-row>
        <v-col cols="12" class="text-center">
          <h3>MFA aplicació Menus:</h3>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" class="text-center">
          <img :src="returnedUrl" alt="Base64 Image" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" class="text-center">
          <v-btn @click="router.push('/')" color="primary">Finalitza sense Verificació</v-btn>
        </v-col>
      </v-row>
    </div>
    <div v-if="isRegistred">
      <verify-token></verify-token>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import arrxios from '@/modules/arrxios';
import { addMessage } from '@/modules/arrMessage';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import VerifyToken from './VerifyToken.vue';



const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const returnedUrl = ref('');
const username = ref(route.params.username);
let secret = ref('');
let exit = false;
let isRegistred = ref(false);

if (username.value === undefined) {
  exit = true;
  router.push('/login');
}

if (!userStore.loggedIn) {
  exit = true;
  router.push('/login');
}

if (username.value !== userStore.account) {
  exit = true;
  router.push('/login');
}

if (!exit) {
  await arrxios.post('/api/users/register', {
    username: username.value
  })
    .then((response) => {
      if (response.status === 201) {
        secret.value = response.data.secret;
        returnedUrl.value = response.data.url;
        console.log(returnedUrl.value);
        addMessage('Ususari regiestrat', 'success');
        isRegistred.value = true;
      } else {
        addMessage('Error registrant usuari', 'error');
      }
    })
    .catch((error) => {
      addMessage('Error registrant usuari', 'error');
      console.log(error);
    });
}
</script>