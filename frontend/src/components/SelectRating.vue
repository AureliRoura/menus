<template>

  <div class="text-center">
    <v-menu>
      <template v-slot:activator="{ props }">
        <span v-bind="props" class="cursor-pointer">
          <h2>{{ rating[itemSelected]?.title ?? 'undefined' }}
            <v-tooltip v-if="hasRatings" activator="parent" location="bottom" open-on-hover>
              <!--  show list key value pairs  -->
              <v-list>
                <v-list-item v-for="(value, key) in ratingList" :key="key" density="compact" rounded>
                  <v-list-item-title>{{ key }}: {{ items[value].title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-tooltip>
          </h2>
        </span>
      </template>

      <v-list>
        <v-list-item v-for="(item, index) in items" :key="index" @click="selectItem(item)" density="compact"
          rounded="lg" :class="item.value === itemSelected ? 'bg-blue-darken-4' : ''">
          <v-list-item-title>{{ item.title }} {{ item.desc }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>
<script setup>
import { ref, watch, computed } from 'vue'
import rating from '@/modules/rating';
const props = defineProps({
  rating: {
    type: Number,
    default: 0
  },
  ratingList: {
    type: Object,
    default: () => ({})
  }
})
const items = ref(rating)
const menuVisible = ref(false);
const itemSelected = ref(props.rating || 0);
const ratingList = computed(() => props.ratingList || {});

const emit = defineEmits(['update:rating']);

watch(() => props.rating, (value) => {
  itemSelected.value = value;
});

const selectItem = (item) => {
  menuVisible.value = false; // Close the menu
  if (item.value === itemSelected.value) return; // If the selected item is the same as the current one, do nothing
  itemSelected.value = item.value
  emit('update:rating', item.value); // Emit the selected value
};

const hasRatings = computed(() => {
 if (Object.keys(props.ratingList).length == 0) return false;
 // verify all ratings are 0
  for (const key in props.ratingList) {
    if (props.ratingList[key] !== 0) return true;
  }
  return false;
});
</script>