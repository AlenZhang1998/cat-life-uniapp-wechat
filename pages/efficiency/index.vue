<template>
  <view class="efficiency-page">
    <view
      class="hero-card"
      :style="{
        '--accent': accentColor,
        '--accent-light': accentLightColor,
      }"
    >
      <view class="hero-top">
        <view class="pill">{{ displayLevel || '未评' }}</view>
        <view class="title-group">
          <text class="hero-title">油耗评级说明</text>
          <text class="hero-sub">基于行业平均值的参考模型</text>
        </view>
      </view>
      <view class="hero-meta">
        <view class="meta-item">
          <text class="meta-label">最新油耗</text>
          <text class="meta-value">
            {{ displayFuelText }}
          </text>
        </view>
        <view class="meta-item">
          <text class="meta-label">当前级别</text>
          <text class="meta-value">{{ displayLevel || '--' }}</text>
        </view>
      </view>
      <view class="hero-tip">
        数据基于行业平均水平，具体油耗受路况、驾驶习惯、气候和车辆状态等影响，仅供参考。
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">等级对照表</text>
        <text class="section-subtitle">L/100km 与能源效率描述</text>
      </view>
      <view class="table-card">
        <view class="table-header">
          <text class="col col-grade">等级</text>
          <text class="col col-name">级别描述</text>
          <text class="col col-range">百公里油耗</text>
          <text class="col col-desc">能源效率描述</text>
        </view>
        <view
          v-for="item in efficiencyTable"
          :key="item.grade"
          class="table-row"
          :class="{ active: isActive(item.grade), colored: true }"
          :style="getRowStyle(item.grade)"
        >
          <text class="col col-grade">{{ item.grade }}</text>
          <view class="col col-name">
            <text class="name">{{ item.title }}</text>
            <text class="sub">{{ item.subtitle }}</text>
          </view>
          <text class="col col-range">{{ item.range }}</text>
          <view class="col col-desc">
            <text class="desc">{{ item.detail }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">如何提升油耗表现？</text>
      </view>
      <view class="tips-grid">
        <view class="tip-card" v-for="tip in tips" :key="tip.title">
          <view class="tip-icon">{{ tip.icon }}</view>
          <view class="tip-body">
            <text class="tip-title">{{ tip.title }}</text>
            <text class="tip-desc">{{ tip.desc }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

type EfficiencyRow = {
  grade: string;
  title: string;
  subtitle: string;
  range: string;
  detail: string;
};

const efficiencyTable: EfficiencyRow[] = [
  {
    grade: 'S',
    title: '超凡卓越',
    subtitle: 'Superb',
    range: '≤ 5.0',
    detail:
      '行业顶尖水平，通常为混动车型（HEV）的理想油耗或小型高能效燃油车的极限。',
  },
  {
    grade: 'A',
    title: '优秀',
    subtitle: 'Excellent',
    range: '5.1 ~ 6.5',
    detail:
      '达到行业优秀值，代表同级别燃油车中的先进水平，是紧凑型或中型车的理想目标。',
  },
  {
    grade: 'B',
    title: '良好',
    subtitle: 'Good',
    range: '6.6 ~ 7.5',
    detail:
      '达到行业平均水平，大部分主流紧凑型或普通家用中型车的实际油耗水平。',
  },
  {
    grade: 'C',
    title: '及格',
    subtitle: 'Acceptable',
    range: '7.6 ~ 9.0',
    detail:
      '处于行业中下游，油耗偏高，可能是中型 SUV 或老旧技术发动机的正常表现。',
  },
  {
    grade: 'D',
    title: '较差',
    subtitle: 'Deficient',
    range: '> 9.0',
    detail: '能耗较高，通常是大型 SUV、大排量车型或技术落后车型的表现。',
  },
];

const tips = [
  {
    icon: '🚗',
    title: '温柔起步，少急加速',
    desc: '缓踩油门、提前预判路况，能有效降低瞬时油耗。',
  },
  {
    icon: '🛞',
    title: '保持胎压与轮胎状态',
    desc: '胎压不足会显著抬升油耗，定期检查胎压与花纹磨损。',
  },
  {
    icon: '⚙️',
    title: '及时保养',
    desc: '按时更换机油、空气滤芯、火花塞，保持发动机高效运转。',
  },
  {
    icon: '🏙️',
    title: '合理规划路线',
    desc: '错峰出行、避开拥堵路段，减少怠速和低速蠕行时间。',
  },
];

const displayFuel = ref('');
const displayLevel = ref('');

const isActive = (grade: string) =>
  displayLevel.value &&
  grade.toLowerCase().trim() === displayLevel.value.toLowerCase().trim();

const displayFuelText = computed(() =>
  displayFuel.value ? `${displayFuel.value} L/100km` : '--'
);

const levelColors: Record<string, { main: string; light: string }> = {
  S: { main: '#16a34a', light: '#e6f6eb' }, // green
  A: { main: '#2563eb', light: '#e7efff' }, // blue
  B: { main: '#f59e0b', light: '#fff4e5' }, // amber
  C: { main: '#f97316', light: '#fff1e7' }, // orange
  D: { main: '#ef4444', light: '#ffecec' }, // red
};

const accentColor = computed(
  () =>
    levelColors[displayLevel.value.toUpperCase?.() || '']?.main || '#1ec15f'
);
const accentLightColor = computed(
  () =>
    levelColors[displayLevel.value.toUpperCase?.() || '']?.light || '#eaf8f0'
);

const getRowStyle = (grade: string) => {
  const colors = levelColors[grade.toUpperCase?.() || ''];
  if (!colors) return {};
  return {
    '--row-accent': colors.main,
    '--row-accent-light': colors.light,
  };
};

onLoad((options) => {
  if (options?.fuel) {
    displayFuel.value = decodeURIComponent(options.fuel as string);
  }
  if (options?.level) {
    displayLevel.value = decodeURIComponent(options.level as string);
  }
});
</script>

<style scoped lang="scss">
.efficiency-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 24rpx 28rpx 48rpx;
  box-sizing: border-box;
}

.hero-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx 30rpx;
  box-shadow: 0 12rpx 30rpx rgba(30, 193, 95, 0.08);
  border: 1rpx solid #e7ebf1;
  position: relative;
  overflow: hidden;
  margin-bottom: 24rpx;
  color: #1f2d3d;

  &::after {
    content: '';
    position: absolute;
    inset: -30rpx 40rpx auto auto;
    width: 180rpx;
    height: 180rpx;
    background: radial-gradient(
      circle at center,
      var(--accent-light),
      rgba(255, 255, 255, 0)
    );
    opacity: 0.85;
    pointer-events: none;
  }

  .hero-top {
    display: flex;
    align-items: center;
    gap: 14rpx;
    margin-bottom: 16rpx;
  }

  .pill {
    padding: 6rpx 18rpx;
    border-radius: 999rpx;
    background: #fff;
    border: 2rpx solid var(--accent);
    color: var(--accent);
    font-weight: 700;
  }

  .title-group {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  .hero-title {
    font-size: 32rpx;
    font-weight: 800;
  }

  .hero-sub {
    font-size: 24rpx;
    color: #4b5563;
  }

  .hero-meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12rpx;
    margin-bottom: 12rpx;
  }

  .meta-item {
    background: rgba(255, 255, 255, 0.75);
    border-radius: 16rpx;
    padding: 18rpx 18rpx;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    border: 1rpx solid #e9eef5;
  }

  .meta-label {
    font-size: 24rpx;
    color: #6b7280;
  }

  .meta-value {
    font-size: 34rpx;
    font-weight: 800;
    color: #111827;
  }

  .hero-tip {
    margin-top: 6rpx;
    font-size: 24rpx;
    color: #5c6b7a;
    line-height: 1.5;
  }
}

.section {
  margin-bottom: 26rpx;
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1f2d3d;
}

.section-subtitle {
  font-size: 24rpx;
  color: #6b7280;
}

.table-card {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 26rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #eef2f7;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 90rpx 190rpx 180rpx 1fr;
  gap: 12rpx;
  padding: 18rpx 18rpx;
  align-items: start;
}

.table-header {
  background: #f8fafc;
  font-size: 24rpx;
  color: #5c6b7a;
  font-weight: 600;
}

.table-row {
  border-top: 1rpx solid #f0f2f5;
  background: #fff;

  &.active {
    background: linear-gradient(90deg, var(--accent-light), #f9fbff 100%);
    border-left: 6rpx solid var(--accent);
  }

  &.colored {
    background: linear-gradient(
      90deg,
      var(--row-accent-light, #fff) 0%,
      #fff 70%
    );
    border-left: 4rpx solid var(--row-accent, #e5e7eb);
  }
}

.col {
  color: #1f2d3d;
}

.col-grade {
  font-size: 32rpx;
  font-weight: 800;
}

.col-name .name {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.col-name .sub {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
  margin-top: 4rpx;
}

.col-range {
  font-size: 28rpx;
  font-weight: 700;
}

.col-desc .desc {
  font-size: 26rpx;
  color: #4b5563;
  line-height: 1.5;
  display: block;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300rpx, 1fr));
  gap: 12rpx;
}

.tip-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 16rpx;
  display: flex;
  gap: 12rpx;
  align-items: flex-start;
  box-shadow: 0 8rpx 18rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid #edf1f5;
}

.tip-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.tip-body {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.tip-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #1f2d3d;
}

.tip-desc {
  font-size: 24rpx;
  color: #4b5563;
  line-height: 1.5;
}

@media (max-width: 375px) {
  .table-header,
  .table-row {
    grid-template-columns: 90rpx 170rpx 160rpx 1fr;
    padding: 16rpx 14rpx;
  }
}
</style>
