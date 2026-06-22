import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { defineCustomElements } from '@trimble-oss/moduswebcomponents/loader'
import { setAssetPath } from '@trimble-oss/moduswebcomponents-react'
import '@trimble-oss/moduswebcomponents/modus-wc-styles.css'
import '@trimble-oss/moduswebcomponents/modus-icons.css'
import './index.css'
import App from './App.jsx'

// Resolve Modus lazy-loaded assets (background patterns, fonts) from the CDN so they
// load correctly both locally and from the GitHub Pages subpath build.
setAssetPath('https://cdn.jsdelivr.net/npm/@trimble-oss/moduswebcomponents@1.8.0/')
defineCustomElements()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
