<template>
  <view class="expense-page">
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

    <view class="category-card">
      <view class="section-header">
        <text class="section-title">费用构成</text>
        <text class="section-subtitle">预算 {{ monthlyBudget }} 元</text>
      </view>
      <view class="category-row" v-for="category in categoryBreakdown" :key="category.key">
        <view
          class="category-row__badge"
          :style="{ background: category.badgeColor, color: category.color }"
        >
          <text>{{ category.icon }}</text>
        </view>
        <view class="category-row__meta">
          <text class="category-row__label">{{ category.label }}</text>
          <text class="category-row__value">￥{{ category.amount }}</text>
        </view>
        <view class="category-row__bar">
          <view
            class="category-row__fill"
            :style="{ width: category.percent + '%', background: category.color }"
          ></view>
        </view>
        <text class="category-row__percent">{{ category.percent }}%</text>
      </view>
    </view>

    <view class="insight-card">
      <view class="section-header">
        <text class="section-title">智能提示</text>
      </view>
      <view class="insight-list">
        <view class="insight-item" v-for="insight in expenseInsights" :key="insight.key">
          <text class="insight-index">0{{ insight.index }}</text>
          <view class="insight-content">
            <text class="insight-label">{{ insight.label }}</text>
            <text class="insight-desc">{{ insight.desc }}</text>
          </view>
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
import { computed, ref } from 'vue'
import BottomActionBar from '@/components/BottomActionBar.vue'

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

const categoryBreakdown = computed(() => {
  const totalAmount = expenseRecords.value.reduce((sum, item) => sum + item.amount, 0)
  const grouped = expenseRecords.value.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount
    return acc
  }, {} as Record<ExpenseCategory, number>)

  return (Object.entries(grouped) as Array<[ExpenseCategory, number]>)
    .sort((a, b) => b[1] - a[1])
    .map(([key, amount]) => {
      const meta = CATEGORY_META[key]
      const percent = totalAmount ? Math.round((amount / totalAmount) * 100) : 0
      return {
        key,
        label: meta.label,
        icon: meta.icon,
        badgeColor: meta.badgeBg,
        amount: amount.toFixed(0),
        percent,
        color: meta.color
      }
    })
})

const expenseInsights = computed(() => {
  const highlightCategory = categoryBreakdown.value[0]
  const recentCount = expenseRecords.value.filter((item) => item.day >= 10).length
  return [
    {
      key: 'budget',
      index: 1,
      label: '预算余量',
      desc: `剩余 ${monthlySummary.value.budgetLeft} 元，可覆盖约 ${Math.max(
        Number(monthlySummary.value.budgetLeft) / 150,
        0
      ).toFixed(1)} 次通勤`
    },
    {
      key: 'category',
      index: 2,
      label: '最高占比',
      desc: highlightCategory
        ? `${highlightCategory.label} 占比 ${highlightCategory.percent}%`
        : '等待记录更新'
    },
    {
      key: 'recent',
      index: 3,
      label: '近期支出',
      desc: `近 7 天记录 ${recentCount} 笔，可考虑错峰充电/加油`
    }
  ]
})

const monthlyBudget = MONTHLY_BUDGET

const getCategoryMeta = (category: ExpenseCategory) => CATEGORY_META[category]
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.expense-page {
  padding: 32rpx 32rpx calc(200rpx + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(180deg, #f9fbff 0%, #f2f4f8 100%);
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

.category-card,
.insight-card,
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

.category-row {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  grid-column-gap: 16rpx;
  grid-row-gap: 12rpx;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #f0f3f7;
  align-items: center;
}

.category-row:last-child {
  border-bottom: none;
}

.category-row__badge {
  grid-row: span 2;
  width: 64rpx;
  height: 64rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
}

.category-row__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-row__label {
  font-size: 28rpx;
}

.category-row__value {
  font-size: 28rpx;
  font-weight: 700;
}

.category-row__bar {
  width: 100%;
  height: 10rpx;
  border-radius: 999rpx;
  background: #eef1f5;
  overflow: hidden;
}

.category-row__fill {
  height: 100%;
  border-radius: inherit;
}

.category-row__percent {
  justify-self: end;
  font-size: 24rpx;
  color: $muted-text;
}

.insight-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.insight-index {
  font-size: 32rpx;
  font-weight: 700;
  color: #1ec15f;
}

.insight-label {
  font-size: 28rpx;
  font-weight: 600;
}

.insight-desc {
  font-size: 24rpx;
  color: $muted-text;
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
