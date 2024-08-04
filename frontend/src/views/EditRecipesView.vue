<template>

    <v-row justify="center">
      <v-col cols="12" md="12" lg="10">
        <v-card class="pa-3" elevation="2">
          <v-card-text >
            <recipe-list />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

</template>

<script setup>
import RecipeList from '@/components/RecipeList.vue';

</script>