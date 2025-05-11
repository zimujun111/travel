import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './app.css'

const App = createApp({
  onShow(options) {
  },
  
})

App.use(createPinia())

export default App
