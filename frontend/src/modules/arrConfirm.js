import { ref, watchEffect } from 'vue';

let dialog = ref(false);
let confirm = ref(null);
let message = ref('');
let resolvePromise = null;

watchEffect(() => {
  if (confirm.value !== null) {
    resolvePromise(confirm.value);
    confirm.value = null;
  }
});

const setConfirm = (value) => {
  confirm.value = value;
  dialog.value = false;
};

const confirmMessage = (msg) => {
  message.value = msg;
  dialog.value = true;
  return new Promise((resolve) => {
    resolvePromise = resolve;
  });
};

export { dialog, confirm, message, setConfirm, confirmMessage };