<template>
  <view class="profile-page">
    <view class="identity-card">
      <view class="identity-glow"></view>
      <view class="identity-header">
        <view class="avatar-ring" @tap="handleAvatarTap">
          <view class="avatar-core">
            <text v-if="isLoggedIn">{{ user.initial }}</text>
            <text v-else class="avatar-placeholder">点我登录</text>
          </view>
        </view>
        <view class="identity-meta" v-if="isLoggedIn">
          <text class="identity-label">驾驶档案</text>
          <text class="user-name">{{ user.name }}</text>
          <text class="user-subtitle">加入于 {{ user.joinDate }}</text>
          <view class="user-tags">
            <text class="user-tag" v-for="tag in user.tags" :key="tag">{{ tag }}</text>
          </view>
        </view>
        <view class="identity-meta identity-meta--placeholder" v-else>
          <text class="identity-label">欢迎来到驾驶档案</text>
          <text class="user-name">点击头像微信一键登录</text>
          <text class="user-subtitle">解锁个性化数据与服务</text>
        </view>
      </view>
      <view class="identity-motto-card" v-if="isLoggedIn">
        <text class="motto-label">今日心情</text>
        <text class="motto-text">{{ user.motto }}</text>
      </view>
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

const isLoggedIn = ref(false)
const user = ref({
  name: 'Alen',
  initial: '熊',
  joinDate: '2024-08',
  motto: '给油门一个拥抱，让城市多一点绿。',
  tags: ['城市漫游者', '节能达人', '夜行者']
})

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
  { key: 'subscription', icon: '🧊', title: '订阅服务', desc: '智驾实验室体验中' },
  {
    key: 'settings',
    icon: '⚙️',
    title: '设置中心',
    desc: '订阅提醒、隐私偏好、一键反馈'
  }
])

const handleAvatarTap = () => {
  if (isLoggedIn.value) {
    return
  }
  // 模拟微信一键登录入口
  uni.showModal({
    title: '提示',
    content: '模拟微信一键登录成功',
    success: (res) => {
      if (res.confirm) {
        isLoggedIn.value = true
      }
    }
  })
}
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
  border-radius: 44rpx;
  padding: 44rpx 40rpx 36rpx;
  background: linear-gradient(135deg, #ffffff 0%, #eef8ff 45%, #fdf1ff 100%);
  box-shadow: 0 28rpx 60rpx rgba(74, 111, 160, 0.2);
  overflow: hidden;
  margin-bottom: 32rpx;
}

.identity-glow {
  position: absolute;
  inset: -60rpx;
  background: radial-gradient(circle at 15% 15%, rgba(190, 225, 255, 0.7), transparent 60%),
    radial-gradient(circle at 85% 5%, rgba(255, 203, 240, 0.55), transparent 50%),
    radial-gradient(circle at 50% 80%, rgba(198, 248, 219, 0.5), transparent 55%);
  filter: blur(8rpx);
}

.identity-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  position: relative;
  z-index: 1;
}

.avatar-ring {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: conic-gradient(#2ed97a, #52a1ff, #ffd976, #2ed97a);
  padding: 8rpx;
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
  box-shadow: inset 0 0 18rpx rgba(0, 0, 0, 0.06);
}

.avatar-placeholder {
  color: #94a2b8;
  font-size: 28rpx;
}

.identity-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.identity-label {
  font-size: 22rpx;
  letter-spacing: 4rpx;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.35);
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

.identity-meta--placeholder {
  align-items: flex-start;
  gap: 8rpx;
}

.identity-meta--placeholder .user-name {
  font-size: 32rpx;
  color: #2a61d1;
}

.identity-motto-card {
  margin-top: 24rpx;
  padding: 24rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.3), 0 12rpx 32rpx rgba(86, 126, 173, 0.14);
  position: relative;
  z-index: 1;
}

.motto-label {
  font-size: 22rpx;
  color: #7a8295;
  margin-bottom: 8rpx;
  display: block;
}

.motto-text {
  font-size: 28rpx;
  color: #3a3f4d;
  line-height: 1.4;
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
