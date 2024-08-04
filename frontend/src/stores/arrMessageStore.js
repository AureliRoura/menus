import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMessageStore = defineStore('message', () => {
  const messages = ref([]);

  const addMessage = (text, color = 'success') => {
    const id = messages.value.length;
    messages.value.push({ id, text, color, show: true });

    // Recalcular ids
    for (let i = messages.value.length - 1, pos = 0; i >= 0; i--, pos++) {
      messages.value[i].pos = pos;
    }
  };

  const removeMessage = (id) => {
    // Eliminar el missatge amb l'id donat
    messages.value = messages.value.filter(message => message.id !== id);
  };

  return {
    messages,
    addMessage,
    removeMessage,
  };
});
