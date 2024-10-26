<template>

    <v-row justify="center">
      <v-col cols="12" md="12" lg="10">
        <v-card class="pa-3" elevation="2">
          <v-card-text >
            <recipe-ingredients />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

</template>

<script setup>
import RecipeIngredients from '@/components/RecipeIngredients.vue';

</script>