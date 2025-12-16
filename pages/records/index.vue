<template>
  <view class="records-page">
    <view
      class="summary-panel animated-block animated-block--delay-0"
      :class="{ 'animated-block--visible': isPageAnimated }"
    >
      <!-- <view class="summary-panel__bg summary-panel__bg--left"></view>
      <view class="summary-panel__bg summary-panel__bg--right"></view> -->
      <view class="summary-head">
        <picker
          class="summary-picker"
          mode="selector"
          :range="yearOptions"
          :value="selectedYearIndex"
          @change="handleYearChange"
        >
          <view class="summary-year">
            <text>{{ currentYear }}</text>
            <text class="iconfont icon-youjiantou"></text>
          </view>
        </picker>
        <view class="summary-chip">
          {{ currentYear === '全部' ? '油耗概况' : '年度油耗概况' }}
        </view>
      </view>

      <view class="summary-total">
        <text class="summary-total__value">{{ summaryCard.totalAmount }}</text>
        <text class="summary-total__label">
          {{ currentYear === '全部' ? '总花费' : '本年总花费' }}
        </text>
      </view>
      <view class="summary-grid">
        <view class="summary-stat">
          <text class="summary-stat__label">平均油耗</text>
          <text class="summary-stat__value">{{ summaryCard.avgFuel }}</text>
        </view>
        <view class="summary-stat">
          <text class="summary-stat__label">平均油价</text>
          <text class="summary-stat__value">{{
            summaryCard.pricePerLiter
          }}</text>
        </view>
        <view class="summary-stat">
          <text class="summary-stat__label">总里程</text>
          <text class="summary-stat__value">{{ summaryCard.mileage }}</text>
        </view>
      </view>
    </view>

    <view class="records-list">
      <template v-for="(entry, entryIndex) in visibleRecords" :key="entry.id">
        <view
          v-if="isRecordItem(entry)"
          hover-class="record-card__hover"
          :class="[
            'record-card',
            'list-animated',
            { 'list-animated--visible': isPageAnimated },
            {
              'record-card--compact': entry.compact,
              'record-card--alert': entry.highlight === 'danger',
              'record-card--expanded': isExpanded(entry.id),
            },
          ]"
          :style="getListAnimatedStyle(entryIndex)"
          @tap="toggleRecord(entry)"
        >
          <view class="record-card__top">
            <view class="record-date">
              <text class="record-date__value">{{ entry.date }}</text>
            </view>
            <view class="record-consumption" v-if="entry.consumption !== '--'">
              <text
                class="record-consumption__value"
                :class="{
                  'record-consumption__value--high':
                    Number(entry.consumption) > 9,
                }"
              >
                {{ entry.consumption }}
              </text>
              <text class="record-consumption__unit">升/百公里</text>
            </view>
            <view class="record-mileage">
              <text class="record-mileage__value">{{ entry.mileage }}</text>
              <text class="record-mileage__unit">公里</text>
            </view>
            <text
              class="record-arrow iconfont icon-youjiantou"
              :class="{ 'record-arrow--expanded': isExpanded(entry.id) }"
            ></text>
          </view>

          <view class="record-details" v-show="isExpanded(entry.id)">
            <!-- 2222-{{ isExpanded(entry.id) }} -->
            <view class="record-meta">
              <text class="record-meta__value">{{
                entry.amount ? entry.amount + '元' : '--'
              }}</text>
              <text class="record-meta__value">{{
                entry.pricePerLiter ? entry.pricePerLiter + '元/升' : '--'
              }}</text>
              <text class="record-meta__value">{{
                entry.deltaFuel ? entry.deltaFuel + '升' : '--'
              }}</text>
            </view>
            <view class="record-remark">
              <text class="record-remark__text">
                <text class="record-remark__oil">{{
                  entry.oilType || '--'
                }}</text>
                <text
                  v-if="entry.fillStatus"
                  class="record-remark__status"
                  :class="{
                    'record-remark__status--danger':
                      entry.fillStatusTone === 'danger',
                    'record-remark__status--accent':
                      entry.fillStatusTone === 'accent',
                  }"
                >
                  {{ entry.fillStatus }}
                </text>
              </text>
              <view class="record-edit" @tap.stop="handleEdit(entry)">✎</view>
            </view>
          </view>
        </view>

        <view
          v-if="isRecordItem(entry) && isExpanded(entry.id)"
          :class="[
            'comparison-card',
            'comparison-card--success',
            'list-animated',
            { 'list-animated--visible': isPageAnimated },
          ]"
          :style="getListAnimatedStyle(entryIndex, 'comparison')"
        >
          <!-- 3333-{{ isExpanded(entry.id) }} -->
          <view v-if="entry.consumption !== '--'" class="comparison-value-box">
            <view class="comparison-value">{{
              entry.pricePerKm ? entry.pricePerKm + '元/公里' : '--'
            }}</view>
            <view class="comparison-value">{{
              entry.fuelConsumption ? entry.fuelConsumption + '升' : '--'
            }}</view>
            <view class="comparison-value">{{
              entry.deltaMileage ? entry.deltaMileage + '公里' : '--'
            }}</view>
            <text class="comparison-arrow iconfont icon-xiangyou"></text>
          </view>
          <view v-else>
            <text>需要加满两次，才能算出油耗</text>
          </view>
        </view>
      </template>
    </view>
  </view>
  <LoginOverlay v-model:visible="showLoginSheet" />
  <BottomActionBar
    active="list"
    :is-logged-in="isLoggedIn"
    @login-required="handleLoginRequired"
  />
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import BottomActionBar from '@/components/BottomActionBar.vue';
import LoginOverlay from '@/components/LoginOverlay.vue';
import { useAuth } from '@/utils/auth';
import { axios } from '@/utils/request';

type FuelRecordItem = {
  type: 'record';
  id: string;
  date: string;
  week?: string;
  consumption: string;
  mileage: string;
  amount?: string;
  pricePerLiter?: string;
  deltaFuel?: string;
  oilType?: string;
  fillStatus?: string;
  fillStatusTone?: 'danger' | 'accent';
  compact?: boolean;
  highlight?: 'danger';
  fuelConsumption?: string;
  deltaMileage?: string;
  pricePerKm?: string;
};

type ComparisonItem = {
  type: 'comparison';
  id: string;
  pricePerKm: string;
  deltaFuel: string;
  deltaMileage: string;
  tone?: 'success';
};

type FuelRecord = FuelRecordItem | ComparisonItem;

type SummarySnapshot = {
  totalAmount: string;
  avgFuel: string;
  pricePerLiter: string;
  mileage: string;
};

const { isLoggedIn, refreshLoginState } = useAuth();
const showLoginSheet = ref(false);

// ===== 年份筛选：默认“全部”，后端用 range=all =====
const yearOptions = ['全部', '2025', '2024', '2023'];
const selectedYearIndex = ref(0); // 默认选中“全部”

// picker 显示的文字
const currentYear = computed(
  () => yearOptions[selectedYearIndex.value] || '全部'
);

// 是否选中了“全部”
const isAllYear = computed(() => currentYear.value === '全部');

const summaryCard = ref<SummarySnapshot>({
  totalAmount: '--',
  avgFuel: '--',
  pricePerLiter: '--',
  mileage: '--',
});

const records = ref<FuelRecordItem[]>([]);

const visibleRecords = computed(() => records.value);

const isPageAnimated = ref(false);
let enterAnimationTimer: ReturnType<typeof setTimeout> | null = null;

const runPageEnterAnimation = () => {
  if (enterAnimationTimer) {
    clearTimeout(enterAnimationTimer);
    enterAnimationTimer = null;
  }
  isPageAnimated.value = false;
  enterAnimationTimer = setTimeout(() => {
    isPageAnimated.value = true;
  }, 40);
};

const getListAnimatedStyle = (
  index: number,
  variant: 'card' | 'comparison' = 'card'
) => {
  const limitedIndex = Math.min(index, 6);
  const baseOffset = variant === 'comparison' ? 140 : 60;
  return {
    '--list-delay': `${limitedIndex * 70 + baseOffset}ms`,
  };
};

// picker 改变年份
const handleYearChange = (event: { detail: { value: number } }) => {
  selectedYearIndex.value = Number(event.detail.value);
};

const isRecordItem = (entry: FuelRecord): entry is FuelRecordItem =>
  entry.type === 'record';

const expandedRecordMap = ref<Record<string, boolean>>({});

const isExpanded = (id: string) => Boolean(expandedRecordMap.value[id]);

const toggleRecord = (entry: FuelRecordItem) => {
  const next = {
    ...expandedRecordMap.value,
    [entry.id]: !expandedRecordMap.value[entry.id],
  };
  expandedRecordMap.value = next;
};

// ================== 核心：请求列表 ==================
const fetchRecords = async () => {
  if (!isLoggedIn.value) {
    records.value = [];
    summaryCard.value = {
      totalAmount: '--',
      avgFuel: '--',
      pricePerLiter: '--',
      mileage: '--',
    };
    return;
  }

  try {
    uni.showLoading({ title: '加载中...', mask: true });

    // 前端筛选，接口始终取全部
    const res = await axios.get(`/api/refuels/list?range=all`);

    if (!res || res.success !== true) {
      throw new Error('接口返回异常');
    }

    const payload = res.data || {};
    const list = (payload.records || []) as any[];
    const currentYearNum = new Date().getFullYear();
    const targetYearNum = Number(currentYear.value);

    // 前端按年份过滤
    const filteredList = list.filter((item) => {
      if (isAllYear.value) return true;
      const dateStr = item.date || item.refuelDate;
      if (!dateStr) return false;
      const parsed = new Date(String(dateStr).replace(/-/g, '/'));
      if (Number.isNaN(parsed.getTime())) return false;
      return parsed.getFullYear() === targetYearNum;
    });

    // 顶部 summary：基于筛选后的列表
    const totalAmountNum = filteredList.reduce((sum, item) => {
      const val = Number(item.amount);
      return sum + (Number.isFinite(val) ? val : 0);
    }, 0);

    // ===== 平均油耗 avgFuel 计算 =====
    let avgFuelNum: number | null = null;

    if (isAllYear.value) {
      // 「全部」：按你的新规则
      // 列表是「最新在前」，所以索引越小越新，越大越旧
      const consumptionIndexes: number[] = [];

      filteredList.forEach((item, idx) => {
        const c = item.consumption;
        if (c === '--' || c == null) return;
        const num = Number(c);
        if (!Number.isFinite(num)) return;
        consumptionIndexes.push(idx);
      });

      if (consumptionIndexes.length >= 2) {
        // 第一条 & 最后一条（按当前列表顺序：最新在前）
        const firstIdx = Math.min(...consumptionIndexes); // 列表中最靠前（最新）的那条
        const lastIdx = Math.max(...consumptionIndexes); // 列表中最靠后（最旧）的那条

        // 「最后一条 consumption 有值的下一条记录」
        const nextIdx =
          lastIdx + 1 < filteredList.length ? lastIdx + 1 : lastIdx;

        const first = filteredList[firstIdx];
        const nextAfterLast = filteredList[nextIdx];

        const firstOdo = Number(first.odometer);
        const nextOdo = Number(nextAfterLast.odometer);

        let distance = NaN;
        if (Number.isFinite(firstOdo) && Number.isFinite(nextOdo)) {
          // 根据你的例子：1587 - 10
          distance = firstOdo - nextOdo;
        }

        // 分子：从 firstIdx 到 lastIdx 之间（含）的 volume 之和
        let volumeSum = 0;
        for (let i = firstIdx; i <= lastIdx; i++) {
          const v = Number(filteredList[i].volume);
          if (Number.isFinite(v) && v > 0) {
            volumeSum += v;
          }
        }

        if (distance > 0 && volumeSum > 0) {
          // L / 100km
          avgFuelNum = (volumeSum / distance) * 100;
        } else {
          avgFuelNum = null;
        }
      } else {
        // 有效 consumption 少于 2 条，没法算这种「区间油耗」
        avgFuelNum = null;
      }
    } else {
      // 非「全部」：按「consumption 求平均」来算
      const consumptionValues = filteredList
        .map((item) => item.consumption)
        .filter((val) => val !== null && val !== '--')
        .map((val) => Number(val))
        .filter((val) => Number.isFinite(val));

      if (consumptionValues.length > 0) {
        const sum = consumptionValues.reduce((s, v) => s + v, 0);
        avgFuelNum = sum / consumptionValues.length;
      } else {
        avgFuelNum = null;
      }
    }

    // 平均油价 & 总里程仍按原来的方式
    const pricePerLValues = filteredList
      .map((item) => Number(item.pricePerL))
      .filter((val) => Number.isFinite(val));
    const avgPricePerLNum =
      pricePerLValues.length > 0
        ? pricePerLValues.reduce((s, v) => s + v, 0) / pricePerLValues.length
        : null;

    const totalDistanceNum = filteredList.reduce((sum, item) => {
      const val = Number(item.distance);
      return sum + (Number.isFinite(val) ? val : 0);
    }, 0);

    summaryCard.value = {
      totalAmount: totalAmountNum > 0 ? totalAmountNum.toFixed(2) : '--',
      avgFuel: avgFuelNum != null ? avgFuelNum.toFixed(2) : '--',
      pricePerLiter:
        avgPricePerLNum != null ? Number(avgPricePerLNum).toFixed(2) : '--',
      mileage:
        totalDistanceNum > 0 ? String(Math.round(totalDistanceNum)) : '--',
    };

    // 列表项映射到你现有的结构
    records.value = filteredList.map((r): FuelRecordItem => {
      const distanceNum = r.distance != null ? Number(r.distance) : NaN;
      const volumeNum = r.volume != null ? Number(r.volume) : NaN;
      const odometerNum = r.odometer != null ? Number(r.odometer) : NaN;
      const rawDateStr = r.date || r.refuelDate || '';
      let displayDate = r.monthDay || '--';
      if (rawDateStr) {
        const parsed = new Date(String(rawDateStr).replace(/-/g, '/'));
        if (!Number.isNaN(parsed.getTime())) {
          const y = parsed.getFullYear();
          const m = String(parsed.getMonth() + 1).padStart(2, '0');
          const d = String(parsed.getDate()).padStart(2, '0');
          if (isAllYear.value && y !== currentYearNum) {
            displayDate = `${y}/${m}/${d}`;
          } else if (!r.monthDay) {
            displayDate = `${m}-${d}`;
          }
        }
      }

      return {
        type: 'record',
        id: r._id,
        date: displayDate,
        consumption:
          r.consumption != null ? Number(r.consumption).toFixed(2) : '--',
        mileage: !Number.isNaN(odometerNum)
          ? String(Math.round(odometerNum))
          : '--',
        amount: r.amount != null ? Number(r.amount).toFixed(2) : undefined,
        pricePerLiter:
          r.pricePerL != null ? Number(r.pricePerL).toFixed(2) : undefined,
        deltaFuel: !Number.isNaN(volumeNum)
          ? `+${volumeNum.toFixed(2)}`
          : undefined,
        oilType: r.fuelGrade ? `${r.fuelGrade}汽油` : undefined,
        fillStatus: r.isFullTank ? '加满' : '',
        fillStatusTone: r.isFullTank ? 'danger' : undefined,
        compact: true,
        highlight: undefined,
        fuelConsumption: !Number.isNaN(volumeNum)
          ? `-${volumeNum.toFixed(2)}`
          : undefined,
        deltaMileage: !Number.isNaN(distanceNum)
          ? `+${Math.round(distanceNum)}`
          : undefined,
        pricePerKm:
          r.pricePerKm != null ? Number(r.pricePerKm).toFixed(2) : undefined,
      };
    });
  } catch (err) {
    console.error('fetchRecords error:', err);
    uni.showToast({
      title: '加载失败，请稍后再试',
      icon: 'none',
    });
  } finally {
    uni.hideLoading();
  }
};

const handleLoginRequired = () => {
  if (!isLoggedIn.value) {
    showLoginSheet.value = true;
  }
};

// 编辑记录
const handleEdit = (entry: FuelRecordItem) => {
  handleLoginRequired();

  uni.navigateTo({
    url: `/pages/add/index?id=${entry.id}`,
  });
};

// 切换年份时，重置展开状态 + 重新拉数据
watch(currentYear, () => {
  expandedRecordMap.value = {};
  runPageEnterAnimation();
  fetchRecords();
});

onShow(() => {
  refreshLoginState();
  runPageEnterAnimation();
  fetchRecords();
});

// 只做动画就行，不必再拉数据
onMounted(() => {
  runPageEnterAnimation();
});

onUnmounted(() => {
  if (enterAnimationTimer) {
    clearTimeout(enterAnimationTimer);
    enterAnimationTimer = null;
  }
});
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.records-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fbff 0%, #f2f4f9 100%);
  padding: 24rpx 32rpx 180rpx;

  .animated-block {
    opacity: 0;
    transform: translate3d(0, 40rpx, 0) scale(0.98);
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
    transition-delay: 80ms;
  }

  .list-animated {
    opacity: 0;
    transform: translate3d(0, 32rpx, 0);
    transition: opacity 0.45s ease,
      transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
    transition-delay: var(--list-delay, 0ms);
    will-change: opacity, transform;
  }

  .list-animated--visible {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }

  .summary-panel {
    position: relative;
    overflow: hidden;
    padding: 32rpx;
    margin-bottom: 32rpx;
    border-radius: 32rpx;
    // background: linear-gradient(110deg, #cde6ff, #dfeeff 70%);
    background: linear-gradient(135deg, #ede6ff 0%, #f4f1ff 55%, #e9fdf2 100%);
    box-shadow: 0 20rpx 40rpx rgba(0, 83, 156, 0.1);

    &::before,
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    &::before {
      background: radial-gradient(
          circle at 0% 0%,
          rgba(255, 255, 255, 0.7),
          transparent 45%
        ),
        radial-gradient(
          circle at 100% 20%,
          rgba(255, 255, 255, 0.35),
          transparent 40%
        );
      opacity: 0.65;
      mix-blend-mode: screen;
      animation: summaryGlow 12s ease-in-out infinite alternate;
    }

    &::after {
      background: linear-gradient(
        120deg,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, 0.5) 45%,
        rgba(255, 255, 255, 0) 80%
      );
      transform: translateX(-60%);
      animation: summarySweep 6s linear infinite;
      opacity: 0.4;
    }

    .summary-panel__bg {
      position: absolute;
      width: 200rpx;
      height: 200rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      filter: blur(0.5px);
    }

    .summary-panel__bg--left {
      top: -40rpx;
      left: -40rpx;
    }

    .summary-panel__bg--right {
      bottom: -60rpx;
      right: -20rpx;
    }

    .summary-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;
      position: relative;
      z-index: 1;
    }

    .summary-picker {
      // width: 260rpx;
    }

    .summary-year {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      padding: 10rpx 18rpx;
      border-radius: 30rpx;
      border: 2rpx solid rgba(255, 255, 255, 0.6);
      color: #1f2329;
      font-size: 26rpx;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.6);

      .icon-youjiantou {
        font-size: 18rpx;
        transform: rotate(90deg);
        margin-top: 6rpx;
      }
    }

    .summary-chip {
      padding: 10rpx 20rpx;
      border-radius: 30rpx;
      font-size: 24rpx;
      color: #1f2329;
      background: rgba(255, 255, 255, 0.7);
    }

    .summary-total {
      position: relative;
      z-index: 1;
      margin-bottom: 28rpx;

      .summary-total__value {
        font-size: 48rpx;
        font-weight: 700;
      }

      .summary-total__label {
        display: block;
        font-size: 24rpx;
        color: rgba(10, 41, 90, 0.7);
      }
    }

    .summary-grid {
      display: flex;
      justify-content: space-between;
      position: relative;
      z-index: 1;

      .summary-stat {
        flex: 1;
        color: #1f2329;

        .summary-stat__label {
          display: block;
          font-size: 24rpx;
          opacity: 0.8;
        }

        .summary-stat__value {
          display: block;
          font-size: 28rpx;
          font-weight: 600;
        }
      }

      .summary-stat:not(:last-child) {
        border-right: 2rpx solid rgba(255, 255, 255, 0.4);
        margin-right: 16rpx;
        padding-right: 16rpx;
      }
    }
  }

  .records-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;

    .record-card {
      background: #fff;
      border-radius: 28rpx;
      padding: 28rpx;
      box-shadow: 0 12rpx 30rpx rgba(15, 114, 59, 0.08);
      transition: box-shadow 0.35s ease, transform 0.35s ease;
      position: relative;
      overflow: hidden;
      border: 1rpx solid rgba(15, 114, 59, 0.1);

      &::before,
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        border-radius: inherit;
      }

      &::before {
        background: linear-gradient(
          135deg,
          rgba(64, 160, 255, 0.08),
          rgba(30, 193, 95, 0.12)
        );
        opacity: 0;
        transition: opacity 0.35s ease;
      }

      &::after {
        inset: -60% -30% auto -30%;
        height: 140rpx;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0),
          rgba(255, 255, 255, 0.55),
          rgba(255, 255, 255, 0)
        );
        transform: translate3d(0, -50%, 0) rotate(-8deg);
        animation: cardShimmer 7s linear infinite;
        opacity: 0.2;
      }

      .record-card__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        // gap: 24rpx;

        .record-date {
          flex: 1;
          position: relative;
          padding-left: 20rpx;

          .record-date__value {
            font-size: 32rpx;
            // font-weight: 700;
          }
          center .record-date__week {
            display: block;
            font-size: 22rpx;
            color: $muted-text;
          }
        }

        .record-date::before {
          content: '';
          position: absolute;
          left: 0;
          top: 8rpx;
          width: 6rpx;
          height: 32rpx;
          border-radius: 4rpx;
          background: linear-gradient(180deg, #00a3ff, #4bc9ff);
        }

        .record-consumption {
          flex: 1;
          // display: flex;
          // align-items: flex-end;
          gap: 12rpx;

          .record-consumption__value {
            font-size: 40rpx;
            font-weight: 600;
            color: $primary-dark;
          }
          .record-consumption__value--high {
            color: #ff4b46;
          }

          .record-consumption__unit {
            font-size: 22rpx;
            color: $muted-text;
          }
        }

        .record-mileage {
          // flex: 1;
          margin-left: 30rpx;
          // text-align: right;

          .record-mileage__value {
            font-size: 40rpx;
            font-weight: 600;
          }

          .record-mileage__unit {
            // display: block;
            margin-left: 12rpx;
            font-size: 22rpx;
            color: $muted-text;
          }
        }

        .record-arrow {
          font-size: 20rpx;
          color: $muted-text;
          padding-left: 12rpx;
          display: inline-block;
          transition: transform 0.2s ease;
          margin-top: 16rpx;
          transform-origin: center;
        }

        .record-arrow--expanded {
          transform: rotate(90deg);
          margin-top: 0;
        }
      }

      .record-details {
        margin-top: 20rpx;
        padding: 24rpx;
        border-radius: 20rpx;
        background: #fff;
        border: 2rpx solid rgba(31, 35, 41, 0.06);

        .record-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20rpx;
          gap: 12rpx;

          .record-meta__value {
            flex: 1;
            text-align: left;
            font-size: 26rpx;
            font-weight: 600;
            color: #1f2329;
            white-space: nowrap;
          }
        }

        .record-remark {
          margin-top: 8rpx;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;

          .record-remark__text {
            font-size: 26rpx;
            color: #1f2329;
            display: flex;
            align-items: center;
            gap: 12rpx;
          }

          .record-remark__oil {
            font-weight: 600;
            color: #1f2329;
          }

          .record-remark__status {
            font-weight: 600;
            margin-left: 12rpx;
          }

          .record-remark__status--danger {
            color: #ff4b46;
          }

          .record-remark__status--accent {
            color: $primary-dark;
          }

          .record-edit {
            width: 44rpx;
            height: 44rpx;
            border-radius: 14rpx;
            background: rgba(30, 193, 95, 0.12);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28rpx;
            color: #1ec15f;
            font-weight: 600;
            align-self: flex-end;
          }
        }
      }
    }

    .record-card--compact {
      padding: 24rpx;
    }

    .record-card--expanded {
      transform: translateY(-6rpx);
      box-shadow: 0 18rpx 46rpx rgba(13, 102, 53, 0.18);

      &::before {
        opacity: 1;
      }
    }

    .record-card__hover {
      background: #fefefe;
    }

    .record-card--alert {
      .record-consumption__value {
        color: #ff4b46;
      }
      .record-consumption__value--high {
        color: #ff4b46;
      }
    }

    .comparison-card {
      background: #f5fbf6;
      border-radius: 28rpx;
      padding: 26rpx;

      border: 2rpx solid rgba(30, 193, 95, 0.1);
      position: relative;
      overflow: hidden;
      transition: box-shadow 0.3s ease;

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0)
        );
        animation: comparisonSweep 6s linear infinite;
        opacity: 0.6;
        pointer-events: none;
      }
      .comparison-value-box {
        display: flex;
        align-items: center;
        gap: 16rpx;
        .comparison-value {
          flex: 1;
          font-size: 28rpx;
          font-weight: 600;
          color: #1f2329;
          text-align: center;
        }

        .comparison-arrow {
          font-size: 26rpx;
          color: $muted-text;
        }
      }
    }

    .comparison-card--success {
      background: rgba(30, 193, 95, 0.12);
      border-color: rgba(30, 193, 95, 0.3);
      box-shadow: 0 18rpx 36rpx rgba(30, 193, 95, 0.18);
    }
  }
}

@keyframes summaryGlow {
  0% {
    transform: scale(1);
    opacity: 0.4;
  }
  100% {
    transform: scale(1.04);
    opacity: 0.7;
  }
}

@keyframes summarySweep {
  0% {
    transform: translateX(-80%);
  }
  100% {
    transform: translateX(120%);
  }
}

@keyframes cardShimmer {
  0% {
    transform: translate3d(-20%, -50%, 0) rotate(-8deg);
    opacity: 0;
  }
  40% {
    opacity: 0.25;
  }
  100% {
    transform: translate3d(140%, -50%, 0) rotate(-8deg);
    opacity: 0;
  }
}

@keyframes comparisonSweep {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(120%);
  }
}
</style>
