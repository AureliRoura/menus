<template>
  <v-sheet height="100%" width="100%" style="padding-bottom: auto;">
    <v-carousel >
      <v-carousel-item v-for="color in colors" :key="color" >
        <v-sheet :color="color" height="100%" tile>
          <v-row class="fill-height" align="center" justify="center">
            <div class="text-h2">
              {{ color }}
            </div>
          </v-row>
        </v-sheet>
      </v-carousel-item>
    </v-carousel>
  </v-sheet>
    <v-carousel v-if="imagesList.length"  >
      <v-carousel-item v-for="(image, index) in imagesList" :key="index"
      :src="'data:image;base64,' + image" :alt="'Image ' + index">
<!--         <div class="  justify-center align-center">
          <img :src="'data:image;base64,' + image" :alt="'Image ' + index" class="carousel-image" />
          <v-btn icon @click="removeImage(index)" class="trash-button">
            <v-icon>mdi-trash-can</v-icon>
          </v-btn>
        </div>
 -->      </v-carousel-item>
    </v-carousel>

    <input type="file" @change="onFileSelected" accept="image/*" />
    <div v-if="imagePreview">
      <p>Selected Image:</p>
      <img :src="imagePreview" alt="Selected Image" style="max-width: 100px; height: auto;" />
      <v-chip @click="addImage" color="primary" class="ma-2" outlined>Add</v-chip>
      <v-chip @click="cancelImage" color="red" class="ma-2" outlined>Cancel</v-chip>
    </div>

</template>

<script setup>
import { ref, watch } from 'vue';
import arrxios from '@/modules/arrxios';
import pica from 'pica';
import { addMessage } from '@/modules/arrMessage';
//import { VCarousel, VCarouselItem, VChip } from 'vuetify/lib';

const props = defineProps({
  images: Array,
});

const imagesList = ref([]);
const colors = ref(['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'pink', 'brown', 'grey', 'black']);

const fetchImages = async () => {
  const imagesTmp = [];
  for (const imageId of props.images) {
    await arrxios.get(`/api/image/${imageId}`)
      .then((response) => {
        if (response.status === 200) {
          imagesTmp.push(response.data.image);
        }
      })
      .catch((error) => {
        console.error('Error fetching image:', error);
      });
  }
  console.log(imagesTmp.length);
  imagesList.value = imagesTmp;
};

watch(() => props.images, fetchImages, { immediate: true });

console.log(imagesList.value.length);
const selectedImage = ref(null);
const imagePreview = ref(null);
const base64Image = ref(null);

const onFileSelected = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedImage.value = file;
    resizeImage(file);
  }
}

const resizeImage = async (file) => {
  const reader = new FileReader();
  reader.onload = async (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const MAX_WIDTH = 800; // Set your desired max width
      const scaleSize = MAX_WIDTH / img.width;
      canvas.width = MAX_WIDTH;
      canvas.height = img.height * scaleSize;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const picaInstance = pica();
      const resizedCanvas = await picaInstance.resize(canvas, canvas);
      const resizedDataUrl = resizedCanvas.toDataURL('image/jpeg');
      imagePreview.value = resizedDataUrl;
      base64Image.value = resizedDataUrl.split(',')[1]; // Extract base64 string
    };
  };
  reader.readAsDataURL(file);
}

const addImage = async () => {
  if (base64Image.value && selectedImage.value) {
    try {
      const response = await arrxios.post('/api/image', {
        fileName: selectedImage.value.name,
        imageStream: base64Image.value,
      });
      addMessage('Image carregada correctament', 'success');
      console.log('Image uploaded successfully:', response.data);
      props.images.push(response.data.id);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }
}

const removeImage = (index) => {
  arrxios.delete(`/api/image/${props.images[index]}`)
    .then((response) => {
      if (response.status === 200) {
        addMessage('Image eliminada correctamente', 'success');
        console.log('Image deleted successfully:', response.data);
        imagesList.value.splice(index, 1);
      }
    })
    .catch((error) => {
      console.error('Error deleting image:', error);
    });
}

const cancelImage = () => {
  selectedImage.value = null;
  imagePreview.value = null;
  base64Image.value = null;
}
</script>

<style scoped>

.sheet {
  padding: 10px;
  margin: 10px;
  border-radius: 10px;
  background-color: red;
  width: 100%;
  height: 0;
  padding-bottom: 100%; /* 1:1 aspect ratio */
  position: relative;
}

.carousel {
  position: relative;
  display: flex;
  background-color: blue; /* Set background color */
  width: 100%;
  height: 100%;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;

}

.carousel-item-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.carousel-image {

  width: 100%;
  height: 100%;
  object-fit: cover; /* Maintain aspect ratio and cover the container */

}


.trash-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.7);
}

</style>
