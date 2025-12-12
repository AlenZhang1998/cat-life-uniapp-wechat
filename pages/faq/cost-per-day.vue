<template>
  <view class="page">
    <view class="hero">
      <text class="hero-title">费用频道的“成本/天”是怎么计算出来的？</text>
    </view>

    <view class="card">
      <text class="formula">成本 / 天 = (费用支出 + 油费支出) / 统计天数</text>
      <view class="section">
        <text class="section-title">费用支出</text>
        <text class="paragraph"> 统计时间范围内发生的所有费用之和。 </text>
        <!-- “年度费用”会按一年分摊后再计入。例：时间范围内有一笔“保险和交通规费”3650 元，统计时间覆盖了 10 天，则计入 3650 / 365 × 10 = 100 元。 -->
      </view>
      <view class="section">
        <text class="section-title">油费支出</text>
        <text class="paragraph">
          统计时间范围内发生的油费。其中，最后一次加油，即使还没怎么使用，油费也会全部计入。
        </text>
      </view>
      <view class="section">
        <text class="section-title">统计天数</text>
        <text class="paragraph">
          从你选择的时间范围内的第一条记录的时间开始统计，油耗记录、里程记录和费用记录，哪个最早算哪个。
        </text>
        <text class="paragraph">
          统计结束时间略微复杂：若选择“3
          个月”“半年”“全部”等预置选项，结束时间就是当天；若自定义时间范围，则为你指定的结束时间。但无论如何，如果已超过一个月没有持续记录，爱车油耗会把最后一条记录的时间当作统计结束时间。
        </text>
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

.formula {
  font-size: 28rpx;
  color: #1370c6;
  font-weight: 700;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.section-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #1f2a44;
}

.paragraph {
  font-size: 26rpx;
  color: #2f3441;
  line-height: 1.7;
}
</style>
