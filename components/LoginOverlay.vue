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
          <text class="agreement-link" @tap.stop="openAgreement('user')"
            >爱车油耗助手用户使用协议</text
          >
          和
          <text class="agreement-link" @tap.stop="openAgreement('privacy')"
            >隐私保护协议</text
          >
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuth } from '@/utils/auth';
import { axios } from '@/utils/request';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  // 带上登录结果
  (
    e: 'login-success',
    payload: { token: string; user: Record<string, any> }
  ): void;
}>();

const hasAgreed = ref(false);
const isSubmitting = ref(false);
const { refreshLoginState } = useAuth();

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      hasAgreed.value = false;
      isSubmitting.value = false;
    }
  }
);

const closeSheet = () => {
  emit('update:visible', false);
};

const toggleAgreement = () => {
  hasAgreed.value = !hasAgreed.value;
};

const openAgreement = (type: 'user' | 'privacy') => {
  if (type === 'user') {
    uni.navigateTo({ url: '/pages/faq/agreement-user' });
    return;
  }
  uni.showToast({
    title: '隐私保护协议稍后上线',
    icon: 'none',
  });
};

const handleWeChatLogin = () => {
  if (isSubmitting.value) return;

  if (!hasAgreed.value) {
    uni.showToast({
      title: '请勾选协议后再登录',
      icon: 'none',
    });
    return;
  }

  isSubmitting.value = true;

  // 👇 这里是按钮 @tap 的同步回调 → 可以正常调用 getUserProfile
  uni.getUserProfile({
    desc: '用于完善个人信息',
    success: (profileRes) => {
      const userInfo = profileRes.userInfo;
      console.log(99, 'getUserProfile userInfo = ', userInfo);

      uni.login({
        provider: 'weixin',
        success: (loginRes) => {
          const code = loginRes.code;

          // 用法1
          // axios.post<{ token?: string; user?: Record<string, any> }>(
          //   '/api/auth/login',
          //   { code, userInfo },
          //   { showErrorToast: false }
          // )
          // .then((data) => {
          //   // ...保持后续逻辑不变
          // })
          // .catch(...)
          // .finally(...)

          // 用法2
          axios
            .request<{
              token?: string; // 给 request 的返回数据加 TypeScript 类型约束。 // token 是可选字段，可能有可能没有
              user?: Record<string, any>; // user 也是可选字段，但它是一个对象（键值对）
            }>({
              url: '/api/auth/login',
              method: 'POST',
              data: {
                code,
                userInfo,
              },
              showErrorToast: false,
            })
            .then((data) => {
              console.log(116, 'login success data = ', data);

              const { token, user } = data || {};

              if (!token || !user) {
                uni.showToast({ title: '登录数据异常', icon: 'none' });
                return;
              }

              uni.setStorageSync('token', token);
              uni.setStorageSync('userProfile', user);

              refreshLoginState();
              uni.showToast({ title: '登录成功', icon: 'success' });
              emit('login-success', { token, user });
              emit('update:visible', false);
            })
            .catch((error) => {
              console.log('login request fail', error);
              uni.showToast({ title: '登录失败，请稍后再试', icon: 'none' });
            })
            .finally(() => {
              isSubmitting.value = false;
            });
        },
        fail: () => {
          isSubmitting.value = false;
          uni.showToast({ title: '寰俊鐧诲綍澶辫触', icon: 'none' });
        },
      });
    },
    fail: (err) => {
      isSubmitting.value = false;
      console.log('getUserProfile fail', err);
      uni.showToast({ title: '需要获取用户信息权限', icon: 'none' });
    },
  });
};
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
