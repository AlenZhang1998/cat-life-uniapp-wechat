<template>
  <view class="profile-page">
    <view class="identity-card">
      <view class="identity-glow"></view>
      <view class="identity-header">
        <view class="avatar-ring" @tap="handleAvatarTap">
          <view class="avatar-core">
            <image v-if="user.avatar && isLoggedIn" :src="user.avatar" class="avatar-image" mode="aspectFill" />
            <text v-else-if="isLoggedIn">{{ user.initial }}</text>
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
        <view class="feature-item" v-for="item in features" :key="item.key" @tap="handleFeatureTap(item)">
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
  <view
    v-if="showLoginSheet"
    class="login-overlay"
    @tap="closeLoginSheet"
    @touchmove.stop.prevent
  >
    <view class="login-overlay__backdrop"></view>
    <view class="login-sheet" @tap.stop>
      <view class="login-sheet__close" @tap="closeLoginSheet">✕</view>
      <view class="login-sheet__title">登录账号</view>
      <view class="login-sheet__subtitle">为有效保存您的数据，建议您登录</view>
      <button class="login-sheet__btn login-sheet__btn--wechat" @tap="handleWeChatLogin">
        微信一键登录
      </button>
      <view class="login-sheet__agreement" @tap="toggleAgreement">
        <view class="checkbox" :class="{ 'checkbox--checked': hasAgreed }">
          <text v-if="hasAgreed">✓</text>
        </view>
        <view class="agreement-text">
          我已阅读并同意
          <text class="agreement-link" @tap.stop="openAgreement('user')">小熊油耗助手用户使用协议</text>
          和
          <text class="agreement-link" @tap.stop="openAgreement('privacy')">隐私保护协议</text>
        </view>
      </view>
    </view>
  </view>
  <BottomActionBar active="profile" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import BottomActionBar from '@/components/BottomActionBar.vue'

const defaultProfile = {
  name: 'Alen',
  initial: '熊',
  avatar: '',
  joinDate: '2024-08',
  motto: '给油门一个拥抱，让城市多一点绿。',
  tags: ['城市漫游者', '节能达人', '夜行者'],
  gender: '',
  deliveryDate: '',
  carModel: '',
  phone: '',
  email: ''
}

const isLoggedIn = ref(false)
const showLoginSheet = ref(false)
const hasAgreed = ref(false)
const user = ref({ ...defaultProfile })

const features = ref([
  {
    key: 'garage',
    icon: '🚗',
    title: '个人信息',
    desc: '编辑个人信息, 爱车型号'
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

const applyProfile = (profile?: Record<string, any>) => {
  const merged = { ...defaultProfile, ...(profile || {}) }
  merged.initial = merged.name ? merged.name.charAt(0) : defaultProfile.initial
  user.value = merged
  isLoggedIn.value = !!profile && !!profile.name
}

const loadUserProfile = () => {
  try {
    const stored = uni.getStorageSync('userProfile')
    if (stored) {
      applyProfile(typeof stored === 'string' ? JSON.parse(stored) : stored)
      return
    }
  } catch (error) {
    console.warn('读取用户信息失败', error)
  }
  isLoggedIn.value = false
  user.value = { ...defaultProfile }
}

onShow(() => {
  loadUserProfile()
})

const handleAvatarTap = () => {
  if (isLoggedIn.value) {
    return
  }
  showLoginSheet.value = true
}

const closeLoginSheet = () => {
  showLoginSheet.value = false
}

const toggleAgreement = () => {
  hasAgreed.value = !hasAgreed.value
}

const handleWeChatLogin = () => {
  if (!hasAgreed.value) {
    uni.showToast({
      title: '请勾选协议后再登录',
      icon: 'none'
    })
    return
  }
  showLoginSheet.value = false

  uni.getUserProfile({
    desc: '用于完善个人信息',
    success: (profileRes) => {
      const userInfo = profileRes.userInfo
      uni.login({
        provider: 'weixin',
        success: (loginRes) => {
          const code = loginRes.code
          uni.request({
            url: 'http://192.168.60.58:3000/api/auth/login',
            method: 'POST',
            header: {
              'Content-Type': 'application/json'
            },
            data: {
              code,
              userInfo
            },
            success: (res) => {
              if (res.statusCode !== 200) {
                uni.showToast({ title: '登录失败', icon: 'none' })
                return
              }

              const { token, user } = res.data
              uni.setStorageSync('token', token)
              uni.setStorageSync('userInfo', user)

              isLoggedIn.value = true
              uni.showToast({ title: '登录成功', icon: 'success' })
            },
            fail: () => {
              uni.showToast({ title: '网络错误', icon: 'none' })
            }
          })
        },
        fail: () => {
          uni.showToast({ title: '微信登录失败', icon: 'none' })
        }
      })
    },
    fail: (err) => {
      console.log('getUserProfile fail', err)
      uni.showToast({ title: '需要授权头像信息', icon: 'none' })
    }
  })
}

const openAgreement = (type: 'user' | 'privacy') => {
  const name = type === 'user' ? '用户使用协议' : '隐私保护协议'
  uni.showToast({
    title: `${name}暂未上线`,
    icon: 'none'
  })
}

const handleFeatureTap = (item: { key: string }) => {
  if (item.key === 'garage') {
    uni.navigateTo({
      url: '/pages/profile/personal-info'
    })
    return
  }
  uni.showToast({
    title: '功能开发中，敬请期待',
    icon: 'none'
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

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.avatar-placeholder {
  color: #94a2b8;
  font-size: 28rpx;
}

.login-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32rpx;
}

.login-overlay__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.login-sheet {
  position: relative;
  width: 100%;
  max-width: 640rpx;
  padding: 48rpx 40rpx 52rpx;
  border-radius: 32rpx;
  background: #fff;
  box-shadow: 0 28rpx 80rpx rgba(15, 25, 32, 0.28);
  z-index: 1;
}

.login-sheet__close {
  position: absolute;
  top: 28rpx;
  right: 28rpx;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba(99, 114, 140, 0.12);
  color: #4b556c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.login-sheet__title {
  font-size: 36rpx;
  font-weight: 600;
  text-align: center;
  color: #1f2329;
}

.login-sheet__subtitle {
  margin-top: 12rpx;
  text-align: center;
  color: #6a7286;
  font-size: 26rpx;
}

.login-sheet__btn {
  width: 100%;
  border: none;
  border-radius: 999rpx;
  margin-top: 32rpx;
  padding: 24rpx 0;
  font-size: 30rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-sheet__btn--wechat {
  background: linear-gradient(100deg, #00b83d, #00a837);
  color: #fff;
  box-shadow: 0 16rpx 32rpx rgba(0, 168, 55, 0.3);
}

.login-sheet__agreement {
  display: flex;
  align-items: center;
  margin-top: 28rpx;
  font-size: 24rpx;
  color: #6c768e;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border-radius: 8rpx;
  border: 2rpx solid #c5ccdd;
  margin-right: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24rpx;
}

.checkbox--checked {
  background: linear-gradient(120deg, #00b83d, #00a837);
  border-color: transparent;
}

.agreement-text {
  flex: 1;
  line-height: 1.6;
}

.agreement-link {
  color: #0f73ff;
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
