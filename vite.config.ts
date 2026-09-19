import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/skill-swap-meituan/',
  plugins: [react()],
})
