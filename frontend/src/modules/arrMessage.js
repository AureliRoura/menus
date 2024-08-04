import { useMessageStore } from '@/stores/arrMessageStore.js';


export function addMessage(text, color = 'success') {
  const store = useMessageStore();
  store.addMessage(text, color);
}

