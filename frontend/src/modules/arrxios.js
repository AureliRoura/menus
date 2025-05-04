//path: src/modules/arrixos.js

import axios from 'axios';
//import { useStore } from 'vuex';
//import store from '@/store/index.js';
import { useUserStore } from '@/stores/userStore';

const instance = axios.create({
  baseURL: window.location.origin+import.meta.env.VITE_API_RELATIVE_PATH,
});


instance.interceptors.request.use((request) => {
//  store = useStore();
  const userStore = useUserStore();
  if (userStore.authentication) {
    request.headers['authorization'] = userStore.authentication; // Set the header
  } 
  return request;
});

instance.interceptors.response.use((response) => {
  //store = useStore();
  const userStore = useUserStore();
  const authenticate = response.headers['authorization']; // Get the header
  if (authenticate) {
    userStore.setAuthentication(authenticate); // Set the store
    // store autentica tion in local storage
    localStorage.setItem('MenuAuthentication', authenticate); // Set the store
//    store.commit('setAuthentication', authenticate); // Set the store
  }
  return response;
}); 

export default instance;
