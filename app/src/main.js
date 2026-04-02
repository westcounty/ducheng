import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router.js'
import './styles/theme.css'
import { migrateFromV1 } from './utils/migration.js'

migrateFromV1()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
