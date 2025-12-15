<template>
  <view class="about-page">
    <view class="hero-section">
      <view class="logo-box">
        <image
          class="app-logo"
          src="/static/icons/logo2.jpeg"
          mode="aspectFit"
        ></image>
      </view>

      <text class="app-name">爱车油耗</text>
      <text class="app-slogan">用数据，让每一滴油更高效</text>
    </view>

    <view class="card vision-card">
      <text class="card-title">🚀 产品愿景</text>
      <view class="vision-content">
        <text class="vision-text">
          致力于成为最精准、最易用的汽车油耗记录与分析工具。
        </text>
        <text class="vision-text">
          通过数据可视化和智能分析，帮助每一位车主实现节油目标，让驾驶更经济、更环保。
        </text>
      </view>
    </view>

    <view class="card author-card">
      <text class="card-title">👨‍💻 作者介绍</text>
      <view class="author-info">
        <text class="author-label">姓名:</text>
        <text class="author-value">Alen Zhang</text>
      </view>
      <view class="author-info">
        <text class="author-label">背景:</text>
        <text class="author-value"
          >资深汽车爱好者与软件工程师，专注于提升用户体验。</text
        >
      </view>
    </view>

    <view class="card contact-card">
      <text class="card-title">📞 联系我们</text>
      <view class="contact-item">
        <text class="contact-label">微信客服:</text>
        <text class="contact-value highlight">1464253423</text>
        <text class="copy-btn" @tap="copyContact('1464253423')"
          >复制</text
        >
      </view>
      <view class="contact-item">
        <text class="contact-label">电子邮箱:</text>
        <text class="contact-value">alenzhang1998@gmail.com</text>
        <text class="copy-btn" @tap="copyContact('alenzhang1998@gmail.com')"
          >复制</text
        >
      </view>
    </view>

    <view class="disclaimer-section">
      <text class="disclaimer-title">免责声明</text>
      <text class="disclaimer-text">
        本小程序提供的油耗数据和分析报告仅基于用户录入数据计算得出，并参考行业平均值，仅供参考。
        实际油耗受多种外部因素影响，作者不保证数据的绝对准确性，用户需自行承担决策风险。
        使用本应用即视为同意本条款。
      </text>
      <text class="app-version">Version 1.0.0</text>
    </view>

    <view class="share-button-area">
      <button class="share-btn" open-type="share">
        <text class="btn-icon">🔗</text>
        <text>分享给好友</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';

// 复制功能
const copyContact = (content: string) => {
  uni.setClipboardData({
    data: content,
    success: () => {
      uni.showToast({
        title: '复制成功',
        icon: 'success',
      });
    },
    fail: () => {
      uni.showToast({
        title: '复制失败',
        icon: 'none',
      });
    },
  });
};

// 分享配置（可选，但推荐用于小程序）
onShareAppMessage(() => {
  return {
    title: '爱车油耗 - 我的私人节油专家',
    path: '/pages/home/index',
  };
});

onShareTimeline(() => {
  return {
    title: '爱车油耗 - 我的私人节油专家',
  };
});
</script>

<style scoped lang="scss">
// 定义主题颜色变量
$theme-green: #10b981; // 主色调：翡翠绿
$theme-light-green: #d1fae5; // 浅绿
$text-dark: #1f2d3d;
$text-light: #6b7280;
$bg-color: #f7f9fc; // 柔和背景色

.about-page {
  min-height: 100vh;
  background: $bg-color;
  padding: 0 30rpx 60rpx;
}

// --- 顶部 Logo & 愿景 ---
.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0 60rpx;
  // 顶部渐变背景，突出品牌感
  background: linear-gradient(180deg, #e0fcf4 0%, $bg-color 100%);
}

.logo-box {
  width: 160rpx;
  height: 160rpx;
  border-radius: 40rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 30rpx rgba(16, 185, 129, 0.3); // 绿色阴影
  border: 4rpx solid #fff;
  transition: transform 0.3s ease;

  &:active {
    transform: scale(0.95);
  }
}

.app-logo {
  width: 100%;
  height: 100%;
}

.app-name {
  font-size: 48rpx;
  font-weight: 900;
  color: $text-dark;
  margin-top: 24rpx;
}

.app-slogan {
  font-size: 28rpx;
  color: $text-light;
  margin-top: 8rpx;
}

// --- 通用卡片样式 ---
.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 10rpx 25rpx rgba(0, 0, 0, 0.05); // 柔和阴影
  border: 1rpx solid #f0f2f5;
  transition: all 0.3s ease;

  &:active {
    transform: translateY(-4rpx);
    box-shadow: 0 15rpx 35rpx rgba(0, 0, 0, 0.08);
  }
}

.card-title {
  font-size: 32rpx;
  font-weight: 800;
  color: $theme-green; // 标题使用主题色
  display: block;
  margin-bottom: 20rpx;
  border-bottom: 3rpx solid $theme-light-green; // 浅绿色底线
  padding-bottom: 10rpx;
}

// --- 愿景卡片 ---
.vision-card {
  .vision-content {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }
  .vision-text {
    font-size: 28rpx;
    color: $text-light;
    line-height: 1.6;
  }
}

// --- 作者介绍卡片 ---
.author-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12rpx;
}
.author-label {
  min-width: 120rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: $text-dark;
}
.author-value {
  flex: 1;
  font-size: 28rpx;
  color: $text-light;
  line-height: 1.6;
}

// --- 联系方式卡片 ---
.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding: 12rpx 0;
  border-bottom: 1rpx dotted #eee;
}
.contact-label {
  min-width: 160rpx;
  font-size: 28rpx;
  color: $text-dark;
  font-weight: 500;
}
.contact-value {
  flex: 1;
  font-size: 28rpx;
  color: $text-dark;
  word-break: break-all;

  &.highlight {
    color: $theme-green;
    font-weight: 700;
  }
}
.copy-btn {
  background: $theme-green;
  color: #fff;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  margin-left: 20rpx;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.8;
  }
}

// --- 免责声明 ---
.disclaimer-section {
  padding: 20rpx;
  margin-top: 30rpx;
  background: $theme-light-green; // 浅绿色背景，区分于卡片
  border-radius: 20rpx;
}
.disclaimer-title {
  font-size: 28rpx;
  font-weight: 700;
  color: $theme-green;
  margin-bottom: 12rpx;
  display: block;
}
.disclaimer-text {
  font-size: 24rpx;
  color: #4b5563;
  line-height: 1.8;
  display: block;
}

.app-version {
  margin-top: 20rpx;
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #9ca3af;
}

// 在 style 底部添加
.share-button-area {
  margin-top: 40rpx;
  padding: 0 30rpx;
}
.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $theme-green; // 使用主题绿色
  color: #fff;
  border-radius: 999rpx;
  height: 90rpx;
  font-size: 32rpx;
  box-shadow: 0 10rpx 20rpx rgba(16, 185, 129, 0.4);
}
.btn-icon {
  margin-right: 10rpx;
  font-size: 36rpx;
}
</style>
