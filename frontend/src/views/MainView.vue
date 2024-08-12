<template>
  <div id="main-window" class="fill-height">
      <MainMenu />
      <arr-message />
      <arr-confirm />
      <app-footer />
  </div>
</template>

<script setup>
import { defineComponent } from 'vue';
import MainMenu from '@/components/MainMenu.vue';
import ArrMessage from '@/components/ArrMessage.vue';
import ArrConfirm from '@/components/ArrConfirm.vue';
import AppFooter from '@/components/AppFooter.vue';

defineComponent({
  components: {
    MainMenu,
    ArrMessage,
    ArrConfirm
  }
})


</script>

<style scoped>
#main-window {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

header {
  background-color: #333;
  color: white;
  padding: 10px;
}

main {
  flex: 1;
}

footer {
  background-color: #333;
  color: white;
  padding: 10px;
}
</style>