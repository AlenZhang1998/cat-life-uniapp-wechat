<template>
  <view class="page">
    <view class="hero">
      <text class="hero-title">爱车油耗助手隐私保护协议</text>
      <text class="hero-sub">V1.0.0 | 生效日期：{{ effectiveDate }}</text>
    </view>

    <view class="agreement-list">
      <view class="card" v-for="section in sections" :key="section.title">
        <text class="card-title">{{ section.title }}</text>
        <view class="paragraph" v-for="(line, idx) in section.lines" :key="idx">
          <text>{{ line }}</text>
        </view>
        <view class="clause-list" v-if="section.clauses">
          <view
            class="clause-item"
            v-for="(clause, cIdx) in section.clauses"
            :key="cIdx"
          >
            <text class="clause-num"
              >{{ section.title.split('.')[0] }}.{{ cIdx + 1 }}.</text
            >
            <text class="clause-text">{{ clause }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="footer">
      <text>本协议最终解释权归爱车油耗助手运营团队所有。</text>
      <text
        >如需注销账号或对信息处理有任何疑问，请通过“关于我们”中的联系方式与我们沟通。</text
      >
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const effectiveDate = ref('2025-12-15'); // 保持原有的生效日期

const sections = [
  {
    title: '1. 引言与适用范围',
    lines: [
      '本《隐私保护协议》（或“隐私政策”）适用于您在使用“爱车油耗助手”微信小程序过程中，我们对您个人信息的处理活动。',
      '请您在使用前仔细阅读并充分理解本协议。当您开始使用或继续使用本服务，即表示您已阅读、理解并同意我们按照本协议处理您的个人信息。',
    ],
  },
  {
    title: '2. 我们收集哪些信息',
    lines: [
      '为向您提供服务，我们会在遵循合法、正当、必要原则以及**基于履行与您的服务合同或事先征得您的授权同意**的前提下收集与实现产品功能相关的信息。',
    ],
    clauses: [
      '账号与身份信息：当您使用微信授权登录时，我们可能获取您的昵称、头像等公开信息，以便展示账号资料与识别登录状态。',
      '位置信息（可选）：当您授权定位权限时，我们可能获取您的位置信息（如粗略地理位置），**仅用于为您展示所在城市的名称，不会在后台持续收集**。您也可以随时在系统设置中关闭定位授权。',
      '您主动填写的信息：例如车辆信息、加油记录、保养费用、里程等您在小程序中录入的数据，用于实现油耗统计与图表分析等核心功能。',
      '设备与日志信息：为保障服务稳定与安全，我们可能收集必要的设备信息与操作日志（如系统版本、网络状态、错误日志等）。',
    ],
  },
  {
    title: '3. 我们如何使用信息',
    lines: ['我们会将收集的信息用于以下目的：'],
    clauses: [
      '提供、维护与优化服务功能（如油耗统计、图表展示、数据同步）。',
      '身份验证与安全防护（如异常登录识别、风险控制）。',
      '改进产品体验与性能（如故障排查、统计分析；在可能情况下进行去标识化/匿名化处理）。',
    ],
  },
  {
    title: '4. 信息共享、转让与公开披露',
    lines: ['我们不会向任何公司、组织和个人共享您的个人信息，但以下情况除外：'],
    clauses: [
      '获得您的明确同意或授权。',
      '为实现功能所必需的合作方/服务提供方（如云服务、通知或统计服务等），我们会要求其遵守严格的数据保护义务并仅在授权范围内处理信息。',
      '**嵌入的第三方 SDK 和服务：** 为保障本小程序功能正常运行，我们可能会嵌入第三方服务提供商（SDK）的代码。这些SDK包括：**微信开放平台SDK（用于微信登录/分享）**。这些SDK可能会依据其隐私政策收集和使用信息。',
      '根据法律法规规定、司法机关或行政机关的要求必须提供。',
      '涉及合并、收购、资产转让等情形时，如涉及个人信息转让，我们会要求新的持有方继续受本协议约束，否则将要求其重新征得您的同意。',
    ],
  },
  {
    title: '5. 信息存储与保护',
    lines: [
      '我们会采取合理可行的技术与管理措施保护您的个人信息，防止未经授权的访问、披露、篡改、丢失。',
    ],
    clauses: [
      '**存储地点：** 我们依照法律法规的要求，将收集到的您的个人信息**存储在中华人民共和国境内**的服务器上。',
      '存储期限：我们仅在实现目的所必需的最短期限内保留您的个人信息，法律法规另有规定的除外。',
      '安全措施：包括但不限于访问控制、加密传输与存储、日志审计与安全监测等。',
      '安全事件：如发生个人信息安全事件，我们将依据法律法规要求及时告知您相关情况与处置措施。',
    ],
  },
  {
    title: '6. 您的权利',
    lines: ['您对自己的个人信息享有以下权利：'],
    clauses: [
      '访问、更正：您可以在**“我的车辆”或“数据记录”**页面随时查阅并修改您录入的所有车辆与用车数据。',
      '删除：您可以在**“数据记录”**页面删除单条记录。如需注销账户并删除所有数据，您可以通过本协议第九条的联系方式申请，我们将在核验身份后的合理期限内完成处理（法律法规另有规定的除外）。',
      '撤回授权：您可以在微信或系统权限设置中撤回定位等授权；撤回后可能影响对应功能的使用。',
    ],
  },
  {
    title: '7. 未成年人保护',
    lines: [
      '若您为未成年人，请在监护人陪同下阅读本协议并在取得监护人同意后使用本服务。',
    ],
  },
  {
    title: '8. 本协议的更新',
    lines: [
      '我们可能适时对本协议进行更新。更新后我们会以小程序内公告、弹窗或推送等方式提示您，更新内容自公布之日起生效。',
    ],
  },
  {
    title: '9. 联系我们',
    lines: [
      '如您对本协议或个人信息处理有任何疑问、意见或建议，请通过“关于我们”中的联系方式与我们联系。',
    ],
  },
];
</script>

<style scoped lang="scss">
$theme-blue: #2563eb;
$text-dark: #1f2a44;
$text-sub: #4b5563;
$bg-color: #f0f4f7;

.page {
  min-height: 100vh;
  padding: 30rpx;
  background: linear-gradient(180deg, $bg-color 0%, #ffffff 100%);
  box-sizing: border-box;
}

.hero {
  padding: 35rpx 30rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #e3f2ff 0%, #c4e0ff 100%);
  color: $text-dark;
  box-shadow: 0 15rpx 40rpx rgba(37, 99, 235, 0.15);
  margin-bottom: 30rpx;
  border: 1rpx solid #dbeafe;

  .hero-title {
    font-size: 38rpx;
    font-weight: 900;
    display: block;
    margin-bottom: 8rpx;
  }
  .hero-sub {
    font-size: 26rpx;
    color: #4a5875;
    font-weight: 500;
  }
}

.agreement-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.03);
  border-left: 6rpx solid $theme-blue;
  transition: all 0.3s;
}

.card-title {
  font-size: 32rpx;
  font-weight: 800;
  color: $theme-blue;
  display: block;
  margin-bottom: 16rpx;
  padding-bottom: 8rpx;
  border-bottom: 1rpx solid #f0f4f8;
}

.paragraph {
  font-size: 28rpx;
  color: $text-sub;
  line-height: 1.7;
  margin-bottom: 10rpx;
  text-align: justify;
}

.clause-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 10rpx 0 0 0;
}

.clause-item {
  display: flex;
  align-items: flex-start;
  line-height: 1.6;
}

.clause-num {
  font-size: 26rpx;
  color: $theme-blue;
  font-weight: 700;
  min-width: 60rpx;
  margin-right: 10rpx;
}

.clause-text {
  flex: 1;
  font-size: 26rpx;
  color: $text-sub;
}

.footer {
  margin-top: 40rpx;
  padding: 20rpx 0;
  border-top: 1rpx dashed #d1d9e6;
  font-size: 24rpx;
  color: #7a829a;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
</style>
