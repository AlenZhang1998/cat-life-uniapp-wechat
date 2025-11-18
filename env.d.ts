/// <reference types="@dcloudio/types" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>;
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

declare const require: <T = any>(moduleId: string) => T;
declare const uni: UniApp.Uni;
