<template>
  <view class="feedback-page">
    <!-- 顶部说明 -->
    <view class="header-card">
      <view class="header-title">建议反馈</view>
      <view class="header-sub">
        谢谢你愿意告诉我真实的使用感受，这会帮助我持续优化「爱车油耗」。
      </view>
    </view>

    <!-- 使用感受 -->
    <view class="section-card">
      <view class="section-title">最近的使用感受</view>
      <view class="feeling-tags">
        <view
          v-for="item in feelingOptions"
          :key="item.value"
          :class="[
            'feeling-tag',
            `feeling-tag--${item.value}`,
            { 'feeling-tag--active': item.value === feeling },
          ]"
          @tap="feeling = item.value"
        >
          <text class="feeling-emoji">{{ item.emoji }}</text>
          <text class="feeling-text">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <!-- 反馈内容 -->
    <view class="section-card">
      <view class="section-title">
        反馈内容（必填）
        <text class="section-subtitle"
          >(越详细越好，比如在哪个页面、操作步骤等)</text
        >
      </view>
      <view class="textarea-wrapper">
        <textarea
          v-model="content"
          class="feedback-textarea"
          placeholder="例如：在加油记录页面，想增加一个按油站统计的视图；或者某个地方不好用、文案看不懂，都可以直接说～"
          placeholder-class="feedback-textarea__placeholder"
          :maxlength="maxLength"
          show-confirm-bar="false"
          auto-height
        />
        <view class="textarea-footer">
          <view class="textarea-tip">
            <text v-if="content.length < 10"
              >可以简单说说你遇到的问题或期待的功能</text
            >
            <text v-else>感谢，你的建议我都会认真看 🙇‍♂️</text>
          </view>
          <view class="textarea-count">
            {{ content.length }}/{{ maxLength }}
          </view>
        </view>
      </view>
    </view>

    <!-- 截图上传 -->
    <view class="section-card">
      <view class="section-title">
        截图（可选）
        <text class="section-subtitle"
          >(如果方便的话，可以截几张图，更好定位问题)</text
        >
      </view>
      <view class="image-list">
        <view v-for="(img, index) in localImages" :key="img" class="image-item">
          <image class="image-thumb" :src="img" mode="aspectFill" />
          <view class="image-remove" @tap="removeImage(index)">✕</view>
        </view>

        <view
          v-if="localImages.length < maxImages"
          class="image-item image-item--add"
          hover-class="image-item--add__hover"
          @tap="chooseImages"
        >
          <text class="add-icon">＋</text>
          <text class="add-text"
            >添加{{ localImages.length ? '更多' : '' }}截图</text
          >
        </view>
      </view>
    </view>

    <!-- 联系方式 -->
    <view class="section-card">
      <view class="section-title">
        联系方式（可选）
        <text class="section-subtitle">(微信号、邮箱等，方便需要时联系你)</text>
      </view>
      <view class="input-wrapper">
        <input
          v-model="contact"
          class="feedback-input"
          placeholder="例如：微信号 / 邮箱（不填也可以匿名反馈）"
          placeholder-class="feedback-input__placeholder"
        />
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-safe" />

    <view class="submit-bar">
      <button
        class="submit-btn"
        :class="{ 'submit-btn--disabled': !canSubmit || submitting }"
        :disabled="!canSubmit || submitting"
        @tap="handleSubmit"
      >
        {{ submitting ? '提交中...' : '提交反馈' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { axios } from '@/utils/request';
import { useAuth } from '@/utils/auth';
import { STORAGE_KEYS } from '@/constants/storage';
import { uploadImagesToCos } from '@/utils/upload';

const { isLoggedIn, getStoredProfile } = useAuth();

const feelingOptions = [
  { value: 'great', label: '很好用', emoji: '👍' },
  { value: 'ok', label: '还可以', emoji: '🙂' },
  { value: 'bug', label: '有问题', emoji: '🪲' },
  { value: 'bad', label: '体验糟糕', emoji: '😣' },
];

const feeling = ref<string>('great');
const content = ref<string>('');
const maxLength = 500;

const contact = ref<string>('');
const localImages = ref<string[]>([]);
const maxImages = 3;

const submitting = ref(false);

const getAppVersion = () => {
  try {
    const baseInfo =
      typeof uni.getAppBaseInfo === 'function' ? uni.getAppBaseInfo() : null;
    if (!baseInfo) return '';
    const version = (baseInfo as Record<string, any>).appVersion;
    const versionCode = (baseInfo as Record<string, any>).appVersionCode;
    return version || (versionCode ? String(versionCode) : '');
  } catch {
    return '';
  }
};

// 有内容（去掉空白后长度>=5）才能提交
const canSubmit = computed(() => content.value.trim().length >= 5);

const chooseImages = () => {
  const remain = maxImages - localImages.value.length;
  if (remain <= 0) return;

  uni.chooseImage({
    count: remain,
    sizeType: ['compressed'],
    success(res) {
      localImages.value = localImages.value.concat(res.tempFilePaths);
    },
  });
};

const removeImage = (index: number) => {
  localImages.value.splice(index, 1);
};

const uploadSelectedImages = async (): Promise<string[]> => {
  if (!localImages.value.length) return [];
  return uploadImagesToCos(localImages.value);
};

const handleSubmit = async () => {
  if (!canSubmit.value || submitting.value) return;
  if (!isLoggedIn.value) {
    uni.showToast({ title: '请先登录再提交反馈', icon: 'none' });
    return;
  }

  submitting.value = true;
  try {
    // 1. 上传截图（如果有）
    const imageUrls = await uploadSelectedImages();
    console.log(303, 'imageUrls = ', imageUrls);

    // 2. 调用反馈接口
    const systemInfo = uni.getSystemInfoSync();
    const city =
      uni.getStorageSync(STORAGE_KEYS.selectedCity) ||
      uni.getStorageSync('selectedCity') ||
      '';
    const appVersion = getAppVersion();
    const profile = getStoredProfile?.() || {};
    const username =
      (profile && (profile.username || profile.name || profile.nickname)) || '';
    const userId =
      (profile && (profile.userId || profile._id || profile.id)) || '';

    const payload = {
      content: content.value.trim(),
      contact: contact.value.trim(),
      feeling: feeling.value,
      images: imageUrls,
      page: 'settings-feedback',
      system: systemInfo?.system || '',
      platform: systemInfo?.platform || '',
      model: systemInfo?.model || '',
      brand: systemInfo?.brand || '',
      language: systemInfo?.language || '',
      screenSize:
        systemInfo?.screenWidth && systemInfo?.screenHeight
          ? `${systemInfo.screenWidth}x${systemInfo.screenHeight}`
          : '',
      city,
      appVersion,
      username,
      userId,
    };
    console.log(234, 'payload = ', payload);

    const res = (await axios.post('/api/feedback', {
      data: payload,
    })) as any;

    if (!res || res.success !== true) {
      throw new Error(res?.error || res?.message || '提交失败');
    }

    uni.showToast({
      title: res.message || '已收到你的反馈 🙏',
      icon: 'none',
    });

    // 简单重置一下
    content.value = '';
    contact.value = '';
    localImages.value = [];
    feeling.value = 'great';

    // 提交后稍微返回上一页也行，看你需求
    setTimeout(() => uni.navigateBack({ delta: 1 }), 600);
  } catch (err) {
    console.error('submit feedback error:', err);
    const message =
      (err as any)?.statusCode === 401 ||
      (err instanceof Error && err.message === 'no token for upload')
        ? '请登录后再上传截图'
        : err instanceof Error && err.message.toLowerCase().includes('upload')
        ? '截图上传失败，请稍后再试'
        : err instanceof Error && err.message
        ? err.message
        : '提交失败，请稍后再试';
    uni.showToast({
      title: message,
      icon: 'none',
    });
  } finally {
    submitting.value = false;
  }
};

onShow(() => {
  // 没登录也允许匿名反馈，但你也可以强制登录
  if (!isLoggedIn.value) {
    // 匿名就啥也不做
  }
});
</script>

<style lang="scss" scoped>
.feedback-page {
  min-height: 100vh;
  padding: 20rpx 24rpx 140rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #1d2129;
  /* 背景做一点细节：浅色渐变 + 细网格感 */
  background-image: linear-gradient(
      180deg,
      #f3f6ff 0%,
      #f7f8fa 40%,
      #f4f7fb 100%
    ),
    linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 0),
    linear-gradient(180deg, rgba(255, 255, 255, 0.5) 1px, transparent 0);
  background-size: 100% 100%, 60rpx 60rpx, 60rpx 60rpx;
  background-position: 0 0, 0 0, 0 0;
}

/* 顶部卡片：渐变、光晕、左侧色条 */
.header-card {
  position: relative;
  margin-bottom: 28rpx;
  padding: 28rpx 26rpx 28rpx;
  border-radius: 26rpx;
  background: radial-gradient(
    circle at 0 0,
    #e4ecff 0,
    #ffffff 36%,
    #f7f8ff 100%
  );
  box-shadow: 0 18rpx 42rpx rgba(68, 106, 190, 0.12);
  overflow: hidden;

  // &::before {
  //   content: '';
  //   position: absolute;
  //   left: 0;
  //   top: 24rpx;
  //   bottom: 24rpx;
  //   width: 8rpx;
  //   border-radius: 999rpx;
  //   background: linear-gradient(180deg, #3a7afe, #45c6ff);
  // }

  &::after {
    /* 右上角一点高光 */
    content: '';
    position: absolute;
    right: -60rpx;
    top: -80rpx;
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.9) 0,
      transparent 60%
    );
    opacity: 0.65;
  }

  .header-title {
    font-size: 34rpx;
    font-weight: 650;
    margin-bottom: 10rpx;
    // padding-left: 18rpx;
  }

  .header-sub {
    // padding-left: 18rpx;
    font-size: 22rpx;
    color: #8691a3;
    line-height: 1.7;
  }
}

/* 通用卡片：轻微渐变边、玻璃感 */
.section-card {
  position: relative;
  margin-bottom: 22rpx;
  // padding: 24rpx 24rpx 30rpx;
  padding: 28rpx 26rpx 28rpx;
  border-radius: 24rpx;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.92), #ffffff);
  border: 1rpx solid rgba(216, 223, 240, 0.9);
  box-shadow: 0 10rpx 28rpx rgba(28, 39, 83, 0.05);

  // &::before {
  //   /* 顶部小色条 */
  //   content: '';
  //   position: absolute;
  //   left: 24rpx;
  //   top: 20rpx;
  //   width: 32rpx;
  //   height: 6rpx;
  //   border-radius: 999rpx;
  //   background: linear-gradient(90deg, #3a7afe, #6ae0ff);
  // }
}

/* 标题 + 副标题：纵向排列，看起来更整齐 */
.section-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 18rpx;
  // padding-left: 26rpx;
  font-size: 28rpx;
  font-weight: 550;
  color: #1d2129;

  &.required::before {
    content: '*';
    color: #ff4d4f;
    margin-bottom: 4rpx;
  }
}

.section-subtitle {
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #9ca3b5;
  line-height: 1.5;
}

/* 使用感受 tags */
.feeling-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  // padding-left: 12rpx;
}

.feeling-tag {
  width: 46%;
  padding: 12rpx 22rpx;
  border-radius: 999rpx;
  background: #f5f7fb;
  color: #4e5969;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 26rpx;
  border: 1rpx solid transparent;
  transition: all 0.18s ease-out;

  &--great {
    background: linear-gradient(
      135deg,
      rgba(29, 210, 135, 0.08),
      rgba(10, 177, 118, 0.02)
    );
    color: #19b470;
  }

  &--ok {
    background: linear-gradient(
      135deg,
      rgba(60, 134, 255, 0.08),
      rgba(58, 122, 254, 0.02)
    );
    color: #3a7afe;
  }

  &--bug {
    background: linear-gradient(
      135deg,
      rgba(255, 193, 79, 0.09),
      rgba(255, 158, 49, 0.02)
    );
    color: #ff9f31;
  }

  &--bad {
    background: linear-gradient(
      135deg,
      rgba(255, 119, 119, 0.1),
      rgba(255, 90, 95, 0.02)
    );
    color: #ff5a5f;
  }

  &--active {
    color: #151a24;
    background: #ffffff;
    box-shadow: 0 10rpx 24rpx rgba(58, 122, 254, 0.28);
    // border-image: linear-gradient(135deg, #3a7afe, #6ae0ff) 1;
    transform: translateY(-2rpx);
    // transform: scale(1.1);
    .feeling-emoji {
      // font-size: 30rpx;
      transform: scale(1.3);
    }
  }
}

.feeling-emoji {
  font-size: 30rpx;
}

/* 反馈内容文本域 */
.textarea-wrapper {
  margin-top: 4rpx;
  border-radius: 22rpx;
  padding: 18rpx 20rpx 12rpx;
  background: radial-gradient(
    circle at 0 0,
    #f4f6ff 0,
    #f7f8fc 40%,
    #f6f7fa 100%
  );
  border: 1rpx dashed #dde2f0;
}

.feedback-textarea {
  width: 100%;
  min-height: 190rpx;
  max-height: 480rpx;
  font-size: 28rpx;
  line-height: 1.7;
  color: #1d2129;
}

:deep(.feedback-textarea__placeholder) {
  color: #c0c4cc;
  font-size: 24rpx;
}

.textarea-footer {
  margin-top: 8rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.textarea-tip {
  font-size: 22rpx;
  color: #a0a5b3;
}

.textarea-count {
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #eef3ff, #e1ecff);
  font-size: 22rpx;
  color: #3164ff;
}

/* 图片上传区域 */
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 18rpx;
  padding-left: 6rpx;
}

.image-item {
  position: relative;
  width: 164rpx;
  height: 164rpx;
  border-radius: 22rpx;
  overflow: hidden;
  background: #f5f7fb;
}

.image-thumb {
  width: 100%;
  height: 100%;
}

.image-remove {
  position: absolute;
  right: 8rpx;
  top: 8rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 999rpx;
  background: rgba(0, 0, 0, 0.38);
  color: #fff;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 添加图片：渐变描边 + 轻微浮起 */
.image-item--add {
  border-radius: 22rpx;
  border: 1rpx dashed #b7c0d8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #a0a5b3;
  background: radial-gradient(
    circle at 20% 0,
    #f7fbff 0,
    #f5f7fb 36%,
    #f4f5f7 100%
  );
  transition: all 0.16s ease-out;

  .add-icon {
    font-size: 40rpx;
    margin-bottom: 8rpx;
  }

  .add-text {
    font-size: 24rpx;
  }

  &__hover {
    background: linear-gradient(135deg, #eef3ff, #e5f6ff);
    border-color: #3a7afe;
    color: #3a7afe;
    transform: translateY(-2rpx);
    box-shadow: 0 10rpx 24rpx rgba(58, 122, 254, 0.22);
  }
}

/* 联系方式输入：pill + 轻玻璃感 */
.input-wrapper {
  margin-top: 4rpx;
  border-radius: 999rpx;
  padding: 10rpx 24rpx;
  background: linear-gradient(135deg, rgba(247, 248, 250, 0.96), #f9fafb);
  border: 1rpx solid #e4e7f2;
  box-shadow: 0 6rpx 16rpx rgba(15, 35, 95, 0.04);
}

.feedback-input {
  width: 100%;
  height: 72rpx;
  line-height: 72rpx;
  font-size: 28rpx;
  color: #1d2129;
}

.feedback-input__placeholder {
  color: #c0c4cc;
  font-size: 26rpx;
}

/* 底部安全距离 */
.bottom-safe {
  height: 120rpx;
}

/* 提交条：毛玻璃 + 渐变按钮 */
.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12rpx 24rpx 32rpx;
  box-sizing: border-box;
  background: linear-gradient(
    180deg,
    rgba(247, 248, 250, 0.1) 0%,
    rgba(247, 248, 250, 0.9) 30%,
    #f7f8fa 100%
  );
  backdrop-filter: blur(14rpx);
  box-shadow: 0 -6rpx 20rpx rgba(15, 35, 95, 0.08);
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 500;
  color: #ffffff;
  background: linear-gradient(135deg, #3a7afe, #45c6ff);
  box-shadow: 0 16rpx 32rpx rgba(58, 122, 254, 0.35);
  transition: all 0.18s ease-out;

  &--disabled {
    background: linear-gradient(135deg, #b8c6ff, #d1e6ff);
    box-shadow: none;
  }

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 8rpx 20rpx rgba(58, 122, 254, 0.25);
    opacity: 0.96;
  }
}
</style>
