<template>
  <div>
    <v-container fluid fill-height>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card class="elevation-12" color="bg-secondary" variant="outlined" round>
            <v-toolbar color="primary" dark flat>
              <v-toolbar-title>Verificació MFA</v-toolbar-title>
            </v-toolbar>
            <v-card-text>

              <v-row justify="center">

                <v-col v-for="(char, index) in 6" :key="index" cols="2">
                  <v-text-field v-model="mfaToken[index]" :ref="'mfaField' + index" maxlength="1"
                    class="text-center single-char-width" hide-details @input="onInput(index, $event)"
                    @keydown="handleBackspace(index, $event)" @paste="handlePaste" @focus="onFocus(index)" required
                    type="password"></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>


  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, getCurrentInstance } from 'vue';
import arrxios from '@/modules/arrxios';
import { addMessage } from '@/modules/arrMessage';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { loadAllData } from '@/modules/loadData';

const router = useRouter();
const userStore = useUserStore();
const username = ref(userStore.account);
const mfaToken = ref(Array(6).fill(''));

const instance = getCurrentInstance();
const proxy = instance?.proxy;

const verifyMFA = () => {
  const token = mfaToken.value.join('');
  if (username.value && token.length === 6) {
    arrxios.post('/api/users/verify', {
      username: username.value,
      token: token
    })
      .then(response => {
        if (response.status == 201 && response.data.isValid) {
          loadAllData();
          addMessage('Verificació MFA correcte', 'success');
          userStore.setLoggedIn(true);
          router.push({ path: '/menuweeklist' });

        } else {
          addMessage('Verificació del MFA incorrecte', 'error');
          mfaToken.value = Array(6).fill('');
          const firstFieldElement = proxy.$refs.mfaField0[0];
          if (firstFieldElement && typeof firstFieldElement.focus === 'function') {
            firstFieldElement.focus();
          }
        }
      })
      .catch(error => {
        console.error(error);
        addMessage('Problema en la verificació del MFA', 'error');
      });
  }
};

const onInput = (index, event) => {
  if (!proxy) return;

  mfaToken.value[index] = event.target.value;

  if (mfaToken.value[index].length === 1 && index < 5) {
    nextTick(() => {
      const nextField = index + 1;
      const nextFieldRef = `mfaField${nextField}`;
      const nextFieldElement = proxy.$refs[nextFieldRef][0];
      if (nextFieldElement && typeof nextFieldElement.focus === 'function') {
        nextFieldElement.focus();
      }
      mfaToken.value[nextField] = '';
    });
  } else if (index === 5 && mfaToken.value[index].length === 1) {
    verifyMFA();
  }
};

const handleBackspace = (index, event) => {
  if (index > 0 && event.key === 'Backspace') {
    mfaToken.value[index] = '';
    const previousField = index - 1;
    const previousFieldRef = `mfaField${previousField}`;
    const previousFieldElement = proxy.$refs[previousFieldRef][0];
    if (previousFieldElement && typeof previousFieldElement.focus === 'function') {
      previousFieldElement.focus();
    }
  }
};

const handlePaste = (event) => {
  event.preventDefault();
  const paste = (event.clipboardData || window.Clipboard).getData('text');
    if (paste.length === 6) {
      mfaToken.value = paste.split('');
      verifyMFA();
    } else {
      addMessage('El token MFA ha de tenir 6 caràcters', 'error');
    }
};

const onFocus = (index) => {
  mfaToken.value[index] = ''; // Fill the field with '0' when it gets focus
};

onMounted(() => {
  nextTick(() => {
    const firstFieldElement = proxy.$refs.mfaField0[0];
    if (firstFieldElement && typeof firstFieldElement.focus === 'function') {
      firstFieldElement.focus();
    }
  });
});
</script>

<style scoped>
.text-center {
  text-align: center;
}

.single-char-width {
  width: 2.4em;
  /* Adjust the width as needed to fit one character */
}
</style>