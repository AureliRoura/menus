<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center bg-blue">
        Llista d'ingredients
        <v-spacer></v-spacer>
        <v-btn icon @click="copyToClipboard" class="mr-2">
          <v-icon>mdi-content-copy</v-icon>
        </v-btn>
        <v-btn icon @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-text-field v-model="numberOfPersons" label="Number of Persons" type="number"
          :rules="[rules.required]"></v-text-field>
        <v-list style="max-height: 300px; overflow-y: auto;">

          <v-list-item v-for="(ingredient, index) in aggregatedIngredients" :key="index">
            <div class="d-flex justify-space-between">
              <v-list-item-title
                :class="{ 'text-decoration-line-through text-red-lighten-1': activeIngredient[ingredient.name+ingredient.unit] }">
                {{ ingredient.name }}: {{ ingredient.quantity !== 0 ? ingredient.quantity + ' ' + ingredient.unit : ingredient.unit }}
              </v-list-item-title>
              <v-list-item-action>
                <div>
                  <v-icon v-if="!ingredient.manual" @click="EditIngredient(index)" class="mr-2" color="blue" :disabled="activeIngredient[ingredient.name+ingredient.unit]">mdi-pencil</v-icon>
                  <v-icon v-else @click="unsetIngredient(ingredient.oldIndex)" class="mr-2" color="red">mdi-pencil-off</v-icon>
                  <v-icon @click="activeIngredient[ingredient.name+ingredient.unit] = !activeIngredient[ingredient.name+ingredient.unit]">{{ !activeIngredient[ingredient.name+ingredient.unit] ?
                    'mdi-minus' : 'mdi-plus' }}</v-icon>
                </div>
              </v-list-item-action>
            </div>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogList" max-width="400" >
    <v-card>
      <v-card-title>Llista</v-card-title>
      <v-card-text>
        <v-textarea v-model="listText" readonly></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-chip class="mr-2" color="green darken-1" text @click="dialogList = false">Tanca</v-chip>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogEdit" max-width="400px">
    <v-card>
      <v-card-title>Edita Ingredient</v-card-title>
      <v-card-text>
        {{ editIngredient.name }}
        <br>
        <v-text-field v-model="editIngredient.quantity" label="Quantity" type="number" :rules="[rules.required]"></v-text-field>
        <v-autocomplete v-model="editIngredient.unit" :items="units" item-title="unit" item-value="unit"
          label="Unitats" auto-select-first required style="min-width: 100px;"></v-autocomplete>
      </v-card-text>
      <v-card-actions>
        <v-chip color="red" @click="dialogEdit = false">Cancel·lar</v-chip>
        <v-chip color="green" @click="editManual">Guardar</v-chip>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script setup>
import { ref, computed, watch } from 'vue';
import aggregateIngredients from '@/modules/aggregateIngredients';
import { addMessage } from '@/modules/arrMessage';
import { useUnitsStore } from '@/stores/unitsStore';

const { units } = useUnitsStore();

// Props
const props = defineProps({
  dialog: Boolean,
  menu:
  {
    type: Object,
    default: () => null
  },
  recipeList:
  {
    type: Array,
    default: () => []
  }
});


// Data
const dialog = ref(props.dialog);
const dialogList = ref(false);
const dialogEdit = ref(false);
const editIngredient = ref({ name: '', quantity: 0, unit: '' });
const numberOfPersons = ref(1);
const listText = ref('');
const activeIngredient = ref([]);
const editIngredients = ref([]);
let currentIngredient = -1;
const emit = defineEmits(['update:dialog']);


watch(() => props.dialog, (value) => {
  dialog.value = value;
});

watch(dialog, (value) => {
  emit('update:dialog', value);
});

const copyToClipboard = () => {
  try {
    // only for active ingredients
    listText.value = aggregatedIngredients.value.filter((ingredient) => !activeIngredient.value[ingredient.name+ingredient.unit]).map(ingredient => `${ingredient.name}: ${ingredient.quantity} ${ingredient.unit}`).join('\n');
    navigator.clipboard.writeText(listText.value);
    addMessage('Ingredients copiats al porta-retalls', 'success');
  } catch (error) {
    dialogList.value = true;
  }
};

const EditIngredient = (index) => {
  editIngredient.value = {...aggregatedIngredients.value[index]};
  dialogEdit.value = true;
  currentIngredient = index;
};

const editManual = () => {  
  editIngredients.value[aggregatedIngredients.value[currentIngredient].name+aggregatedIngredients.value[currentIngredient].unit] = {...editIngredient.value};
  dialogEdit.value = false;
  editIngredients.value = {...editIngredients.value};
}

// Validation rules
const rules = {
  required: value => !!value || 'Required.'
};

// Computed property to get aggregated ingredients
const aggregatedIngredients = computed(() => {
  let ingredientsList = aggregateIngredients(props.menu, props.recipeList, numberOfPersons.value);
  // replace ingredient if exits on editIngredients
  ingredientsList.forEach((ingredient) => {
    if (editIngredients.value[ingredient.name+ingredient.unit]) {
      ingredient.oldIndex = ingredient.name+ingredient.unit;
      ingredient.quantity = editIngredients.value[ingredient.name+ingredient.unit].quantity;
      ingredient.unit = editIngredients.value[ingredient.name+ingredient.unit].unit;
      ingredient.manual = true;
    }
  });
  return ingredientsList;
});

const unsetIngredient = (name) => {
  delete editIngredients.value[name];
  editIngredients.value = {...editIngredients.value};
}
</script>