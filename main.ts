import { createSSRApp } from 'vue'
import App from './App.vue'
import '@/static/iconfont/iconfont.css'

export function createApp() {
  // 此函数由 uni-app 在各端执行，用于返回根组件实例
  const app = createSSRApp(App)
  return {
    app
  }
}
