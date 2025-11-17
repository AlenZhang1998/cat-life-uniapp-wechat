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
      <view class="action-icon">
        <image
          v-if="action.iconType === 'image'"
          :src="action.key === active ? action.iconActive : action.icon"
          class="action-icon__img"
          mode="aspectFit"
        />
        <text v-else>
          {{ action.key === active ? action.iconActive || action.icon : action.icon }}
        </text>
      </view>
      <text v-if="action.label" class="action-label">{{ action.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
type ActionKey = 'fuel' | 'list' | 'add' | 'expense' | 'profile'

const props = defineProps<{
  active?: ActionKey
}>()

const actions: Array<{
  key: ActionKey
  label: string
  icon: string
  iconActive?: string
  iconType: 'text' | 'image'
  type: 'text' | 'primary'
  path: string
}> = [
  {
    key: 'fuel',
    label: '油耗',
    icon: '⛽',
    iconActive: '🛢️',
    iconType: 'text',
    type: 'text',
    path: '/pages/home/index'
  },
  {
    key: 'list',
    label: '列表',
    icon: '📋',
    iconActive: '📑',
    iconType: 'text',
    type: 'text',
    path: '/pages/records/index'
  },
  {
    key: 'add',
    label: '',
    icon: '+',
    iconActive: '✚',
    iconType: 'text',
    type: 'primary',
    path: '/pages/add/index'
  },
  {
    key: 'expense',
    label: '费用',
    icon: '💰',
    iconActive: '💵',
    iconType: 'text',
    type: 'text',
    path: '/pages/expense/index'
  },
  {
    key: 'profile',
    label: '我的',
    icon: '🙂',
    iconActive: '😄',
    iconType: 'text',
    type: 'text',
    path: '/pages/profile/index'
  }
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
  // align-items: center;
  padding: 16rpx 32rpx calc(18rpx + env(safe-area-inset-bottom, 0rpx));
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
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, #1ec15f 0%, #14a04b 100%);
  color: #fff;
  justify-content: center;
  align-items: center;
  margin-bottom: 24rpx;
  box-shadow: 0 18rpx 32rpx rgba(30, 193, 95, 0.32);
}

.action-icon {
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon__img {
  width: 40rpx;
  height: 40rpx;
}

.action-item.primary .action-icon {
  width: 100%;
  height: 100%;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56rpx;
}

.action-item.primary .action-label {
  font-size: 24rpx;
  margin-top: 12rpx;
}

.action-label {
  white-space: nowrap;
}
</style>
