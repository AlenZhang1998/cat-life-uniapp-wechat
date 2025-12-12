<template>
  <view class="page">
    <view class="hero">
      <text class="hero-title">燃油车的单次油耗是怎么算的？</text>
    </view>

    <view class="card">
      <text class="card-title">定义</text>
      <view class="paragraph">
        <text>对于燃油车，单次油耗是连续两次加油期间的油耗。</text>
      </view>
    </view>

    <view class="card">
      <text class="card-title">计算方法</text>
      <view class="paragraph highlight">
        <text>
          算法 1：如果连续两次都是“加油跳枪”（油箱加满），第一个记录的单次油耗 = 第二次加油量 ÷ 这两次记录之间的行驶里程。
        </text>
      </view>
      <view class="paragraph highlight">
        <text>
          算法 2：如果连续两次都是“油灯亮了”去加油，第一个记录的单次油耗 = 第一次加油量 ÷ 这两次记录之间的行驶里程。
        </text>
      </view>
      <view class="paragraph">
        <text>如果以上两种条件都满足（既加满又亮灯），优先采用算法 1。</text>
      </view>
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
  background: #f0f4ff;
  color: #1f2a44;
  box-shadow: 0 12rpx 32rpx rgba(58, 122, 254, 0.1);
  margin-bottom: 24rpx;

  .hero-title {
    font-size: 34rpx;
    font-weight: 700;
    display: block;
  }
}

.card {
  background: #fff;
  border-radius: 18rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);

  .card-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1f2a44;
    display: block;
    margin-bottom: 14rpx;
  }

  .paragraph {
    font-size: 26rpx;
    color: #2f3441;
    line-height: 1.7;
    margin-bottom: 10rpx;

    &.highlight {
      color: #1370c6;
    }
  }
}
</style>
