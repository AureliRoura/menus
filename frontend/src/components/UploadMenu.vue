<template>
  <v-container>
    <v-progress-linear
        :active="working"
        :indeterminate="working"
        color="deep-orange"
        absolute
        bottom
      ></v-progress-linear>
    <v-form ref="form">
      <!-- File Input -->
      <v-file-input v-model="file" label="Upload file" prepend-icon="mdi-paperclip"></v-file-input>

      <!-- Text Area -->
      <v-textarea v-model="textInput" label="Enter text" prepend-icon="mdi-pencil" :rows="textAreaRows" ></v-textarea>

      <!-- Submit Button -->
      <v-chip class="mr-2" color="green darken-1" text :disabled="!valid" @click="submitForm">Upload</v-chip>
    </v-form>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { addMessage } from '@/modules/arrMessage';
import arrxios from '@/modules/arrxios';


const file = ref(null); // This will hold the uploaded file
const textInput = ref(''); // This will hold the text input
const screenWidth = ref(window.innerWidth);
const screenHeight = ref(window.innerHeight); // New reactive property for screen height

const working = ref(false);

const updateScreenSize = () => {
  screenWidth.value = window.innerWidth;
  screenHeight.value = window.innerHeight; // Update screen height
};


onMounted(() => {
  window.addEventListener('resize', updateScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize);
});

const textAreaRows = computed(() => {
  // Example calculation based on screen height
  // This is a simplistic approach; adjust the logic based on your UI design
  const baseHeight = 480; // Base screen height for minimum row count
  const rowHeight = 24; // Approximate height per text area row
  const additionalRows = Math.max(0, Math.floor((screenHeight.value - baseHeight) / rowHeight));
  return 4 + additionalRows; // Start with a base of 4 rows and add additional rows based on screen height
});


// Computed property to check if the form is valid
const valid = computed(() => {
  // Check if either a file is uploaded or text input is not empty
  return (file.value !== null || textInput.value.trim() !== '') && !working.value;
});

var json = null;

const handleFileUpload = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject('Fitxer no trobat');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        json = JSON.parse(e.target.result); // Parse the JSON content
        resolve(json); // Resolve the promise with the parsed JSON
      } catch (error) {
        console.error('Error parsing JSON:', error);
        addMessage('Error validant JSON', 'error');
        reject(error); // Reject the promise on error
      }
    };

    reader.onerror = () => {
      console.error('Error reading file');
      addMessage('Error llegint el fitxer', 'error');
      reject(new Error('Error reading file')); // Reject the promise on file read error
    };

    reader.readAsText(file);
  });
};

const handleTextInput = (value) => {
  try {
    json = JSON.parse(value);
    // Handle text input logic here
  }
  catch (error) {
    console.error('Error parsing JSON:', error);
    addMessage('Error  validant JSON', 'error');
  }
};

const submitForm = async () => {
  working.value = true;
  try {
    if (file.value) {
      const result = await handleFileUpload(file.value);
      if (!result) {
        addMessage('Error llegint el fitxer', 'error');
        working.value = false;
        return;
      }
    } else if (textInput.value) {
      handleTextInput(textInput.value);
    }
    console.log('textInput.value', textInput.value  )
    arrxios.post('/api/menus/upload',  { data: JSON.stringify(json) })
      .then((response) => {
        console.log('Response:', response);
        addMessage('Menu pujat amb exit!!');
        working.value = false;
        textInput.value = '';
        file.value = null;
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
        addMessage('Error fent Upload: ', 'error');
        working.value = false;
      });
  } catch (error) {
    console.error('Error submitting form:', error);
    addMessage('Error fent Upload: ', 'error');
    working.value = false;
  }
};
</script>