import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import glsl from 'vite-plugin-glsl'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  
  plugins: [
    react(),
    glsl()
  ],

  // Build optimizations
  build: {
    // Target modern browsers for better optimization
    target: 'esnext',
    
    // Enable minification
    minify: 'esbuild',
    
    // Source map configuration
    sourcemap: false, // Disable in production for smaller bundles
    
    // Rollup options for advanced bundling
    rollupOptions: {
      output: {
        // Manual code splitting for better caching
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          
          // Three.js ecosystem
          'three-core': ['three'],
          'react-three': ['@react-three/fiber', '@react-three/drei'],
          'react-three-postprocessing': ['@react-three/postprocessing'],
          
          // Animation libraries
          'react-spring': ['@react-spring/three'],
          'framer-motion': ['framer-motion'],
          
          // Utility libraries
          'lenis': ['lenis'],
          'stats': ['stats.js'],
        },
        
        // Optimize chunk file names for better caching
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash].[ext]';
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `media/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Enable CSS code splitting
    cssCodeSplit: true,
    
    // Optimize asset handling
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },

  // Dependency optimization
  optimizeDeps: {
    // Pre-bundle these dependencies for faster dev server
    include: [
      'react',
      'react-dom',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/postprocessing',
      '@react-spring/three',
      'framer-motion',
      'lenis',
      'stats.js'
    ],
    
    // Exclude these from pre-bundling
    exclude: [
      // Add any problematic dependencies here
    ],
    
    // Force optimization for specific packages
    force: true,
  },

  // Development server optimizations
  server: {
    // Enable HMR (Hot Module Replacement)
    hmr: true,
    
    // Allow external connections (for mobile testing)
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173, // Default Vite port
    
    // Optimize file watching
    watch: {
      usePolling: false,
      ignored: ['**/node_modules/**', '**/.git/**']
    },
  },

  // CSS optimizations
  css: {
    // Enable CSS source maps in development
    devSourcemap: true,
    
    // PostCSS configuration
    postcss: {
      plugins: [
        // Add PostCSS plugins if needed
      ],
    },
  },


  // Resolve configuration
  resolve: {
    // Alias configuration for cleaner imports
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@utils': '/src/utils',
      '@contexts': '/src/contexts',
      '@hooks': '/src/hooks',
      '@shaders': '/src/shaders',
    },
  },

  // Performance optimizations
  esbuild: {
    // Enable tree shaking
    treeShaking: true,
    
    // Target modern JavaScript
    target: 'esnext',
  },
})
