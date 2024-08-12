<template>
  <v-container>


    <v-layout align-center justify-center>
      <div>
        <PasswordField style="width: 300px;" v-model="oldPassword" label="Current Password"
          v-model:isValid="isOldPasswordValid" :verifyPassword="false"></PasswordField>
        <PasswordField style="width: 300px;" v-model:isValid="isNewPasswordValid" v-model="newPassword"
          label="New Password" :verifyPassword="true">
        </PasswordField>
        <PasswordField style="width: 300px;" v-model:isValid="isConfirmNewPasswordValid" v-model="confirmNewPassword"
          :rules="confirmPasswordRules" label="Confirm New Password" :verifyPassword="true">
        </PasswordField>
        <v-btn :disabled="!isOldPasswordValid || !isNewPasswordValid || !isConfirmNewPasswordValid"
          @click="submitForm">Change Password
        </v-btn>
      </div>
    </v-layout>
  </v-container>
</template>


<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import PasswordField from './PasswordField.vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { addMessage } from '@/modules/arrMessage';
import arrxios from '@/modules/arrxios';

const userStore = useUserStore();
const router = useRouter();

const oldPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const isOldPasswordValid = ref(false);
const isNewPasswordValid = ref(false);
const isConfirmNewPasswordValid = ref(false); 
 
const confirmPasswordRules = computed(() => [

  v => v === newPassword.value || 'Passwords do not match',
]);

const valid = computed(() => isOldPasswordValid.value && isNewPasswordValid.value && isConfirmNewPasswordValid.value);

var user = {};

const submitForm = async () => {
  if (valid.value) {
    try {

      if (await validaUsuariActual(userStore.account, oldPassword.value)) {
        user.password = newPassword.value
        const response = await arrxios.put(`/api/usuaris/${user.nom}`, user)
          .then((response) => {
            console.log(response);
            if (response.status === 200) {
              addMessage('Password modificada', 'success');
            }
          })
          .catch((error) => {
            console.error(error);
            addMessage('Error canviant password', 'error');
          });
      } else {
        addMessage('Pasword actual incorrecte', 'warning');
      }
    } catch (error) {
      console.error(error);
      addMessage('Error canviant el password', 'error');
    }
  }
};

async function validaUsuariActual(user, password) {
  try {
    const response = await arrxios.post('/api/logon', {
      nom: user,
      password: password
    });

    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

onMounted(async () => {
  try {
    if (!userStore.loggedIn) {
      router.push('/login');
      return;
    }
    const response = await arrxios.get(`/api/users/${userStore.account}`)
      .then((response) => {
        user = response.data;
      })
      .catch((error) => {
        addMessage("Error recuperant informació d'usuari", 'error');
      });

  } catch (error) {
    console.error(error);
    addMessage("Error recuperant informació d'usuari", 'error');

  }
});
</script>
