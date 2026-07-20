import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  // Rutas relativas en el build para que dist/index.html funcione al abrirse
  // directamente (p. ej. con la extensión Live Server), sin depender de que
  // el servidor estático trate /dist como raíz.
  base: './',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist'
  }
});
