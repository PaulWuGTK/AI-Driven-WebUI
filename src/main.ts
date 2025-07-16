import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'

// Global error handler for module loading failures
window.addEventListener('error', (event) => {
  // Check if the error is related to module loading
  if (
    event.message.includes('Failed to fetch dynamically imported module') ||
    event.message.includes('ChunkLoadError') ||
    event.message.includes('Loading chunk') ||
    event.message.includes('Loading CSS chunk')
  ) {
    console.error('Module loading error detected:', event.message);
        
    // Prevent the default error handling
    event.preventDefault();
  }
});

// Also handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Check if the rejection is related to module loading
  if (
    event.reason && 
    (
      (event.reason.message && event.reason.message.includes('Failed to fetch dynamically imported module')) ||
      (typeof event.reason === 'string' && event.reason.includes('Failed to fetch dynamically imported module'))
    )
  ) {
    console.error('Module loading promise rejection detected:', event.reason);
        
    // Prevent the default error handling
    event.preventDefault();
  }
});

const app = createApp(App)
app.use(router)
app.use(i18n)
app.mount('#app')