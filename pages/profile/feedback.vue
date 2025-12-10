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
          class="feeling-tag"
          :class="{ 'feeling-tag--active': item.value === feeling }"
          @tap="feeling = item.value"
        >
          <text class="feeling-emoji">{{ item.emoji }}</text>
          <text class="feeling-text">{{ item.label }}</text>
        </view>
      </view>
    </view>

    <!-- 反馈内容 -->
    <view class="section-card">
      <view class="section-title required">
        反馈内容
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
  background: #f7f8fa;
  font-size: 28rpx;
  color: #1d2129;
}

.header-card {
  margin-bottom: 24rpx;
  padding: 28rpx 24rpx 32rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 10rpx 30rpx rgba(15, 35, 95, 0.03);

  .header-title {
    font-size: 34rpx;
    font-weight: 600;
    margin-bottom: 8rpx;
  }

  .header-sub {
    font-size: 26rpx;
    color: #86909c;
    line-height: 1.5;
  }
}

.section-card {
  margin-bottom: 20rpx;
  padding: 24rpx 24rpx 28rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 10rpx 30rpx rgba(15, 35, 95, 0.02);
}

.section-title {
  display: flex;
  align-items: baseline;
  font-size: 28rpx;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 18rpx;

  &.required::before {
    content: '*';
    color: #f53f3f;
    margin-right: 4rpx;
  }
}

.section-subtitle {
  margin-left: 8rpx;
  font-size: 24rpx;
  color: #a0a5b3;
}

.feeling-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.feeling-tag {
  min-width: 150rpx;
  padding: 14rpx 20rpx;
  border-radius: 999rpx;
  background: #f5f7fb;
  color: #4e5969;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  font-size: 26rpx;

  &--active {
    background: #e8f5ff;
    color: #2a7afe;
  }
}

.feeling-emoji {
  font-size: 30rpx;
}

.textarea-wrapper {
  border-radius: 20rpx;
  background: #f7f8fa;
  padding: 16rpx 18rpx 10rpx;
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
  font-size: 22rpx;
  color: #86909c;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
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
  border: 1px dashed #d0d3dd;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #a0a5b3;

  .add-icon {
    font-size: 40rpx;
    margin-bottom: 6rpx;
  }

  .add-text {
    font-size: 24rpx;
  }

  &__hover {
    background: #f0f2f5;
  }
}

.input-wrapper {
  border-radius: 999rpx;
  background: #f7f8fa;
  padding: 10rpx 22rpx;
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

.bottom-safe {
  height: 120rpx;
}

.submit-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12rpx 24rpx 32rpx;
  background: linear-gradient(to top, #f7f8fa, rgba(247, 248, 250, 0.1));
  box-sizing: border-box;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 999rpx;
  background: #2a7afe;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 500;

  &--disabled {
    background: #a0b5f0;
  }
}
</style>
