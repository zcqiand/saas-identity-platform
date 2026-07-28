import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// 构建配置（dev/build/preview）。测试配置见 vitest.config.ts。
//
// dev: SAAS_API_PORT（默认 5176）启 dev-server/server.ts；
//     saas 5175 自身 /api/* 转发到 5176，方便 saas SPA 自身 + 同源 lab 5173 跨域凭代理访问。
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.SAAS_API_PORT ?? 5176}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
