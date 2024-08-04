<template>
  <v-text-field v-model="password" :rules="combinedRules" :label="label" :type="showPassword ? 'text' : 'password'"
    required>
    <template v-slot:append>
      <v-icon tabindex="-1" @click="showPassword = !showPassword">{{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
    </template>
  </v-text-field>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

    const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  rules: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: 'Password'
  },
  isValid: {
    type: Boolean,
    default: false
  },
  verifyPassword: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'update:isValid']);
    const showPassword = ref(false);
    const password = ref(props.modelValue);

    watch(() => props.modelValue, newVal => {
      password.value = newVal;
    });

    const isValid = computed(() => {
      return combinedRules.value.every(rule => rule(password.value) === true);
    });

    watch(password, newVal => {
      emit('update:modelValue', newVal);
      emit('update:isValid', isValid.value);
    });

    const passwordRules = [
      v => !!v || 'La contrasenya és obligatòria',
      v => (v && v.length >= 8) || 'La contrasenya ha de tenir almenys 8 caràcters',
      v => (v && /[A-Z]/.test(v)) || 'La contrasenya ha de contenir almenys una lletra majúscula',
      v => (v && /[a-z]/.test(v)) || 'La contrasenya ha de contenir almenys una lletra minúscula',
      v => (v && /[0-9]/.test(v)) || 'La contrasenya ha de contenir almenys un número',
      v => (v && /[^A-Za-z0-9]/.test(v)) || 'La contrasenya ha de contenir almenys un caràcter especial',
      v => {
        const simplePasswords = ['password', '12345678', 'qwerty', 'admin'];
        return !simplePasswords.some(simplePassword => v.includes(simplePassword)) || 'La contrasenya no pot contenir una contrasenya comuna';
      },
    ];


    const combinedRules = computed(() => {
      if ((props.verifyPassword === false || props.verifyPassword === 'false')) {
        return [];
      }
      let rules = [];
      if (props.rules && Array.isArray(props.rules) && props.rules.length > 0) {
        rules = [...props.rules];
      }
      return [...rules, ...passwordRules];
    });

</script>