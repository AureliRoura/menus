<template>
  <v-card>
    <v-card-title>Categories</v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="5">
          <v-autocomplete v-model="newCategory.category" :items="mainCategories" label="Categories" auto-select-first
            required @input="inputCategoryCtl" style="min-width: 100px;">
          </v-autocomplete>
        </v-col>
        <v-col cols="12" sm="5">
          <v-autocomplete v-model="newCategory.value" :items="categoryValues" label="Valor" required
            @input="inputValueCtl" style="min-width: 100px;"> </v-autocomplete>
        </v-col>
        <v-col cols="12" sm="2" style="min-width: 80px;" class="align-self-center">
          <v-chip @click="addCategory" color="primary" :disabled="!valid" class="mb-3">Add</v-chip>
        </v-col>
      </v-row>
      <v-list class="list-container">
        <div v-for="(category, index) in categories" :key="index">
          <v-list-item v-for="(value, indexValue) in category.values" :key="indexValue" density="compact">
            <div class="d-flex justify-space-between">
              <div class="d-flex ">
                {{ category.category }} -&nbsp;
                <!-- Corrected: Use value for href if category.category is 'url', otherwise display category and value -->
                <a v-if="category.category === 'url'" :href="value" target="_blank"> {{ value }}</a>
                <span v-else> {{ value }}</span>
              </div>
              <v-list-item-action>
                <v-icon color="red" @click="removeCategory(category.category, value)">mdi-delete</v-icon>
              </v-list-item-action>
            </div>
          </v-list-item>
        </div>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, reactive, watch, computed, toRef } from 'vue';
import { useCategoriesStore } from '@/stores/categoriesStore';
import { addMessage } from '@/modules/arrMessage';

const categoriesStore = useCategoriesStore();

const props = defineProps({
  categories: Array
});

let categories = toRef(props, 'categories');

//let valid = ref(false);
let newCategory = reactive({ category: '', value: '' });
newCategory.category = '';
newCategory.value = '';

const emit = defineEmits(['update:categories']);

watch(() => categories.value, (newCategorie) => {
  emit('update:categories', newCategorie);
});

let valid = computed(() => {
  //search if category exists in Ingredients

  return Object.values(newCategory).every(value => value !== '');
});

let newCategorybutton = ref(true);

const mainCategories = computed(() => categoriesStore.categories.map(category => category.category).reduce((acc, val) => acc.includes(val) ? acc : [...acc, val], []).sort());

const categoryValues = computed(() => {
  if (newCategory.category === '') {
    return [];
  }
  const category = categoriesStore.searchByCategory(newCategory.category)[0];
  if (!category || !category.values || category.values.length === 0) {
    return [];
  }
  return category.values.reduce((acc, val) => acc.includes(val) ? acc : [...acc, val], []).sort();
});

const inputCategoryCtl = (value) => {
  newCategory.category = value.target.value;
}

const inputValueCtl = (value) => {
  newCategory.value = value.target.value;
}

const addGlobalCategory = () => {
  // if not exists add to categories
  if (categoriesStore.getIndexByCategory(newCategory.category) === -1) {
    if (newCategory.value !== '') {
      categoriesStore.addCategory({ category: newCategory.category, values: [newCategory.value] });
    } else {
      categoriesStore.addCategory({ category: newCategory.category, values: [] });
    }
  } else {
    if (newCategory.value !== '') {
      categoriesStore.addValueToCategory(newCategory.category, newCategory.value);
    }
  }
};

function findCategoryByName(categoryName) {
  return categories.value.find(category => category.category === categoryName);
}

const addCategory = () => {
  addGlobalCategory();
  if (newCategory.category === '' || newCategory.value === '') {
    addMessage('Categoria i valor no poden ser buits', 'error');
    return;
  }
  let foundCategory = findCategoryByName(newCategory.category);
  if (foundCategory) {
    if (foundCategory.values.includes(newCategory.value)) {
      addMessage('Valor ja existeix', 'warning');
      return;
    }
    foundCategory.values.push(newCategory.value);
  } else {
    categories.value.push({ category: newCategory.category, values: [newCategory.value] });
  }
  addMessage('Categoria afegida');
  newCategory.category = '';
  newCategory.value = '';
  newCategorybutton = false;
}

const removeCategory = (category, value) => {
  // Find the index of the category
  const categoryIndex = categories.value.findIndex(c => c.category === category);
  if (categoryIndex !== -1) {
    // Find the index of the value in the category's values array
    const valueIndex = categories.value[categoryIndex].values.findIndex(v => v === value);
    if (valueIndex !== -1) {
      // Remove the value
      categories.value[categoryIndex].values.splice(valueIndex, 1);
      // If the category has no more values, remove the category
      if (categories.value[categoryIndex].values.length === 0) {
        categories.value.splice(categoryIndex, 1);
      }
      addMessage('Categoria i valor eliminats');
    } else {
      addMessage('Valor no trobat', 'error');
    }
  } else {
    addMessage('Categoria no trobada', 'error');
  }
};


</script>

<style scoped>
.list-container {
  max-height: calc(3em * 3);
  /* 3 lines of text */
  overflow-y: auto;
  /* Add a vertical scrollbar */
}
</style>