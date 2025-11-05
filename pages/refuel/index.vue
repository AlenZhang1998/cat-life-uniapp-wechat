<template>
  <view class="refuel-page">
    <view class="summary-card">
      <text class="summary-title">本月加油统计</text>
      <view class="summary-grid">
        <view class="summary-item">
          <text class="summary-value">{{ monthlySummary.times }}</text>
          <text class="summary-label">加油次数</text>
        </view>
        <view class="summary-item">
          <text class="summary-value">{{ monthlySummary.volume }}</text>
          <text class="summary-label">总油量 (升)</text>
        </view>
        <view class="summary-item">
          <text class="summary-value">{{ monthlySummary.amount }}</text>
          <text class="summary-label">总金额 (元)</text>
        </view>
      </view>
    </view>

    <view class="timeline">
      <view class="timeline-item" v-for="item in refuelRecords" :key="item.id">
        <view class="timeline-marker"></view>
        <view class="timeline-content">
          <text class="timeline-date">{{ item.date }}</text>
          <text class="timeline-station">{{ item.station }}</text>
          <view class="timeline-meta">
            <text>油量：{{ item.volume }} 升</text>
            <text>金额：{{ item.amount }} 元</text>
          </view>
          <text class="timeline-remark" v-if="item.remark">
            备注：{{ item.remark }}
          </text>
        </view>
      </view>
    </view>
  </view>
  <BottomActionBar active="refuel" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BottomActionBar from '@/components/BottomActionBar.vue'

// 加油记录列表，包含油量、金额与备注信息
const refuelRecords = ref([
  {
    id: 1,
    date: '2025-03-08',
    station: '中国石化 · 宝安站',
    volume: 42,
    amount: 295,
    remark: '跑高速，油价便宜 0.3 元/升'
  },
  {
    id: 2,
    date: '2025-02-19',
    station: '中国石油 · 西乡站',
    volume: 38,
    amount: 274,
    remark: ''
  },
  {
    id: 3,
    date: '2025-02-01',
    station: '中国石化 · 南山站',
    volume: 35,
    amount: 252,
    remark: '春节出游前补油'
  }
])

// 通过计算属性得到本月统计信息
const monthlySummary = computed(() => {
  const totalVolume = refuelRecords.value.reduce(
    (sum, item) => sum + item.volume,
    0
  )
  const totalAmount = refuelRecords.value.reduce(
    (sum, item) => sum + item.amount,
    0
  )
  return {
    times: refuelRecords.value.length,
    volume: totalVolume.toFixed(1),
    amount: totalAmount.toFixed(0)
  }
})
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.refuel-page {
  padding: 32rpx 32rpx 160rpx;
}

.summary-card {
  background-color: #fff;
  border-radius: $card-radius;
  padding: $card-padding;
  margin-bottom: 32rpx;
  box-shadow: $soft-shadow;
}

.summary-title {
  font-size: 32rpx;
  font-weight: 700;
  margin-bottom: 24rpx;
  display: block;
}

.summary-grid {
  display: flex;
  justify-content: space-between;
}

.summary-item {
  text-align: center;
  flex: 1;
}

.summary-item:not(:last-child) {
  border-right: 2rpx solid #eef2f6;
}

.summary-value {
  font-size: 40rpx;
  font-weight: 700;
  color: $primary-dark;
  display: block;
}

.summary-label {
  font-size: 24rpx;
  color: $muted-text;
}

.timeline {
  position: relative;
  padding-left: 32rpx;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 16rpx;
  top: 0;
  bottom: 0;
  width: 4rpx;
  background: linear-gradient(180deg, #1ec15f 0%, #c8e6d3 100%);
}

.timeline-item {
  position: relative;
  margin-bottom: 36rpx;
}

.timeline-marker {
  position: absolute;
  left: -2rpx;
  top: 8rpx;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background-color: #fff;
  border: 6rpx solid #1ec15f;
  box-shadow: 0 8rpx 16rpx rgba(30, 193, 95, 0.18);
}

.timeline-content {
  margin-left: 48rpx;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 16rpx 30rpx rgba(15, 114, 59, 0.08);
}

.timeline-date {
  font-size: 30rpx;
  font-weight: 600;
}

.timeline-station {
  display: block;
  margin-top: 6rpx;
  font-size: 26rpx;
  color: $muted-text;
}

.timeline-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #1f2329;
}

.timeline-remark {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: $muted-text;
}
</style>
