<template>
  <view class="expense-page" :class="{ 'expense-page--locked': showMonthlyPicker }">
    <view class="hero-card">
      <view class="hero-card__title-row">
        <text class="hero-card__title">统计</text>
        <view class="hero-card__filter" @tap="handleHeroRangeTap">
          <text>{{ heroRange.label }}</text>
          <text class="hero-card__filter-icon">⇅</text>
        </view>
      </view>

      <view class="hero-card__equation">
        <view class="equation-block">
          <view class="equation-label">
            <text>总支出</text>
            <text class="info-badge">?</text>
          </view>
          <view class="equation-value equation-value--accent">
            <text class="equation-number">{{ heroOverview.total }}</text>
            <text class="equation-unit">元</text>
          </view>
        </view>
        <text class="equation-operator">=</text>
        <view class="equation-block">
          <view class="equation-label">
            <text>油费总计</text>
          </view>
          <view class="equation-value">
            <text class="equation-number">{{ heroOverview.fuel }}</text>
            <text class="equation-unit">元</text>
          </view>
        </view>
        <text class="equation-operator">+</text>
        <view class="equation-block">
          <view class="equation-label">
            <text>支出总计</text>
          </view>
          <view class="equation-value">
            <text class="equation-number">{{ heroOverview.other }}</text>
            <text class="equation-unit">元</text>
          </view>
        </view>
      </view>

      <view class="hero-divider"></view>

      <view class="hero-card__metrics">
        <view class="hero-metric" v-for="metric in heroOverview.metrics" :key="metric.key">
          <view class="equation-label">
            <text>{{ metric.label }}</text>
            <text class="info-badge">?</text>
          </view>
          <text class="hero-metric__value">{{ metric.value }}</text>
          <text class="hero-metric__unit">{{ metric.unit }}</text>
        </view>
      </view>
    </view>

    <view class="chart-card">
      <view class="section-header">
        <text class="section-title">油费月度统计</text>
        <view class="chart-filter" @tap="cycleMonthlyRange">
          <text>{{ monthlyRange.label }}</text>
          <text class="chart-filter__icon">⇅</text>
        </view>
      </view>
      <view class="chart-body">
        <!-- #ifdef MP-WEIXIN -->
        <ec-canvas
          v-show="!showMonthlyPicker"
          id="monthlyExpenseChart"
          canvas-id="monthlyExpenseChart"
          class="chart-canvas"
          style="width: 100%; height: 320rpx"
          :ec="monthlyExpenseEc"
        ></ec-canvas>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <view class="chart-placeholder">请在微信小程序端查看油费月度统计图</view>
        <!-- #endif -->
      </view>
    </view>

    <view class="chart-card">
      <view class="section-header">
        <text class="section-title">油耗年度对比统计</text>
        <view class="chart-filter" @tap="cycleYearlyRange">
          <text>{{ yearlyRange.label }}</text>
          <text class="chart-filter__icon">⇅</text>
        </view>
      </view>
      <view class="chart-body">
        <!-- #ifdef MP-WEIXIN -->
        <ec-canvas
          v-show="!showMonthlyPicker"
          id="yearlyExpenseChart"
          canvas-id="yearlyExpenseChart"
          class="chart-canvas"
          style="width: 100%; height: 320rpx"
          :ec="yearlyExpenseEc"
        ></ec-canvas>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <view class="chart-placeholder">请在微信小程序端查看油耗年度统计图</view>
        <!-- #endif -->
      </view>
    </view>

    <view
      v-if="showMonthlyPicker"
      class="range-picker-overlay"
      @tap="closeMonthlyPicker"
      @touchmove.stop.prevent
    >
      <view class="range-picker-dialog" @tap.stop>
        <view class="range-picker-title">选择统计范围</view>
        <view class="range-options">
          <view
            class="range-option"
            v-for="option in monthlyRangeOptions"
            :key="option.key"
            :class="{ active: option.key === pendingMonthlyRange }"
            @tap="() => (pendingMonthlyRange = option.key)"
          >
            <text>{{ option.label }}</text>
          </view>
        </view>
        <view class="range-actions">
          <view class="range-button cancel" @tap="closeMonthlyPicker">取消</view>
          <view class="range-button confirm" @tap="confirmMonthlyPicker">确定</view>
        </view>
      </view>
    </view>

    <view class="timeline">
      <view class="section-header">
        <text class="section-title">费用时间线</text>
        <text class="section-subtitle">近 {{ expenseRecords.length }} 笔</text>
      </view>
      <view class="timeline-track"></view>
      <view class="timeline-item" v-for="item in expenseRecords" :key="item.id">
        <view
          class="timeline-marker"
          :style="{ borderColor: getCategoryMeta(item.category).color }"
        ></view>
        <view class="timeline-content">
          <view class="timeline-row">
            <text class="timeline-date">{{ item.date }}</text>
            <text class="timeline-amount">￥{{ item.amount }}</text>
          </view>
          <view class="timeline-tag">
            <text class="timeline-tag__icon">{{ getCategoryMeta(item.category).icon }}</text>
            <text class="timeline-tag__label">
              {{ getCategoryMeta(item.category).label }} · {{ item.title }}
            </text>
            <text class="timeline-tag__status" v-if="item.tag">{{ item.tag }}</text>
          </view>
          <view class="timeline-meta">
            <text>{{ item.location }}</text>
            <text>{{ item.detail }}</text>
          </view>
          <text class="timeline-remark" v-if="item.remark">{{ item.remark }}</text>
        </view>
      </view>
    </view>
  </view>
  <BottomActionBar active="expense" />
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import BottomActionBar from '@/components/BottomActionBar.vue'
// uCharts 官方 ECharts 适配仅支持 CJS 导入，这里使用 require 方式以兼容编译到小程序端
// eslint-disable-next-line @typescript-eslint/no-var-requires
const echarts = require('../../wxcomponents/ec-canvas/echarts')

type ExpenseCategory = 'fuel' | 'maintenance' | 'parking' | 'charging' | 'insurance' | 'wash'

type ExpenseRecord = {
  id: string
  date: string
  day: number
  category: ExpenseCategory
  title: string
  location: string
  amount: number
  detail: string
  remark?: string
  tag?: string
}

const CATEGORY_META: Record<ExpenseCategory, { label: string; icon: string; color: string; badgeBg: string }> = {
  fuel: { label: '加油', icon: '⛽', color: '#1EC15F', badgeBg: '#E4FAED' },
  maintenance: { label: '保养', icon: '🛠️', color: '#3A7AFE', badgeBg: '#E2EAFF' },
  parking: { label: '停车', icon: '🅿️', color: '#FFB74D', badgeBg: '#FFF2E1' },
  charging: { label: '充电', icon: '⚡', color: '#00B8D9', badgeBg: '#D4F7FF' },
  insurance: { label: '保险', icon: '🛡️', color: '#8E64FF', badgeBg: '#F0E7FF' },
  wash: { label: '洗车', icon: '💦', color: '#00BFA5', badgeBg: '#DDF8F3' }
}

const MONTHLY_BUDGET = 2200

const expenseRecords = ref<ExpenseRecord[]>([
  {
    id: '2025-03-18-fuel',
    date: '03/18',
    day: 18,
    category: 'fuel',
    title: '加油 45 升',
    location: '中石化 · 宝安站',
    amount: 320,
    detail: '92# · 7.12 元/升 · 里程 +585km',
    remark: '夜间油价优惠 0.3 元',
    tag: '加满'
  },
  {
    id: '2025-03-15-maintenance',
    date: '03/15',
    day: 15,
    category: 'maintenance',
    title: '小保养',
    location: '广汽 Honda 授权店',
    amount: 680,
    detail: '更换机油 + 滤芯',
    remark: '赠送轮胎检测'
  },
  {
    id: '2025-03-12-parking',
    date: '03/12',
    day: 12,
    category: 'parking',
    title: '停车 6 小时',
    location: '宝安中心地下停车场',
    amount: 36,
    detail: '会员 6 折 · 封顶 50',
    tag: '折扣'
  },
  {
    id: '2025-03-09-charging',
    date: '03/09',
    day: 9,
    category: 'charging',
    title: '充电 28 kWh',
    location: '南山科技园超充站',
    amount: 112,
    detail: '峰谷电价 · 谷段 0.38 元/kWh'
  },
  {
    id: '2025-03-04-wash',
    date: '03/04',
    day: 4,
    category: 'wash',
    title: '精洗 + 内饰除尘',
    location: 'KeepClean 专业养护',
    amount: 168,
    detail: '含打蜡 · 车身镀膜保养',
    remark: '下次 8.5 折'
  }
])

const monthlySummary = computed(() => {
  const totalAmount = expenseRecords.value.reduce((sum, item) => sum + item.amount, 0)
  const totalCount = expenseRecords.value.length
  const avgPerRecord = totalCount ? totalAmount / totalCount : 0
  const budgetDiff = totalAmount - MONTHLY_BUDGET
  const categoryTotals = expenseRecords.value.reduce((acc, record) => {
    acc[record.category] = (acc[record.category] || 0) + record.amount
    return acc
  }, {} as Record<ExpenseCategory, number>)
  const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]
  const topCategoryLabel = topCategoryEntry
    ? CATEGORY_META[topCategoryEntry[0] as ExpenseCategory].label
    : CATEGORY_META.fuel.label

  return {
    totalAmount: totalAmount.toFixed(0),
    avgPerRecord: avgPerRecord.toFixed(0),
    count: totalCount,
    trend: budgetDiff > 0 ? 'up' : 'down',
    trendLabel:
      budgetDiff > 0
        ? `超预算 +${Math.abs(budgetDiff).toFixed(0)} 元`
        : `剩余 ${Math.abs(budgetDiff).toFixed(0)} 元`,
    topCategory: topCategoryLabel,
    budgetLeft: Math.max(MONTHLY_BUDGET - totalAmount, 0).toFixed(0)
  }
})

const HERO_DISTANCE = 1577
const HERO_DAYS = 48
const HERO_RANGE_OPTIONS = [
  { key: 'week', label: '一周' },
  { key: 'month', label: '一月' },
  { key: 'year', label: '一年' }
]
const heroRange = ref(HERO_RANGE_OPTIONS[2])

const heroOverview = computed(() => {
  const total = Number(monthlySummary.value.totalAmount)
  const fuelCategories: ExpenseCategory[] = ['fuel', 'charging']
  const fuelTotal = expenseRecords.value
    .filter((item) => fuelCategories.includes(item.category))
    .reduce((sum, item) => sum + item.amount, 0)
  const otherTotal = Math.max(total - fuelTotal, 0)
  const costPerKm = HERO_DISTANCE ? total / HERO_DISTANCE : 0
  const fuelPerKm = HERO_DISTANCE ? fuelTotal / HERO_DISTANCE : 0
  const costPerDay = HERO_DAYS ? total / HERO_DAYS : 0

  return {
    total: total.toFixed(1),
    fuel: fuelTotal.toFixed(1),
    other: otherTotal.toFixed(1),
    metrics: [
      { key: 'days', label: '爱车相伴', value: HERO_DAYS.toFixed(0), unit: '天' },
      { key: 'fuelKm', label: '油费/公里', value: fuelPerKm.toFixed(2), unit: '元' },
      { key: 'perDay', label: '成本/天', value: costPerDay.toFixed(2), unit: '元' }
    ]
  }
})

const handleHeroRangeTap = () => {
  const currentIndex = HERO_RANGE_OPTIONS.findIndex((option) => option.key === heroRange.value.key)
  const next = HERO_RANGE_OPTIONS[(currentIndex + 1) % HERO_RANGE_OPTIONS.length]
  heroRange.value = next
  uni.showToast({ title: `已切换到${next.label}`, icon: 'none' })
}

const monthlyRangeOptions = [
  { key: '3m', label: '三个月' },
  { key: '6m', label: '半年' },
  { key: '1y', label: '一年' },
  { key: 'all', label: '全部' }
]
const monthlyRange = ref(monthlyRangeOptions[1])
const showMonthlyPicker = ref(false)
const pendingMonthlyRange = ref(monthlyRangeOptions[1].key)
const monthlyChartData = ref([
  { month: '7月', value: 412 },
  { month: '8月', value: 536 },
  { month: '9月', value: 623 },
  { month: '10月', value: 836 }
])
const monthlyBaseline = computed(() => Number(monthlySummary.value.totalAmount).toFixed(1))

const yearlyChartRangeOptions = [
  { key: '2y', label: '两年' },
  { key: '5y', label: '五年' }
]
const yearlyRange = ref(yearlyChartRangeOptions[0])
const yearlyChartData = ref([
  { month: '6月', value: 6.2 },
  { month: '7月', value: 5.8 },
  { month: '8月', value: 4.9 },
  { month: '9月', value: 5.1 }
])

let monthlyExpenseChart: any = null
let yearlyExpenseChart: any = null

const buildMonthlyOption = () => {
  const categories = monthlyChartData.value.map((item) => item.month)
  const seriesData = monthlyChartData.value.map((item) => item.value)
  return {
    grid: { left: 28, right: 16, top: 32, bottom: 32 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#d0d7e3' } },
      axisTick: { show: false },
      axisLabel: { color: '#5f6673', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#eef1f5', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#8a93a0', fontSize: 12 }
    },
    series: [
      {
        name: '油费',
        type: 'bar',
        data: seriesData,
        barWidth: 26,
        label: {
          show: true,
          position: 'top',
          color: '#1f2329',
          fontSize: 12
        },
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#3a7afe' },
            { offset: 1, color: '#8db8ff' }
          ])
        },
        markLine: {
          data: [
            {
              yAxis: Number(monthlyBaseline.value),
              lineStyle: { type: 'dashed', color: '#ff6b6b' },
              label: { formatter: `${monthlyBaseline.value} 元`, color: '#ff6b6b' }
            }
          ]
        }
      }
    ]
  }
}

const buildYearlyOption = () => {
  const categories = yearlyChartData.value.map((item) => item.month)
  const seriesData = yearlyChartData.value.map((item) => item.value)
  return {
    grid: { left: 28, right: 20, top: 32, bottom: 28 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#d0d7e3' } },
      axisTick: { show: false },
      axisLabel: { color: '#5f6673', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      min: 4,
      max: 9,
      splitNumber: 5,
      splitLine: { lineStyle: { color: '#eef1f5', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#8a93a0', fontSize: 12 }
    },
    series: [
      {
        name: '油耗',
        type: 'line',
        data: seriesData,
        smooth: true,
        showSymbol: true,
        symbolSize: 6,
        itemStyle: { color: '#3a7afe' }
      }
    ]
  }
}

const initMonthlyExpenseChart = (canvas: any, width: number, height: number, dpr: number) => {
  const chart = echarts.init(canvas, null, { width, height, devicePixelRatio: dpr })
  canvas.setChart?.(chart)
  chart.setOption(buildMonthlyOption())
  monthlyExpenseChart = chart
  return chart
}

const initYearlyExpenseChart = (canvas: any, width: number, height: number, dpr: number) => {
  const chart = echarts.init(canvas, null, { width, height, devicePixelRatio: dpr })
  canvas.setChart?.(chart)
  chart.setOption(buildYearlyOption())
  yearlyExpenseChart = chart
  return chart
}

const refreshMonthlyExpenseChart = () => {
  monthlyExpenseChart?.setOption(buildMonthlyOption(), true)
}

const refreshYearlyExpenseChart = () => {
  yearlyExpenseChart?.setOption(buildYearlyOption(), true)
}

const cycleMonthlyRange = () => {
  pendingMonthlyRange.value = monthlyRange.value.key
  showMonthlyPicker.value = true
}

const closeMonthlyPicker = () => {
  showMonthlyPicker.value = false
}

const confirmMonthlyPicker = () => {
  const target = monthlyRangeOptions.find((option) => option.key === pendingMonthlyRange.value)
  if (target) {
    monthlyRange.value = target
    uni.showToast({ title: `已切换到${target.label}`, icon: 'none' })
    refreshMonthlyExpenseChart()
  }
  closeMonthlyPicker()
}

const cycleYearlyRange = () => {
  const currentIndex = yearlyChartRangeOptions.findIndex(
    (option) => option.key === yearlyRange.value.key
  )
  yearlyRange.value =
    yearlyChartRangeOptions[(currentIndex + 1) % yearlyChartRangeOptions.length]
  uni.showToast({ title: `已切换到${yearlyRange.value.label}`, icon: 'none' })
  refreshYearlyExpenseChart()
}

const monthlyExpenseEc = ref({ lazyLoad: false, onInit: initMonthlyExpenseChart })
const yearlyExpenseEc = ref({ lazyLoad: false, onInit: initYearlyExpenseChart })

onUnmounted(() => {
  monthlyExpenseChart?.dispose()
  yearlyExpenseChart?.dispose()
  monthlyExpenseChart = null
  yearlyExpenseChart = null
})

const getCategoryMeta = (category: ExpenseCategory) => CATEGORY_META[category]
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.expense-page {
  padding: 32rpx 32rpx calc(200rpx + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(180deg, #f9fbff 0%, #f2f4f8 100%);
}

.expense-page--locked {
  height: 100vh;
  overflow: hidden;
}

.hero-card {
  // background: linear-gradient(135deg, #e9f7ff 0%, #f4f1ff 55%, #e9fdf2 100%);
  background: linear-gradient(135deg, #1ec15f 0%, #4ab3ff 100%);
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 28rpx 60rpx rgba(34, 94, 175, 0.18);
  margin-bottom: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  position: relative;
  overflow: hidden;
}


.hero-card__title-row,
.hero-card__equation,
.hero-divider,
.hero-card__metrics {
  position: relative;
  z-index: 1;
}

.hero-card::before,
.hero-card::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-card::before {
  background: radial-gradient(circle at 15% 20%, rgba(255, 255, 255, 0.8), transparent 55%),
    radial-gradient(circle at 85% 0%, rgba(255, 255, 255, 0.6), transparent 45%);
  opacity: 0.8;
}

.hero-card::after {
  inset: auto -50% -60% -50%;
  height: 180rpx;
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.05) 100%);
  filter: blur(6rpx);
}

.hero-card__title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hero-card__title {
  font-size: 34rpx;
  font-weight: 700;
}

.hero-card__filter {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  border: 1rpx solid #e6e9f2;
  font-size: 24rpx;
  color: #1f2329;
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.hero-card__filter-icon {
  font-size: 22rpx;
}

.hero-card__equation {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 16rpx;
}

.equation-block {
  background: rgba(255, 255, 255, 0.78);
  border-radius: 24rpx;
  padding: 18rpx;
}

.equation-label {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #5f6673;
}

.info-badge {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: #eef1f5;
  font-size: 20rpx;
  color: #8a93a0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.equation-value {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
  margin-top: 8rpx;
}

.equation-number {
  font-size: 36rpx;
  font-weight: 700;
  color: #1f2329;
}

.equation-value--accent .equation-number {
  color: #e64a3b;
}

.equation-unit {
  font-size: 22rpx;
  color: #8a93a0;
}

.equation-operator {
  font-size: 34rpx;
  color: #81858f;
}

.hero-divider {
  height: 1rpx;
  background: #8a93a0;
}

.hero-card__metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18rpx;
}

.hero-metric {
  background: rgba(255, 255, 255, 0.78);
  border-radius: 20rpx;
  padding: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.hero-metric__value {
  font-size: 32rpx;
  font-weight: 700;
  color: #1f2329;
}

.hero-metric__unit {
  font-size: 22rpx;
  color: #8a93a0;
}

.chart-card,
.timeline {
  background: #fff;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: $soft-shadow;
  margin-bottom: 28rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
}

.section-subtitle {
  font-size: 24rpx;
  color: $muted-text;
}

.chart-filter {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  border: 1rpx solid #e0e6ef;
  font-size: 24rpx;
  color: #5f6673;
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.chart-filter__icon {
  font-size: 22rpx;
  color: #94a2b8;
}

.chart-body {
  margin-top: 12rpx;
  min-height: 300rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-canvas {
  width: 100%;
  height: 320rpx;
}

.chart-placeholder {
  width: 100%;
  text-align: center;
  color: #8a93a0;
  font-size: 26rpx;
  padding: 60rpx 0;
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

.timeline {
  position: relative;
  padding-top: 16rpx;
}

.timeline-track {
  position: absolute;
  top: 80rpx;
  bottom: 32rpx;
  left: 46rpx;
  width: 4rpx;
  background: linear-gradient(180deg, #d1d6e6 0%, rgba(209, 214, 230, 0) 100%);
}

.timeline-item {
  position: relative;
  padding-left: 60rpx;
  margin-bottom: 32rpx;
}

.timeline-marker {
  position: absolute;
  left: 24rpx;
  top: 16rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border-width: 6rpx;
  border-style: solid;
  background: #fff;
}

.timeline-content {
  background: #fff;
  border-radius: 28rpx;
  padding: 24rpx;
  box-shadow: 0 20rpx 32rpx rgba(15, 25, 80, 0.08);
  border: 1rpx solid #eef1f5;
}

.timeline-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-date {
  font-size: 30rpx;
  font-weight: 600;
}

.timeline-amount {
  font-size: 32rpx;
  font-weight: 700;
}

.timeline-tag {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 26rpx;
}

.timeline-tag__icon {
  font-size: 28rpx;
}

.timeline-tag__status {
  margin-left: auto;
  font-size: 22rpx;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(30, 193, 95, 0.1);
  color: #1ec15f;
}

.timeline-meta {
  margin-top: 12rpx;
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: $muted-text;
}

.timeline-meta text:last-child {
  text-align: right;
}

.timeline-remark {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #1f2329;
}
</style>
