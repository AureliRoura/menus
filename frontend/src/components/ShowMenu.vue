<template>
  <v-card class="mx-auto" color="surface-variant" max-width=400 min-width=200>
    <v-card-title class="d-flex align-center">
      <span class="font-weight-black">{{ apat }}</span>
    </v-card-title>
    <v-card-text class="bg-surface-light pt-4">
      <div v-for="(dish, index) in menu" :key="index" class="border pt-2 pl-2 pr-2 pb-2 mb-2">
        <span class="hover-cursor" @click="showText[index] = !showText[index]">
          <v-table>
            <tbody>
              <tr class="bg-grey text-black">
                <td>{{ dish.name }}</td>
              </tr>
            </tbody>
          </v-table>
        </span>
        <v-slide-y-transition>
          <div v-if="showText[index]">
            <div v-if="dish.ingredients && dish.ingredients.length">
              <h3>Ingredients:</h3>
              <v-list density="compact" class="text-justify">
                <v-list-item v-for="(value, key) in dish.ingredients" :key="key">
                  {{ key + 1 + ': ' + value.name + ' - ' }}
                  <span v-if="value.quantity > 0"> {{ value.quantity + ' ' }}</span>
                  <span> {{ value.unit }} </span>
                </v-list-item>
              </v-list>
            </div>
            <div v-if="dish.steps && dish.steps.length">
              <h3>Passos:</h3>
              <v-list density="compact" class="text-justify">
                <v-list-item v-for="(step, index) in dish.steps" :key="index">
                  {{ index + 1 }}. {{ step }}
                </v-list-item>
              </v-list>
            </div>
            <div v-if="dish.desc">

              <br>
              <p v-html="dish.desc.replace(/\./g, '.<br>')"></p>
              <br>
            </div>
            <p>Temps de cocció: {{ dish.time }}</p>
          </div>
        </v-slide-y-transition>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue';

const showText = ref([]);

const props = defineProps({
  apat: String,
  menu: Array,
});

watch(props.menu, (newMenu) => {
  console.log('New menu', newMenu);

  showText.value = [];
});
</script>

<style scoped>
.hover-cursor {
  cursor: pointer;
}
</style>