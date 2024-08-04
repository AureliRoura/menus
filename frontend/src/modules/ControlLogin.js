import { ref } from 'vue';
import { useRouter } from 'vue-router';
//import { useStore } from 'vuex';
import arrxios from '@/modules/arrxios.js';
import { addMessage } from './arrMessage';
import { useUserStore } from '@/stores/userStore';
import { loadAllData } from './loadData.js';


export default function ControlLogin() {
  const username = ref('');
  const password = ref('');
  //  const store = useStore();
  const router = useRouter();
  const userStore = useUserStore();

  const login = () => {
    if (username.value && password.value) {
      // if fail, show error message
      arrxios.post('/api/logon', {
        nom: username.value,
        password: password.value
      })
        .then(response => {
          // if success, redirect to home page
          if (response.status == 200) {
            userStore.setLoggedIn(false);
            userStore.setAccount(username.value);
            userStore.setAuthentication(response.headers.authorization);
            userStore.setUserId(response.data.id);
            localStorage.setItem('MenuAccount', username.value);
            localStorage.setItem('MenuAuthentication', response.headers.authorization);
            arrxios.get('/api/users/mfa/' + username.value)
              .then(response => {
                if (response.status == 200) {
                  if (response.data.mfa) {
                    router.push({ path: '/verifyToken' });
                  } else {
                    userStore.setLoggedIn(true);
                    router.push({ path: '/menuweeklist' });
                    loadAllData();
                  }
                } else {
                  addMessage('Login failed', 'error');
                }
              })
              .catch(error => {
                addMessage('Login failed', 'error');
                console.error(error);
              });
          } else {
            addMessage('Login failed', 'error');
          }
        })
        .catch(error => {
          // if fail, show error message
          if (error.response.status == 404) {
            addMessage('User not found', 'error');
          } else if (error.response.status == 401) {
            addMessage('Invalid password', 'error');
          } else {
            addMessage('Login failed', 'error');
            console.error(error);
          }
        });
    } else {
      addMessage('Invalid input', 'error');
    }
  };

  const logout = () => {
    userStore.setAccount('');
    userStore.setAuthentication('');
    userStore.setLoggedIn(false);
    userStore.setUserId(0);
    localStorage.removeItem('MenuAccount');
    localStorage.removeItem('MenuAuthentication');
  }

  return {
    username,
    password,
    login,
    logout,
  };
}
