<template>
  <view class="profile-page">
    <view class="identity-card">
      <view class="identity-glow"></view>
      <view class="identity-header">
        <view class="avatar-ring">
          <view class="avatar-core">{{ user.initial }}</view>
        </view>
        <view class="identity-meta">
          <text class="user-name">{{ user.name }}</text>
          <text class="user-subtitle">加入于 {{ user.joinDate }}</text>
          <view class="user-tags">
            <text class="user-tag" v-for="tag in user.tags" :key="tag">{{ tag }}</text>
          </view>
        </view>
        <!-- <view class="identity-badge">
          <text class="badge-label">等级</text>
          <text class="badge-value">α-3</text>
        </view> -->
      </view>
      <view class="identity-motto">{{ user.motto }}</view>
      <!-- <view class="identity-actions">
        <view class="identity-action" v-for="action in quickLinks" :key="action.key">
          <view class="action-icon">
            <text>{{ action.icon }}</text>
          </view>
          <view class="action-meta">
            <text class="action-label">{{ action.label }}</text>
            <text class="action-desc">{{ action.desc }}</text>
          </view>
          <text class="action-arrow">→</text>
        </view>
      </view> -->
    </view>

    <view class="garage-card">
      <view class="section-header">
        <text class="section-title">常用模块</text>
        <text class="section-subtitle">体验自定义驾驶日常</text>
      </view>
      <view class="feature-list">
        <view class="feature-item" v-for="item in features" :key="item.key">
          <view class="feature-icon">{{ item.icon }}</view>
          <view class="feature-content">
            <text class="feature-title">{{ item.title }}</text>
            <text class="feature-desc">{{ item.desc }}</text>
          </view>
          <text class="feature-arrow">﹥</text>
        </view>
      </view>
    </view>
  </view>
  <BottomActionBar active="profile" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BottomActionBar from '@/components/BottomActionBar.vue'

const user = ref({
  name: 'Alen',
  initial: '熊',
  joinDate: '2024-08',
  motto: '给油门一个拥抱，让城市多一点绿。',
  tags: ['城市漫游者', '节能达人', '夜行者']
})

const quickLinks = ref([
  { key: 'garage', icon: '🛰️', label: '车库宇宙', desc: '连接 3 台车与 2 个电桩' },
  { key: 'report', icon: '📈', label: '驾驶报告', desc: '今日续航表现 +2%' },
  // { key: 'subscription', icon: '🧊', label: '订阅服务', desc: '智驾实验室体验中' }
])

const features = ref([
  {
    key: 'garage',
    icon: '🚗',
    title: '我的车库',
    desc: '切换默认车型，创建虚拟座驾'
  },
  {
    key: 'feedback',
    icon: '💡',
    title: '建议反馈',
    desc: '和我们聊聊你的灵感，持续优化体验'
  },
  {
    key: 'backup',
    icon: '☁️',
    title: '数据备份',
    desc: '同步到云端，换机无忧'
  },
  { key: 'subscription', icon: '🧊', label: '订阅服务', desc: '智驾实验室体验中' },
  {
    key: 'settings',
    icon: '⚙️',
    title: '设置中心',
    desc: '订阅提醒、隐私偏好、一键反馈'
  }
])
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.profile-page {
  padding: 32rpx 32rpx 160rpx;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4f7 100%);
  color: #1f2329;
}

.identity-card {
  position: relative;
  border-radius: 40rpx;
  padding: 40rpx 36rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f2fbff 60%, #fef7ff 100%);
  box-shadow: 0 26rpx 52rpx rgba(103, 132, 192, 0.18);
  overflow: hidden;
  margin-bottom: 32rpx;
}

.identity-glow {
  position: absolute;
  inset: -40rpx;
  background: radial-gradient(circle at 20% 20%, rgba(190, 225, 255, 0.8), transparent 55%),
    radial-gradient(circle at 80% 10%, rgba(255, 203, 240, 0.45), transparent 55%);
  filter: blur(6rpx);
}

.identity-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  position: relative;
  z-index: 1;
}

.avatar-ring {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: conic-gradient(#2ed97a, #52a1ff, #ffd976, #2ed97a);
  padding: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-core {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  font-weight: 700;
  color: #1f2329;
  box-shadow: inset 0 0 12rpx rgba(0, 0, 0, 0.08);
}

.identity-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.user-name {
  font-size: 40rpx;
  font-weight: 700;
}

.user-subtitle {
  font-size: 26rpx;
  color: #6a7283;
}

.user-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.user-tag {
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(30, 193, 95, 0.12);
  font-size: 22rpx;
  color: #1d7243;
}

// .identity-badge {
//   width: 120rpx;
//   border-radius: 24rpx;
//   background: rgba(82, 161, 255, 0.12);
//   text-align: center;
//   padding: 12rpx 0;
//   font-size: 24rpx;
//   color: #2a61d1;
// }

.identity-motto {
  margin: 10rpx 0 5rpx;
  font-size: 28rpx;
  color: #4c5567;
  // position: relative;
  z-index: 1;
}

.identity-actions {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 18rpx;
}

.identity-action {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 28rpx;
  padding: 24rpx 26rpx;
  gap: 20rpx;
  box-shadow: 0 12rpx 28rpx rgba(78, 120, 172, 0.18);
}

.action-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  background: rgba(46, 217, 122, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  flex-shrink: 0;
}

.action-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.action-label {
  font-size: 30rpx;
  font-weight: 600;
}

.action-desc {
  font-size: 24rpx;
  color: #8a93a0;
}

.action-arrow {
  font-size: 32rpx;
  color: #aab0c0;
}

.stats-panel,
.journey-card,
.garage-card {
  border-radius: 32rpx;
  padding: 32rpx;
  background: #fff;
  box-shadow: 0 20rpx 48rpx rgba(72, 117, 149, 0.12);
  margin-bottom: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
}

.section-subtitle {
  font-size: 24rpx;
  color: #8a93a0;
}


.feature-list {
  display: flex;
  flex-direction: column;
  border-radius: 28rpx;
  overflow: hidden;
  border: 1rpx solid rgba(164, 186, 211, 0.25);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 26rpx;
  background: #fbfdff;
}

.feature-item + .feature-item {
  border-top: 1rpx solid rgba(223, 229, 238, 0.9);
}

.feature-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  background: rgba(30, 193, 95, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
}

.feature-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.feature-title {
  font-size: 30rpx;
  font-weight: 600;
}

.feature-desc {
  font-size: 24rpx;
  color: #8a93a0;
}

.feature-arrow {
  font-size: 32rpx;
  color: #c0c5d2;
}
</style>
