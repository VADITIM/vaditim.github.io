import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'


// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  server: {
    host: true, // listen on all interfaces (0.0.0.0) so LAN devices (phone) can connect
  },
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@styleVariables": path.resolve(__dirname, 'src/style/variables.scss'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      
      '@perks': path.resolve(__dirname, 'src/components/Main/Perks Section'),
      '@logs': path.resolve(__dirname, 'src/components/Main/Logs Section'),
      '@projects': path.resolve(__dirname, 'src/components/Main/Projects Section'),

      '@sections': path.resolve(__dirname, 'src/components/Main'),
    }
  },
})
