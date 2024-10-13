<template>

  <div class="text-center">
    <v-menu>
      <template v-slot:activator="{ props }">
        <span v-bind="props" class="cursor-pointer">
          <h2> {{ rating[itemSelected]?.title ?? 'undefined' }}
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

      <v-list v-if="!props.readonly">
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
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();

const props = defineProps({
  rating: {
    type: Number,
    default: 0
  },
  ratingList: {
    type: Object,
    default: () => ({})
  },
  readonly: {
    type: Boolean,
    default: false
  }
})
const items = ref(rating)
const menuVisible = ref(false);
const itemSelected = ref(props.rating || 0);

const ratingList = computed(() => {
  var list = {}; 
  if (Object.keys(props.ratingList).length == 0) return {};
  // extract current user rating from list
  for (const key in props.ratingList) {
    if (key !== userStore.account && props.ratingList[key] !== 0) {
      list[key] = props.ratingList[key];
    }
  }
  return list || {}
});

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

const hasRatings = computed(() =>   Object.keys(ratingList.value).length > 0);
</script>