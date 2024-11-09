<template>
  <v-card>
    <v-card-title>
      Notes
    </v-card-title>
    <v-card-text>
      <v-textarea v-model="newNoteContent" label="New Note" outlined></v-textarea>
      <v-btn @click="addNote" rounded>Add Note</v-btn>
    </v-card-text>
    <v-card-text>
      <v-list density="compact">
        <v-list-item v-for="(note, index) in notes" :key="index" density="compact">
          <v-list-item-title>
            <v-card variant="tonal">
              <v-card-title class="d-flex align-center">
                <v-chip>{{ note.user }}</v-chip>
                <v-btn v-if="note.user === userStore.account" class="ml-1" icon @click="editNote[index] = !editNote[index]">
                  <v-icon v-if="!editNote[index]">mdi-pencil</v-icon>
                  <v-icon v-else>mdi-pencil-off</v-icon>
                </v-btn>
                <v-btn v-if="editNote[index]" class="ml-1" icon @click="updateNote(note, index)">
                  <v-icon>mdi-content-save</v-icon>
                </v-btn>
                <v-btn v-if="editNote[index]" class="ml-1" icon @click="deleteNote(note._id)">
                  <v-icon color="red">mdi-delete</v-icon>
                </v-btn>
                <span class="ml-2">
                  {{ formatDate(note.createdAt) }}
                </span>
              </v-card-title>
              <v-card-text class="bg-surface-light pt-2">
                <v-textarea v-if="editNote[index]" class="ml-2" v-model="note.content" label="Note"
                  outlined :disabled="note.user !== userStore.account">
                </v-textarea>
                <span v-else class="ml-2">
                  {{ note.content }}
                </span>
              </v-card-text>
            </v-card>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import arrxios from '@/modules/arrxios';
import { useUserStore } from '@/stores/userStore';

const props = defineProps({
  recipeId: {
    type: String,
    required: true
  }
});


const userStore = useUserStore();
const recipeId = props.recipeId;
const notes = ref([]);
const newNoteContent = ref('');
const editNote = ref([]);

const fetchNotes = async () => {
  try {
    const response = await arrxios.get(`/api/recipes/${recipeId}/notes`);
    notes.value = response.data;
  } catch (error) {
    console.error('Error fetching notes:', error);
  }
};

const addNote = async () => {
  try {
    const note = {
      content: newNoteContent.value,
      user: userStore.account // Add user information to the note
    };
    const response = await arrxios.post(`/api/recipes/${recipeId}/notes`, note);
    notes.value.unshift(response.data);
    newNoteContent.value = '';
  } catch (error) {
    console.error('Error adding note:', error);
  }
};

const updateNote = async (note) => {
  try {
    await arrxios.put(`/api/recipes/${recipeId}/notes/${note._id}`, note);
  } catch (error) {
    console.error('Error updating note:', error);
  }
};

const deleteNote = async (noteId, index) => {
  try {
    await arrxios.delete(`/api/recipes/${recipeId}/notes/${noteId}`);
    notes.value = notes.value.filter(note => note._id !== noteId);
    editNote.value.splice(index, 1);
  } catch (error) {
    console.error('Error deleting note:', error);
  }
};

const formatDate = (dateString) => {
  const options = {
    timeZone: 'Europe/Berlin', // CET time zone
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  };
  return new Intl.DateTimeFormat('en-GB', options).format(new Date(dateString));
};

onMounted(async () => {
  await fetchNotes();
});
</script>


<style scoped></style>