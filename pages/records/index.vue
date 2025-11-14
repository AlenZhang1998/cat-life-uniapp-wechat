<template>
  <view class="records-page">
    <view class="summary-panel">
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
            <text class="summary-year__arrow">⌄</text>
          </view>
        </picker>
        <view class="summary-chip">年度油耗概览</view>
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
          <text class="summary-stat__label">平均单价</text>
          <text class="summary-stat__value">{{ summaryCard.pricePerLiter }}</text>
        </view>
        <view class="summary-stat">
          <text class="summary-stat__label">累计里程</text>
          <text class="summary-stat__value">{{ summaryCard.mileage }}</text>
        </view>
      </view>
    </view>

    <view class="records-list">
      <template v-for="entry in visibleRecords" :key="entry.id">
        <view
          v-if="isRecordItem(entry)"
          class="record-card"
          :class="{
            'record-card--compact': entry.compact,
            'record-card--alert': entry.highlight === 'danger'
          }"
        >
          <view class="record-card__top">
            <view class="record-date">
              <text class="record-date__value">{{ entry.date }}</text>
              <text v-if="entry.week" class="record-date__week">
                {{ entry.week }}
              </text>
            </view>
            <view class="record-consumption">
              <text class="record-consumption__value">{{
                entry.consumption
              }}</text>
              <text class="record-consumption__unit">升/百公里</text>
            </view>
            <view class="record-mileage">
              <text class="record-mileage__value">{{ entry.mileage }}</text>
              <text class="record-mileage__unit">公里</text>
            </view>
            <text class="record-arrow">›</text>
          </view>
          <view class="record-meta" v-if="entry.meta">
            <view
              class="record-meta__item"
              v-for="meta in entry.meta"
              :key="meta.value + meta.caption"
            >
              <text class="record-meta__value">{{ meta.value }}</text>
              <text class="record-meta__label">{{ meta.caption }}</text>
            </view>
          </view>
          <view
            class="record-remark"
            v-if="entry.remark || entry.showEdit"
          >
            <text
              v-if="entry.remark"
              class="record-remark__text"
              :class="{
                'record-remark__text--danger': entry.remarkTone === 'danger',
                'record-remark__text--accent': entry.remarkTone === 'accent'
              }"
            >
              {{ entry.remark }}
            </text>
            <view class="record-edit" v-if="entry.showEdit">✎</view>
          </view>
        </view>

        <view
          v-else
          class="comparison-card"
          :class="{
            'comparison-card--success': entry.tone === 'success'
          }"
        >
          <view class="comparison-value">{{ entry.pricePerKm }}</view>
          <view class="comparison-value">{{ entry.deltaFuel }}</view>
          <view class="comparison-value">{{ entry.deltaMileage }}</view>
          <text class="comparison-arrow">›</text>
        </view>
      </template>
    </view>
  </view>
  <BottomActionBar active="list" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BottomActionBar from '@/components/BottomActionBar.vue'

type RecordMeta = {
  value: string
  caption: string
}

type FuelRecordItem = {
  type: 'record'
  id: string
  date: string
  week?: string
  consumption: string
  mileage: string
  meta?: RecordMeta[]
  remark?: string
  remarkTone?: 'danger' | 'accent'
  showEdit?: boolean
  compact?: boolean
  highlight?: 'danger'
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

const yearOptions = ['2025年', '2024年', '2023年']
const selectedYearIndex = ref(0)

const summarySnapshots: Record<string, SummarySnapshot> = {
  '2025年': {
    totalAmount: '836.70元',
    avgFuel: '5.71升/百公里',
    pricePerLiter: '7.12元/升',
    mileage: '1,577公里'
  },
  '2024年': {
    totalAmount: '1,120.80元',
    avgFuel: '6.04升/百公里',
    pricePerLiter: '7.03元/升',
    mileage: '2,318公里'
  },
  '2023年': {
    totalAmount: '906.40元',
    avgFuel: '5.83升/百公里',
    pricePerLiter: '6.87元/升',
    mileage: '1,980公里'
  }
}

const recordSnapshots: Record<string, FuelRecord[]> = {
  '2025年': [
    {
      type: 'record',
      id: '2025-10-18',
      date: '10/18',
      week: '周五',
      consumption: '4.80',
      mileage: '1587',
      meta: [
        { value: '200.00元', caption: '花费' },
        { value: '7.12元/升', caption: '单价' },
        { value: '+28.09升', caption: '油量' }
      ],
      remark: '92#汽油  加满',
      remarkTone: 'danger',
      showEdit: true
    },
    {
      type: 'comparison',
      id: '2025-compare-1',
      pricePerKm: '0.34元/公里',
      deltaFuel: '-28.09升',
      deltaMileage: '+585.00公里',
      tone: 'success'
    },
    {
      type: 'record',
      id: '2025-10-09',
      date: '10/09',
      consumption: '8.59',
      mileage: '1002',
      highlight: 'danger',
      compact: true
    },
    {
      type: 'record',
      id: '2025-10-02',
      date: '10/02',
      consumption: '4.72',
      mileage: '611',
      compact: true
    },
    {
      type: 'record',
      id: '2025-10-01',
      date: '10/01',
      consumption: '5.10',
      mileage: '510',
      compact: true
    },
    {
      type: 'record',
      id: '2025-10-01',
      date: '10/01',
      consumption: '5.10',
      mileage: '510',
      compact: true
    },
    {
      type: 'record',
      id: '2025-10-01',
      date: '10/01',
      consumption: '5.10',
      mileage: '510',
      compact: true
    }
  ],
  '2024年': [
    {
      type: 'record',
      id: '2024-12-22',
      date: '12/22',
      consumption: '5.02',
      mileage: '1320',
      meta: [
        { value: '180.00元', caption: '花费' },
        { value: '6.90元/升', caption: '单价' },
        { value: '+25.21升', caption: '油量' }
      ],
      remark: '95#汽油  七成满',
      remarkTone: 'accent'
    },
    {
      type: 'record',
      id: '2024-11-02',
      date: '11/02',
      consumption: '6.40',
      mileage: '820',
      compact: true
    }
  ],
  '2023年': [
    {
      type: 'record',
      id: '2023-07-03',
      date: '07/03',
      consumption: '5.30',
      mileage: '730',
      compact: true
    }
  ]
}

const currentYear = computed(
  () => yearOptions[selectedYearIndex.value] || yearOptions[0]
)

const summaryCard = computed(
  () => summarySnapshots[currentYear.value] || summarySnapshots[yearOptions[0]]
)

const visibleRecords = computed(
  () => recordSnapshots[currentYear.value] || []
)

const handleYearChange = (event: { detail: { value: number } }) => {
  selectedYearIndex.value = Number(event.detail.value)
}

const isRecordItem = (entry: FuelRecord): entry is FuelRecordItem =>
  entry.type === 'record'
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.records-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fbff 0%, #f2f4f9 100%);
  padding: 24rpx 32rpx 180rpx;
}


.summary-panel {
  position: relative;
  overflow: hidden;
  padding: 32rpx;
  border-radius: 32rpx;
  background: linear-gradient(110deg, #cde6ff, #dfeeff 70%);
  box-shadow: 0 20rpx 40rpx rgba(0, 83, 156, 0.1);
  margin-bottom: 32rpx;
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
  gap: 8rpx;
  padding: 10rpx 18rpx;
  border-radius: 30rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.6);
  color: #1f2329;
  font-size: 26rpx;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.6);
}

.summary-year__arrow {
  font-size: 24rpx;
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
}

.summary-total__value {
  font-size: 48rpx;
  font-weight: 700;
}

.summary-total__label {
  display: block;
  font-size: 24rpx;
  color: rgba(10, 41, 90, 0.7);
}

.summary-grid {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.summary-stat {
  flex: 1;
  color: #1f2329;
}

.summary-stat:not(:last-child) {
  border-right: 2rpx solid rgba(255, 255, 255, 0.4);
  margin-right: 16rpx;
  padding-right: 16rpx;
}

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

.records-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.record-card {
  background: #fff;
  border-radius: 28rpx;
  padding: 28rpx;
  box-shadow: 0 12rpx 30rpx rgba(15, 114, 59, 0.08);
}

.record-card--compact {
  padding: 24rpx;
}

.record-card--alert .record-consumption__value {
  color: #e64a3b;
}

.record-card__top {
  display: flex;
  align-items: flex-end;
  gap: 12rpx;
}

.record-date {
  flex: 1;
  position: relative;
  padding-left: 20rpx;
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

.record-date__value {
  font-size: 32rpx;
  font-weight: 700;
}

.record-date__week {
  display: block;
  font-size: 22rpx;
  color: $muted-text;
}

.record-consumption {
  display: flex;
  align-items: flex-end;
  gap: 8rpx;
}

.record-consumption__value {
  font-size: 40rpx;
  font-weight: 700;
  color: $primary-dark;
}

.record-consumption__unit {
  font-size: 24rpx;
  color: $muted-text;
}

.record-mileage {
  margin-left: auto;
  text-align: right;
}

.record-mileage__value {
  font-size: 32rpx;
  font-weight: 600;
}

.record-mileage__unit {
  display: block;
  font-size: 22rpx;
  color: $muted-text;
}

.record-arrow {
  font-size: 36rpx;
  color: $muted-text;
  padding-left: 12rpx;
}

.record-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 24rpx;
}

.record-meta__item {
  flex: 1;
  text-align: center;
}

.record-meta__value {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
}

.record-meta__label {
  font-size: 22rpx;
  color: $muted-text;
}

.record-remark {
  margin-top: 18rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-remark__text {
  font-size: 24rpx;
  color: $muted-text;
}

.record-remark__text--danger {
  color: #d44848;
}

.record-remark__text--accent {
  color: $primary-dark;
}

.record-edit {
  width: 44rpx;
  height: 44rpx;
  border-radius: 14rpx;
  border: 2rpx solid rgba(31, 35, 41, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #1f2329;
}

.comparison-card {
  background: #f5fbf6;
  border-radius: 28rpx;
  padding: 26rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  border: 2rpx solid rgba(30, 193, 95, 0.1);
}

.comparison-card--success {
  background: rgba(30, 193, 95, 0.12);
  border-color: rgba(30, 193, 95, 0.3);
}

.comparison-value {
  flex: 1;
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2329;
  text-align: center;
}

.comparison-arrow {
  font-size: 32rpx;
  color: $muted-text;
}
</style>
