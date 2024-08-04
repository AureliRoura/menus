import {defineStore} from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    const account = ref('');
    const authentication = ref('');
    const loggedIn = ref(false);
    const userId = ref(0);
    
    const setAccount = (value) => {
        account.value = value;
    };
    
    const setAuthentication = (value) => {
        authentication.value = value;
    };
    
    const setLoggedIn = (value) => {
        loggedIn.value = value;
    };
    
    const setUserId = (value) => {
        userId.value = value;
    };
    // getters

    
    return {
        account,
        authentication,
        loggedIn,
        userId,
        setAccount,
        setAuthentication,
        setLoggedIn,
        setUserId,
    };
    });