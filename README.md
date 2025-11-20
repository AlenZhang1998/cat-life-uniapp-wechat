# 小熊油耗助手（uni-app 微信小程序）

一个基于 **uni-app + Vue 3 + TypeScript** 的油耗记录微信小程序原型，围绕「城市定位 → 首页仪表盘 → 记录列表 / 统计 → 个人档案」的完整体验打造。项目已内置城市选择页、油耗列表、费用统计页、个人资料编辑页等模块，可直接作为演示、课程示例或真正业务的 UI 雏形。

> 当前数据仍为静态示例，便于直接运行。接入真实服务时，可替换为接口数据、本地存储或云函数数据源。

## 功能亮点

- **自定义导航栏与安全区适配**：首页与多卡片页均使用自定义导航，自动处理状态栏、安全区，适配异形屏。
- **首页仪表盘**：信息面板、油耗评级、统计网格、折线图背景与筛选弹层一应俱全，支持快速接入真实指标。
- **城市选择与定位**：`pages/city` 提供搜索、字母索引、GPS 自动定位与地图选点逻辑，可配合腾讯地图 Key 食用。
- **油耗记录列表**：`pages/records` 搭建分组列表、卡片展开、年度筛选与补充对比卡，展示真实业务形态。
- **费用统计中心**：`pages/expense` 复用 `ec-canvas` 绘制月度 / 年度双图表，并提供多层时间范围选择器。
- **个人档案与资料编辑**：`pages/profile` 与 `pages/profile/personal-info` 支持本地存储头像、昵称、车型等信息，模拟微信登录、资料保存。
- **账号登录与退出**：个人档案页登录后会展示底部「退出登录」按钮，可清空本地 token 与 `userProfile`，方便演示账号切换与安全退出。
- **复用型 UI 组件**：底部操作栏、范围选择弹层在多个页面共享，保持体验一致并简化交互逻辑。

## 核心页面

| 页面 | 说明 |
| --- | --- |
| `/pages/home/index` | 仪表盘：展示城市、车辆、油耗统计、趋势折线图，含 Range Picker 和 `ec-canvas` 折线图。 |
| `/pages/city/index` | 城市列表：支持搜索、拼音索引、GPS 自动定位（需 `VITE_TENCENT_MAP_KEY`）、地图选点。 |
| `/pages/add/index` | 录入表单：涵盖加油日期/时间、里程、油价金额、补充信息与多项开关。 |
| `/pages/records/index` | 记录列表：年度切换、卡片点击展开、费用对比、状态标签等。 |
| `/pages/expense/index` | 费用分析：统计卡片 + 月度柱状图 + 年度折线图，全部通过 RangePicker 控制时间范围。 |
| `/pages/profile/index` | 个人档案：模拟登录、显示加入时间/标签、快捷入口。 |
| `/pages/profile/personal-info` | 资料编辑：头像上传（拍照/相册）、昵称/车型/日期等表单，数据落地 `userProfile`。 |

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
├── components/
│   ├── BottomActionBar.vue  # 底部浮动操作区
│   └── RangePickerOverlay.vue
├── pages/
│   ├── home/                # 首页仪表盘/趋势
│   ├── city/                # 城市选择 & 定位
│   ├── records/             # 油耗记录列表
│   ├── add/                 # 录入油耗表单
│   ├── expense/             # 费用统计中心
│   └── profile/
│       ├── index.vue        # 个人档案首页
│       └── personal-info.vue # 资料编辑页
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
3. **（可选）配置定位能力**
   - 项目在城市页中调用腾讯位置服务反向地理编码。若需启用，请到 [腾讯位置服务](https://lbs.qq.com/) 申请 Key。
   - 在项目根目录新增 `.env.local`（或任意被 `uni` 识别的 env 文件）：
     ```bash
     VITE_TENCENT_MAP_KEY=your-key
     ```
   - 未配置时仍可运行，定位相关功能会自动回退到手动选择。
4. **启动微信小程序开发调试**
   - **HBuilderX**：导入项目后选择「运行到小程序·微信开发者工具」。
   - **CLI**：
     ```bash
     npm run dev:mp-weixin
     ```
     然后在微信开发者工具中打开 `dist/dev/mp-weixin` 目录。
5. **打包发布**
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

- **首页静态数据**：`pages/home/index.vue` 中的 `ref` 保存了城市、车辆信息、油耗指标等；只需替换这些变量即可同步更新 UI。
- **筛选范围配置**：`RangePickerOverlay` 接收 `options` / `selected-key`，已在主页与费用页多次复用，可统一承载接口参数规则。
- **城市列表与定位**：
  - `data/cities.ts` 内置常见城市列表。
  - `utils/location.ts` 提供定位授权、GPS、腾讯地图反解、地图选点工具方法，支持 `VITE_TENCENT_MAP_KEY` 环境变量。
  - `STORAGE_KEYS.selectedCity` 用于跨页读取最近选择的城市。
- **油耗记录快照**：`pages/records` 中的 `recordSnapshots`、`summarySnapshots` 示例展示如何按年份切换；接入后端时可按年份拉取接口数据。
- **费用统计图表**：`pages/expense` 通过 `wxcomponents/ec-canvas` 引入官方 ECharts 适配，动态图表均集中在 `monthlyExpenseEc` / `yearlyExpenseEc`。
- **个人档案存储**：
  - 个人信息存储在本地 `userProfile` 中（`uni.setStorageSync`），同时登录凭证会写入 `token` 键。
  - `pages/profile/index.vue` 读取缓存并展示标签、加入时间、今日心情等；登录后会渲染底部「退出登录」按钮，点击即可清空本地 token / `userProfile` 并恢复默认档案。
  - `pages/profile/personal-info.vue` 支持头像（`userAvatar`）、用户名（`username`）等表单，保存会：
    - 校验手机号/邮箱，再将 `{nickname, avatarUrl, gender, deliveryDate, favoriteCarModel, phone, email}` 通过 `PUT /api/profile` 写入后端。
    - 写本地缓存，兼容旧字段 `name` / `avatar`。
    - 初始化时先读本地自定义值；若用户未自定义 `userAvatar`/`username`，会回退使用接口的 `avatarUrl`/`nickname`。
  - 后端示例（同目录 `../car-life-nodejs-express-mongodb/src/app.js`）提供 `GET /api/profile`、`PUT /api/profile`，接入时将 BASE_URL 指向你的服务即可。
- **样式变量**：`uni.scss` 定义了主题色、阴影、圆角等 token，能统一管理视觉风格。
- **自定义导航栏**：`pages.json` 中将核心页面的 `navigationStyle` 设为 `custom`，并使用 `var(--status-bar-height)` 保证状态栏安全。

## 二次开发建议

1. 接入真实油价、油耗、费用接口或车联网服务，替换示例数据。
2. 结合 `uni-storage`、`uniCloud` 或微信云开发，实现云端存储、多设备同步。
3. 升级图表体验：可引入 `qiun-data-charts`、`ucharts` 或其他组件提升交互。
4. 完善账号系统，例如微信一键登录、车主认证、订阅消息、保养提醒等。
5. 增加 ESLint、Prettier、自动化测试与 CI/CD 流程，提升协作效率。

## 参考资料

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [uni-app CLI 快速上手](https://uniapp.dcloud.net.cn/quickstart-cli.html)

如在使用过程中遇到问题，欢迎提交 Issue 或 PR。祝开发顺利！
