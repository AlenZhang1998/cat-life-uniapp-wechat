import { createSSRApp } from 'vue'
import App from './App.vue'
import '@/static/iconfont/iconfont.css'

const isDev =
  (() => {
    try {
      // @ts-ignore uni-app 会在编译阶段注入 import.meta.env
      return !!(import.meta as any)?.env?.DEV;
    } catch {
      try {
        return (globalThis as any)?.process?.env?.NODE_ENV !== 'production';
      } catch {
        return false;
      }
    }
  })() === true;

if (!isDev) {
  const noop = () => {};
  (console as any).log = noop;
  (console as any).debug = noop;
  (console as any).info = noop;
}

export function createApp() {
  // 此函数由 uni-app 在各端执行，用于返回根组件实例
  const app = createSSRApp(App)
  return {
    app
  }
}
