<template>
  <view class="page">
    <view class="hero">
      <text class="hero-title">为什么油耗算不出来？</text>
    </view>

    <view class="card">
      <text class="paragraph">
        对于燃油车，爱车油耗采用的是通用的“跳枪法”来计算油耗，这个算法很准，但要求加油要加满，记录时勾选“油箱加满”，这样加油记录
        2
        次，才能算出一次油耗。如果油耗计算不出来，等下次记得加满油箱，下次加满后，这次的也能一并计算出来。
      </text>
      <text class="paragraph">
        如果已经加满两次还是算不出来，就看记录时是不是都勾选了“油箱加满”。另外，“上次忘记记录”这个选项，不要随意勾选，这个只有在上一次加油没有记录时，才勾选的；如果勾选了，就要再等两次加满，才能计算油耗。不加满也是可以的，每次都等燃油警告灯亮再去加油，记录时勾选“油灯亮了”，也能计算油耗，就是准确度会低一点。
      </text>
      <text class="paragraph">
        也不用每次都加满，隔几次加满一次也是可以的。油耗计算不出来还有可能是记录有问题，注意看首页或统计单中的错误提示信息（一般都是黄色背景），把错误解决了，就能计算出来了。常见的错误有：里程数填写错误（比如多输入一个数字）、油价或者加油量输入了
        0 等。
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
