<template>
  <view class="page">
    <view class="hero">
      <text class="hero-title"
        >输入时“油灯亮了”“油箱加满”和“上次忘记”怎么勾选？</text
      >
    </view>

    <view class="card">
      <text class="paragraph">
        “油箱加满”、“油灯亮了”和“上次忘记”是油耗能否计算、计算是否准确的重要选项，录入时一定要如实勾选。
      </text>
      <text class="paragraph">
        “油灯亮了”即油量警告灯。实践上，第一次加油时留意上次油表指针的位置，当油表指针再到这个位置时，就去加油，记录时勾选“油灯亮了”。
      </text>
      <text class="paragraph">
        “油箱加满”指本次加油之后的状态。如果加油加到跳枪，就要选择这个选项。加满后有时会补一点凑整数，对油耗计算会有一点影响但不大。
      </text>
      <text class="paragraph">
        “上次忘记”一般情况下不要勾选。只有本次加油之前有一次或几次没有记录，这次加油就要勾选。典型情况：比如忘了记录了，或者借车给别人加油不知道加了多少，只要勾选这个选项，爱车油耗会自动分段计算，尽可能保证计算结果的准确度。
      </text>
      <text class="paragraph">
        这三个选项是油耗计算的基准，大多数油耗统计不准确的车友，都是因为没有正确、如实地勾选造成的，请大家务必理解这三个选项的意义，如实勾选。
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
