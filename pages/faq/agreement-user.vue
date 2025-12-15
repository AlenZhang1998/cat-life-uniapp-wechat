<template>
  <view class="page">
    <view class="hero">
      <text class="hero-title">爱车油耗助手用户服务协议</text>
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
      <text>如有疑问，请通过“关于我们”中的联系方式与我们沟通。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const effectiveDate = ref('2025-12-15');

const sections = [
  {
    title: '1. 协议的确认与生效',
    lines: [
      '本《用户服务协议》由您（“用户”）与爱车油耗助手（“我们”）共同签订，具有合同法律效力。',
      '在使用本服务前，请您务必审慎阅读、充分理解本协议的各项条款。您通过点击“同意”或实际使用本小程序服务的行为，即表示您已阅读、理解并同意接受本协议的全部内容。',
    ],
  },
  {
    title: '2. 账户注册、登录与安全保障',
    lines: [
      '您可通过微信授权登录本小程序，完成账号创建。您应确保所提供信息的真实性、合法性和有效性。',
    ],
    clauses: [
      '您应妥善保管您的微信账号及密码，并对您账户下发生的所有活动和事件承担全部责任。',
      '您理解并同意，您在使用本服务时，禁止转借、共享或以其他方式授予任何第三方使用您的账户。',
      '如发现任何未经授权使用您账户的情况，您应立即通知我们。',
    ],
  },
  {
    title: '3. 服务内容及变更',
    lines: [
      '本应用核心服务包括：车辆信息管理、油耗数据记录、加油/保养费用统计、数据图表可视化分析、能效评级等。',
    ],
    clauses: [
      '我们有权根据业务发展、技术升级或市场变化，在通知或不通知的情况下，对部分服务内容进行优化、升级或调整。',
      '我们将努力保障核心数据（如加油记录）的连续性和可导出性，但不对因不可抗力或技术故障导致的短暂服务中断承担责任。',
    ],
  },
  {
    title: '4. 用户行为规范与法律责任',
    lines: ['您在使用本服务时，必须遵守所有适用的法律法规、本协议及相关规则。'],
    clauses: [
      '**信息真实性义务：** 保证所有输入的车辆信息和油耗数据真实、准确、完整、有效，不得虚构或恶意篡改数据。',
      '**禁止行为：** 不得利用本服务制作、复制、发布、传播任何法律法规禁止的信息，包括但不限于煽动仇恨、色情、暴力或侵犯他人知识产权的内容。',
      '**技术合规：** 不得对本小程序进行反向工程、反向汇编、破解，不得利用爬虫或自动化工具批量获取数据。',
    ],
  },
  {
    title: '5. 数据所有权与隐私保护',
    lines: [
      '我们高度重视您的隐私和数据安全。详细的隐私数据处理方式请参阅《隐私政策》。',
    ],
    clauses: [
      '**数据所有权：** 您上传的个人车辆记录、油耗、费用等数据的所有权归您所有。我们仅在提供服务、进行数据分析（去标识化）和改善产品的目的范围内使用这些数据。',
      '**数据保护：** 我们将采用行业标准的加密技术和安全措施保护您的数据，防止未经授权的访问、使用或泄露。',
      '**数据删除：** 您可以通过联系客服申请永久删除您的账户及其所有相关数据。在账户删除后，我们将依据法律法规要求在合理期限内从服务器上清除您的数据。',
    ],
  },
  {
    title: '6. 免责声明与风险提示',
    lines: [
      '您理解并同意，本服务依照“现状”和“现有”提供，我们不对服务的准确性、可靠性或适用性作任何明示或暗示的保证。',
    ],
    clauses: [
      '**数据参考性：** 本应用提供的油耗分析、评级、费用预测等结果均基于您输入的数据计算得出，仅作为您的用车参考，不构成任何投资、驾驶操作或财务建议。',
      '**不可抗力：** 对于因电信部门技术调整、自然灾害、疫情、战争等不可抗力事件导致的延迟或损失，我们不承担责任。',
      '**第三方链接：** 本应用可能包含指向第三方网站或服务的链接，我们对这些链接的内容不承担责任。',
    ],
  },
  {
    title: '7. 知识产权与授权',
    lines: [
      '本小程序的所有内容，包括但不限于代码、设计、用户界面、图表、文档、商标等知识产权，均归爱车油耗助手运营团队所有或已获得合法授权。',
    ],
  },
  {
    title: '8. 协议的变更、中断与终止',
    lines: [
      '我们保留在必要时修改本协议任何条款的权利。协议修改后，我们会通过小程序内公告、弹窗或推送等方式通知您，修改后的条款一经公布立即生效。',
    ],
  },
  {
    title: '9. 适用法律与争议解决',
    lines: [
      '本协议的订立、执行和解释及争议解决均适用中华人民共和国法律。',
      '因本协议产生的任何争议，双方应首先友好协商解决；协商不成的，任何一方有权向本应用运营方所在地人民法院提起诉讼。',
    ],
  },
];
</script>

<style scoped lang="scss">
// 主题色定义：深海蓝和辅助色
$theme-blue: #2563eb;
$theme-light: #e6f0ff;
$text-dark: #1f2a44;
$text-sub: #4b5563;
$bg-color: #f0f4f7;

.page {
  min-height: 100vh;
  padding: 30rpx;
  // 柔和的渐变背景
  background: linear-gradient(180deg, $bg-color 0%, #ffffff 100%);
  box-sizing: border-box;
}

// --- 头部英雄区域 (Hero) ---
.hero {
  padding: 35rpx 30rpx;
  border-radius: 24rpx;
  // 科技感背景渐变
  background: linear-gradient(135deg, #e3f2ff 0%, #c4e0ff 100%);
  color: $text-dark;
  // 增强阴影，突出悬浮感
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

// --- 协议列表容器 ---
.agreement-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

// --- 卡片 (Card) ---
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.03);
  border-left: 6rpx solid $theme-blue; // 左侧主题色条
  transition: all 0.3s;
}

.card-title {
  font-size: 32rpx;
  font-weight: 800;
  color: $theme-blue;
  display: block;
  margin-bottom: 16rpx;
  padding-bottom: 8rpx;
  border-bottom: 1rpx solid #f0f4f8; // 分隔线
}

.paragraph {
  font-size: 28rpx;
  color: $text-sub;
  line-height: 1.7;
  margin-bottom: 10rpx;
  text-align: justify; // 内容对齐
}

// --- 子条款列表样式 ---
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

// --- 底部 ---
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

