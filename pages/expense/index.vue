<template>
  <view
    class="expense-page"
    :class="{ 'expense-page--locked': showHeroPicker || showMonthlyPicker || showYearlyPicker }"
  >
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
          v-show="!showHeroPicker && !showMonthlyPicker && !showYearlyPicker"
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
          v-show="!showHeroPicker && !showMonthlyPicker && !showYearlyPicker"
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

    <RangePickerOverlay
      :visible="showHeroPicker"
      title="选择统计范围"
      :options="HERO_RANGE_OPTIONS"
      :selected-key="pendingHeroRange"
      @update:selected-key="handleHeroRangeSelection"
      @cancel="closeHeroPicker"
      @confirm="confirmHeroPicker"
    />

    <RangePickerOverlay
      :visible="showMonthlyPicker"
      title="选择统计范围"
      :options="monthlyRangeOptions"
      :selected-key="pendingMonthlyRange"
      @update:selected-key="handleMonthlyRangeSelection"
      @cancel="closeMonthlyPicker"
      @confirm="confirmMonthlyPicker"
    />

    <RangePickerOverlay
      :visible="showYearlyPicker"
      title="选择对比区间"
      :options="yearlyRangeOptions"
      :selected-key="pendingYearlyRange"
      @update:selected-key="handleYearlyRangeSelection"
      @cancel="closeYearlyPicker"
      @confirm="confirmYearlyPicker"
    />

    <!-- <view class="timeline">
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
    </view> -->
  </view>
  <LoginOverlay v-model:visible="showLoginSheet" />
  <BottomActionBar
    active="expense"
    :is-logged-in="isLoggedIn"
    @login-required="handleLoginRequired"
  />
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed, onUnmounted, ref } from 'vue'
import BottomActionBar from '@/components/BottomActionBar.vue'
import RangePickerOverlay from '@/components/RangePickerOverlay.vue'
import LoginOverlay from '@/components/LoginOverlay.vue'
import { useAuth } from '@/utils/auth'
import { axios } from '@/utils/request'

// uCharts 官方 ECharts 适配仅支持 CJS 导入，这里使用 require 方式以兼容编译到小程序端
// eslint-disable-next-line @typescript-eslint/no-var-requires
const echarts = require('../../wxcomponents/ec-canvas/echarts')

// ============= 类型 & 常量 =============
type ExpenseCategory =
  | 'fuel'
  | 'maintenance'
  | 'parking'
  | 'charging'
  | 'insurance'
  | 'wash'

type RangeKey = '3m' | '6m' | '1y' | '2y' | 'all'
type BackendRangeKey = '3m' | '6m' | '1y' | 'all'

type HeroMetric = {
  key: string
  label: string
  value: string
  unit: string
}

type HeroOverview = {
  total: string
  fuel: string
  other: string
  metrics: HeroMetric[]
}

type MonthlyBarPoint = {
  month: string
  value: number
}

type YearlyLinePoint = {
  month: string
  value: number
}

const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; icon: string; color: string; badgeBg: string }
> = {
  fuel: { label: '加油', icon: '⛽', color: '#1EC15F', badgeBg: '#E4FAED' },
  maintenance: { label: '保养', icon: '🛠️', color: '#3A7AFE', badgeBg: '#E2EAFF' },
  parking: { label: '停车', icon: '🅿️', color: '#FFB74D', badgeBg: '#FFF2E1' },
  charging: { label: '充电', icon: '⚡', color: '#00B8D9', badgeBg: '#D4F7FF' },
  insurance: { label: '保险', icon: '🛡️', color: '#8E64FF', badgeBg: '#F0E7FF' },
  wash: { label: '洗车', icon: '💦', color: '#00BFA5', badgeBg: '#DDF8F3' }
}

// ============= 登录状态 =============
const { isLoggedIn, refreshLoginState } = useAuth()
const showLoginSheet = ref(false)

const handleLoginRequired = () => {
  if (!isLoggedIn.value) {
    showLoginSheet.value = true
  }
}

// ============= 公共日期工具 =============
const DAY_MS = 24 * 60 * 60 * 1000

const normalizeDateOnly = (value?: string | Date | null) => {
  if (!value) return null
  const date =
    value instanceof Date ? value : new Date(String(value).replace(/-/g, '/'))
  if (Number.isNaN(date.getTime())) return null
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

const calcDateRangeDays = (
  start?: string | Date | null,
  end?: string | Date | null
): number | null => {
  const startDate = normalizeDateOnly(start)
  const endDate = normalizeDateOnly(end)
  if (!startDate || !endDate || endDate.getTime() < startDate.getTime()) {
    return null
  }
  const diff = endDate.getTime() - startDate.getTime()
  return Math.floor(diff / DAY_MS) + 1
}

// 计算“爱车相伴天数”（和首页保持一致）
const calcHeroDays = (deliveryDate?: string | null) => {
  if (!deliveryDate) return 0
  const parsed = new Date(deliveryDate.replace(/-/g, '/'))
  if (Number.isNaN(parsed.getTime())) return 0
  const diff = Date.now() - parsed.getTime()
  if (diff < 0) return 0
  const days = Math.floor(diff / DAY_MS)
  return days + 1
}

// ============= 用户交车日期（用于统计卡片） =============
const profileDeliveryDate = ref<string | null>(null)

const fetchProfile = async () => {
  if (!isLoggedIn.value) return
  try {
    const res = await axios.get('/api/profile')
    const resp = res as any
    const data = resp.data || resp || {}
    profileDeliveryDate.value = data.deliveryDate || ''
  } catch (err) {
    console.warn('fetchProfile error:', err)
  }
}

// ============= 顶部「统计」卡片 =============

// 统计范围选项（UI）
const HERO_RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: '3m', label: '三个月' },
  { key: '6m', label: '半年' },
  { key: '1y', label: '一年' },
  { key: '2y', label: '两年' },
  { key: 'all', label: '全部' }
]

const heroRange = ref(HERO_RANGE_OPTIONS[2]) // 默认一年
const showHeroPicker = ref(false)
const pendingHeroRange = ref<RangeKey>(heroRange.value.key)

// 顶部统计数据（异步填充）
const heroOverview = ref<HeroOverview>({
  total: '--',
  fuel: '--',
  other: '--',
  metrics: [
    { key: 'days', label: '爱车相伴', value: '--', unit: '天' },
    { key: 'fuelKm', label: '油费/公里', value: '--', unit: '元' },
    { key: 'perDay', label: '成本/天', value: '--', unit: '元' }
  ]
})

// 前端范围 key -> 后端 range 参数
const mapRangeToBackend = (key: RangeKey): BackendRangeKey => {
  if (key === '3m' || key === '6m' || key === '1y') return key
  // '2y' 和 'all' 目前都用 all 兜底
  return 'all'
}

// 拉取「统计」所需的 refuel 数据
const fetchHeroData = async (rangeKey: RangeKey = heroRange.value.key) => {
  if (!isLoggedIn.value) {
    heroOverview.value = {
      total: '--',
      fuel: '--',
      other: '--',
      metrics: [
        { key: 'days', label: '爱车相伴', value: '--', unit: '天' },
        { key: 'fuelKm', label: '油费/公里', value: '--', unit: '元' },
        { key: 'perDay', label: '成本/天', value: '--', unit: '元' }
      ]
    }
    return
  }

  try {
    const backendRange = mapRangeToBackend(rangeKey)
    const res = await axios.get(`/api/refuels/list?range=${backendRange}`)
    const resp = res as any
    if (!resp || resp.success !== true) {
      throw new Error('接口返回异常')
    }

    const payload = resp.data || resp || {}
    const s = payload.summary || {}
    const list = (payload.records || []) as any[]

    // 总油费
    const totalOilNum =
      typeof s.totalAmount === 'number'
        ? Number(s.totalAmount)
        : list.reduce((sum, item) => sum + Number(item.amount || 0), 0)

    // 目前只有油费，其它支出为 0，将来有保养/停车等可以在这里加
    const otherTotalNum = 0
    const totalSpendNum = totalOilNum + otherTotalNum

    // 里程相关
    const coverageDistance =
      typeof s.coverageDistance === 'number'
        ? Number(s.coverageDistance)
        : typeof s.totalDistance === 'number'
          ? Number(s.totalDistance)
          : 0

    // 区间天数
    const dateRangeDays =
      typeof s.dateRangeDays === 'number'
        ? s.dateRangeDays
        : calcDateRangeDays(s.startDate, s.endDate)

    const heroDaysNum = calcHeroDays(profileDeliveryDate.value)

    const fuelPerKm =
      coverageDistance > 0 ? totalOilNum / coverageDistance : 0
    const costPerDay =
      dateRangeDays && dateRangeDays > 0 ? totalSpendNum / dateRangeDays : 0

    heroOverview.value = {
      total: totalSpendNum.toFixed(1),
      fuel: totalOilNum.toFixed(1),
      other: otherTotalNum.toFixed(1),
      metrics: [
        {
          key: 'days',
          label: '爱车相伴',
          value: heroDaysNum ? heroDaysNum.toFixed(0) : '--',
          unit: '天'
        },
        {
          key: 'fuelKm',
          label: '油费/公里',
          value: coverageDistance > 0 ? fuelPerKm.toFixed(2) : '--',
          unit: '元'
        },
        {
          key: 'perDay',
          label: '成本/天',
          value: dateRangeDays && dateRangeDays > 0 ? costPerDay.toFixed(2) : '--',
          unit: '元'
        }
      ]
    }
  } catch (err) {
    console.warn('fetchHeroData error:', err)
  }
}

// 统计卡片筛选弹窗
const handleHeroRangeTap = () => {
  pendingHeroRange.value = heroRange.value.key
  showHeroPicker.value = true
}
const closeHeroPicker = () => {
  showHeroPicker.value = false
}
const handleHeroRangeSelection = (value: string | null) => {
  if (value) {
    pendingHeroRange.value = value as RangeKey
  }
}
const confirmHeroPicker = () => {
  const target = HERO_RANGE_OPTIONS.find(
    (option) => option.key === pendingHeroRange.value
  )
  if (target) {
    heroRange.value = target
    uni.showToast({ title: `已切换到${target.label}`, icon: 'none' })
    fetchHeroData(target.key)
  }
  closeHeroPicker()
}

// ============= 「油费月度统计」 =============
const monthlyRangeOptions: { key: RangeKey; label: string }[] = [
  { key: '3m', label: '三个月' },
  { key: '6m', label: '半年' },
  { key: '1y', label: '一年' },
  { key: 'all', label: '全部' }
]
const monthlyRange = ref(monthlyRangeOptions[1]) // 默认半年
const showMonthlyPicker = ref(false)
const pendingMonthlyRange = ref<RangeKey>(monthlyRangeOptions[1].key)
const monthlyChartData = ref<MonthlyBarPoint[]>([])

// 用所有柱子的平均值做一条虚线参考
const monthlyBaseline = computed(() => {
  if (!monthlyChartData.value.length) return '0'
  const sum = monthlyChartData.value.reduce((s, p) => s + p.value, 0)
  const avg = sum / monthlyChartData.value.length
  return avg.toFixed(1)
})

const fetchMonthlyCost = async (
  rangeKey: RangeKey = monthlyRange.value.key
) => {
  if (!isLoggedIn.value) {
    monthlyChartData.value = []
    return
  }
  try {
    const backendRange = mapRangeToBackend(rangeKey)
    const res = await axios.get(`/api/refuels/list?range=${backendRange}`)
    const resp = res as any
    if (!resp || resp.success !== true) {
      throw new Error('接口返回异常')
    }
    const payload = resp.data || resp || {}
    const list = (payload.records || []) as any[]

    const map = new Map<string, number>() // '2025-07' -> 金额
    list.forEach((item) => {
      const dateStr = item.date || item.refuelDate
      if (!dateStr) return
      const d = new Date(String(dateStr).replace(/-/g, '/'))
      if (Number.isNaN(d.getTime())) return
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0'
      )}`
      const prev = map.get(key) || 0
      map.set(key, prev + Number(item.amount || 0))
    })

    monthlyChartData.value = Array.from(map.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([ym, amount]) => {
        const m = Number(ym.slice(5))
        return {
          month: `${m}月`,
          value: Number(amount.toFixed(0))
        }
      })

    refreshMonthlyExpenseChart()
  } catch (err) {
    console.warn('fetchMonthlyCost error:', err)
    monthlyChartData.value = []
    refreshMonthlyExpenseChart()
  }
}

const cycleMonthlyRange = () => {
  pendingMonthlyRange.value = monthlyRange.value.key
  showMonthlyPicker.value = true
}
const closeMonthlyPicker = () => {
  showMonthlyPicker.value = false
}
const handleMonthlyRangeSelection = (value: string | null) => {
  if (value) {
    pendingMonthlyRange.value = value as RangeKey
  }
}
const confirmMonthlyPicker = () => {
  const target = monthlyRangeOptions.find(
    (option) => option.key === pendingMonthlyRange.value
  )
  if (target) {
    monthlyRange.value = target
    uni.showToast({ title: `已切换到${target.label}`, icon: 'none' })
    fetchMonthlyCost(target.key)
  }
  closeMonthlyPicker()
}

// ============= 「油耗年度对比统计」 =============
const yearlyRangeOptions: { key: RangeKey; label: string }[] = [
  { key: '1y', label: '一年' },
  { key: '2y', label: '两年' },
  { key: '3y', label: '三年' } // 这里 UI 先保留，实际后端还是用 1y / all 兜底
]
const yearlyRange = ref(yearlyRangeOptions[0])
const showYearlyPicker = ref(false)
const pendingYearlyRange = ref<RangeKey>(yearlyRangeOptions[0].key)
const yearlyChartData = ref<YearlyLinePoint[]>([])

// 从 refuels 记录里按月份统计“平均油耗”（lPer100km）
const fetchYearlyTrend = async (
  rangeKey: RangeKey = yearlyRange.value.key
) => {
  if (!isLoggedIn.value) {
    yearlyChartData.value = []
    return
  }
  try {
    // 为简单起见，这里 1y/2y/3y 都先按 1y 或 all 处理
    const backendRange: BackendRangeKey =
      rangeKey === '1y' ? '1y' : 'all'
    const res = await axios.get(`/api/refuels/list?range=${backendRange}`)
    const resp = res as any
    if (!resp || resp.success !== true) {
      throw new Error('接口返回异常')
    }
    const payload = resp.data || resp || {}
    const list = (payload.records || []) as any[]

    const map = new Map<
      number,
      { sum: number; count: number }
    >() // 月份 -> {总油耗, 次数}

    list.forEach((item) => {
      if (item.lPer100km == null) return
      const dateStr = item.date || item.refuelDate
      if (!dateStr) return
      const d = new Date(String(dateStr).replace(/-/g, '/'))
      if (Number.isNaN(d.getTime())) return
      const m = d.getMonth() + 1
      const bucket = map.get(m) || { sum: 0, count: 0 }
      bucket.sum += Number(item.lPer100km)
      bucket.count += 1
      map.set(m, bucket)
    })

    yearlyChartData.value = Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([m, { sum, count }]) => ({
        month: `${m}月`,
        value: count > 0 ? Number((sum / count).toFixed(2)) : 0
      }))

    refreshYearlyExpenseChart()
  } catch (err) {
    console.warn('fetchYearlyTrend error:', err)
    yearlyChartData.value = []
    refreshYearlyExpenseChart()
  }
}

const cycleYearlyRange = () => {
  pendingYearlyRange.value = yearlyRange.value.key
  showYearlyPicker.value = true
}
const closeYearlyPicker = () => {
  showYearlyPicker.value = false
}
const handleYearlyRangeSelection = (value: string | null) => {
  if (value) {
    pendingYearlyRange.value = value as RangeKey
  }
}
const confirmYearlyPicker = () => {
  const target = yearlyRangeOptions.find(
    (option) => option.key === pendingYearlyRange.value
  )
  if (target) {
    yearlyRange.value = target
    uni.showToast({ title: `已切换到${target.label}`, icon: 'none' })
    fetchYearlyTrend(target.key)
  }
  closeYearlyPicker()
}

// ============= ECharts 配置 =============
let monthlyExpenseChart: any = null
let yearlyExpenseChart: any = null

const buildMonthlyOption = () => {
  const categories = monthlyChartData.value.map((item) => item.month)
  const seriesData = monthlyChartData.value.map((item) => item.value)

  // 空数据时给一个占位，避免 ECharts 报错
  if (!categories.length) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'middle',
        textStyle: { color: '#9ca3af', fontSize: 12 }
      }
    }
  }

  // 动态算一个稍微高一点的 max，让柱子不要顶到头
  const maxVal = Math.max(...seriesData)
  const yMax = maxVal > 0 ? Math.ceil(maxVal * 1.15) : 100

  return {
    grid: { left: 36, right: 20, top: 24, bottom: 40 },
    tooltip: {
      trigger: 'axis',
      // axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const p = params[0]
        // ✅ 用 \n，而不是 <br/>
        return `${p.axisValue}\n油费：${p.data} 元`
        // 如果你不想换行，也可以写成：
        // return `${p.axisValue}  油费：${p.data} 元`
      },
      backgroundColor: 'rgba(31,35,41,0.9)',
      borderWidth: 0,
      textStyle: { color: '#fff', fontSize: 11, lineHeight: 16 },
      padding: [6, 8]
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#d4d7de' } },
      axisTick: { show: false },
      axisLabel: { color: '#6b7280', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      max: yMax,
      splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11,
        formatter: (val: number) => (val === 0 ? '0' : val.toFixed(0))
      }
    },
    series: [
      {
        name: '油费',
        type: 'bar',
        data: seriesData,
        barWidth: 20,
        itemStyle: {
          borderRadius: [8, 8, 4, 4],
          shadowColor: 'rgba(15, 118, 110, 0.25)',
          shadowBlur: 8,
          shadowOffsetY: 4,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#34d399' },   // 上：浅绿
            { offset: 1, color: '#059669' }    // 下：深绿
          ])
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 12,
            shadowOffsetY: 6,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#6ee7b7' },
              { offset: 1, color: '#10b981' }
            ])
          }
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 11,
          color: '#374151',
          formatter: '{c}'
        },
        markLine: {
          symbol: 'none',        // 去掉两端小圆点
          label: {
            show: true,
            position: 'middle',     // ✅ 不要默认 auto
            verticalAlign: 'middle',  // 垂直居中
            align: 'center',     // 水平居中
            // formatter: `平均 ${monthlyBaseline.value} 元`,
            // color: '#ff6b6b',
            // fontSize: 11,
            // padding: [2, 6],
            // backgroundColor: 'rgba(255,107,107,0.3)',
            // borderRadius: 6
          },
          // lineStyle: {
          //   type: 'dashed',
          //   color: '#ff6b6b',
          //   width: 1
          // },
          data: [
            {
              yAxis: Number(monthlyBaseline.value),
              lineStyle: { type: 'dashed', color: '#ff6b6b' },
              label: {
                formatter: `${monthlyBaseline.value} 元`,
                color: '#ff6b6b'
              }
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

  if (!categories.length) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'middle',
        textStyle: { color: '#9ca3af', fontSize: 12 }
      }
    }
  }

  const maxVal = Math.max(...seriesData)
  const minVal = Math.min(...seriesData)
  const yMax = Math.max(9, Math.ceil(maxVal + 0.5))
  const yMin = Math.min(4, Math.floor(minVal - 0.5))

  return {
    grid: { left: 40, right: 20, top: 30, bottom: 36 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line' },
      backgroundColor: 'rgba(31,35,41,0.9)',
      borderWidth: 0,
      padding: [6, 8],
      textStyle: { color: '#fff', fontSize: 11 },
      formatter: (params: any[]) => {
        const p = params[0]
        return `${p.axisValue}\n油耗：${p.data.toFixed(1)} L/100km`
      }
    },
    xAxis: {
      type: 'category',
      data: categories,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#d4d7de' } },
      axisTick: { show: false },
      axisLabel: { color: '#6b7280', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      min: yMin,
      max: yMax,
      splitNumber: 5,
      splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11,
        formatter: (val: number) => val.toFixed(1)
      }
    },
    series: [
      {
        name: '油耗',
        type: 'line',
        data: seriesData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2,
          color: '#3b82f6'
        },
        itemStyle: {
          color: '#2563eb',
          borderColor: '#eff6ff',
          borderWidth: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59,130,246,0.22)' },
            { offset: 1, color: 'rgba(59,130,246,0.02)' }
          ])
        }
      }
    ]
  }
}


const initMonthlyExpenseChart = (
  canvas: any,
  width: number,
  height: number,
  dpr: number
) => {
  const chart = echarts.init(canvas, null, { width, height, devicePixelRatio: dpr })
  canvas.setChart?.(chart)
  chart.setOption(buildMonthlyOption())
  monthlyExpenseChart = chart
  return chart
}

const initYearlyExpenseChart = (
  canvas: any,
  width: number,
  height: number,
  dpr: number
) => {
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

const monthlyExpenseEc = ref({ lazyLoad: false, onInit: initMonthlyExpenseChart })
const yearlyExpenseEc = ref({ lazyLoad: false, onInit: initYearlyExpenseChart })

// ============= 生命周期 =============
onUnmounted(() => {
  monthlyExpenseChart?.dispose()
  yearlyExpenseChart?.dispose()
  monthlyExpenseChart = null
  yearlyExpenseChart = null
})

onShow(() => {
  refreshLoginState()
  fetchProfile().then(() => {
    // 先拿到交车日期，再拉统计
    fetchHeroData(heroRange.value.key)
  })
  fetchMonthlyCost(monthlyRange.value.key)
  fetchYearlyTrend(yearlyRange.value.key)
})

// 时间线现在用不到真实数据，先保留工具函数（以后扩展用）
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

// .timeline {
//   position: relative;
//   padding-top: 16rpx;
// }

// .timeline-track {
//   position: absolute;
//   top: 80rpx;
//   bottom: 32rpx;
//   left: 46rpx;
//   width: 4rpx;
//   background: linear-gradient(180deg, #d1d6e6 0%, rgba(209, 214, 230, 0) 100%);
// }

// .timeline-item {
//   position: relative;
//   padding-left: 60rpx;
//   margin-bottom: 32rpx;
// }

// .timeline-marker {
//   position: absolute;
//   left: 24rpx;
//   top: 16rpx;
//   width: 36rpx;
//   height: 36rpx;
//   border-radius: 50%;
//   border-width: 6rpx;
//   border-style: solid;
//   background: #fff;
// }

// .timeline-content {
//   background: #fff;
//   border-radius: 28rpx;
//   padding: 24rpx;
//   box-shadow: 0 20rpx 32rpx rgba(15, 25, 80, 0.08);
//   border: 1rpx solid #eef1f5;
// }

// .timeline-row {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
// }

// .timeline-date {
//   font-size: 30rpx;
//   font-weight: 600;
// }

// .timeline-amount {
//   font-size: 32rpx;
//   font-weight: 700;
// }

// .timeline-tag {
//   margin-top: 12rpx;
//   display: flex;
//   align-items: center;
//   gap: 12rpx;
//   font-size: 26rpx;
// }

// .timeline-tag__icon {
//   font-size: 28rpx;
// }

// .timeline-tag__status {
//   margin-left: auto;
//   font-size: 22rpx;
//   padding: 6rpx 18rpx;
//   border-radius: 999rpx;
//   background: rgba(30, 193, 95, 0.1);
//   color: #1ec15f;
// }

// .timeline-meta {
//   margin-top: 12rpx;
//   display: flex;
//   justify-content: space-between;
//   font-size: 24rpx;
//   color: $muted-text;
// }

// .timeline-meta text:last-child {
//   text-align: right;
// }

// .timeline-remark {
//   margin-top: 12rpx;
//   font-size: 24rpx;
//   color: #1f2329;
// }
</style>
