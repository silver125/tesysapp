import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@rhds/elements/rh-button/rh-button.js',
      '@rhds/elements/rh-card/rh-card.js',
      '@rhds/elements/rh-badge/rh-badge.js',
      '@rhds/elements/rh-alert/rh-alert.js',
      '@rhds/tokens/css/global.css',
      'lit',
      '@lit/react',
    ],
  },
})
