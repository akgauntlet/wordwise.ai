import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Code splitting configuration for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Firebase chunk for all Firebase services
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          // Tiptap editor chunk
          'editor-vendor': [
            '@tiptap/react', 
            '@tiptap/starter-kit', 
            '@tiptap/extension-character-count',
            '@tiptap/extension-link',
            '@tiptap/extension-placeholder',
            '@tiptap/extension-underline'
          ],
          // UI components chunk  
          'ui-vendor': [
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar', 
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            'lucide-react'
          ]
        }
      }
    },
    // Enable source maps for debugging
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // Target modern browsers for better performance
    target: 'esnext',
    // Minify for production
    minify: 'esbuild',
  },
  // Optimize dependencies during development
  optimizeDeps: {
    include: [
      'react',
      'react-dom', 
      'react-router-dom',
      '@tiptap/react',
      '@tiptap/starter-kit',
      'firebase/app',
      'firebase/auth', 
      'firebase/firestore'
    ]
  }
})
