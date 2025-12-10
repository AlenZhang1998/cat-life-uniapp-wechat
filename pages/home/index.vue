<template>
  <view class="home-page" :class="{ 'home-page--locked': showRangePicker }">
    <!-- 顶部卡片：展示城市、车辆概况和提醒 -->
    <view
      class="header-card animated-block animated-block--delay-0"
      :class="{ 'animated-block--visible': isPageAnimated }"
    >
      <view class="header-meta">
        <view
          class="location-row"
          hover-class="location-row__hover"
          @tap="navigateToCity"
        >
          <image class="location-icon" :src="locationIcon" mode="aspectFit" />
          <text class="location-text">{{ city }}</text>
          <!-- <text class="location-arrow">v</text> -->
          <image class="dingwei_right" :src="dingwei_right" mode="aspectFit" />
        </view>
        <view class="header-actions">
          <view class="chip primary">
            <text class="chip-text">爱车相伴 {{ carInfo.heroDays }} 天</text>
          </view>
          <!-- <view class="chip outline">
            <text class="chip-text">智驾提醒</text>
          </view> -->
        </view>
      </view>

      <view class="car-info">
        <text class="car-name">{{ carInfo.name }}</text>
        <!-- <text class="car-name">{{ carInfo.brand }} · {{ carInfo.model }}</text> -->
        <!-- <text class="car-trim">{{ carInfo.trim }}</text> -->
      </view>

      <view v-if="oilPriceList.length" class="price-row">
        <swiper
          class="price-swiper"
          :autoplay="oilPriceList.length > 1"
          :circular="oilPriceList.length > 1"
          :interval="2600"
          vertical
        >
          <swiper-item v-for="item in oilPriceList" :key="item.label">
            <view class="price-item">
              <text class="oil-type">{{ item.label }}</text>
              <text class="oil-price">
                <text class="price-number">{{ item.value }}</text>
                元/升
              </text>
            </view>
          </swiper-item>
        </swiper>
      </view>
      <view v-else class="price-row">
        <text class="oil-type">{{ oilPrice.label }}</text>
        <text class="oil-price">
          <text class="price-number">{{ oilPrice.value }}</text>
          元/升
        </text>
      </view>

      <view class="reminder-banner" v-if="!hasRecentRefuel">
        <text class="reminder-icon">!</text>
        <text class="reminder-text">没有加油或者充电记录，快去添加吧～</text>
      </view>
    </view>

    <!-- 最新油耗和能耗评级 -->
    <view
      class="latest-card animated-block animated-block--delay-1"
      :class="{ 'animated-block--visible': isPageAnimated }"
    >
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
            :class="{
              active: level.label === currentEfficiency.label && isLoggedIn,
            }"
            :style="getBadgeStyle(level)"
          >
            <text>{{ level.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 统计区块 -->
    <view
      class="stats-card animated-block animated-block--delay-2"
      :class="{ 'animated-block--visible': isPageAnimated }"
    >
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
    <view
      class="trend-card animated-block animated-block--delay-3"
      :class="{ 'animated-block--visible': isPageAnimated }"
    >
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
          <!-- 数据基于近 7 天行驶记录，绿线为当前车辆，红/灰线为本市参考区间。 -->
          绿线为当前车辆，红/灰 线为本市参考区间。
        </text>
      </view>
    </view>

    <RangePickerOverlay
      :visible="showRangePicker"
      title="请选择"
      :options="rangeOptions"
      :selected-key="pendingRangeKey"
      @update:selected-key="handlePendingRangeChange"
      @cancel="closeRangePicker"
      @confirm="confirmRangePicker"
    />

    <LoginOverlay v-model:visible="showLoginSheet" />
    <BottomActionBar
      active="fuel"
      :is-logged-in="isLoggedIn"
      @login-required="handleLoginRequired"
    />
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { STORAGE_KEYS } from '@/constants/storage';
import { CITY_LIST } from '@/data/cities';
import { normalizeCityName } from '@/utils/location';
import locationIcon from '@/static/icons/dingwei.png';
import dingwei_right from '@/static/icons/dingwei_right.png';
import BottomActionBar from '@/components/BottomActionBar.vue';
import RangePickerOverlay from '@/components/RangePickerOverlay.vue';
import LoginOverlay from '@/components/LoginOverlay.vue';
import { useAuth } from '@/utils/auth';
import { axios } from '@/utils/request';

// uCharts 官方 ECharts 适配仅支持 CJS 导入，这里使用 require 方式以兼容编译到小程序端
// eslint-disable-next-line @typescript-eslint/no-var-requires
const echarts = require('../../wxcomponents/ec-canvas/echarts');

// ================= 基础展示数据 =================
const DEFAULT_CITY = '未定位';
const normalizeOrDefault = (value?: string | null) =>
  normalizeCityName(value) || DEFAULT_CITY;

const cityProvinceMap = new Map<string, string>();

const buildCityProvinceMap = () => {
  CITY_LIST.forEach((item) => {
    const normalized = normalizeCityName(item.name);
    if (normalized && !cityProvinceMap.has(normalized)) {
      cityProvinceMap.set(normalized, item.province);
    }
    if (!cityProvinceMap.has(item.name)) {
      cityProvinceMap.set(item.name, item.province);
    }
  });
};

buildCityProvinceMap();

const resolveProvinceByCity = (cityName?: string | null) => {
  if (!cityName) return '';
  const normalized = normalizeCityName(cityName);
  return cityProvinceMap.get(normalized) || cityProvinceMap.get(cityName) || '';
};

const { isLoggedIn, refreshLoginState } = useAuth();
const showLoginSheet = ref(false);

const city = ref(normalizeOrDefault(DEFAULT_CITY));
const province = ref(resolveProvinceByCity(city.value));
let skipSyncSelectedCityOnce = false; // 避免从城市页回跳时二次触发 applyCity

const applyCity = (value: string, provinceName?: string) => {
  const normalizedCity = normalizeOrDefault(value);
  city.value = normalizedCity;
  if (provinceName) {
    console.log('自动定位，有省份');
    const normalizedProvince =
      normalizeCityName(provinceName) || provinceName || '';
    province.value = normalizedProvince;
  } else {
    console.log('无省份');
    province.value = resolveProvinceByCity(value);
  }
  console.log(233, 'applyCity = ', city.value, province.value);
};
watch(
  () => province.value,
  (v) => {
    if (v) fetchOilPrice(); // 有了省份，就获取油价
  },
  { immediate: true }
);
const syncSelectedCity = () => {
  const stored = uni.getStorageSync(STORAGE_KEYS.selectedCity) as string | null;
  if (stored) {
    applyCity(stored);
  }
};

syncSelectedCity();
const carInfo = ref({
  brand: '思域',
  model: '2025款 240TURBO CVT',
  trim: '智趣Plus',
  name: '--', // 思域 · 2025款 240TURBO CVT
  heroDays: 0,
});
type OilPrice = {
  label: string;
  value: string;
};

const oilPrice = ref<OilPrice>({
  label: '92#',
  value: '--',
});
const oilPriceList = ref<OilPrice[]>([
  // {label: "92#", value: "6.91"},
  // {label: "95#", value: "7.48"},
  // {label: "98#", value: "9.48"},
  // {label: "0#", value: "6.53"}
]);
const oilLoading = ref(false);
const oilError = ref('');

// 获取今日油价
const fetchOilPrice = async () => {
  // if (!isLoggedIn.value) {
  //   return
  // }
  if (!province.value) return;
  oilLoading.value = true;
  oilError.value = '';

  try {
    const res = await axios.get('/api/oil-price?province=' + province.value);

    const data = res as any;
    if (!data?.success || !Array.isArray(data.prices)) {
      oilError.value = '油价数据异常';
      return;
    }
    console.log(276, 'data = ', data);
    oilPriceList.value = data.prices;
    if (data.prices.length) {
      oilPrice.value = data.prices[0];
    }
  } catch (err) {
    console.warn('fetchOilPrice error:', err);
    oilError.value = '获取油价失败';
  } finally {
    oilLoading.value = false;
  }
};

// 用于控制提醒条是否展示，这里默认没有记录
const hasRecentRefuel = ref(false);

// 最新油耗展示值，默认0
const latestFuel = ref('0');

// 评级标签以静态数组呈现，方便后续根据接口高亮不同等级
type EfficiencyLevel = {
  label: string;
  badgeBg: string;
  badgeColor: string;
};

const efficiencyLevels = ref<EfficiencyLevel[]>([
  { label: 'S', badgeBg: '#e4faed', badgeColor: '#07c263' },
  { label: 'A', badgeBg: '#f0f9e7', badgeColor: '#94d951' },
  { label: 'B', badgeBg: '#f4faeb', badgeColor: '#c7e969' },
  { label: 'C', badgeBg: '#fff7e4', badgeColor: '#f7d36c' },
  { label: 'D', badgeBg: '#fff1df', badgeColor: '#fabb59' },
]);
const currentEfficiency = ref<EfficiencyLevel>(efficiencyLevels.value[0]);

const getBadgeStyle = (level: EfficiencyLevel) => ({
  '--badge-bg': level.badgeBg,
  '--badge-color': level.badgeColor,
});

// ⭐ 根据最新油耗计算评级
const getGradeByFuel = (val: number): 'S' | 'A' | 'B' | 'C' | 'D' => {
  if (val <= 5) return 'S';
  if (val <= 6.5) return 'A';
  if (val <= 7.5) return 'B';
  if (val <= 9) return 'C';
  return 'D';
};

watch(latestFuel, (newVal) => {
  const num = Number(newVal);
  if (Number.isNaN(num)) {
    currentEfficiency.value = efficiencyLevels.value[0];
    return;
  }
  const grade = getGradeByFuel(num);
  const target =
    efficiencyLevels.value.find((item) => item.label === grade) ||
    efficiencyLevels.value[0];
  currentEfficiency.value = target;
  // console.log(1111, currentEfficiency.value)
});

// 计算爱车相伴天数
const calcHeroDays = (deliveryDate?: string | null) => {
  if (!deliveryDate) return 0;
  const parsed = new Date(deliveryDate.replace(/-/g, '/'));
  if (Number.isNaN(parsed.getTime())) return 0;
  const diff = Date.now() - parsed.getTime();
  if (diff < 0) return 0;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  return days + 1; // 当天算第 1 天
};

// 获取用户资料信息
const fetchProfile = async () => {
  if (!isLoggedIn.value) {
    return;
  }
  try {
    const res = await axios.get('/api/profile');
    // console.log(1111, res)
    const resp = res as any;
    const data = resp.data || resp || {};

    carInfo.value.name = data.favoriteCarModel;
    carInfo.value.heroDays = calcHeroDays(data.deliveryDate);
  } catch (err) {
    console.warn('fetchProfile error:', err);
  }
};

// 统计口径筛选
type RangeKey = '3m' | '6m' | '1y' | 'all';

type RangeOption = {
  key: RangeKey;
  label: string;
};

const rangeOptions: RangeOption[] = [
  { key: '3m', label: '三个月' },
  { key: '6m', label: '半年' },
  { key: '1y', label: '一年' },
  { key: 'all', label: '全部' },
];

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

const calcDaysSinceEarliestRecord = (records: any[]): number | null => {
  if (!Array.isArray(records) || records.length === 0) return null;

  let earliestTime: number | null = null;

  records.forEach((item) => {
    const dateStr = item?.date || item?.refuelDate;
    const parsed = normalizeDateOnly(dateStr);
    if (!parsed) return;
    const ts = parsed.getTime();
    if (earliestTime == null || ts < earliestTime) {
      earliestTime = ts;
    }
  });

  if (earliestTime == null) return null;

  const today = normalizeDateOnly(new Date());
  if (!today) return null;

  const diff = today.getTime() - earliestTime;
  if (diff < 0) return null;

  return Math.floor(diff / DAY_MS) + 1;
};

// 统计区块的数据源，这里把单位也一起放进来，便于展示
const stats = ref([
  {
    key: 'fuelAvg',
    label: '平均油耗',
    value: '0',
    unit: '升/百公里',
    accent: true,
  },
  {
    key: 'mileageAvg',
    label: '平均行程',
    value: '0',
    unit: '公里/天',
  },
  {
    key: 'costAvg',
    label: '平均油价',
    value: '0',
    unit: '元/公里',
    accent: true,
  },
  {
    key: 'mileageTotal',
    label: '累计行程',
    value: '0',
    unit: '公里',
  },
  {
    key: 'costTotal',
    label: '累计油费',
    value: '0',
    unit: '元',
  },
  {
    key: 'discountTotal',
    label: '总计优惠',
    value: '0',
    unit: '元',
  },
]);

const fetchRefuelData = async (rangeKey: RangeKey = rangeOptions[3].key) => {
  if (!isLoggedIn.value) {
    hasRecentRefuel.value = false;
    latestFuel.value = '0';
    return;
  }

  try {
    // const year = new Date().getFullYear()
    const resolvedRange = rangeKey || rangeOptions[3].key;
    // let url = `/api/refuels/list?year=${year}`

    // if (resolvedRange !== 'all') {
    //   url += `&range=${resolvedRange}`
    // }
    const url = `/api/refuels/list?range=${resolvedRange || 'all'}`;

    const res = await axios.get(url);
    const resp = res as any;

    if (!resp || resp.success !== true) {
      throw new Error('接口返回异常');
    }
    const payload = resp.data || resp || {};
    const s = payload.summary || {};
    const list = (payload.records || []) as any[];
    const isAllRange = resolvedRange === 'all';

    // 是否有加油记录 -> 控制“没有记录”提示条
    hasRecentRefuel.value = Array.isArray(list) && list.length > 0;

    // ===== 最新油耗：取最近一条有有效 consumption 的记录（非 '--'） =====
    const latestWithConsumption = list.find((item: any) => {
      const val = item?.consumption;
      if (val === '--' || val == null) return false;
      const num = Number(val);
      return Number.isFinite(num);
    });
    latestFuel.value = latestWithConsumption
      ? Number(latestWithConsumption.consumption).toFixed(2)
      : '0';

    // ===== 统计区块数据 =====
    let avgFuelNum: number | null = null;
    if (!isAllRange) {
      avgFuelNum =
        typeof s.avgFuelConsumption === 'number'
          ? Number(s.avgFuelConsumption)
          : null;
    } else {
      const consumptionIndexes: number[] = [];
      list.forEach((item: any, idx: number) => {
        const c = item?.consumption;
        if (c === '--' || c == null) return;
        const num = Number(c);
        if (!Number.isFinite(num)) return;
        consumptionIndexes.push(idx);
      });

      if (consumptionIndexes.length >= 2) {
        const firstIdx = Math.min(...consumptionIndexes);
        const lastIdx = Math.max(...consumptionIndexes);
        const nextIdx = lastIdx + 1 < list.length ? lastIdx + 1 : lastIdx;

        const first = list[firstIdx] || {};
        const nextAfterLast = list[nextIdx] || {};

        const firstOdo = Number(first.odometer);
        const nextOdo = Number(nextAfterLast.odometer);

        let distance = NaN;
        if (Number.isFinite(firstOdo) && Number.isFinite(nextOdo)) {
          distance = firstOdo - nextOdo;
        }

        let volumeSum = 0;
        for (let i = firstIdx; i <= lastIdx; i++) {
          const v = Number(list[i]?.volume);
          if (Number.isFinite(v) && v > 0) {
            volumeSum += v;
          }
        }

        if (distance > 0 && volumeSum > 0) {
          avgFuelNum = (volumeSum / distance) * 100;
        } else {
          avgFuelNum = null;
        }
      } else {
        avgFuelNum = null;
      }
    }

    const avgFuel =
      avgFuelNum != null && Number.isFinite(avgFuelNum)
        ? Number(avgFuelNum).toFixed(2)
        : '--';
    const totalDistanceNum =
      s.totalDistance != null ? Number(s.totalDistance) : NaN;
    const totalDistance = Number.isFinite(totalDistanceNum)
      ? String(Math.round(totalDistanceNum))
      : '--';
    const totalAmount =
      s.totalAmount != null ? Number(s.totalAmount).toFixed(2) : '--';
    const avgPricePerL =
      s.avgPricePerL != null ? Number(s.avgPricePerL).toFixed(2) : '--';

    const resolvedDateRangeDaysFromList = calcDaysSinceEarliestRecord(list);
    const resolvedDateRangeDays =
      typeof resolvedDateRangeDaysFromList === 'number'
        ? resolvedDateRangeDaysFromList
        : typeof s.dateRangeDays === 'number'
        ? s.dateRangeDays
        : calcDateRangeDays(s.startDate, s.endDate);
    const validDateRangeDays =
      typeof resolvedDateRangeDays === 'number' && resolvedDateRangeDays > 0
        ? resolvedDateRangeDays
        : null;

    const mileageAvg =
      Number.isFinite(totalDistanceNum) && validDateRangeDays
        ? (totalDistanceNum / validDateRangeDays).toFixed(2)
        : '--';

    stats.value = [
      {
        key: 'fuelAvg',
        label: '平均油耗',
        value: avgFuel,
        unit: '升/百公里',
        accent: true,
      },
      {
        key: 'mileageAvg',
        label: '平均行程',
        value: mileageAvg,
        unit: '公里/天',
      },
      {
        key: 'costAvg',
        label: '平均油价',
        value: avgPricePerL === '--' ? '--' : avgPricePerL,
        unit: '元/升',
        accent: true,
      },
      {
        key: 'mileageTotal',
        label: '累计行程',
        value: totalDistance,
        unit: '公里',
      },
      {
        key: 'costTotal',
        label: '累计油费',
        value: totalAmount,
        unit: '元',
      },
      {
        key: 'discountTotal',
        label: '总计优惠',
        value: '0',
        unit: '元',
      },
    ];
  } catch (err) {
    console.warn('fetchRefuelData error:', err);
  }
};

// ================ 油耗趋势图 ================

// 根据加油记录构造油耗趋势数据
const fetchTrendData = async (rangeKey: RangeKey = rangeOptions[3].key) => {
  if (!isLoggedIn.value) {
    trendData.value = [];
    return;
  }

  try {
    const resolvedRange = rangeKey || rangeOptions[3].key;
    const url = `/api/refuels/list?range=${resolvedRange || 'all'}`;

    const res = await axios.get(url);
    const resp = res as any;

    const payload = resp.data || resp || {};
    const s = payload.summary || {};
    const list = (payload.records || []) as any[];

    // 基准油耗（用于城市高/低位线）：用平均油耗做一个 ±15% 的区间
    const base =
      typeof s.avgFuelConsumption === 'number' && s.avgFuelConsumption > 0
        ? Number(s.avgFuelConsumption)
        : 7; // 没数据给个兜底值

    const cityHigh = Number((base * 1.15).toFixed(2));
    const cityLow = Number((base * 0.85).toFixed(2));

    // 列表接口是「最近在前」，趋势要按时间正序画，所以要 reverse 一下，仅保留有有效 consumption 的记录
    const points = list
      .slice()
      .reverse()
      .filter((item: any) => {
        const consumption = item?.consumption;
        if (consumption === '--' || consumption == null) return false;
        const num = Number(consumption);
        return Number.isFinite(num);
      })
      .map((item: any) => {
        const dateStr = item.date || item.refuelDate;
        let year = NaN;

        if (dateStr) {
          const d = new Date(String(dateStr).replace(/-/g, '/'));
          if (!Number.isNaN(d.getTime())) {
            year = d.getFullYear();
          }
        }

        return {
          day: item.monthDay || '', // X 轴显示用，比如 10/09
          year, // 用来判断是否跨年
          value: Number(Number(item.consumption).toFixed(2)), // 当前车油耗
          cityHigh,
          cityLow,
        };
      });

    trendData.value = points;
  } catch (err) {
    console.warn('fetchTrendData error:', err);
    trendData.value = [];
  }
};

// 油耗趋势数据，value 直接对应折线的高度
type TrendPoint = {
  day: string; // '10/09'
  year: number; // 2024 / 2025
  value: number;
  cityHigh: number;
  cityLow: number;
};

const trendData = ref<TrendPoint[]>([
  // { day: '2025-10-01', value: 4.9, cityHigh: 8.2, cityLow: 6.1 },
  // { day: '2025-10-02', value: 8.6, cityHigh: 8.15, cityLow: 6.05 },
  // { day: '2025-10-04', value: 8.1, cityHigh: 8.05, cityLow: 6.0 },
  // { day: '2025-10-06', value: 7.3, cityHigh: 8.0, cityLow: 5.96 },
  // { day: '2025-10-09', value: 4.8, cityHigh: 7.95, cityLow: 5.92 }
]);

type RangeTarget = 'stats' | 'trend';

const statsRange = ref<RangeOption>(rangeOptions[3]);
const trendRange = ref<RangeOption>(rangeOptions[3]);
const showRangePicker = ref(false);
const pendingRangeKey = ref<RangeKey>(rangeOptions[3].key);
const activeRangeTarget = ref<RangeTarget>('stats');
const isPageAnimated = ref(false);
let enterAnimationTimer: ReturnType<typeof setTimeout> | null = null;

const resolveTargetRange = (target: RangeTarget) =>
  target === 'stats' ? statsRange : trendRange;

const runPageEnterAnimation = () => {
  if (enterAnimationTimer) {
    clearTimeout(enterAnimationTimer);
    enterAnimationTimer = null;
  }
  // Reset visible state before re-triggering the transition
  isPageAnimated.value = false;
  enterAnimationTimer = setTimeout(() => {
    isPageAnimated.value = true;
  }, 30);
};

const openRangePicker = (target: RangeTarget) => {
  activeRangeTarget.value = target;
  pendingRangeKey.value = resolveTargetRange(target).value.key;
  showRangePicker.value = true;
};

const closeRangePicker = () => {
  showRangePicker.value = false;
};

const handlePendingRangeChange = (value: RangeKey | null) => {
  if (value) {
    pendingRangeKey.value = value;
  }
};

const applyRangeSelection = (target: RangeTarget, key: RangeKey) => {
  const targetOption = rangeOptions.find((option) => option.key === key);
  if (!targetOption) return;

  const rangeRef = resolveTargetRange(target);
  const changed = rangeRef.value.key !== targetOption.key;
  rangeRef.value = targetOption;
  pendingRangeKey.value = targetOption.key;

  if (changed) {
    if (target === 'stats') {
      fetchRefuelData(targetOption.key);
    } else {
      // 趋势卡片的筛选变化时，单独拉趋势数据
      fetchTrendData(targetOption.key);
    }
  }

  const targetLabel = target === 'stats' ? '统计' : '趋势';
  uni.showToast({
    title: `${targetLabel}已切换到${targetOption.label}`,
    icon: 'none',
  });
};

const confirmRangePicker = (value?: RangeKey | null) => {
  const finalKey = value || pendingRangeKey.value;
  if (finalKey) {
    applyRangeSelection(activeRangeTarget.value, finalKey);
  }
  closeRangePicker();
};

let fuelTrendChart: any = null;

const buildTrendOption = () => {
  const years = trendData.value.map((item) => item.year); // ⭐ 新增：每个点对应的年份
  const categories = trendData.value.map((item) => item.day);
  const actualSeries = trendData.value.map((item) => item.value);
  const highSeries = trendData.value.map((item) => item.cityHigh);
  const lowSeries = trendData.value.map((item) => item.cityLow);
  const cityLegendHigh = `${city.value}油耗参考-高位`;
  const cityLegendLow = `${city.value}油耗参考-低位`;
  const allValues = [...actualSeries, ...highSeries, ...lowSeries].filter(
    (v) => typeof v === 'number' && !Number.isNaN(v)
  );

  const yMin =
    allValues.length > 0 ? Math.floor(Math.min(...allValues) - 0.5) : 4;
  const yMax =
    allValues.length > 0 ? Math.ceil(Math.max(...allValues) + 0.5) : 9;

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
        fontSize: 8,
      },
      data: [cityLegendHigh, '油耗', cityLegendLow],
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(28,31,43,0.9)',
      borderWidth: 0,
      textStyle: {
        color: '#fff',
        fontSize: 12,
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#0AB068',
          width: 1,
          type: 'dashed',
        },
      },
    },
    grid: {
      left: 40,
      right: 30,
      top: 40,
      bottom: 60,
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
        margin: 16,
        interval: 0,
        formatter: (value: string, index: number) => {
          const year = years[index];
          const prevYear = index > 0 ? years[index - 1] : null;

          // year 解析失败，就正常显示
          if (!year || Number.isNaN(year)) {
            return value;
          }

          // 第一个点，或者年份发生变化 -> 带上年份前缀：24年10/09
          if (index === 0 || year !== prevYear) {
            const shortYear = String(year).slice(-2);
            return `${shortYear}年${value}`;
          }

          // 同一年 -> 只显示日期：10/09
          return value;
        },
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      // min: 4,
      // max: 9,
      min: yMin,
      max: yMax,
      interval: 1,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#8a93a0',
        fontSize: 12,
        formatter: (value: number) => value.toFixed(1),
      },
      splitLine: {
        lineStyle: { color: '#E1E6EF', type: 'dashed' },
      },
    },
    series: [
      {
        name: cityLegendHigh,
        type: 'line',
        data: highSeries,
        smooth: true,
        showSymbol: true,
        symbolSize: 2,
        lineStyle: { width: 1 },
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
              { offset: 1, color: 'rgba(17,181,97,0)' },
            ],
          },
        },
      },
      {
        name: cityLegendLow,
        type: 'line',
        data: lowSeries,
        smooth: true,
        showSymbol: true,
        symbolSize: 2,
        lineStyle: { width: 1, type: 'dashed', color: '#AEB5C0' },
        itemStyle: { color: '#AEB5C0' },
      },
    ],
  };
};

const initFuelTrendChart = (
  canvas: any,
  width: number,
  height: number,
  dpr: number
) => {
  if (!canvas) {
    return null;
  }
  const chart = echarts.init(canvas, null, {
    width,
    height,
    devicePixelRatio: dpr,
  });
  canvas.setChart?.(chart);
  chart.setOption(buildTrendOption());
  fuelTrendChart = chart;
  return chart;
};

const fuelTrendEc = ref({
  lazyLoad: false,
  onInit: initFuelTrendChart,
});

const refreshFuelTrendChart = () => {
  if (fuelTrendChart) {
    fuelTrendChart.setOption(buildTrendOption(), true);
  }
};

watch(
  trendData,
  () => {
    refreshFuelTrendChart();
  },
  { deep: true }
);

watch(city, () => {
  refreshFuelTrendChart();
});

const handleLoginRequired = () => {
  if (!isLoggedIn.value) {
    showLoginSheet.value = true;
  }
};

/**
 * 统一处理页面跳转或后续功能入口
 * @param actionKey 操作 key
 */
const handleNavigate = (actionKey: string) => {
  uni.showToast({
    title: `功能 ${actionKey} 开发中`,
    icon: 'none',
  });
};

const navigateToCity = () => {
  uni.navigateTo({
    url: `/pages/city/index?currentCity=${encodeURIComponent(city.value)}`,
    events: {
      'city-selected': (
        payload: string | { city: string; province?: string }
      ) => {
        if (!payload) return;
        skipSyncSelectedCityOnce = true;
        if (typeof payload === 'string') {
          applyCity(payload);
        } else if (payload.city) {
          applyCity(payload.city, payload.province);
        }
      },
    },
  });
};

onShow(() => {
  refreshLoginState();
  if (!skipSyncSelectedCityOnce) {
    syncSelectedCity();
  } else {
    skipSyncSelectedCityOnce = false;
  }
  runPageEnterAnimation();

  // 获取用户资料信息和加油记录数据
  fetchProfile();
  fetchRefuelData(statsRange.value.key);
  // 获取趋势数据
  fetchTrendData(trendRange.value.key);
});

onMounted(() => {
  runPageEnterAnimation();
});
onUnmounted(() => {
  fuelTrendChart?.dispose();
  fuelTrendChart = null;
  if (enterAnimationTimer) {
    clearTimeout(enterAnimationTimer);
    enterAnimationTimer = null;
  }
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.home-page {
  // padding: 24rpx 32rpx 120rpx;
  padding: 24rpx 32rpx calc(180rpx + env(safe-area-inset-bottom, 0px));
  padding-top: calc(
    34rpx + var(--status-bar-height, env(safe-area-inset-top, 0px))
  );
  box-sizing: border-box;

  &.home-page--locked {
    height: 100vh;
    overflow: hidden;
  }

  // Shared entry animation for the main hero cards
  .animated-block {
    opacity: 0;
    transform: translate3d(0, 36rpx, 0) scale(0.98);
    transition-property: opacity, transform;
    transition-duration: 0.55s, 0.65s;
    transition-timing-function: ease, cubic-bezier(0.22, 0.61, 0.36, 1);
    will-change: opacity, transform;
  }

  .animated-block--visible {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }

  .animated-block--delay-0 {
    transition-delay: 0ms;
  }

  .animated-block--delay-1 {
    transition-delay: 120ms;
  }

  .animated-block--delay-2 {
    transition-delay: 200ms;
  }

  .animated-block--delay-3 {
    transition-delay: 280ms;
  }

  // Soft animated gradient hero card
  .header-card {
    background: linear-gradient(180deg, #58b1ff 0%, #1ec15f 100%);
    border-radius: 48rpx 48rpx 32rpx 32rpx;
    padding: 48rpx 40rpx;
    color: #fff;
    box-shadow: 0 24rpx 40rpx rgba(24, 160, 88, 0.25);
    margin-bottom: 32rpx;
    position: relative;
    overflow: hidden;
    background-size: 240% 240%;
    animation: heroGradient 10s ease-in-out infinite alternate;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: radial-gradient(
          circle at 20% 20%,
          rgba(255, 255, 255, 0.3),
          transparent 45%
        ),
        radial-gradient(
          circle at 80% 0%,
          rgba(255, 255, 255, 0.2),
          transparent 40%
        );
      opacity: 0.35;
      pointer-events: none;
      mix-blend-mode: screen;
      animation: heroGlow 12s linear infinite;
    }

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
      align-items: center;
      gap: 16rpx;
      margin-bottom: 24rpx;

      .price-swiper {
        height: 64rpx;
        width: 100%;
      }

      .price-item {
        display: flex;
        align-items: baseline;
        gap: 16rpx;
      }

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
}

@keyframes heroGradient {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 100%;
  }
}

@keyframes heroGlow {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.35;
  }
  50% {
    transform: translate3d(-2%, 4%, 0) scale(1.05);
    opacity: 0.5;
  }
  100% {
    transform: translate3d(2%, -3%, 0) scale(1.02);
    opacity: 0.35;
  }
}
</style>
