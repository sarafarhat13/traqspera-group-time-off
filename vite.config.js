import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the project under /<repo-name>/.
// Set base for the production build only so `npm run dev` still works at /.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/traqspera-group-time-off/' : '/',
}))
