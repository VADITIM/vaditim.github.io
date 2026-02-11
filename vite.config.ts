import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'


// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
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
      
      '@perks': path.resolve(__dirname, 'src/components/Pages/Main/Perks Section'),
      '@profile': path.resolve(__dirname, 'src/components/Pages/Main/Profile Section'),
      '@projects': path.resolve(__dirname, 'src/components/Pages/Main/Projects Section'),
      
      '@perksStyle': path.resolve(__dirname, 'src/style/Perks Section'),
      '@profileStyle': path.resolve(__dirname, 'src/style/Profile Section'),
      '@projectsStyle': path.resolve(__dirname, 'src/style/Projects Section'),
      
      '@perksModules': path.resolve(__dirname, 'src/modules/Perks Section'),
      '@profileModules': path.resolve(__dirname, 'src/modules/Profile Section'),
      '@projectsModules': path.resolve(__dirname, 'src/modules/Projects Section'),
      
      '@sections': path.resolve(__dirname, 'src/components/Sections'),
    }
  },
})
