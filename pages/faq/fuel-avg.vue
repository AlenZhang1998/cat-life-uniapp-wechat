<template>
  <view class="page">
    <view class="hero">
      <text class="hero-title">燃油车的平均油耗是怎么计算的？</text>
      <text class="hero-sub">加权平均 · 兼顾准确与通用场景</text>
    </view>

    <view class="card">
      <text class="card-title">计算公式</text>
      <view class="formula">
        <text class="line">平均油耗 = (单次油耗 × 权重) 的总和</text>
        <text class="line">权重 = 单次行程 × 行程总和</text>
      </view>
      <view class="tip" @tap="goSingleFuelInfo">
        <text>单次油耗的计算方法请参见：单次油耗怎么算？</text>
      </view>
    </view>

    <view class="card">
      <text class="card-title">为什么用加权平均</text>
      <view class="paragraph">
        <text>
          有些车友用“加油量 / 行驶里程”来算平均油耗，但加油量不等于消耗的油量，准确的计算是“耗油量 / 行驶里程”。
        </text>
      </view>
      <view class="paragraph">
        <text>
          本应用采用加权平均，基于公认公式设计，权重是单次行程，能够兼容多种记录情况（偶尔加满、偶尔亮灯等），结果更稳健。
        </text>
      </view>
    </view>

    <view class="card">
      <text class="card-title">举例说明</text>
      <view class="paragraph">
        <text>
          示例数据：总记录 276 次，总加油量 13159.36 升，总行程 129047 公里。假设第一箱加满油 65.17 升，扣除后实际耗油量为 13094.19 升。
        </text>
      </view>
      <view class="paragraph">
        <text>公认公式：耗油量 / 行驶里程 = 13094.19 / 129047 × 100 = 10.15 L/100km。</text>
      </view>
      <view class="paragraph">
        <text>加权平均：10.18 L/100km，和公认公式仅差 0.2%，在复杂场景下更通用。</text>
      </view>
    </view>

    <view class="card">
      <text class="card-title">温馨提示</text>
      <view class="paragraph">
        <text>
          请确保记录真实准确；本计算仅针对燃油车，新能源车型请忽略。
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
  background: #f0f4ff;
  color: #1f2a44;
  box-shadow: 0 12rpx 32rpx rgba(58, 122, 254, 0.1);
  margin-bottom: 24rpx;

  .hero-title {
    font-size: 34rpx;
    font-weight: 700;
    display: block;
    margin-bottom: 10rpx;
  }
  .hero-sub {
    font-size: 24rpx;
    color: #4a5875;
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

  .formula {
    background: #f7f9fc;
    border-radius: 12rpx;
    padding: 14rpx 16rpx;
    font-size: 26rpx;
    color: #1f2a44;
    line-height: 1.6;
    margin-bottom: 12rpx;

    .line + .line {
      margin-top: 6rpx;
    }
  }

  .tip {
    font-size: 24rpx;
    color: #3a7afe;
  }

  .paragraph {
    font-size: 26rpx;
    color: #2f3441;
    line-height: 1.7;
    margin-bottom: 10rpx;
  }
}
</style>

<script setup lang="ts">
const goSingleFuelInfo = () => {
  uni.navigateTo({
    url: '/pages/faq/single-fuel',
  });
};
</script>
