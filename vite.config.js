import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// `VITE_BASE` é definido pelo workflow do GitHub Pages (ex.: /Sercomp-Website-Debug/).
// Em desenvolvimento fica "/" para o site continuar em http://localhost:5173.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
