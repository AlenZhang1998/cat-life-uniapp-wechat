<template>
  <view class="page">
    <view class="hero">
      <text class="hero-title">油费/公里是怎么计算的？</text>
    </view>

    <view class="card">
      <text class="paragraph">
        对燃油车来说，只统计那些能计算出油耗的记录。
      </text>
      <text class="paragraph">
        根据油耗和油价，算出每条记录的平均每公里油费，用每条记录对应的行驶里程做权重，加权平均得到总的平均每公里油费。
      </text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 24rpx;
  background: linear-gradient(180deg, #f5f7fb 0%, #f8fbff 100%);
  box-sizing: border-box;
}

.hero {
  padding: 26rpx 24rpx;
  border-radius: 20rpx;
  background: #eef3ff;
  color: #1f2a44;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 20rpx;

  .hero-title {
    font-size: 34rpx;
    font-weight: 700;
    display: block;
  }
}

.card {
  background: #fff;
  border-radius: 18rpx;
  padding: 22rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.paragraph {
  font-size: 26rpx;
  color: #2f3441;
  line-height: 1.7;
}
</style>
