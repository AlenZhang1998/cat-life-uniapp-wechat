<template>
  <view class="records-page">
    <!-- 顶部说明，引导用户知道页面用途 -->
    <view class="page-tips">
      <text class="tips-title">最近油耗记录</text>
      <text class="tips-desc">
        这里可以查看月度油耗趋势、记录对比以及快速筛选不同车型。
      </text>
    </view>

    <!-- 列表数据，这里使用静态假数据，后续可替换为请求结果 -->
    <view class="record-card" v-for="item in recordList" :key="item.id">
      <view class="card-left">
        <text class="record-date">{{ item.date }}</text>
        <text class="record-location">{{ item.city }}</text>
      </view>
      <view class="card-right">
        <text class="record-fuel">{{ item.fuel }} 升/百公里</text>
        <text class="record-mileage">行驶 {{ item.mileage }} 公里</text>
      </view>
    </view>

    <!-- 空状态占位，提高在无数据情况下的引导体验 -->
    <view class="empty-state" v-if="recordList.length === 0">
      <text class="empty-title">暂无记录</text>
      <text class="empty-desc">点击底部“加号”即可添加第一条记录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 真实项目中可从服务端读取，这里简单给出三条示例数据
const recordList = ref([
  { id: 1, date: '2025-03-12', city: '深圳', fuel: 4.8, mileage: 326 },
  { id: 2, date: '2025-02-21', city: '广州', fuel: 5.1, mileage: 280 },
  { id: 3, date: '2025-02-03', city: '东莞', fuel: 5.7, mileage: 415 }
])
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.records-page {
  padding: 32rpx;
}

.page-tips {
  margin-bottom: 24rpx;
}

.tips-title {
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
  display: block;
}

.tips-desc {
  font-size: 24rpx;
  color: $muted-text;
  display: block;
}

.record-card {
  background-color: #fff;
  border-radius: $card-radius;
  padding: 28rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  box-shadow: $soft-shadow;
}

.card-left {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.record-date {
  font-size: 32rpx;
  font-weight: 600;
}

.record-location {
  font-size: 24rpx;
  color: $muted-text;
}

.card-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.record-fuel {
  font-size: 34rpx;
  font-weight: 700;
  color: $primary-dark;
}

.record-mileage {
  font-size: 24rpx;
  color: $muted-text;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 32rpx;
  color: $muted-text;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 24rpx;
}
</style>
