<template>
  <view class="home-page" :class="{ 'home-page--locked': showRangePicker }">
    <!-- 顶部卡片：展示城市、车辆概况和提醒 -->
    <view class="header-card">
      <view class="header-meta">
        <view
          class="location-row"
          hover-class="location-row__hover"
          @tap="navigateToCity"
        >
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
            :style="getBadgeStyle(level)"
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
        <view
          class="filter"
          hover-class="filter__hover"
          @tap="openRangePicker('stats')"
        >
          <text class="filter-text">{{ statsRange.label }}</text>
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
        <view
          class="filter"
          hover-class="filter__hover"
          @tap="openRangePicker('trend')"
        >
          <text class="filter-text">{{ trendRange.label }}</text>
          <text class="filter-arrow">⇅</text>
        </view>
      </view>
      <view class="trend-body">
        <view class="trend-chart__wrapper">
          <!-- #ifdef MP-WEIXIN -->
          <ec-canvas
            id="fuelTrendChart"
            canvas-id="fuelTrendChart"
            class="trend-chart__canvas"
            :ec="fuelTrendEc"
          ></ec-canvas>
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN -->
          <view class="trend-chart__fallback">
            <text>请在微信小程序端查看油耗趋势图</text>
          </view>
          <!-- #endif -->
        </view>
      </view>
      <view class="trend-footer">
        <text class="benchmark-label">
          数据基于近 7 天行驶记录，绿线为当前车辆，红/灰线为本市参考区间。
        </text>
      </view>
    </view>

    <view
      v-if="showRangePicker"
      class="range-picker-overlay"
      @tap="closeRangePicker"
      @touchmove.stop.prevent
    >
      <view class="range-picker-dialog" @tap.stop>
        <view class="range-picker-title">请选择</view>
        <view class="range-options">
          <view
            v-for="option in rangeOptions"
            :key="option.key"
            class="range-option"
            :class="{ active: option.key === pendingRangeKey }"
            @tap="selectPendingRange(option)"
          >
            <text>{{ option.label }}</text>
          </view>
        </view>
        <view class="range-actions">
          <view class="range-button cancel" @tap="closeRangePicker">取消</view>
          <view class="range-button confirm" @tap="confirmRangePicker">
            确定
          </view>
        </view>
      </view>
    </view>

    <BottomActionBar active="fuel" />
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { onUnmounted, ref, watch } from 'vue'
import type * as EChartsType from '@/wxcomponents/ec-canvas/echarts'
import { STORAGE_KEYS } from '@/constants/storage'
import { normalizeCityName } from '@/utils/location'
import locationIcon from '@/static/icons/dingwei.png'
import dingwei_right from '@/static/icons/dingwei_right.png'
import BottomActionBar from '@/components/BottomActionBar.vue'
// uCharts 官方 ECharts 适配仅支持 CJS 导入，这里使用 require 方式以兼容编译到小程序端
// eslint-disable-next-line @typescript-eslint/no-var-requires
const echarts = require('../../wxcomponents/ec-canvas/echarts') as typeof EChartsType

// ================= 基础展示数据 =================
const DEFAULT_CITY = '深圳市'
const normalizeOrDefault = (value?: string | null) =>
  normalizeCityName(value) || DEFAULT_CITY

const city = ref(normalizeOrDefault(DEFAULT_CITY))

const syncSelectedCity = () => {
  const stored = uni.getStorageSync(
    STORAGE_KEYS.selectedCity
  ) as string | null
  if (stored) {
    city.value = normalizeOrDefault(stored)
  }
}

syncSelectedCity()
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
type EfficiencyLevel = {
  label: string
  badgeBg: string
  badgeColor: string
}

const efficiencyLevels = ref<EfficiencyLevel[]>([
  { label: 'S', badgeBg: '#e4faed', badgeColor: '#07c263' },
  { label: 'A', badgeBg: '#f0f9e7', badgeColor: '#94d951' },
  { label: 'B', badgeBg: '#f4faeb', badgeColor: '#c7e969' },
  { label: 'C', badgeBg: '#fff7e4', badgeColor: '#f7d36c' },
  { label: 'D', badgeBg: '#fff1df', badgeColor: '#fabb59' }
])
const currentEfficiency = ref<EfficiencyLevel>(efficiencyLevels.value[0])

const getBadgeStyle = (level: EfficiencyLevel) => ({
  '--badge-bg': level.badgeBg,
  '--badge-color': level.badgeColor
})

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
type TrendPoint = {
  day: string
  value: number
  cityHigh: number
  cityLow: number
}

const trendData = ref<TrendPoint[]>([
  { day: '2025-10-01', value: 4.9, cityHigh: 8.2, cityLow: 6.1 },
  { day: '2025-10-02', value: 8.6, cityHigh: 8.15, cityLow: 6.05 },
  { day: '2025-10-04', value: 8.1, cityHigh: 8.05, cityLow: 6.0 },
  { day: '2025-10-06', value: 7.3, cityHigh: 8.0, cityLow: 5.96 },
  { day: '2025-10-09', value: 4.8, cityHigh: 7.95, cityLow: 5.92 }
])

// 统计口径筛选，目前仅用于展示标签
type RangeKey = '3m' | '6m' | '1y' | 'all'

type RangeOption = {
  key: RangeKey
  label: string
}

const rangeOptions: RangeOption[] = [
  { key: '3m', label: '三个月' },
  { key: '6m', label: '半年' },
  { key: '1y', label: '一年' },
  { key: 'all', label: '全部' }
]

type RangeTarget = 'stats' | 'trend'

const statsRange = ref<RangeOption>(rangeOptions[3])
const trendRange = ref<RangeOption>(rangeOptions[3])
const showRangePicker = ref(false)
const pendingRangeKey = ref<RangeKey>(rangeOptions[3].key)
const activeRangeTarget = ref<RangeTarget>('stats')

const resolveTargetRange = (target: RangeTarget) =>
  target === 'stats' ? statsRange : trendRange

const openRangePicker = (target: RangeTarget) => {
  activeRangeTarget.value = target
  pendingRangeKey.value = resolveTargetRange(target).value.key
  showRangePicker.value = true
}

const closeRangePicker = () => {
  showRangePicker.value = false
}

const selectPendingRange = (option: RangeOption) => {
  pendingRangeKey.value = option.key
}

const confirmRangePicker = () => {
  const target = rangeOptions.find((option) => option.key === pendingRangeKey.value)
  if (target) {
    const rangeRef = resolveTargetRange(activeRangeTarget.value)
    rangeRef.value = target
  }
  closeRangePicker()
}

// ================ 油耗趋势图 ================
const fuelTrendChart = ref<any>(null)

const buildTrendOption = () => {
  const categories = trendData.value.map((item) => item.day)
  const actualSeries = trendData.value.map((item) => item.value)
  const highSeries = trendData.value.map((item) => item.cityHigh)
  const lowSeries = trendData.value.map((item) => item.cityLow)
  const cityLegendHigh = `${city.value}油耗参考-高位`
  const cityLegendLow = `${city.value}油耗参考-低位`

  return {
    color: ['#F47274', '#11B561', '#AEB5C0'],
    animationDuration: 700,
    legend: {
      left: 24,
      top: 12,
      icon: 'roundRect',
      itemWidth: 20,
      itemHeight: 6,
      textStyle: {
        color: '#5F6673',
        fontSize: 8
      },
      data: [cityLegendHigh, '油耗', cityLegendLow]
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(28,31,43,0.9)',
      borderWidth: 0,
      textStyle: {
        color: '#fff',
        fontSize: 12
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#0AB068',
          width: 1,
          type: 'dashed'
        }
      }
    },
    grid: {
      left: 40,
      right: 30,
      top: 40,
      bottom: 60
    },
    xAxis: {
      type: 'category',
      data: categories,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#D0D7E3' } },
      axisTick: { show: false },
      axisLabel: {
        color: '#8a93a0',
        fontSize: 12,
        margin: 16
      },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 4,
      max: 9,
      interval: 1,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#8a93a0',
        fontSize: 12,
        formatter: (value: number) => value.toFixed(1)
      },
      splitLine: {
        lineStyle: { color: '#E1E6EF', type: 'dashed' }
      }
    },
    series: [
      {
        name: cityLegendHigh,
        type: 'line',
        data: highSeries,
        smooth: true,
        showSymbol: true,
        symbolSize: 2,
        lineStyle: { width: 1 }
      },
      {
        name: '油耗',
        type: 'line',
        data: actualSeries,
        smooth: true,
        showSymbol: true,
        symbolSize: 2,
        lineStyle: { width: 2 },
        itemStyle: { color: '#11B97A' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(17,181,97,0.18)' },
              { offset: 1, color: 'rgba(17,181,97,0)' }
            ]
          }
        }
      },
      {
        name: cityLegendLow,
        type: 'line',
        data: lowSeries,
        smooth: true,
        showSymbol: true,
        symbolSize: 2,
        lineStyle: { width: 1, type: 'dashed', color: '#AEB5C0' },
        itemStyle: { color: '#AEB5C0' }
      }
    ]
  }
}

const initFuelTrendChart = (
  canvas: any,
  width: number,
  height: number,
  dpr: number
) => {
  const chart = echarts.init(canvas, null, {
    width,
    height,
    devicePixelRatio: dpr
  })
  canvas.setChart?.(chart)
  chart.setOption(buildTrendOption())
  fuelTrendChart.value = chart
  return chart
}

const fuelTrendEc = ref({
  lazyLoad: false,
  onInit: initFuelTrendChart
})

const refreshFuelTrendChart = () => {
  if (fuelTrendChart.value) {
    fuelTrendChart.value.setOption(buildTrendOption(), true)
  }
}

watch(
  trendData,
  () => {
    refreshFuelTrendChart()
  },
  { deep: true }
)

watch(city, () => {
  refreshFuelTrendChart()
})

onUnmounted(() => {
  fuelTrendChart.value?.dispose()
})

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

const navigateToCity = () => {
  uni.navigateTo({
    url: `/pages/city/index?currentCity=${encodeURIComponent(city.value)}`,
    events: {
      'city-selected': (selectedCity: string) => {
        if (selectedCity) {
          city.value = normalizeOrDefault(selectedCity)
        }
      }
    }
  })
}

onShow(() => {
  syncSelectedCity()
})

</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.home-page {
  // padding: 24rpx 32rpx 120rpx;
  padding: 24rpx 32rpx calc(180rpx + env(safe-area-inset-bottom, 0px));
  padding-top: calc(34rpx + var(--status-bar-height, env(safe-area-inset-top, 0px)));
  box-sizing: border-box;

  &.home-page--locked {
    height: 100vh;
    overflow: hidden;
  }

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

      .location-row__hover {
        opacity: 0.7;
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
      align-items: center;
      gap: 32rpx;

      .rating-label {
        flex: 1;
      }

      .rating-badges {
        flex: 0 0 50%;
        max-width: 50%;
        display: flex;
        gap: 12rpx;
        align-items: center;
        justify-content: space-between;
      }

      .rating-badge {
        width: 56rpx;
        height: 56rpx;
        padding: 0 6rpx;
        border-radius: 32rpx;
        background: var(--badge-bg, #edf3ef);
        color: var(--badge-color, $primary-dark);
        display: flex;
        align-items: center;
        justify-content: center;
        // clip-path: polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%);
        clip-path: polygon(50% 0%, 94% 25%, 94% 75%, 50% 100%, 6% 75%, 6% 25%);
        transform: scale(0.88) translateY(0rpx);
        opacity: 0.88;
        transition: transform 0.25s ease, background 0.25s ease,
          color 0.25s ease, box-shadow 0.25s ease;
        box-shadow: inset 0 0 0 0 rgba(255, 255, 255, 0.25);
      }

      .rating-badge text {
        line-height: 1;
        font-size: 28rpx;
        font-weight: 700;
      }

      .rating-badge.active {
        background: var(--badge-color, $primary-color);
        color: #fff;
        transform: scale(1.12) translateY(0);
        opacity: 1;
        box-shadow: 0 18rpx 28rpx rgba(30, 193, 95, 0.35);
      }

      .rating-badge.active text {
        font-size: 34rpx;
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
      // margin: 16rpx 0 24rpx;
    }

    .trend-chart__wrapper {
      border-radius: 16rpx;
      border: 1rpx solid rgba(203, 210, 221, 0.3);
      background: #fff;
      // padding: 8rpx 0 0;
      height: 600rpx;
      overflow: hidden;
    }

    .trend-chart__canvas {
      width: 100%;
      height: 100%;
      display: block;
    }

    .trend-chart__fallback {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $muted-text;
      font-size: 24rpx;
      // padding: 0 24rpx;
      text-align: center;
      background: linear-gradient(180deg, #f9fbff 0%, #f1f4f9 100%);
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

  .filter.filter__hover {
    opacity: 0.7;
  }

  .range-picker-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 48rpx;
    z-index: 1200;
  }

  .range-picker-dialog {
    width: 100%;
    background: #fff;
    border-radius: 40rpx;
    padding: 48rpx 40rpx 40rpx;
    box-shadow: 0 30rpx 80rpx rgba(0, 0, 0, 0.12);
  }

  .range-picker-title {
    text-align: center;
    font-size: 32rpx;
    font-weight: 700;
  }

  .range-options {
    display: flex;
    flex-wrap: wrap;
    gap: 24rpx;
    margin: 36rpx 0 12rpx;
  }

  .range-option {
    flex: 1 1 calc(33% - 16rpx);
    max-width: 30%;
    border-radius: 999rpx;
    border: 2rpx solid rgba(138, 147, 160, 0.35);
    padding: 22rpx 0;
    text-align: center;
    color: $muted-text;
    font-size: 26rpx;
    font-weight: 600;
    background: #fafbfd;
  }

  .range-option.active {
    border-color: transparent;
    background: linear-gradient(180deg, #1ec15f 0%, #22d78a 100%);
    color: #fff;
    box-shadow: 0 16rpx 36rpx rgba(18, 163, 74, 0.35);
  }

  .range-actions {
    display: flex;
    gap: 24rpx;
    margin-top: 32rpx;
  }

  .range-button {
    flex: 1;
    border-radius: 999rpx;
    text-align: center;
    padding: 26rpx 0;
    font-size: 28rpx;
    font-weight: 600;
  }

  .range-button.cancel {
    background: #f5f7fb;
    color: #1c1f23;
    border: 1rpx solid #e5e9f2;
  }

  .range-button.confirm {
    color: #fff;
    background: linear-gradient(180deg, #1ec15f 0%, #22d78a 100%);
    box-shadow: 0 18rpx 32rpx rgba(30, 193, 95, 0.32);
  }
}
</style>
