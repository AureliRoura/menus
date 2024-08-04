<template>  
<div class="Login">
<v-container class="fill-height">
  
  <v-responsive class="align-centerfill-height mx-auto" max-width="900">

    <div class="py-4" />

    <v-row>
      <v-col  >
        <LoginForm @submit="handleLogin"/>
      </v-col>
    </v-row>
  </v-responsive>
</v-container>
</div>
</template>

<script>
import { defineComponent } from 'vue';
import LoginForm from '@/components/Login.vue';

export default defineComponent({


    components: {
        LoginForm
    },

  setup () {
    const handleLogin = (credentials) => {
      
    }

    return {
      handleLogin
    }
  }
})
</script>

<style scoped>
.login {
  margin: 0 auto;
  max-width: 400px;
  padding: 20px;
}

.login h1 {
  margin-bottom: 20px;
}
</style>