//import './assets/main.css'
import { registerPlugins } from '@/plugins'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
console.log('Pinia Initialized')
//app.use(createPinia())
registerPlugins(app)
app.use(router)

app.mount('#app')
console.log('App Mounted')
