import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['@nutui/icons-vue-taro', '@nutui/icons-vue-taro/dist/types/icons']
    }
  }
});