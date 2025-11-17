# 小熊油耗助手（uni-app 微信小程序）

一个基于 **uni-app + Vue 3 + TypeScript** 的油耗记录微信小程序原型，围绕「爱车油耗」场景构建首页仪表盘体验。项目已经预置了信息面板、油耗统计卡片、趋势图背景以及底部操作栏，可作为学习 uni-app 组件化开发或继续扩展为业务项目的起点。

> 当前展示的数据均为静态示例，便于直接运行。需要接入真实服务时，可替换为接口数据或本地存储。

## 功能亮点

- **自定义导航栏与安全区适配**：首页使用自定义导航栏，针对状态栏和安全区进行了处理，保证内容不会被刘海屏遮挡。
- **动态信息面板布局**：城市定位、车辆信息、油价、提醒等元素按照设计稿排布，展示真实业务形态。
- **油耗与评级展示**：提供高亮数字、评级徽章等视觉元素，方便替换为实时油耗数据。
- **统计与趋势模块**：包含 3×2 指标网格和折线图背景网格，并提供“统计 / 油耗变化趋势”双独立筛选范围，可快速替换为接口数据实现动态效果。
- **底部浮动操作区**：核心操作集中展示，后续易于绑定跳转或弹窗。
- **弹层交互与态势同步**：Filter 筛选弹层带有遮罩和滚动锁定，支持三个月 / 半年 / 一年 / 全部四个区间；选择后即时更新对应卡片与折线图 legend 文案。

## 技术栈

- **框架**：uni-app（Vue 3 Composition API）
- **语言**：TypeScript、SCSS
- **构建工具**：`@dcloudio/uni-app` CLI / HBuilderX
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
│   ├── expense/             # 费用记录（占位）
│   └── profile/             # 个人中心（占位）
├── unpackage/               # uni-app 编译输出
└── uni.scss                 # 颜色、阴影等全局 SCSS 变量
```

## 快速开始

1. **获取代码**
   ```bash
   git clone https://github.com/AlenZhang1998/cat-life-uniapp-wechat.git
   cd cat-life-uniapp-wechat
   ```
2. **安装依赖**
   ```bash
   npm install
   ```
3. **启动微信小程序开发调试**
   - **HBuilderX**：导入项目后选择「运行到小程序·微信开发者工具」。
   - **CLI**：
     ```bash
     npm run dev:mp-weixin
     ```
     然后在微信开发者工具中打开 `dist/dev/mp-weixin` 目录。
4. **打包发布**
   ```bash
   npm run build:mp-weixin
   ```
   构建产物位于 `dist/build/mp-weixin`，可直接导入微信开发者工具提交审核。

## 常用脚本

| 命令 | 说明 |
| ---- | ---- |
| `npm run dev:mp-weixin` | 微信小程序开发调试（监听文件变动） |
| `npm run build:mp-weixin` | 微信小程序正式构建 |

> 其他平台（App、H5 等）的构建命令可参阅 `package.json` 或 uni-app 官方文档，自行按需添加。

## 数据与配置说明

- **静态示例数据**：`pages/home/index.vue` 中的 `ref` 对象保存了城市、车辆信息、油价、统计指标等，替换为真实数据即可接入接口或本地存储。
- **筛选范围**：`rangeOptions` 定义四个时间区间，`statsRange` 与 `trendRange` 分别控制统计卡片和趋势图的筛选标签，可在确认回调里接入真实查询逻辑。
- **样式变量**：`uni.scss` 定义了主色、阴影、圆角等设计 Token，可统一管理视觉风格。
- **自定义导航栏**：在 `pages.json` 中为 `pages/home/index` 设置了 `navigationStyle: "custom"`，如需恢复系统导航栏可移除此配置。
- **状态栏高度处理**：`pages/home/index.vue` 的样式使用了 `var(--status-bar-height)`，确保不同设备上内容不被遮挡。

## 二次开发建议

1. 接入真实油价、油耗接口或车联网服务，替换示例数据。
2. 使用 `uni-storage`、`uniCloud` 或微信云开发实现数据持久化。
3. 引入 `qiun-data-charts`、`ucharts`、`echarts-for-weixin` 等组件，实现可交互的折线图/柱状图。
4. 完善权限体系，如车主认证、一键登录、消息订阅、保养提醒等。
5. 增加 ESLint、Prettier、自动化测试或 CI/CD 流程，提升工程效率。

## 参考资料

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [uni-app CLI 快速上手](https://uniapp.dcloud.net.cn/quickstart-cli.html)

如在使用过程中遇到问题，欢迎提交 Issue 或 PR。祝开发顺利！
