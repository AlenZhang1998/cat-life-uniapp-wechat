<template>
  <view
    class="expense-page"
    :class="{
      'expense-page--locked':
        showHeroPicker || showMonthlyPicker || showYearlyPicker,
    }"
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
        <view
          class="hero-metric"
          v-for="metric in heroOverview.metrics"
          :key="metric.key"
        >
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
        <view class="chart-placeholder"
          >请在微信小程序端查看油费月度统计图</view
        >
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
        <view class="chart-placeholder"
          >请在微信小程序端查看油耗年度统计图</view
        >
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
import { onShow } from '@dcloudio/uni-app';
import { computed, onUnmounted, ref } from 'vue';
import BottomActionBar from '@/components/BottomActionBar.vue';
import RangePickerOverlay from '@/components/RangePickerOverlay.vue';
import LoginOverlay from '@/components/LoginOverlay.vue';
import { useAuth } from '@/utils/auth';
import { axios } from '@/utils/request';

// uCharts 官方 ECharts 适配仅支持 CJS 导入，这里使用 require 方式以兼容编译到小程序端
// eslint-disable-next-line @typescript-eslint/no-var-requires
const echarts = require('../../wxcomponents/ec-canvas/echarts');

// ============= 类型 & 常量 =============
type ExpenseCategory =
  | 'fuel'
  | 'maintenance'
  | 'parking'
  | 'charging'
  | 'insurance'
  | 'wash';

type RangeKey = '3m' | '6m' | '1y' | '2y' | '3y' | 'all';
type BackendRangeKey = '3m' | '6m' | '1y' | 'all';

type HeroMetric = {
  key: string;
  label: string;
  value: string;
  unit: string;
};

type HeroOverview = {
  total: string;
  fuel: string;
  other: string;
  metrics: HeroMetric[];
};

type MonthlyBarPoint = {
  year: number; // 2024 / 2025
  month: string; // '10月' '11月'
  value: number;
};

type YearlyLinePoint = {
  month: string;
  value: number;
};

const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; icon: string; color: string; badgeBg: string }
> = {
  fuel: { label: '加油', icon: '⛽', color: '#1EC15F', badgeBg: '#E4FAED' },
  maintenance: {
    label: '保养',
    icon: '🛠️',
    color: '#3A7AFE',
    badgeBg: '#E2EAFF',
  },
  parking: { label: '停车', icon: '🅿️', color: '#FFB74D', badgeBg: '#FFF2E1' },
  charging: { label: '充电', icon: '⚡', color: '#00B8D9', badgeBg: '#D4F7FF' },
  insurance: {
    label: '保险',
    icon: '🛡️',
    color: '#8E64FF',
    badgeBg: '#F0E7FF',
  },
  wash: { label: '洗车', icon: '💦', color: '#00BFA5', badgeBg: '#DDF8F3' },
};

// ============= 登录状态 =============
const { isLoggedIn, refreshLoginState } = useAuth();
const showLoginSheet = ref(false);

const handleLoginRequired = () => {
  if (!isLoggedIn.value) {
    showLoginSheet.value = true;
  }
};

// ============= 公共日期工具 =============
const DAY_MS = 24 * 60 * 60 * 1000;

const normalizeDateOnly = (value?: string | Date | null) => {
  if (!value) return null;
  const date =
    value instanceof Date ? value : new Date(String(value).replace(/-/g, '/'));
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const calcDateRangeDays = (
  start?: string | Date | null,
  end?: string | Date | null
): number | null => {
  const startDate = normalizeDateOnly(start);
  const endDate = normalizeDateOnly(end);
  if (!startDate || !endDate || endDate.getTime() < startDate.getTime()) {
    return null;
  }
  const diff = endDate.getTime() - startDate.getTime();
  return Math.floor(diff / DAY_MS) + 1;
};

// 计算“爱车相伴天数”（和首页保持一致）
const calcHeroDays = (deliveryDate?: string | null) => {
  if (!deliveryDate) return 0;
  const parsed = new Date(deliveryDate.replace(/-/g, '/'));
  if (Number.isNaN(parsed.getTime())) return 0;
  const diff = Date.now() - parsed.getTime();
  if (diff < 0) return 0;
  const days = Math.floor(diff / DAY_MS);
  return days + 1;
};

// ============= 用户交车日期（用于统计卡片） =============
const profileDeliveryDate = ref<string | null>(null);

const fetchProfile = async () => {
  if (!isLoggedIn.value) return;
  try {
    const res = await axios.get('/api/profile');
    const resp = res as any;
    const data = resp.data || resp || {};
    profileDeliveryDate.value = data.deliveryDate || '';
  } catch (err) {
    console.warn('fetchProfile error:', err);
  }
};

// ============= 顶部「统计」卡片 =============

// 统计范围选项（UI）
const HERO_RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: '3m', label: '三个月' },
  { key: '6m', label: '半年' },
  { key: '1y', label: '一年' },
  { key: '2y', label: '两年' },
  { key: 'all', label: '全部' },
];

const heroRange = ref(HERO_RANGE_OPTIONS[4]); // 默认一年
const showHeroPicker = ref(false);
const pendingHeroRange = ref<RangeKey>(heroRange.value.key);

// 顶部统计数据（异步填充）
const heroOverview = ref<HeroOverview>({
  total: '--',
  fuel: '--',
  other: '--',
  metrics: [
    { key: 'days', label: '爱车相伴', value: '--', unit: '天' },
    { key: 'fuelKm', label: '油费/公里', value: '--', unit: '元' },
    { key: 'perDay', label: '成本/天', value: '--', unit: '元' },
  ],
});

// 前端范围 key -> 后端 range 参数
const mapRangeToBackend = (key: RangeKey): BackendRangeKey => {
  if (key === '3m' || key === '6m' || key === '1y') return key;
  // '2y' 和 'all' 目前都用 all 兜底
  return 'all';
};

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
        { key: 'perDay', label: '成本/天', value: '--', unit: '元' },
      ],
    };
    return;
  }

  try {
    const backendRange = mapRangeToBackend(rangeKey);
    const res = await axios.get(`/api/refuels/list?range=${backendRange}`);
    const resp = res as any;
    if (!resp || resp.success !== true) {
      throw new Error('接口返回异常');
    }

    const payload = resp.data || resp || {};
    const s = payload.summary || {};
    const list = (payload.records || []) as any[];

    // 计算总油费（当前筛选范围内的所有加油金额）
    const totalOilNum =
      typeof s.totalAmount === 'number'
        ? Number(s.totalAmount)
        : list.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    // 目前只有油费，其它支出为 0，将来有保养/停车等可以在这里加
    const otherTotalNum = 0;
    const totalSpendNum = totalOilNum + otherTotalNum;

    // ===== 用“满箱区间”计算油费/公里 =====

    // list 是按时间倒序（最新在前），这里翻转成正序处理
    const asc = [...list].reverse();

    let lastFullIndex: number | null = null;
    let segmentDistanceTotal = 0; // 所有满箱区间的里程和
    let segmentAmountTotal = 0; // 所有满箱区间的油费和

    for (let i = 0; i < asc.length; i++) {
      const item = asc[i];
      const isFull = !!item.isFullTank;

      if (!isFull) continue;

      // 第一次遇到“加满”，记录起点
      if (lastFullIndex === null) {
        lastFullIndex = i;
        continue;
      }

      // 之后再次遇到“加满”，形成一个区间 [lastFullIndex, i]
      const start = asc[lastFullIndex];
      const end = item;

      const startOdo = Number(start.odometer);
      const endOdo = Number(end.odometer);

      if (
        !Number.isFinite(startOdo) ||
        !Number.isFinite(endOdo) ||
        endOdo <= startOdo
      ) {
        // 里程非法，跳过这个区间，同时把新的满箱当成下一个区间起点
        lastFullIndex = i;
        continue;
      }

      // 区间油费：起点之后一条到终点这一条（不含起点加满）
      let segmentAmount = 0;
      for (let j = lastFullIndex + 1; j <= i; j++) {
        const amt = Number(asc[j].amount || 0);
        if (Number.isFinite(amt) && amt > 0) {
          segmentAmount += amt;
        }
      }

      const distance = endOdo - startOdo;
      if (distance > 0 && segmentAmount > 0) {
        segmentDistanceTotal += distance;
        segmentAmountTotal += segmentAmount;
      }

      // 当前满箱作为下一段的起点
      lastFullIndex = i;
    }

    const fuelPerKm =
      segmentDistanceTotal > 0 ? segmentAmountTotal / segmentDistanceTotal : 0;

    // ===== 爱车相伴天数 & 成本/天 =====
    const heroDaysNum = calcHeroDays(profileDeliveryDate.value);

    // 成本/天 = 总支出 / 爱车相伴天数
    const costPerDay = heroDaysNum > 0 ? totalSpendNum / heroDaysNum : 0;

    // ===== 更新 heroOverview 数据 =====
    heroOverview.value = {
      total: totalSpendNum.toFixed(1), // 总支出
      fuel: totalOilNum.toFixed(1), // 油费
      other: otherTotalNum.toFixed(1), // 其他支出
      metrics: [
        {
          key: 'days',
          label: '爱车相伴',
          value: heroDaysNum ? heroDaysNum.toFixed(0) : '--',
          unit: '天',
        },
        {
          key: 'fuelKm',
          label: '油费/公里',
          value: segmentDistanceTotal > 0 ? fuelPerKm.toFixed(2) : '--',
          unit: '元',
        },
        {
          key: 'perDay',
          label: '成本/天',
          value: heroDaysNum > 0 ? costPerDay.toFixed(2) : '--',
          unit: '元',
        },
      ],
    };
  } catch (err) {
    console.warn('fetchHeroData error:', err);
  }
};

// 统计卡片筛选弹窗
const handleHeroRangeTap = () => {
  pendingHeroRange.value = heroRange.value.key;
  showHeroPicker.value = true;
};
const closeHeroPicker = () => {
  showHeroPicker.value = false;
};
const handleHeroRangeSelection = (value: string | null) => {
  if (value) {
    pendingHeroRange.value = value as RangeKey;
  }
};
const confirmHeroPicker = () => {
  const target = HERO_RANGE_OPTIONS.find(
    (option) => option.key === pendingHeroRange.value
  );
  if (target) {
    heroRange.value = target;
    uni.showToast({ title: `已切换到${target.label}`, icon: 'none' });
    fetchHeroData(target.key);
  }
  closeHeroPicker();
};

// ============= 「油费月度统计」 =============
const monthlyRangeOptions: { key: RangeKey; label: string }[] = [
  { key: '1y', label: '今年' },
  { key: '2y', label: '近两年' },
  { key: '3y', label: '近三年' },
  { key: 'all', label: '全部' },
];

const monthlyRange = ref(monthlyRangeOptions[3]); // 默认 全部
const showMonthlyPicker = ref(false);
const pendingMonthlyRange = ref<RangeKey>(monthlyRangeOptions[3].key);
const monthlyChartData = ref<MonthlyBarPoint[]>([]);

// 用所有柱子的总和 / 横轴覆盖的月份数量 作为虚线参考
const monthlyBaseline = computed(() => {
  const data = monthlyChartData.value;
  if (!data.length) return '0';

  // 1. 找到最早、最晚的 year-month
  let minYear = data[0].year;
  let maxYear = data[0].year;
  let minMonth = parseInt(data[0].month, 10); // '10月' => 10
  let maxMonth = parseInt(data[0].month, 10);

  for (const item of data) {
    const y = item.year;
    const m = parseInt(item.month, 10);
    if (y < minYear || (y === minYear && m < minMonth)) {
      minYear = y;
      minMonth = m;
    }
    if (y > maxYear || (y === maxYear && m > maxMonth)) {
      maxYear = y;
      maxMonth = m;
    }
  }

  // 2. 计算横轴一共跨了多少个月（包含头尾）
  const monthCount = (maxYear - minYear) * 12 + (maxMonth - minMonth) + 1;

  // 3. 所有柱子的总油费
  const sum = data.reduce((s, p) => s + p.value, 0);

  const avg = monthCount > 0 ? sum / monthCount : 0;
  return avg.toFixed(1);
});

const fetchMonthlyCost = async (
  rangeKey: RangeKey = monthlyRange.value.key
) => {
  if (!isLoggedIn.value) {
    monthlyChartData.value = [];
    return;
  }

  try {
    // 这里直接拉全部记录，前端自己按年份筛选
    const res = await axios.get('/api/refuels/list?range=all');
    const resp = res as any;
    if (!resp || resp.success !== true) {
      throw new Error('接口返回异常');
    }
    const payload = resp.data || resp || {};
    const list = (payload.records || []) as any[];

    const now = new Date();
    const currentYear = now.getFullYear();

    // 根据筛选项，算出需要保留的最早年份
    let minYear = -Infinity;
    switch (rangeKey) {
      case '1y': // 今年
        minYear = currentYear;
        break;
      case '2y': // 近两年 = 今年 + 去年
        minYear = currentYear - 1;
        break;
      case '3y': // 近三年 = 今年 + 前两年
        minYear = currentYear - 2;
        break;
      case 'all':
      default:
        minYear = -Infinity;
        break;
    }

    const map = new Map<
      string,
      { year: number; month: number; amount: number }
    >(); // '2025-07' -> 聚合

    list.forEach((item) => {
      const dateStr = item.date || item.refuelDate;
      if (!dateStr) return;

      const d = new Date(String(dateStr).replace(/-/g, '/'));
      if (Number.isNaN(d.getTime())) return;

      const year = d.getFullYear();
      const month = d.getMonth() + 1;

      // 按“今年 / 近两年 / 近三年”过滤
      if (year < minYear || year > currentYear) return;

      const key = `${year}-${String(month).padStart(2, '0')}`;
      const prev = map.get(key)?.amount || 0;
      map.set(key, { year, month, amount: prev + Number(item.amount || 0) });
    });

    monthlyChartData.value = Array.from(map.values())
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      })
      .map((item) => ({
        year: item.year,
        month: `${item.month}月`,
        value: Number(item.amount.toFixed(0)),
      }));

    refreshMonthlyExpenseChart();
  } catch (err) {
    console.warn('fetchMonthlyCost error:', err);
    monthlyChartData.value = [];
    refreshMonthlyExpenseChart();
  }
};

const cycleMonthlyRange = () => {
  pendingMonthlyRange.value = monthlyRange.value.key;
  showMonthlyPicker.value = true;
};
const closeMonthlyPicker = () => {
  showMonthlyPicker.value = false;
};
const handleMonthlyRangeSelection = (value: string | null) => {
  if (value) {
    pendingMonthlyRange.value = value as RangeKey;
  }
};
const confirmMonthlyPicker = () => {
  const target = monthlyRangeOptions.find(
    (option) => option.key === pendingMonthlyRange.value
  );
  if (target) {
    monthlyRange.value = target;
    uni.showToast({ title: `已切换到${target.label}`, icon: 'none' });
    fetchMonthlyCost(target.key);
  }
  closeMonthlyPicker();
};

// ============= 「油耗年度对比统计」 =============
const yearlyRangeOptions: { key: RangeKey; label: string }[] = [
  { key: '1y', label: '一年' },
  { key: '2y', label: '两年' },
  { key: '3y', label: '三年' }, // 这里 UI 先保留，实际后端还是用 1y / all 兜底
];
const yearlyRange = ref(yearlyRangeOptions[2]);
const showYearlyPicker = ref(false);
const pendingYearlyRange = ref<RangeKey>(yearlyRangeOptions[0].key);
const yearlyChartData = ref<YearlyLinePoint[]>([]);

// 从 refuels 记录里按月份统计“平均油耗”（使用 consumption 有值的记录）
const fetchYearlyTrend = async (rangeKey: RangeKey = yearlyRange.value.key) => {
  if (!isLoggedIn.value) {
    yearlyChartData.value = [];
    return;
  }
  try {
    // 为简单起见，这里 1y/2y/3y 都先按 1y 或 all 处理
    const backendRange: BackendRangeKey = rangeKey === '1y' ? '1y' : 'all';
    const res = await axios.get(`/api/refuels/list?range=${backendRange}`);
    const resp = res as any;
    if (!resp || resp.success !== true) {
      throw new Error('接口返回异常');
    }
    const payload = resp.data || resp || {};
    const list = (payload.records || []) as any[];

    const map = new Map<number, { sum: number; count: number }>(); // 月份 -> {总油耗, 次数}

    list.forEach((item) => {
      const consumption = item?.consumption;
      if (consumption === '--' || consumption == null) return;
      const consumptionNum = Number(consumption);
      if (!Number.isFinite(consumptionNum)) return;
      const dateStr = item.date || item.refuelDate;
      if (!dateStr) return;
      const d = new Date(String(dateStr).replace(/-/g, '/'));
      if (Number.isNaN(d.getTime())) return;
      const m = d.getMonth() + 1;
      const bucket = map.get(m) || { sum: 0, count: 0 };
      bucket.sum += consumptionNum;
      bucket.count += 1;
      map.set(m, bucket);
    });

    yearlyChartData.value = Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([m, { sum, count }]) => ({
        month: `${m}月`,
        value: count > 0 ? Number((sum / count).toFixed(2)) : 0,
      }));

    refreshYearlyExpenseChart();
  } catch (err) {
    console.warn('fetchYearlyTrend error:', err);
    yearlyChartData.value = [];
    refreshYearlyExpenseChart();
  }
};

const cycleYearlyRange = () => {
  pendingYearlyRange.value = yearlyRange.value.key;
  showYearlyPicker.value = true;
};
const closeYearlyPicker = () => {
  showYearlyPicker.value = false;
};
const handleYearlyRangeSelection = (value: string | null) => {
  if (value) {
    pendingYearlyRange.value = value as RangeKey;
  }
};
const confirmYearlyPicker = () => {
  const target = yearlyRangeOptions.find(
    (option) => option.key === pendingYearlyRange.value
  );
  if (target) {
    yearlyRange.value = target;
    uni.showToast({ title: `已切换到${target.label}`, icon: 'none' });
    fetchYearlyTrend(target.key);
  }
  closeYearlyPicker();
};

// ============= ECharts 配置 =============
let monthlyExpenseChart: any = null;
let yearlyExpenseChart: any = null;

const buildMonthlyOption = () => {
  const categories = monthlyChartData.value.map((item) => item.month);
  const years = monthlyChartData.value.map((item) => item.year);

  const yearColors: Record<number, string> = {
    2024: '#E34CFF',
    2025: '#3A7AFE',
  };

  const seriesData = monthlyChartData.value.map((item) => ({
    value: item.value,
    itemStyle: {
      color: yearColors[item.year] || '#3A7AFE',
    },
  }));

  const labelFormatter = (value: string, index: number) => {
    const year = years[index];
    const prevYear = index > 0 ? years[index - 1] : null;
    if (index === 0 || year !== prevYear) {
      const shortYear = String(year).slice(-2);
      return `${shortYear}年${value}`;
    }
    return value;
  };

  // 这里直接取刚才算好的 baseline
  const avg = Number(monthlyBaseline.value);

  return {
    grid: { left: 32, right: 16, top: 36, bottom: 40 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const p = params[0];
        const idx = p.dataIndex;
        const item = monthlyChartData.value[idx];
        return `${item.year}年${item.month}<br/>油费：${item.value} 元`;
      },
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#d0d7e3' } },
      axisTick: { show: false },
      axisLabel: {
        color: '#5f6673',
        fontSize: 12,
        interval: 0,
        formatter: labelFormatter,
      },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#eef1f5', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#8a93a0', fontSize: 12 },
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
          fontSize: 12,
        },
        markLine: {
          symbol: 'none',
          label: {
            show: true,
            position: 'middle', // ✅ 不要默认 auto
            verticalAlign: 'middle', // 垂直居中
            formatter: `${avg} 元`,
            color: '#ff6b6b',
          },
          lineStyle: {
            type: 'dashed',
            color: '#ff6b6b',
          },
          data: [{ yAxis: avg }],
        },
      },
    ],
  };
};

const buildYearlyOption = () => {
  const categories = yearlyChartData.value.map((item) => item.month);
  const seriesData = yearlyChartData.value.map((item) => item.value);

  if (!categories.length) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'middle',
        textStyle: { color: '#9ca3af', fontSize: 12 },
      },
    };
  }

  const maxVal = Math.max(...seriesData);
  const minVal = Math.min(...seriesData);
  const yMax = Math.max(9, Math.ceil(maxVal + 0.5));
  const yMin = Math.min(4, Math.floor(minVal - 0.5));

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
        const p = params[0];
        return `${p.axisValue}\n油耗：${p.data.toFixed(1)} L/100km`;
      },
    },
    xAxis: {
      type: 'category',
      data: categories,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#d4d7de' } },
      axisTick: { show: false },
      axisLabel: { color: '#6b7280', fontSize: 11 },
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
        formatter: (val: number) => val.toFixed(1),
      },
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
          color: '#3b82f6',
        },
        itemStyle: {
          color: '#2563eb',
          borderColor: '#eff6ff',
          borderWidth: 2,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59,130,246,0.22)' },
            { offset: 1, color: 'rgba(59,130,246,0.02)' },
          ]),
        },
      },
    ],
  };
};

const initMonthlyExpenseChart = (
  canvas: any,
  width: number,
  height: number,
  dpr: number
) => {
  const chart = echarts.init(canvas, null, {
    width,
    height,
    devicePixelRatio: dpr,
  });
  canvas.setChart?.(chart);
  chart.setOption(buildMonthlyOption());
  monthlyExpenseChart = chart;
  return chart;
};

const initYearlyExpenseChart = (
  canvas: any,
  width: number,
  height: number,
  dpr: number
) => {
  const chart = echarts.init(canvas, null, {
    width,
    height,
    devicePixelRatio: dpr,
  });
  canvas.setChart?.(chart);
  chart.setOption(buildYearlyOption());
  yearlyExpenseChart = chart;
  return chart;
};

const refreshMonthlyExpenseChart = () => {
  monthlyExpenseChart?.setOption(buildMonthlyOption(), true);
};

const refreshYearlyExpenseChart = () => {
  yearlyExpenseChart?.setOption(buildYearlyOption(), true);
};

const monthlyExpenseEc = ref({
  lazyLoad: false,
  onInit: initMonthlyExpenseChart,
});
const yearlyExpenseEc = ref({
  lazyLoad: false,
  onInit: initYearlyExpenseChart,
});

// ============= 生命周期 =============
onUnmounted(() => {
  monthlyExpenseChart?.dispose();
  yearlyExpenseChart?.dispose();
  monthlyExpenseChart = null;
  yearlyExpenseChart = null;
});

onShow(() => {
  refreshLoginState();
  fetchProfile().then(() => {
    // 先拿到交车日期，再拉统计
    fetchHeroData(heroRange.value.key);
  });
  fetchMonthlyCost(monthlyRange.value.key);
  fetchYearlyTrend(yearlyRange.value.key);
});

// 时间线现在用不到真实数据，先保留工具函数（以后扩展用）
const getCategoryMeta = (category: ExpenseCategory) => CATEGORY_META[category];
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
  background: radial-gradient(
      circle at 15% 20%,
      rgba(255, 255, 255, 0.8),
      transparent 55%
    ),
    radial-gradient(circle at 85% 0%, rgba(255, 255, 255, 0.6), transparent 45%);
  opacity: 0.8;
}

.hero-card::after {
  inset: auto -50% -60% -50%;
  height: 180rpx;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
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
