<template>
  <view
    v-if="visible"
    class="range-picker-overlay"
    @tap="handleOverlayTap"
    @touchmove.stop.prevent
  >
    <view class="range-picker-dialog" @tap.stop>
      <view class="range-picker-title">{{ title }}</view>
      <view class="range-options">
        <view
          v-for="option in options"
          :key="option.key"
          class="range-option"
          :class="{ active: option.key === selectedKey }"
          @tap="() => handleSelect(option.key)"
        >
          <text>{{ option.label }}</text>
        </view>
      </view>
      <view class="range-actions">
        <view class="range-button cancel" @tap="handleCancel">{{ cancelText }}</view>
        <view class="range-button confirm" @tap="handleConfirm">{{ confirmText }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

type OptionKey = string | number

export interface RangePickerOption {
  key: OptionKey
  label: string
}

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '请选择'
  },
  options: {
    type: Array as PropType<RangePickerOption[]>,
    default: () => []
  },
  selectedKey: {
    type: [String, Number] as PropType<OptionKey | null>,
    default: null
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits<{
  (event: 'update:selectedKey', value: OptionKey | null): void
  (event: 'confirm', value: OptionKey | null): void
  (event: 'cancel'): void
}>()

const handleSelect = (key: OptionKey) => {
  emit('update:selectedKey', key)
}

const handleCancel = () => {
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm', props.selectedKey ?? null)
}

const handleOverlayTap = () => {
  if (props.closeOnOverlay) {
    handleCancel()
  }
}
</script>

<style scoped lang="scss">
@import '@/uni.scss';

.range-picker-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 48rpx;
  z-index: 1200;
}

.range-picker-dialog {
  width: 100%;
  background: #fff;
  border-radius: 40rpx;
  padding: 48rpx 40rpx 40rpx;
  box-shadow: 0 30rpx 80rpx rgba(0, 0, 0, 0.12);
  animation: pickerPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.range-picker-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
}

.range-options {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
  margin: 36rpx 0 12rpx;
}

.range-option {
  flex: 1 1 calc(33% - 16rpx);
  max-width: 30%;
  border-radius: 999rpx;
  border: 2rpx solid rgba(138, 147, 160, 0.35);
  padding: 22rpx 0;
  text-align: center;
  color: $muted-text;
  font-size: 26rpx;
  font-weight: 600;
  background: #fafbfd;
}

.range-option.active {
  border-color: transparent;
  background: linear-gradient(180deg, #1ec15f 0%, #22d78a 100%);
  color: #fff;
  box-shadow: 0 16rpx 36rpx rgba(18, 163, 74, 0.35);
}

.range-actions {
  display: flex;
  gap: 24rpx;
  margin-top: 32rpx;
}

.range-button {
  flex: 1;
  border-radius: 999rpx;
  text-align: center;
  padding: 26rpx 0;
  font-size: 28rpx;
  font-weight: 600;
}

.range-button.cancel {
  background: #f5f7fb;
  color: #1c1f23;
  border: 1rpx solid #e5e9f2;
}

.range-button.confirm {
  color: #fff;
  background: linear-gradient(180deg, #1ec15f 0%, #22d78a 100%);
  box-shadow: 0 18rpx 32rpx rgba(30, 193, 95, 0.32);
}

@keyframes pickerPop {
  0% {
    transform: translate3d(0, 24rpx, 0) scale(0.96);
    opacity: 0;
  }
  100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 1;
  }
}
</style>
