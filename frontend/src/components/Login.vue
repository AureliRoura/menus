<template>
  <v-container fluid fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Login form</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field label="Username" name="username" prepend-icon="mdi-account" type="text"
                v-model="username" autofocus :autocapitalize="'none'"></v-text-field>
              <PasswordField id="password" label="Password" name="password" prepend-icon="mdi-lock" :verifyPassword="false"
                v-model="password" @keyup.enter="login"></PasswordField>
                <v-btn text @click="redirectToRegister">Ets nou? Registra't</v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="login">Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>

import PasswordField from '@/components/PasswordField.vue';
import controlLogin from '@/modules/ControlLogin';
import { useRouter } from 'vue-router';

const router = useRouter();

const { username, password, login,  } = controlLogin();

const redirectToRegister = () => {
  router.push('/newuser');
}

</script>

<style scoped>
.v-application--wrap {
  min-height: 100vh;
}
</style>