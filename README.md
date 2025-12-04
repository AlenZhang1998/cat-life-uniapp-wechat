# 小熊油耗助手（uni-app 微信小程序）

一个基于 **uni-app + Vue 3 + TypeScript** 的油耗记录微信小程序原型，围绕「城市定位 → 首页仪表盘 → 记录列表 / 统计 → 个人档案」的完整体验打造。项目内置城市选择、油耗列表、费用统计、个人资料编辑等模块，可直接作为演示、课程示例或真实业务的 UI 雏形。

> 预置静态示例数据，便于开箱运行。登录、资料、头像等接口封装已就绪，配置自己的后端地址后即可联调。

## 功能亮点

- **自定义导航与安全区**：首页、列表页均使用自定义导航栏，自动处理状态栏/刘海屏安全区。
- **仪表盘与趋势图**：信息面板、油耗评级、统计网格、折线图与筛选弹层一应俱全，快速对接真实指标。
- **城市选择与定位**：`pages/city` 支持搜索、拼音索引、GPS 自动定位、地图选点，配合腾讯地图 Key 即可使用。
- **记录与统计**：`pages/records` 展示年度切换、卡片展开、费用对比；`pages/expense` 复用 `ec-canvas` 绘制月/年双图表。
- **登录与档案管理**：`LoginOverlay` 模拟微信一键登录，`pages/profile` 支持本地缓存、资料编辑、退出登录。
- **资料与头像上传**：`pages/profile/personal-info` 兼容本地/接口数据，调用 `/api/profile` 及 `/api/upload/avatar` 完成资料与头像更新。
- **复用型组件**：底部操作栏与范围选择弹层在多个页面共享，保持体验一致、降低重复开发。

## 核心页面

| 页面 | 说明 |
| --- | --- |
| `/pages/home/index` | 仪表盘：城市、车辆、油耗统计、趋势折线图，含 Range Picker 与 `ec-canvas`。 |
| `/pages/city/index` | 城市列表：搜索、拼音索引、GPS 自动定位（需 `VITE_TENCENT_MAP_KEY`）、地图选点。 |
| `/pages/add/index` | 录入表单：加油日期/时间、里程、油价金额、补充信息与多项开关。 |
| `/pages/records/index` | 记录列表：年度切换、卡片点击展开、费用对比、状态标签。 |
| `/pages/expense/index` | 费用分析：统计卡片 + 月度柱状图 + 年度折线图，均由 RangePicker 控制时间范围。 |
| `/pages/profile/index` | 个人档案：模拟登录、加入时间/标签、快捷入口，支持退出登录。 |
| `/pages/profile/personal-info` | 资料编辑：头像上传（拍照/相册）、昵称/车型/日期等表单，数据写入 `userProfile` 与后端。 |

## 技术栈

- **框架**：uni-app（Vue 3 Composition API）
- **语言**：TypeScript、SCSS
- **构建工具**：`@dcloudio/uni-app` CLI / HBuilderX
- **目标平台**：微信小程序（可扩展到 App / H5）

## 目录结构

```
├── App.vue                      # 全局样式与根组件
├── main.ts                      # 应用入口
├── manifest.json                # 小程序运行配置
├── pages.json                   # 页面路由与窗口配置
├── components/
│   ├── BottomActionBar.vue      # 底部浮动操作区
│   ├── LoginOverlay.vue         # 登录弹层
│   └── RangePickerOverlay.vue   # 时间范围选择弹层
├── constants/                   # 全局常量（如 storage key）
├── data/                        # 城市等静态数据
├── pages/                       # 业务页面
├── utils/                       # 请求、定位、头像上传、认证等工具
├── wxcomponents/                # 第三方组件（ec-canvas）
├── unpackage/                   # uni-app 编译输出
└── uni.scss                     # 主题色、阴影、圆角等 SCSS 变量
```

## 环境要求

- Node.js 18+、npm
- 微信开发者工具（用于预览/真机调试）
- HBuilderX 4.x（可选，便捷运行到小程序端）

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
3. **配置环境变量（推荐）**
   在项目根目录新建 `.env.local`（或任意被 uni 识别的 env 文件），填写后端与地图配置：
   ```bash
   VITE_API_BASE_URL=http://localhost:3000   # 后端服务根地址，未配置则使用 request.ts 中的默认值
   VITE_TENCENT_MAP_KEY=your-map-key         # 可选：用于城市页反向地理编码/地图选点
   ```
   未配置地图 Key 时，定位功能会自动回退到手动选择。
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

## 环境变量

| 变量 | 作用 | 默认值 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | 后端 API 根地址，`utils/request.ts` 会自动拼接路径并附加 token Header。 | `http://192.168.60.78:3000` |
| `VITE_TENCENT_MAP_KEY` | 腾讯位置服务 Key，用于城市页的反向地理编码/地图选点。 | 未设置则不调用地图接口 |

## 后端接口约定

- **登录**：`POST /api/auth/login`，入参 `{ code, userInfo }`（来自 `uni.login` 与 `uni.getUserProfile`），需返回 `{ token, user }`。
- **资料读取**：`GET /api/profile`，返回用户档案字段（昵称、头像、车型、日期、联系方式等）。
- **资料更新**：`PUT /api/profile`，请求体 `{ data: { nickname, avatarUrl, gender, deliveryDate, favoriteCarModel, phone, email } }`。
- **头像上传**：`POST /api/upload/avatar`，表单字段名 `file`，返回 `{ url }`；请求会携带 `Authorization: Bearer <token>`。
- 请求封装：`utils/request.ts` 会将本地 `token` 写入 `Authorization` 与 `token` 头，非 2xx 状态自动 toast 提示。
- **加油记录列表**：`GET /api/refuels/list?range=all|3m|6m|1y`，返回 `summary`（含 `startDate`、`endDate`、`dateRangeDays`，`all` 时从最早加油日到今日）及 `records`，前端用 `dateRangeDays` 计算平均行程。

## 数据与配置说明

- **首页静态数据**：`pages/home/index.vue` 中的 `ref` 保存城市、车辆、油耗指标等，替换即可更新 UI。
- **筛选范围配置**：`RangePickerOverlay` 接收 `options` / `selected-key`，在首页与费用页复用，可统一承载接口参数。
- **统计口径**：首页「平均行程」= `累计行程 ÷ 统计天数`，统计天数来源于接口 `dateRangeDays`（或 `startDate`/`endDate` 推算）；选择「全部」时从最早加油记录日期计算至今日。
- **城市列表与定位**：`data/cities.ts` 提供城市列表；`utils/location.ts` 负责授权/GPS/腾讯地图解析；`STORAGE_KEYS.selectedCity` 用于跨页复用最近城市。
- **油耗记录快照**：`pages/records` 的 `recordSnapshots`、`summarySnapshots` 示例展示按年份切换，真实接入时按年份请求接口即可。
- **个人档案存储**：`userProfile` 与 `token` 持久化在本地；`pages/profile/index.vue` 支持退出登录；`pages/profile/personal-info.vue` 兼容旧字段 `name` / `avatar` 并回退使用接口数据。
- **样式变量**：`uni.scss` 定义主题色、阴影、圆角等 Token，统一管理视觉风格。

## 常用脚本

| 命令 | 说明 |
| ---- | ---- |
| `npm run dev:mp-weixin` | 微信小程序开发调试（监听文件变动） |
| `npm run build:mp-weixin` | 微信小程序正式构建 |

> 其他平台（App、H5 等）的构建命令可参考 `package.json` 或 uni-app 官方文档按需添加。

## 二次开发建议

1. 接入真实油价、油耗、费用接口或车联网服务，替换示例数据。
2. 结合 `uni-storage`、`uniCloud` 或微信云开发，实现云端存储与多设备同步。
3. 升级图表体验：引入 `qiun-data-charts`、`ucharts` 等组件提升交互。
4. 完善账号体系：微信一键登录、车主认证、订阅消息、保养提醒等。
5. 补充工程化：ESLint、Prettier、自动化测试与 CI/CD 流程。

## 参考资料

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [uni-app CLI 快速上手](https://uniapp.dcloud.net.cn/quickstart-cli.html)

如在使用过程中遇到问题，欢迎提交 Issue 或 PR。祝开发顺利！
