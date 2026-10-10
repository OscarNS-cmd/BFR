import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register Service Worker for 100% offline execution on Android and Desktop
registerSW({
  immediate: true,
  onRegisteredSW() {
    // Service Worker ready for offline usage
  },
  onOfflineReady() {
    // App assets cached for offline mode
  },
});

createRoot(document.getElementById('root')!).render(<App />);
