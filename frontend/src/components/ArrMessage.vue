<template>
  <transition-group name="list" tag="div">
    <div v-for="(item, index) in messages" :key="item.id">
      <teleport to="body">
      <v-snackbar v-model="item.show" :color="item.color" :timeout="5000" rounded="pill" :close-on-content-click="true"
        :style="{ bottom: `${item.pos * 60}px`, position: 'fixed', width: '100%' }" @close="removeMessage(item.id)"
        text-align: center>
        <div class="text-center" style="width: 100%">
          {{ item.text }}
        </div>
      </v-snackbar>
      </teleport>
    </div>
  </transition-group>
</template>

<script setup>
import { useMessageStore } from '@/stores/arrMessageStore.js';

const store = useMessageStore();

const messages = store.messages;

const removeMessage = store.removeMessage;

/* addMessage('Hello, World!'); */
</script>

<style scoped>
.list-enter-active, .list-leave-active {
  transition: all 0.5s;
}
.list-enter, .list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>