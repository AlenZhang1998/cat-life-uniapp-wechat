1111
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
          >（越详细越好，比如在哪个页面、操作步骤等）</text
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
          >如果方便的话，可以截几张图，更好定位问题</text
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
        <text class="section-subtitle">微信号、邮箱等，方便需要时联系你</text>
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

const { isLoggedIn } = useAuth();

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

// 这里先假装“上传成功”，真实项目你可以走你之前头像/COS 的那套上传逻辑，返回 url 数组
const uploadImagesMock = async (): Promise<string[]> => {
  // TODO: 替换成真正的上传逻辑
  // 现在直接用本地路径占位，后端先不强依赖截图
  return localImages.value.slice();
};

const handleSubmit = async () => {
  if (!canSubmit.value || submitting.value) return;

  submitting.value = true;
  try {
    // 1. 上传截图（如果有）
    const imageUrls = await uploadImagesMock();

    // 2. 调用反馈接口
    const payload = {
      content: content.value.trim(),
      contact: contact.value.trim() || '',
      page: 'settings-feedback',
      version: '', // 如果你有版本号，可以在这里填
      system: uni.getSystemInfoSync().system,
      city: uni.getStorageSync('selectedCity') || '',
      feeling: feeling.value,
      images: imageUrls,
    };

    const res = (await axios.post('/api/feedback/create', payload)) as any;

    if (!res || res.success !== true) {
      throw new Error(res?.error || '提交失败');
    }

    uni.showToast({
      title: '已收到你的反馈 🙏',
      icon: 'none',
    });

    // 简单重置一下
    content.value = '';
    contact.value = '';
    localImages.value = [];
    feeling.value = 'great';

    // 提交后稍微返回上一页也行，看你需求
    // setTimeout(() => uni.navigateBack(), 600);
  } catch (err) {
    console.error('submit feedback error:', err);
    uni.showToast({
      title: '提交失败，请稍后再试',
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
  padding: 16rpx 24rpx 140rpx;
  box-sizing: border-box;
  background: linear-gradient(180deg, #f5f7ff 0%, #f7f8fa 36%, #f5f7f9 100%);
  font-size: 28rpx;
  color: #1d2129;
}

/* 顶部卡片 */
.header-card {
  position: relative;
  margin-bottom: 24rpx;
  padding: 28rpx 24rpx 32rpx;
  background: linear-gradient(135deg, #ffffff 0%, #f6f7ff 40%, #f8fbff 100%);
  border-radius: 24rpx;
  box-shadow: 0 12rpx 32rpx rgba(28, 63, 160, 0.06);
  overflow: hidden;

  .header-title {
    font-size: 34rpx;
    font-weight: 600;
    margin-bottom: 8rpx;
    padding-left: 10rpx;
  }

  .header-sub {
    padding-left: 10rpx;
    font-size: 26rpx;
    color: #8a93a3;
    line-height: 1.6;
  }
}

/* 通用卡片 */
.section-card {
  position: relative;
  margin-bottom: 20rpx;
  padding: 24rpx 24rpx 28rpx;
  background: #ffffff;
  border-radius: 24rpx;
  border: 1rpx solid #eef0f4;
  box-shadow: 0 10rpx 28rpx rgba(15, 35, 95, 0.03);
}

/* ✅✅✅ 这里是关键修复点 ✅✅✅ */
.section-title {
  display: flex;
  flex-direction: column; // ✅ 改成纵向排列
  align-items: flex-start; // ✅ 左对齐
  font-size: 28rpx;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 18rpx;
  padding-left: 44rpx;

  &.required::before {
    content: '*';
    color: #ff4d4f;
    margin-bottom: 4rpx;
  }
}

/* ✅ 副标题独占一行 */
.section-subtitle {
  margin-top: 6rpx; // ✅ 由 margin-left 改为 margin-top
  font-size: 24rpx;
  color: #a0a5b3;
  line-height: 1.5;
}

/* 使用感受 tags */
.feeling-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding-left: 20rpx;
}

.feeling-tag {
  min-width: 150rpx;
  padding: 12rpx 20rpx;
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
    background: rgba(57, 209, 129, 0.06);
    color: #21a96b;
  }
  &--ok {
    background: rgba(64, 134, 255, 0.05);
    color: #3a7afe;
  }
  &--bug {
    background: rgba(255, 193, 79, 0.06);
    color: #ff9f31;
  }
  &--bad {
    background: rgba(255, 119, 119, 0.06);
    color: #ff5a5f;
  }

  &--active {
    color: #1d2129;
    box-shadow: 0 10rpx 24rpx rgba(58, 122, 254, 0.22);
    background: #ffffff;
    border-image: linear-gradient(135deg, #3a7afe, #6ae0ff) 1;
  }
}

.feeling-emoji {
  font-size: 30rpx;
}

/* 文本输入块 */
.textarea-wrapper {
  border-radius: 20rpx;
  background: #f7f8fc;
  padding: 16rpx 18rpx 10rpx;
  border: 1rpx dashed #dde2f0;
}

.feedback-textarea {
  width: 100%;
  min-height: 180rpx;
  max-height: 480rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #1d2129;
}

.feedback-textarea__placeholder {
  color: #c0c4cc;
  font-size: 26rpx;
}

.textarea-footer {
  margin-top: 6rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.textarea-tip {
  font-size: 22rpx;
  color: #a0a5b3;
}

.textarea-count {
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  background: #eef3ff;
  font-size: 22rpx;
  color: #3a7afe;
}

/* 图片上传 */
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding-left: 4rpx;
}

.image-item {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 20rpx;
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
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-item--add {
  border-radius: 20rpx;
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
}

/* 联系方式输入框 */
.input-wrapper {
  border-radius: 999rpx;
  background: #f7f8fa;
  padding: 10rpx 22rpx;
  border: 1rpx solid #e4e7f2;
}

.feedback-input {
  width: 100%;
  height: 72rpx;
  line-height: 72rpx;
  font-size: 28rpx;
  color: #1d2129;
}

/* 底部提交按钮 */
.bottom-safe {
  height: 120rpx;
}

.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12rpx 24rpx 32rpx;
  background: linear-gradient(
    180deg,
    rgba(247, 248, 250, 0.1) 0%,
    rgba(247, 248, 250, 0.92) 30%,
    #f7f8fa 100%
  );
  backdrop-filter: blur(12rpx);
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #3a7afe, #45c6ff);
  box-shadow: 0 16rpx 32rpx rgba(58, 122, 254, 0.35);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 500;

  &--disabled {
    background: linear-gradient(135deg, #afc3ff, #cdeaff);
    box-shadow: none;
  }
}
</style>
