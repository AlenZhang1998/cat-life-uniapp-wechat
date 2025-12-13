<template>
  <view class="page">
    <view class="hero">
      <text class="hero-title">爱车油耗推荐的 6 种燃油车加油记录习惯</text>
      <text class="hero-sub">推荐“习惯一/习惯四”，加满最易操作、最准确</text>
    </view>

    <view class="card">
      <text class="paragraph">
        下面是不同行车习惯的一些做法，供你参考。我们推荐“习惯一”和“习惯四”，即通过加满油箱来计算油耗，准确度最高。
      </text>
      <view class="list">
        <view class="item">
          <text class="item-title">1. 习惯一：每次都加满</text>
          <text class="item-desc">每次油耗都能计算，准确度最高。</text>
        </view>
        <view class="item">
          <text class="item-title">2. 习惯二：每次都等油灯一亮就马上加油</text>
          <text class="item-desc">每次都能计算，准确度也很高。</text>
        </view>
        <view class="item">
          <text class="item-title">3. 王雨算法（亮灯优化法）</text>
          <text class="item-desc">
            每次油灯亮，就记下当时的总里程；等加油后（可不加满）记录时填写亮灯时记下的总里程。每次都能计算，准确度最高。
          </text>
        </view>
        <view class="item">
          <text class="item-title">4. 习惯四：固定金额 + 间隔加满</text>
          <text class="item-desc">
            第一次加满，第二次、第三次…都是固定金额（如 200
            元）。想看这段时间油耗时，再次加满，就能把这几次计算出来，准确度高；中间几次会让油耗曲线呈阶梯状。
          </text>
        </view>
        <view class="item">
          <text class="item-title">5. 习惯五：亮灯时固定金额 + 间隔加满</text>
          <text class="item-desc">
            第一次油灯亮时加油，第二次、第三次…固定金额；想看这段时间油耗时，再次加满，就能计算这几次，准确度高，缺点同习惯五。
          </text>
        </view>
        <view class="item">
          <text class="item-title">6. 小虾米算法</text>
          <text class="item-desc">
            每次加油，记录里程表读数（总里程）+
            行车电脑显示的剩余油量还能跑的公里数，勾选“油灯亮了”，再输入其他项保存。操作简单，但受行车电脑统计误差影响大，剩余里程有时波动，单次油耗有误差。
          </text>
        </view>
      </view>
      <!-- <text class="paragraph note">
      </text> -->
      <text class="paragraph warning">
        我们不推荐加满以外的习惯，因为通过亮灯计算油耗必须严格掌握亮灯时机，心累且不如加满准确；记录不够严谨会算不准。
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
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 24rpx;

  .hero-title {
    font-size: 34rpx;
    font-weight: 700;
    display: block;
    margin-bottom: 8rpx;
  }
  .hero-sub {
    font-size: 24rpx;
    color: #4a5875;
  }
}

.card {
  background: #fff;
  border-radius: 18rpx;
  padding: 22rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.paragraph {
  font-size: 26rpx;
  color: #2f3441;
  line-height: 1.7;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.item {
  background: #f7f9fc;
  border-radius: 14rpx;
  padding: 14rpx;
}

.item-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #1f2a44;
  margin-bottom: 6rpx;
  display: block;
}

.item-desc {
  font-size: 26rpx;
  color: #2f3441;
  line-height: 1.6;
}

.note {
  font-size: 24rpx;
  color: #4a5875;
}

.warning {
  font-size: 26rpx;
  color: #c84a32;
  line-height: 1.6;
}
</style>
