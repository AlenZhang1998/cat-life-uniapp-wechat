<template>
  <view class="home-page">
    <!-- 顶部卡片：展示城市、车辆概况和提醒 -->
    <view class="header-card">
      <view class="header-meta">
        <view class="location-row">
          <image
            class="location-icon"
            :src="locationIcon"
            mode="aspectFit"
          />
          <text class="location-text">{{ city }}</text>
          <!-- <text class="location-arrow">v</text> -->
          <image
            class="dingwei_right"
            :src="dingwei_right"
            mode="aspectFit"
          />
        </view>
        <view class="header-actions">
          <view class="chip primary">
            <text class="chip-text">下次保养时间</text>
          </view>
          <!-- <view class="chip outline">
            <text class="chip-text">智驾提醒</text>
          </view> -->
        </view>
      </view>

      <view class="car-info">
        <text class="car-name">{{ carInfo.brand }} · {{ carInfo.model }}</text>
        <text class="car-trim">{{ carInfo.trim }}</text>
      </view>

      <!-- <view class="price-row">
        <text class="oil-type">{{ oilPrice.label }}</text>
        <text class="oil-price">
          <text class="price-number">{{ oilPrice.value }}</text>
          元/升
        </text>
      </view> -->

      <view class="reminder-banner" v-if="!hasRecentRefuel">
        <text class="reminder-icon">!</text>
        <text class="reminder-text">没有加油或者充电记录，快去添加吧～</text>
      </view>
    </view>

    <!-- 最新油耗和能耗评级 -->
    <view class="latest-card">
      <view class="latest-title">
        <text class="label">最新油耗</text>
        <text class="link" @tap="handleNavigate('trend')">查看更多</text>
      </view>
      <view class="latest-body">
        <text class="latest-number">{{ latestFuel }} </text>
        <text class="latest-unit">升/百公里</text>
      </view>

      <view class="rating-row">
        <view class="rating-label">
          <text class="label">能耗评级</text>
        </view>
        <view class="rating-badges">
          <view
            class="rating-badge"
            v-for="level in efficiencyLevels"
            :key="level.label"
            :class="{ active: level.label === currentEfficiency.label }"
          >
            <text>{{ level.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 统计区块 -->
    <view class="stats-card">
      <view class="stats-header">
        <text class="label">统计</text>
        <view class="filter">
          <text class="filter-text">{{ selectedRange.label }}</text>
          <text class="filter-arrow">⇅</text>
        </view>
      </view>
      <view class="stats-grid">
        <view class="stat-item" v-for="item in stats" :key="item.key">
          <text class="stat-label">{{ item.label }}</text>
          <text class="stat-value" :class="{ accent: item.accent }">
            {{ item.value }}
          </text>
          <text class="stat-unit">{{ item.unit }}</text>
        </view>
      </view>
    </view>

    <!-- 油耗变化趋势 -->
    <view class="trend-card">
      <view class="trend-header">
        <text class="label">油耗变化趋势</text>
        <view class="filter">
          <text class="filter-text">{{ selectedRange.label }}</text>
          <text class="filter-arrow">⇅</text>
        </view>
      </view>
      <view class="trend-body">
        <!-- 网格背景，模拟图表的参考线 -->
        <view class="grid" v-for="line in 5" :key="line"></view>

        <!-- 参考基准线 -->
        <view class="benchmark-line"></view>

        <!-- 使用绝对定位绘制的折线图 -->
        <view class="chart-line">
          <view
            class="chart-point"
            v-for="(point, index) in trendData"
            :key="point.day"
            :style="getPointStyle(point.value, index)"
          >
            <view class="point-dot"></view>
            <text class="point-label">{{ point.day }}</text>
          </view>
        </view>
      </view>
      <view class="trend-footer">
        <text class="benchmark-label">
          灰线为深圳市油耗参考 - 低位
        </text>
      </view>
    </view>

    <BottomActionBar active="fuel" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import locationIcon from '@/static/icons/dingwei.png'
import dingwei_right from '@/static/icons/dingwei_right.png'
import BottomActionBar from '@/components/BottomActionBar.vue'

// ================= 基础展示数据 =================
const city = ref('深圳市')
const carInfo = ref({
  brand: '思域',
  model: '2025款 240TURBO CVT',
  trim: '智趣Plus'
})
const oilPrice = ref({
  label: '92#',
  value: '7.07'
})

// 用于控制提醒条是否展示，这里默认没有记录
const hasRecentRefuel = ref(false)

// 最新油耗展示值，可在后续与服务端对接时替换
const latestFuel = ref('4.80')

// 评级标签以静态数组呈现，方便后续根据接口高亮不同等级
const efficiencyLevels = ref([
  { label: 'S' },
  { label: 'A' },
  { label: 'B' },
  { label: 'C' },
  { label: 'D' }
])
const currentEfficiency = ref({ label: 'S' })

// 统计区块的数据源，这里把单位也一起放进来，便于展示
const stats = ref([
  {
    key: 'fuelAvg',
    label: '平均油耗',
    value: '5.71',
    unit: '升/百公里',
    accent: true
  },
  {
    key: 'mileageAvg',
    label: '平均行程',
    value: '92.76',
    unit: '公里/天'
  },
  {
    key: 'costAvg',
    label: '平均油费',
    value: '0.35',
    unit: '元/公里',
    accent: true
  },
  {
    key: 'mileageTotal',
    label: '累计行程',
    value: '1577',
    unit: '公里'
  },
  {
    key: 'costTotal',
    label: '累计油费',
    value: '836.7',
    unit: '元'
  },
  {
    key: 'discountTotal',
    label: '总计优惠',
    value: '128.4',
    unit: '元'
  }
])

// 油耗趋势数据，value 直接对应折线的高度
const trendData = ref([
  { day: '周一', value: 6.2 },
  { day: '周二', value: 6.9 },
  { day: '周三', value: 8.4 },
  { day: '周四', value: 9.0 },
  { day: '周五', value: 7.6 },
  { day: '周六', value: 6.8 },
  { day: '周日', value: 6.5 }
])

// 统计口径筛选，目前仅用于展示标签
const selectedRange = ref({
  label: '全部'
})

// 底部操作栏配置，后续可以在此添加路由跳转逻辑
// ================ 计算属性与函数工具 =================
const maxTrendValue = computed(() =>
  Math.max(...trendData.value.map((item) => item.value))
)
const minTrendValue = computed(() =>
  Math.min(...trendData.value.map((item) => item.value))
)

/**
 * 根据油耗值和位置计算折线点的绝对定位样式
 * @param value 当前点的油耗值
 * @param index 当前下标
 */
const getPointStyle = (value: number, index: number) => {
  // 避免除以 0，这里设置一个默认区间
  const safeRange = Math.max(maxTrendValue.value - minTrendValue.value, 1)
  // 线条会占据容器 80% 的高度，上下留有 10% 的内边距保证视觉呼吸
  const heightPercent =
    ((value - minTrendValue.value) / safeRange) * 80 + 10
  const leftPercent =
    trendData.value.length === 1
      ? 50
      : (index / (trendData.value.length - 1)) * 100

  return `left:${leftPercent}%;bottom:${heightPercent}%`
}

/**
 * 统一处理页面跳转或后续功能入口
 * @param actionKey 操作 key
 */
const handleNavigate = (actionKey: string) => {
  uni.showToast({
    title: `功能 ${actionKey} 开发中`,
    icon: 'none'
  })
}

</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.home-page {
  padding: 24rpx 32rpx 120rpx;
  padding-top: calc(34rpx + var(--status-bar-height, env(safe-area-inset-top, 0px)));
  box-sizing: border-box;

  .header-card {
    background: linear-gradient(180deg, #58b1ff 0%, #1ec15f 100%);
    border-radius: 48rpx 48rpx 32rpx 32rpx;
    padding: 48rpx 40rpx;
    color: #fff;
    box-shadow: 0 24rpx 40rpx rgba(24, 160, 88, 0.25);
    margin-bottom: 32rpx;

    .header-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32rpx;

      .location-row {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        font-weight: 600;

        .location-icon {
          width: 32rpx;
          height: 32rpx;
          margin-right: 10rpx;
          flex-shrink: 0;
          display: block;
        }

        .location-text {
          // margin-right: 8rpx;
        }

        .dingwei_right {
          width: 26rpx;
          height: 26rpx;
          margin-left: 6rpx;
          flex-shrink: 0;
          display: block;
        }
      }

      .header-actions {
        display: flex;
        gap: 16rpx;

        .chip {
          padding: 12rpx 28rpx;
          border-radius: 999rpx;
          font-size: 24rpx;
          font-weight: 600;

          .chip-text {
            white-space: nowrap;
          }
        }

        .chip.primary {
          background-color: rgba(255, 255, 255, 0.25);
        }

        .chip.outline {
          border: 2rpx solid rgba(255, 255, 255, 0.45);
          background-color: transparent;
        }
      }
    }

    .car-info {
      margin-bottom: 24rpx;

      .car-name {
        display: block;
        font-size: 40rpx;
        font-weight: 700;
      }

      .car-trim {
        display: block;
        margin-top: 8rpx;
        font-size: 26rpx;
        opacity: 0.9;
      }
    }

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 16rpx;
      margin-bottom: 24rpx;

      .oil-type {
        font-size: 32rpx;
        font-weight: 600;
        padding: 8rpx 20rpx;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 999rpx;
      }

      .oil-price {
        .price-number {
          font-size: 40rpx;
          font-weight: 700;
          margin-right: 6rpx;
        }
      }
    }

    .reminder-banner {
      margin-top: 24rpx;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 24rpx;
      padding: 20rpx 24rpx;
      display: flex;
      align-items: center;
      font-size: 24rpx;

      .reminder-icon {
        margin-right: 12rpx;
      }

      .reminder-text {
        white-space: nowrap;
      }
    }
  }

  .latest-card,
  .stats-card,
  .trend-card {
    background-color: #fff;
    border-radius: $card-radius;
    padding: $card-padding;
    box-shadow: $soft-shadow;
    margin-bottom: 32rpx;
  }

  .latest-title,
  .stats-header,
  .trend-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }

  .label {
    font-size: 30rpx;
    font-weight: 600;
  }

  .link {
    font-size: 24rpx;
    color: $primary-dark;
  }

  .latest-card {
    .latest-body {
      display: flex;
      align-items: baseline;
      margin-bottom: 24rpx;

      .latest-number {
        font-size: 72rpx;
        font-weight: 700;
        line-height: 1;
        margin-right: 12rpx;
      }

      .latest-unit {
        font-size: 26rpx;
        color: $muted-text;
      }
    }

    .rating-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .rating-badges {
        display: flex;
        gap: 16rpx;

        .rating-badge {
          width: 48rpx;
          height: 48rpx;
          border-radius: 16rpx;
          background-color: #edf3ef;
          color: $primary-dark;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 26rpx;
          transition: all 0.3s ease;
        }

        .rating-badge.active {
          background-color: $primary-color;
          color: #fff;
          box-shadow: 0 12rpx 18rpx rgba(30, 193, 95, 0.4);
        }
      }
    }
  }

  .stats-card {
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24rpx;

      .stat-item {
        background-color: #f7f9fb;
        border-radius: 20rpx;
        padding: 20rpx;

        .stat-label {
          font-size: 24rpx;
          color: $muted-text;
        }

        .stat-value {
          display: block;
          font-size: 36rpx;
          font-weight: 700;
          margin: 12rpx 0 6rpx;
        }

        .stat-value.accent {
          color: $primary-dark;
        }

        .stat-unit {
          font-size: 22rpx;
          color: $muted-text;
        }
      }
    }
  }

  .trend-card {
    .trend-body {
      position: relative;
      height: 280rpx;
      background: linear-gradient(180deg, #ebf5ee 0%, #fff 100%);
      border-radius: 24rpx;
      overflow: hidden;
      margin: 16rpx 0 24rpx;

      .grid {
        position: absolute;
        left: 0;
        right: 0;
        height: 1px;
        background-color: rgba(25, 147, 97, 0.12);
      }

      .grid:nth-child(1) {
        top: 10%;
      }

      .grid:nth-child(2) {
        top: 35%;
      }

      .grid:nth-child(3) {
        top: 60%;
      }

      .grid:nth-child(4) {
        top: 80%;
      }

      .grid:nth-child(5) {
        top: 90%;
      }

      .benchmark-line {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 35%;
        height: 2rpx;
        background: rgba(138, 147, 160, 0.4);
      }

      .chart-line {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;

        .chart-point {
          position: absolute;
          transform: translate(-50%, 0);
          display: flex;
          flex-direction: column;
          align-items: center;

          .point-dot {
            width: 20rpx;
            height: 20rpx;
            border-radius: 999rpx;
            background-color: $primary-color;
            box-shadow: 0 0 0 12rpx rgba(30, 193, 95, 0.18);
            margin-bottom: 12rpx;
          }

          .point-label {
            font-size: 22rpx;
            color: $muted-text;
          }
        }
      }
    }

    .trend-footer {
      color: $muted-text;
      font-size: 22rpx;
    }
  }

  .filter {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    background-color: #f2f5f8;
    color: $muted-text;

    .filter-text {
      font-size: 24rpx;
    }

    .filter-arrow {
      font-size: 22rpx;
    }
  }

}
</style>
