/// <reference types="@dcloudio/types" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    any
  >;
  export default component;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '@/wxcomponents/ec-canvas/echarts' {
  const echarts: any;
  export = echarts;
}

interface ImportMetaEnv {
  readonly VITE_TENCENT_MAP_KEY?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly WECHAT_ROBOT_WEBHOOK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const require: <T = any>(moduleId: string) => T;
declare const uni: UniApp.Uni;
declare function getCurrentPages(): any[];
