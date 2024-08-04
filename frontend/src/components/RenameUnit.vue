<template>
  <v-container min-width="400px">
    <v-progress-linear :active="working" :indeterminate="working" color="deep-orange" absolute
      bottom></v-progress-linear>
    <v-row>
      <v-col cols="12" md="6">
        <v-autocomplete v-model="selectedFromUnit" :items="unitsItems" label="Unitat a Renombrar" item-title="unit"
          item-value="_id" return-object></v-autocomplete>
      </v-col>
      <v-col cols="12" md="6">
        <v-autocomplete v-model="selectedToUnit" :items="unitsItemsTo" label="Nova Unitat" item-title="unit"
          item-value="_id" return-object></v-autocomplete>
      </v-col>

      <v-col cols="12" class="text-right">
        <v-chip @click="renameUnit" color="primary" :disabled="!correctData">Renombrar</v-chip>
      </v-col>
    </v-row>
  </v-container>

</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';
import { useUnitsStore } from '@/stores/unitsStore';
import arrxios from '@/modules/arrxios';
import { addMessage } from '@/modules/arrMessage';
import { loadUints } from '@/modules/loadData';

const confirmMessage = inject('confirmMessage');

const unitsStore = useUnitsStore();
const selectedFromUnit = ref(null);
const selectedToUnit = ref(null);
const working = ref(false);


// Assuming your store has a computed property or a state array called 'units'
// that returns an array of unit objects with 'id' and 'name' properties
const unitsItems = computed(() => unitsStore.units);
// computed that explude the selectedFromUnit from the unitItems
const unitsItemsTo = computed(() => {
  if (!selectedFromUnit.value) return unitsStore.units;
  return unitsStore.units.filter(unit => unit._id !== selectedFromUnit.value._id);
});

// verify from and to units are informed
const correctData = computed(() => selectedFromUnit.value && selectedToUnit.value);

watch(() => selectedFromUnit.value, (value) => {
  if (selectedToUnit.value && selectedToUnit.value._id === value._id) {
    selectedToUnit.value = null;
  }
});

const renameUnit = () => {
  console.log('Rename unit', selectedFromUnit.value, selectedToUnit.value);
  confirmMessage('Estàs segur que vols renombrar la unitat?')
    .then((result) => {
      if (result) {

        working.value = true;
        arrxios.put('/api/units/rename', { oldUnitName: selectedFromUnit.value.unit, newUnitName: selectedToUnit.value.unit })
          .then((response) => {
            console.log(response);
            if (response.status === 200) {
              loadUints();
              addMessage('Unitat renombrada correctament', 'success');
              selectedFromUnit.value = null;
              selectedToUnit.value = null;
            } else {
              addMessage('Error al renombrar la unitat', 'error');
            }
          })
          .catch((error) => {
            console.error(error);
            addMessage('Error al renombrar la unitat' + error, 'error');
          })
          .finally(() => {
            working.value = false;
          });
      } else {
        addMessage('Renombrament de la unitat cancel·lat', 'info');
      }

    })
    .catch(() => {
      addMessage('Renombrament de la unitat cancel·lat', 'error');
    });
};

</script>