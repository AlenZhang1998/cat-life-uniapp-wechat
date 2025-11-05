<template>
  <view class="action-bar">
    <view
      v-for="action in actions"
      :key="action.key"
      @tap="handleAction(action)"
      :class="[
        'action-item',
        action.type === 'primary' ? 'primary' : '',
        `action-${action.key}`,
        action.key === active ? 'active' : ''
      ]"
    >
      <view class="action-icon">{{ action.icon }}</view>
      <text v-if="action.label" class="action-label">{{ action.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
type ActionKey = 'fuel' | 'list' | 'add' | 'refuel' | 'profile'

const props = defineProps<{
  active?: ActionKey
}>()

const actions: Array<{
  key: ActionKey
  label: string
  icon: string
  type: 'text' | 'primary'
  path: string
}> = [
  { key: 'fuel', label: '油耗', icon: '油', type: 'text', path: '/pages/home/index' },
  { key: 'list', label: '列表', icon: '表', type: 'text', path: '/pages/records/index' },
  { key: 'add', label: '', icon: '+', type: 'primary', path: '/pages/add/index' },
  { key: 'refuel', label: '加油', icon: '汽', type: 'text', path: '/pages/refuel/index' },
  { key: 'profile', label: '我的', icon: '我', type: 'text', path: '/pages/profile/index' }
]

const handleAction = (action: (typeof actions)[number]) => {
  if (action.key === props.active && action.key !== 'add') {
    return
  }

  if (action.key === 'add') {
    uni.navigateTo({ url: action.path })
    return
  }

  uni.redirectTo({ url: action.path })
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding: 16rpx 32rpx calc(36rpx + env(safe-area-inset-bottom, 0rpx));
  background-color: #fff;
  box-shadow: 0 -12rpx 32rpx rgba(0, 0, 0, 0.06);
  z-index: 999;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: $muted-text;
  font-size: 22rpx;
  transition: color 0.2s ease;
}

.action-item.active {
  color: $primary-dark;
  font-weight: 600;
}

.action-item.primary {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, #1ec15f 0%, #14a04b 100%);
  color: #fff;
  justify-content: center;
  margin-bottom: 24rpx;
  box-shadow: 0 18rpx 32rpx rgba(30, 193, 95, 0.32);
}

.action-icon {
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
}

.action-item.primary .action-icon {
  font-size: 56rpx;
  margin-bottom: 0;
}

.action-item.primary .action-label {
  font-size: 24rpx;
  margin-top: 12rpx;
}

.action-label {
  white-space: nowrap;
}
</style>
