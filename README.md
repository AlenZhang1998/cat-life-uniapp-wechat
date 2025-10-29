# 小熊油耗助手（uni-app 微信小程序）

一个基于 **uni-app + Vue 3 + TypeScript** 的油耗记录微信小程序原型，专注演示「爱车油耗」类应用的首页体验。项目预置了整套信息面板、统计卡片、趋势图和底部操作栏布局，可作为学习 uni-app 组件化开发或二次扩展成业务项目的起点。

## 功能亮点

- **自定义导航栏与安全区处理**：页面顶部适配微信小程序状态栏，内容不会被遮挡。
- **动态卡片布局**：城市定位、车辆信息、油价、提醒等元素按照设计稿排列，演示真实场景。
- **最新油耗与评级展示**：提供高亮数字、评级徽章等视觉元素，方便替换为接口数据。
- **统计与趋势模块**：包含 3×2 指标网格、折线图背景网格与基准线占位，实现静态 demo。
- **底部浮动操作栏**：核心动作集中展示，支持后续绑定页面跳转或弹窗。

> 当前数据均为静态示例，方便直接运行浏览。后续可按需接入接口或本地存储。

## 技术栈

- **框架**：uni-app（Vue 3 Composition API）
- **语言**：TypeScript + SCSS
- **构建工具**：`@dcloudio/uni-app` CLI（可选 HBuilderX）
- **目标平台**：微信小程序（同样可扩展到 App / H5）

## 目录结构

```
├── App.vue                  # 全局样式与根组件
├── main.ts                  # 应用入口
├── manifest.json            # 小程序运行配置
├── pages.json               # 页面路由与窗口配置
├── pages/
│   ├── home/                # 首页仪表盘（主要展示页面）
│   ├── records/             # 油耗记录列表（占位）
│   ├── add/                 # 添加记录表单（占位）
│   ├── refuel/              # 加油记录（占位）
│   └── profile/             # 个人中心（占位）
├── unpackage/               # uni-app 编译输出
└── uni.scss                 # 颜色、阴影等全局 SCSS 变量
```

## 快速开始

1. **克隆代码（或下载压缩包）**
   ```bash
   git clone https://github.com/AlenZhang1998/cat-life-uniapp-wechat.git
   cd cat-life-uniapp-wechat
   ```
2. **安装依赖**
   ```bash
   npm install
   ```
3. **本地运行 – 微信小程序**
   - 使用 HBuilderX：导入项目后点击「运行到小程序·微信开发者工具」。
   - 使用 CLI：
     ```bash
     npm run dev:mp-weixin
     ```
     再在微信开发者工具中打开 `dist/dev/mp-weixin` 目录。
4. **打包发布**
   ```bash
   npm run build:mp-weixin
   ```
   构建产物输出至 `dist/build/mp-weixin`（或 HBuilderX 菜单打包）。

## 常用命令

| 命令 | 说明 |
| ---- | ---- |
| `npm run dev:mp-weixin` | 微信小程序开发调试（监听文件变动） |
| `npm run build:mp-weixin` | 微信小程序生产构建 |
| `npm run lint` | 代码检查（若在 `package.json` 中添加 ESLint 配置后启用） |

> 其他平台命令可参考 `package.json` 或 uni-app 官方文档，按需添加。

## 数据与配置说明

- **静态示例数据**：`pages/home/index.vue` 顶部的 `ref` 对象保存了城市、车辆信息、油价、统计指标等，可直接改成真实值或请求接口。
- **样式变量**：`uni.scss` 中定义了主色、阴影、圆角等设计 Token，便于全局复用。
- **自定义导航栏**：`pages.json` 中对 `pages/home/index` 设置了 `navigationStyle: "custom"`，如需恢复系统导航栏可移除此配置。
- **状态栏高度**：`pages/home/index.vue` 样式里使用 `var(--status-bar-height)`，确保在带刘海/圆角的设备上内容不被遮挡。

## 二次开发建议

1. **接入真实接口**：例如油价 API、车辆里程统计服务等，替换静态数据。
2. **持久化数据**：可选 `uni-storage`、`uniCloud`、微信云开发或自建服务。
3. **图表增强**：引入 `qiun-data-charts`、`ucharts` 或 `echarts-for-weixin`，实现可交互的折线/柱状图。
4. **权限与用户体系**：结合微信一键登录、消息订阅、云函数消息推送等能力。
5. **工程优化**：按需添加 ESLint、Prettier、自动化测试或 CI/CD 流程。

## 参考资料

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [uni-app CLI 快速上手](https://uniapp.dcloud.net.cn/quickstart-cli.html)

若在使用过程中遇到问题，欢迎提交 Issue 或 PR 共同完善。祝开发顺利！
