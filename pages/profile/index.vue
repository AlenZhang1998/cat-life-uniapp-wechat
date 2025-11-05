<template>
  <view class="profile-page">
    <view class="profile-card">
      <view class="avatar-wrapper">
        <view class="avatar-text">熊</view>
      </view>
      <view class="user-info">
        <text class="user-name">{{ user.name }}</text>
        <text class="user-subtitle">加入于 {{ user.joinDate }}</text>
      </view>
    </view>

    <view class="feature-list">
      <view class="feature-item" v-for="item in features" :key="item.key">
        <view class="feature-icon">{{ item.icon }}</view>
        <view class="feature-content">
          <text class="feature-title">{{ item.title }}</text>
          <text class="feature-desc">{{ item.desc }}</text>
        </view>
        <text class="feature-arrow">›</text>
      </view>
    </view>
  </view>
  <BottomActionBar active="profile" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BottomActionBar from '@/components/BottomActionBar.vue'

// 个人资料内容，后续可替换为真实用户信息 
const user = ref({
  name: '爱车车主',
  joinDate: '2024-08'
})

// 功能列表，模拟个人中心常见的跳转菜单
const features = ref([
  {
    key: 'garage',
    icon: '车',
    title: '我的车库',
    desc: '管理车辆、切换默认车型'
  },
  {
    key: 'report',
    icon: '报',
    title: '驾驶报告',
    desc: '查看驾驶评分与节油建议'
  },
  {
    key: 'backup',
    icon: '云',
    title: '数据备份',
    desc: '同步到云端，换机无忧'
  },
  {
    key: 'settings',
    icon: '设',
    title: '设置',
    desc: '通知、隐私、关于'
  }
])
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.profile-page {
  padding: 32rpx 32rpx 160rpx;
}

.profile-card {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: $card-radius;
  padding: $card-padding;
  box-shadow: $soft-shadow;
  margin-bottom: 32rpx;
}

.avatar-wrapper {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, #1ec15f 0%, #14a04b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 48rpx;
  font-weight: 700;
  margin-right: 32rpx;
  box-shadow: 0 20rpx 40rpx rgba(30, 193, 95, 0.26);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: 700;
}

.user-subtitle {
  font-size: 24rpx;
  color: $muted-text;
}

.feature-list {
  background-color: #fff;
  border-radius: $card-radius;
  box-shadow: $soft-shadow;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 28rpx;
  border-bottom: 1px solid #edf1f6;
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 24rpx;
  background-color: #f0f7f3;
  color: $primary-dark;
  font-weight: 700;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.feature-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.feature-title {
  font-size: 30rpx;
  font-weight: 600;
}

.feature-desc {
  font-size: 24rpx;
  color: $muted-text;
}

.feature-arrow {
  color: $muted-text;
  font-size: 36rpx;
}
</style>
