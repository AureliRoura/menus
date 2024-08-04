<template>
  <v-container fill-height fluid>
    <v-row justify="center" >
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-text-field style="width: 300px;" v-model="username" label="Username" required></v-text-field>
        <v-text-field style="width: 300px;" v-model="email" :rules="emailRules" label="E-mail" required></v-text-field>
        <PasswordField style="width: 300px;" v-model="password" :rules="passwordRules" label="Password"
          v-model:isValid="isPasswordValid" required>
        </PasswordField>
        <PasswordField style="width: 300px;" v-model="passwordConfirm" :rules="passwordConfirmRules"
          label="Confirm Password" v-model:isValid="isPasswordConfirmValid" required></PasswordField>
        <v-btn :disabled="!isFormValid" @click="insert">Nou Usuari</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import arrxios from '@/modules/arrxios';
import { useRouter } from 'vue-router';
import PasswordField from '@/components/PasswordField.vue';
import { addMessage } from '@/modules/arrMessage';

const router = useRouter();
const username = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const isPasswordValid = ref(false);
const isPasswordConfirmValid = ref(false);


const nameRules = [
  v => !!v || 'El nom és obligatori',
  v => (v && v.length <= 10) || 'El nom ha de tenir menys de 10 caràcters',
];
const emailRules = [
  v => !!v || 'El correu electrònic és obligatori',
  v => /.+@.+\..+/.test(v) || 'El correu electrònic ha de ser vàlid',
];

const passwordRules = [
  v => !v.includes(username.value) || 'El nom d\'usuari no pot formar part de la contrasenya',
];

const passwordConfirmRules = [
  v => !!v || 'La confirmació de la contrasenya és obligatòria',
  v => v === password.value || 'Les contrasenyes han de coincidir',
];

const isFormValid = computed(() => {
  const usernameValid = nameRules.every(rule => rule(username.value) === true);
  const emailValid = emailRules.every(rule => rule(email.value) === true);
  const passwordConfirmValid = passwordConfirmRules.every(rule => rule(passwordConfirm.value) === true);
  return usernameValid && emailValid && passwordConfirmValid && isPasswordValid.value && isPasswordConfirmValid.value;
});

function insert() {
  if (password.value !== passwordConfirm.value) {
    addMessage('Les contrasenyes no coincideixen', 'warning');
    console.log('Passwords do not match');
    return;
  }
  console.log({ nom: username.value, email: email.value, password: password.value });
  arrxios.post('/api/users', {
    nom: username.value,
    email: email.value,
    password: password.value
  })
    .then(function (response) {
      if (response.status === 201) {
        addMessage('Usuari creat', 'success');
        router.push('/'); // Redirect to the home page;
      } else if (response.status === 409) {
        console.log('User already exists');
        addMessage('Usuari ja existeix', 'error');
      } else {
        console.log('Error');
        addMessage('Error creant l\'usuari', 'error');
      }
    })
    .catch(function (error) {
      console.log(error);
      addMessage(`Error creant l\'usuari: ${error}`, 'error');
    });
}

</script>