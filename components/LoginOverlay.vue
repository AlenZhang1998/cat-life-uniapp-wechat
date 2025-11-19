<template>
  <view
    v-if="visible"
    class="login-overlay"
    @tap="closeSheet"
    @touchmove.stop.prevent
  >
    <view class="login-overlay__backdrop"></view>
    <view class="login-sheet" @tap.stop>
      <view class="login-sheet__close" @tap="closeSheet">✕</view>
      <view class="login-sheet__title">登录账号</view>
      <view class="login-sheet__subtitle">为有效保存您的数据，建议您登录</view>
      <button
        class="login-sheet__btn login-sheet__btn--wechat"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @tap="handleWeChatLogin"
      >
        微信一键登录
      </button>
      <view class="login-sheet__agreement" @tap="toggleAgreement">
        <view class="checkbox" :class="{ 'checkbox--checked': hasAgreed }">
          <text v-if="hasAgreed">✓</text>
        </view>
        <view class="agreement-text">
          我已阅读并同意
          <text class="agreement-link" @tap.stop="openAgreement('user')">爱车油耗助手用户使用协议</text>
          和
          <text class="agreement-link" @tap.stop="openAgreement('privacy')">隐私保护协议</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuth } from '@/utils/auth'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  // 带上登录结果
  (e: 'login-success', payload: { token: string; user: Record<string, any> }): void
}>()

const hasAgreed = ref(false)
const isSubmitting = ref(false)
const { refreshLoginState } = useAuth()

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      hasAgreed.value = false
      isSubmitting.value = false
    }
  }
)

const closeSheet = () => {
  emit('update:visible', false)
}

const toggleAgreement = () => {
  hasAgreed.value = !hasAgreed.value
}

const openAgreement = (type: 'user' | 'privacy') => {
  const name = type === 'user' ? '用户使用协议' : '隐私保护协议'
  uni.showToast({
    title: `${name}暂未上线`,
    icon: 'none'
  })
}

const handleWeChatLogin = () => {
  if (isSubmitting.value) return

  if (!hasAgreed.value) {
    uni.showToast({
      title: '请勾选协议后再登录',
      icon: 'none'
    })
    return
  }

  isSubmitting.value = true

  // 👇 这里是按钮 @tap 的同步回调 → 可以正常调用 getUserProfile
  uni.getUserProfile({
    desc: '用于完善个人信息',
    success: (profileRes) => {
      const userInfo = profileRes.userInfo
      console.log(98, 'getUserProfile userInfo = ', userInfo)

      uni.login({
        provider: 'weixin',
        success: (loginRes) => {
          const code = loginRes.code

          uni.request({
            url: 'http://192.168.60.58:3000/api/auth/login', // 10.48.75.101 192.168.60.58
            method: 'POST',
            header: {
              'Content-Type': 'application/json'
            },
            data: {
              code,
              userInfo   // ✅ 和后端 app.js 解构字段对上      前端传 code 和 userInfo
            },
            success: (res) => {
              console.log(116, 'login success res = ', res)
              isSubmitting.value = false

              if (res.statusCode !== 200) {
                uni.showToast({ title: '登录失败', icon: 'none' })
                return
              }

              const { token, user } = res.data as {
                token?: string
                user?: Record<string, any>
              }

              if (!token || !user) {
                uni.showToast({ title: '登录数据异常', icon: 'none' })
                return
              }

              // 这里可以顺手存一份 raw 数据（可选）
              uni.setStorageSync('token', token)
              uni.setStorageSync('userProfile', user)  // ✅ 统一用 userProfile

              refreshLoginState()
              uni.showToast({ title: '登录成功', icon: 'success' })

              // 把结果抛给父组件，让父组件决定怎么展示 profile
              emit('login-success', { token, user })

              emit('update:visible', false)
            },
            fail: () => {
              isSubmitting.value = false
              uni.showToast({ title: '网络错误', icon: 'none' })
            }
          })
        },
        fail: () => {
          isSubmitting.value = false
          uni.showToast({ title: '微信登录失败', icon: 'none' })
        }
      })
    },
    fail: (err) => {
      isSubmitting.value = false
      console.log('getUserProfile fail', err)
      uni.showToast({ title: '需要授权头像信息', icon: 'none' })
    }
  })
}
</script>

<style lang="scss" scoped>
.login-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.login-overlay__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(14, 21, 37, 0.55);
  backdrop-filter: blur(6px);
}

.login-sheet {
  position: relative;
  width: 100%;
  border-top-left-radius: 40rpx;
  border-top-right-radius: 40rpx;
  background: #fff;
  padding: 48rpx 40rpx calc(48rpx + env(safe-area-inset-bottom, 0));
  box-shadow: 0 -20rpx 40rpx rgba(7, 18, 38, 0.15);
  animation: slideUp 0.3s ease-out;
}

.login-sheet__close {
  position: absolute;
  right: 36rpx;
  top: 32rpx;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 32, 58, 0.04);
  font-size: 32rpx;
  color: #5f6c7b;
}

.login-sheet__title {
  font-size: 36rpx;
  font-weight: 700;
  color: #121d2c;
}

.login-sheet__subtitle {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #6c778a;
}

.login-sheet__btn {
  margin-top: 40rpx;
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 999rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  border: none;
}

.login-sheet__btn--wechat {
  background: linear-gradient(110deg, #2dd881, #13a853);
  box-shadow: 0 24rpx 36rpx rgba(19, 168, 83, 0.35);
}

.login-sheet__agreement {
  margin-top: 32rpx;
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid rgba(20, 32, 58, 0.2);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24rpx;
}

.checkbox--checked {
  background: #1ec15f;
  border-color: #1ec15f;
}

.agreement-text {
  flex: 1;
  font-size: 24rpx;
  color: #7b8697;
  line-height: 1.5;
}

.agreement-link {
  color: #1ec15f;
}

@keyframes slideUp {
  0% {
    transform: translateY(20%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
