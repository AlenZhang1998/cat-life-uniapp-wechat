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
            <!-- <text class="iconfont icon-youjiantou"></text> -->
          </view>
        </picker>
        <view class="summary-chip">年度油耗概况</view>
      </view>
      <view class="summary-total">
        <text class="summary-total__value">{{ summaryCard.totalAmount }}</text>
        <text class="summary-total__label">本年总花费</text>
      </view>
      <view class="summary-grid">
        <view class="summary-stat">
          <text class="summary-stat__label">平均油耗</text>
          <text class="summary-stat__value">{{ summaryCard.avgFuel }}</text>
        </view>
        <view class="summary-stat">
          <text class="summary-stat__label">平均油价</text>
          <text class="summary-stat__value">{{ summaryCard.pricePerLiter }}</text>
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
              'record-card--expanded': isExpanded(entry.id)
            }
          ]"
          :style="getListAnimatedStyle(entryIndex)"
          @tap="toggleRecord(entry)"
        >
          <view class="record-card__top">
            <view class="record-date">
              <text class="record-date__value">{{ entry.date }}</text>
            </view>
            <view class="record-consumption" v-if="entry.consumption !== '--'">
              <text class="record-consumption__value">{{
                entry.consumption
              }}</text>
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
                      entry.fillStatusTone === 'accent'
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
            { 'list-animated--visible': isPageAnimated }
          ]"
          :style="getListAnimatedStyle(entryIndex, 'comparison')"
        >
          <!-- 3333-{{ isExpanded(entry.id) }} -->
          <view v-if="entry.consumption !== '--'">
            <view class="comparison-value">{{ entry.pricePerKm ? entry.pricePerKm + '元/公里' : '--' }}</view>
            <view class="comparison-value">{{ entry.fuelConsumption ? entry.fuelConsumption + '升' : '--' }}</view>
            <view class="comparison-value">{{ entry.deltaMileage ? entry.deltaMileage + '公里' : '--' }}</view>
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
import { onShow } from '@dcloudio/uni-app'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import BottomActionBar from '@/components/BottomActionBar.vue'
import LoginOverlay from '@/components/LoginOverlay.vue'
import { useAuth } from '@/utils/auth'
import { axios } from '@/utils/request'

type FuelRecordItem = {
  type: 'record'
  id: string
  date: string
  week?: string
  consumption: string
  mileage: string
  amount?: string
  pricePerLiter?: string
  deltaFuel?: string
  oilType?: string
  fillStatus?: string
  fillStatusTone?: 'danger' | 'accent'
  compact?: boolean
  highlight?: 'danger'
  fuelConsumption?: string
  deltaMileage?: string
  pricePerKm?: string
}

type ComparisonItem = {
  type: 'comparison'
  id: string
  pricePerKm: string
  deltaFuel: string
  deltaMileage: string
  tone?: 'success'
}

type FuelRecord = FuelRecordItem | ComparisonItem

type SummarySnapshot = {
  totalAmount: string
  avgFuel: string
  pricePerLiter: string
  mileage: string
}

const { isLoggedIn, refreshLoginState } = useAuth()
const showLoginSheet = ref(false)

const yearOptions = ['2025', '2024', '2023']
const selectedYearIndex = ref(0)

const summaryCard = ref<SummarySnapshot>({
  totalAmount: '--',
  avgFuel: '--',
  pricePerLiter: '--',
  mileage: '--'
})

const records = ref<FuelRecordItem[]>([])

const visibleRecords = computed(() => records.value)

const currentYear = computed(
  () => yearOptions[selectedYearIndex.value] || yearOptions[0]
)

const isPageAnimated = ref(false)
let enterAnimationTimer: ReturnType<typeof setTimeout> | null = null

const runPageEnterAnimation = () => {
  if (enterAnimationTimer) {
    clearTimeout(enterAnimationTimer)
    enterAnimationTimer = null
  }
  isPageAnimated.value = false
  enterAnimationTimer = setTimeout(() => {
    isPageAnimated.value = true
  }, 40)
}

const getListAnimatedStyle = (
  index: number,
  variant: 'card' | 'comparison' = 'card'
) => {
  const limitedIndex = Math.min(index, 6)
  const baseOffset = variant === 'comparison' ? 140 : 60
  return {
    '--list-delay': `${limitedIndex * 70 + baseOffset}ms`
  }
}

const handleYearChange = (event: { detail: { value: number } }) => {
  selectedYearIndex.value = Number(event.detail.value)
}

const isRecordItem = (entry: FuelRecord): entry is FuelRecordItem =>
  entry.type === 'record'

const expandedRecordMap = ref<Record<string, boolean>>({})

const isExpanded = (id: string) => Boolean(expandedRecordMap.value[id])

const toggleRecord = (entry: FuelRecordItem) => {
  const next = {
    ...expandedRecordMap.value,
    [entry.id]: !expandedRecordMap.value[entry.id]
  }
  expandedRecordMap.value = next
}

const recomputeConsumptionFromFullTanks = () => {
  if (!records.value.length) return

  // 先全部重置为 '--'
  records.value.forEach((item) => {
    if (item.type === 'record') {
      item.consumption = '--'
    }
  })

  // 按时间正序处理：复制一份反转数组（对象引用仍然是同一个）
  const asc = [...records.value].reverse() as FuelRecordItem[]

  // 记录上一段“起始加满”的下标（正序下标）
  let lastFullIndex: number | null = null

  for (let i = 0; i < asc.length; i++) {
    const item = asc[i]
    if (item.type !== 'record') continue

    const isFull = item.fillStatus === '加满'
    if (!isFull) continue

    // 第一次遇到“加满”，只是记起点，不计算
    if (lastFullIndex === null) {
      lastFullIndex = i
      continue
    }

    // 这里是第二次(及之后)遇到“加满”，形成一个区间 [lastFullIndex, i]
    const start = asc[lastFullIndex] // 比如 10/01
    const end = item                 // 比如 10/09

    const startOdo = Number(start.mileage)
    const endOdo = Number(end.mileage)

    // 里程必须合法且递增
    if (
      !Number.isFinite(startOdo) ||
      !Number.isFinite(endOdo) ||
      endOdo <= startOdo
    ) {
      lastFullIndex = i
      continue
    }

    // 区间内油量：**从起点之后一条开始，到终点这一条**（不含起点加满）
    let fuelSum = 0
    for (let j = lastFullIndex + 1; j <= i; j++) {
      const vStr = asc[j].deltaFuel // 形如 "+28.94"
      if (!vStr) continue
      const v = Number(vStr)
      if (!Number.isFinite(v)) continue
      fuelSum += Math.abs(v)
    }

    if (fuelSum <= 0) {
      lastFullIndex = i
      continue
    }

    const distance = endOdo - startOdo
    if (distance <= 0) {
      lastFullIndex = i
      continue
    }

    // 平均油耗（升/百公里）——你界面写的是“升/百公里”，所以这里 * 100
    const lPer100km = (fuelSum / distance) * 100
    const display = lPer100km.toFixed(2)

    // ✅ 只给「起点之后到终点」这几条记录赋值（例如 10/02 + 10/09）
    for (let j = lastFullIndex + 1; j <= i; j++) {
      asc[j].consumption = display
    }
    // 起点那条（10/01）保持 '--'

    // 下一段的起点变成当前这个满油点
    lastFullIndex = i
  }

  // 计算并更新 avgFuelConsumption
  calculateAvgFuelConsumption()
}

// 在 `fetchRecords` 中调用 `processRecords`
const fetchRecords = async () => {
  if (!isLoggedIn.value) {
    records.value = [];
    summaryCard.value = {
      totalAmount: '--',
      avgFuel: '--',
      pricePerLiter: '--',
      mileage: '--'
    };
    return;
  }

  try {
    uni.showLoading({ title: '加载中...', mask: true });

    const res = await axios.get('/api/refuels/list?year=' + currentYear.value);
    console.log(503, res);

    if (!res || res.success !== true) {
      throw new Error('接口返回异常');
    }

    const payload = res.data || {};
    const s = payload.summary || {};
    const list = (payload.records || []) as any[];

    // 顶部 summary 卡片
    summaryCard.value = {
      totalAmount:
        s.totalAmount != null ? Number(s.totalAmount).toFixed(2) : '--',
      avgFuel:
        '--',
      pricePerLiter:
        s.avgPricePerL != null ? Number(s.avgPricePerL).toFixed(2) : '--',
      mileage:
      s.coverageDistance != null ? String(Math.round(Number(s.coverageDistance))) : '--'
    };

    // 列表项映射到你现有的结构
    records.value = list.map((r): FuelRecordItem => {
    const distanceNum = r.distance != null ? Number(r.distance) : NaN
    const volumeNum = r.volume != null ? Number(r.volume) : NaN
    const odometerNum = r.odometer != null ? Number(r.odometer) : NaN

    return {
      type: 'record',
      id: r._id,
      date: r.monthDay || '--',
      consumption: '--', // 这里先统一 '--'，后面用 full-tank 方法重算
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
        r.pricePerKm != null ? Number(r.pricePerKm).toFixed(2) : undefined
    }
  })

  // 🔥 这里调用刚刚那一坨逻辑
  recomputeConsumptionFromFullTanks()

  } catch (err) {
    console.error('fetchRecords error:', err);
    uni.showToast({
      title: '加载失败，请稍后再试',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};

// 新方法：计算 `avgFuelConsumption`
const calculateAvgFuelConsumption = () => {
  const validRecords = records.value.filter(item => item.consumption !== '--')
  if (validRecords.length === 0) {
    summaryCard.value.avgFuel = '--'
    return
  }

  // 计算 `consumption` 的平均值
  const totalConsumption = validRecords.reduce((sum, item) => {
    return sum + (Number(item.consumption) || 0)
  }, 0)

  const avgConsumption = totalConsumption / validRecords.length
  summaryCard.value.avgFuel = avgConsumption.toFixed(2)
}
const handleLoginRequired = () => {
  if (!isLoggedIn.value) {
    showLoginSheet.value = true
  }
}

// 编辑记录
const handleEdit = (entry: FuelRecordItem) => {
  handleLoginRequired()
  
  console.log(590, 'handleEdit', entry)
  uni.navigateTo({
    url: `/pages/add/index?id=${entry.id}`
  })
}

// 切换年份时，重置展开状态
watch(currentYear, () => {
  expandedRecordMap.value = {}
  runPageEnterAnimation()
  fetchRecords()
})

onShow(() => {
  refreshLoginState()
  runPageEnterAnimation()
  fetchRecords()
})

// 只做动画就行，不必再拉数据
onMounted(() => {
  runPageEnterAnimation()
})

onUnmounted(() => {
  if (enterAnimationTimer) {
    clearTimeout(enterAnimationTimer)
    enterAnimationTimer = null
  }
})
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
    transition: opacity 0.45s ease, transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
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
      background: radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.7), transparent 45%),
        radial-gradient(circle at 100% 20%, rgba(255, 255, 255, 0.35), transparent 40%);
      opacity: 0.65;
      mix-blend-mode: screen;
      animation: summaryGlow 12s ease-in-out infinite alternate;
    }

    &::after {
      background: linear-gradient(120deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.5) 45%, rgba(255, 255, 255, 0) 80%);
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
        background: linear-gradient(135deg, rgba(64, 160, 255, 0.08), rgba(30, 193, 95, 0.12));
        opacity: 0;
        transition: opacity 0.35s ease;
      }

      &::after {
        inset: -60% -30% auto -30%;
        height: 140rpx;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0));
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
          }center

          .record-date__week {
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
            color: #d44848;
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
        color: #e64a3b;
      }
    }

    .comparison-card {
      background: #f5fbf6;
      border-radius: 28rpx;
      padding: 26rpx;
      display: flex;
      align-items: center;
      gap: 16rpx;
      border: 2rpx solid rgba(30, 193, 95, 0.1);
      position: relative;
      overflow: hidden;
      transition: box-shadow 0.3s ease;

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
        animation: comparisonSweep 6s linear infinite;
        opacity: 0.6;
        pointer-events: none;
      }

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
