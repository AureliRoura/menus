<template>
  <teleport to="#app">
    
  <v-dialog v-model="dialog" max-width="500px" persistent>
    <v-card>
      <v-card-title>Confirma</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red darken-1" text @click="setConfirm(false)">Cancela</v-btn>
        <v-btn color="green darken-1" text @click="setConfirm(true)">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  </teleport>
</template>

<script setup>
import { dialog, confirm, message, setConfirm, confirmMessage } from '@/modules/arrConfirm';

</script>

