<template>
  <view class="city-page">
    <view class="search-wrapper">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input
          v-model="keyword"
          class="search-input"
          placeholder="城市/拼音"
          placeholder-class="search-placeholder"
          confirm-type="search"
        />
        <text
          v-if="keyword"
          class="clear-icon"
          @tap="clearKeyword"
        >
          ✕
        </text>
      </view>
    </view>

    <view class="location-card">
      <view>
        <text class="location-label">当前位置：</text>
        <text class="location-value">
          {{ locationCity || currentCity || '未定位' }}
        </text>
        <text
          v-if="!locationCity"
          class="location-tip"
        >
          {{ locating ? '定位中...' : '点击右侧按钮重新定位' }}
        </text>
      </view>
      <view class="location-actions">
        <button
          class="icon-button"
          hover-class="icon-button__hover"
          :loading="locating"
          @tap="handleLocate"
        >
          <text class="icon-text">⇱</text>
        </button>
        <button
          class="icon-button"
          hover-class="icon-button__hover"
          @tap="handlePickFromMap"
        >
          <text class="icon-text">◎</text>
        </button>
      </view>
    </view>

    <view class="list-wrapper">
      <scroll-view
        class="city-scroll"
        scroll-y
        :scroll-into-view="activeAnchor"
        scroll-with-animation
      >
        <view
          v-for="section in displayedSections"
          :key="section.letter"
          :id="`anchor-${section.letter}`"
          class="city-section"
        >
          <view class="section-title">
            {{ section.letter }}
          </view>
          <view
            v-for="city in section.items"
            :key="city.code"
            class="city-item"
            @tap="handleCityTap(city.name)"
          >
            <text>{{ city.name }}</text>
            <text
              v-if="city.name === currentCity"
              class="city-tag"
            >
              当前
            </text>
          </view>
        </view>

        <view
          v-if="!displayedSections.length"
          class="empty-hint"
        >
          <text>没有匹配的城市，换个关键词试试～</text>
        </view>
      </scroll-view>

      <view
        class="index-bar index-bar-fixed"
        @touchstart.stop.prevent="handleIndexTouchStart"
        @touchmove.stop.prevent="handleIndexTouchMove"
        @touchend.stop="handleIndexTouchEnd"
        @touchcancel.stop="handleIndexTouchEnd"
      >
        <text
          v-for="section in allSections"
          :key="section.letter"
          class="index-letter"
          :class="{ active: section.letter === highlightedLetter }"
          @tap.stop="handleIndexTap(section.letter)"
        >
          {{ section.letter }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad, onReady } from '@dcloudio/uni-app'
import { computed, getCurrentInstance, nextTick, ref } from 'vue'
import { STORAGE_KEYS } from '@/constants/storage'
import { CITY_LIST, CityItem } from '@/data/cities'
import {
  chooseCityFromMap,
  ensureLocationAuth,
  locateCityByGPS
} from '@/utils/location'

type CitySection = {
  letter: string
  items: CityItem[]
}

type IndexBarRect = {
  top: number
  height: number
}

type TouchLikeEvent = {
  touches?: Array<{
    clientY?: number
    pageY?: number
  }>
  changedTouches?: Array<{
    clientY?: number
    pageY?: number
  }>
}

const keyword = ref('')
const currentCity = ref('')
const locationCity = ref('')
const locating = ref(false)
const activeAnchor = ref('')
const highlightedLetter = ref('')
const eventChannel = ref<UniApp.EventChannel | null>(null)
const pageInstance = getCurrentInstance()
const indexTouching = ref(false)
const indexBarRect = ref<IndexBarRect | null>(null)

const resolveEventChannel = () => {
  const getter =
    pageInstance?.proxy?.getOpenerEventChannel ??
    pageInstance?.ctx?.getOpenerEventChannel
  return typeof getter === 'function' ? getter() : null
}

const measureIndexBar = () => {
  if (!pageInstance?.proxy) return
  uni
    .createSelectorQuery()
    .in(pageInstance.proxy)
    .select('.index-bar-fixed')
    .boundingClientRect((rect) => {
      if (rect) {
        indexBarRect.value = {
          top: rect.top ?? 0,
          height: rect.height ?? 0
        }
      }
    })
    .exec()
}

const getClientY = (event: TouchLikeEvent) => {
  const touch = event.touches?.[0] ?? event.changedTouches?.[0]
  return touch?.clientY ?? touch?.pageY ?? null
}

const baseCities: CityItem[] = CITY_LIST as CityItem[]

const sortSections = (entries: CitySection[]) =>
  entries.sort((a, b) => {
    if (a.letter === '#') return 1
    if (b.letter === '#') return -1
    return a.letter.localeCompare(b.letter)
  })

const groupCities = (cities: CityItem[]) => {
  const map = new Map<string, CityItem[]>()
  cities.forEach((city) => {
    const letter = city.letter || '#'
    if (!map.has(letter)) {
      map.set(letter, [])
    }
    map.get(letter)!.push(city)
  })
  return sortSections(
    Array.from(map.entries()).map(([letter, items]) => ({
      letter,
      items: items.sort((a, b) => a.pinyin.localeCompare(b.pinyin))
    }))
  )
}

const allSections = computed(() => groupCities(baseCities))

const displayedSections = computed(() => {
  const rawKeyword = keyword.value.trim()
  const value = rawKeyword.toLowerCase()
  if (!rawKeyword) {
    return allSections.value
  }

  const filtered = baseCities.filter((city) => {
    if (city.name.includes(rawKeyword)) return true
    return city.pinyin.includes(value) || city.abbr.includes(value)
  })
  return groupCities(filtered)
})

const clearKeyword = () => {
  keyword.value = ''
}

const persistCity = (cityName: string) => {
  currentCity.value = cityName
  uni.setStorage({
    key: STORAGE_KEYS.selectedCity,
    data: cityName
  })
}

const emitSelection = (cityName: string) => {
  eventChannel.value?.emit('city-selected', cityName)
}

const closePage = () => {
  setTimeout(() => {
    uni.navigateBack()
  }, 150)
}

const handleCityTap = (cityName: string) => {
  persistCity(cityName)
  emitSelection(cityName)
  closePage()
}

const handleLocate = async (applyCity = true) => {
  if (locating.value) return
  locating.value = true
  try {
    await ensureLocationAuth()
    const located = await locateCityByGPS()
    if (located?.city) {
      locationCity.value = located.city
      if (applyCity) {
        handleCityTap(located.city)
      }
      return
    }
    if (applyCity) {
      await handlePickFromMap()
    }
  } catch (error) {
    if (applyCity) {
      uni.showToast({
        title: '请先开启定位权限',
        icon: 'none'
      })
    }
  } finally {
    locating.value = false
  }
}

const handlePickFromMap = async () => {
  const result = await chooseCityFromMap()
  if (result?.city) {
    locationCity.value = result.city
    handleCityTap(result.city)
  } else {
    uni.showToast({
      title: '无法获取定位',
      icon: 'none'
    })
  }
}

const resolveClosestLetter = (letter: string) => {
  const sections = displayedSections.value
  if (!sections.length) return ''
  const availableLetters = sections.map((section) => section.letter)
  const availableSet = new Set(availableLetters)
  if (availableSet.has(letter)) return letter
  const orderedLetters = allSections.value.map((section) => section.letter)
  const targetIndex = orderedLetters.indexOf(letter)
  if (targetIndex !== -1) {
    for (let i = targetIndex + 1; i < orderedLetters.length; i++) {
      const candidate = orderedLetters[i]
      if (availableSet.has(candidate)) return candidate
    }
    for (let i = targetIndex - 1; i >= 0; i--) {
      const candidate = orderedLetters[i]
      if (availableSet.has(candidate)) return candidate
    }
  }
  return availableLetters[0]
}

const jumpTo = (letter: string) => {
  const resolvedLetter = resolveClosestLetter(letter)
  if (!resolvedLetter) return
  highlightedLetter.value = resolvedLetter
  activeAnchor.value = `anchor-${resolvedLetter}`
  setTimeout(() => {
    activeAnchor.value = ''
  }, 300)
}

const handleIndexTap = (letter: string) => {
  jumpTo(letter)
}

const getLetterByClientY = (clientY: number | null) => {
  if (!clientY || !indexBarRect.value || !allSections.value.length) return null
  const { top, height } = indexBarRect.value
  const sections = allSections.value
  const relativeY = clientY - top
  if (relativeY <= 0) return sections[0].letter
  if (relativeY >= height) return sections[sections.length - 1].letter
  const itemHeight = height / sections.length
  const letterIndex = Math.min(
    sections.length - 1,
    Math.max(0, Math.floor(relativeY / itemHeight))
  )
  return sections[letterIndex].letter
}

const updateLetterByTouch = (event: TouchLikeEvent) => {
  const clientY = getClientY(event)
  const letter = getLetterByClientY(clientY)
  if (letter) {
    jumpTo(letter)
  }
}

const handleIndexTouchStart = (event: TouchLikeEvent) => {
  indexTouching.value = true
  updateLetterByTouch(event)
}

const handleIndexTouchMove = (event: TouchLikeEvent) => {
  if (!indexTouching.value) return
  updateLetterByTouch(event)
}

const handleIndexTouchEnd = () => {
  indexTouching.value = false
}

onLoad((options) => {
  eventChannel.value = resolveEventChannel()
  const queryCity =
    (options?.currentCity && decodeURIComponent(options.currentCity)) || ''
  const storedCity =
    (uni.getStorageSync(STORAGE_KEYS.selectedCity) as string | null) || ''

  currentCity.value = queryCity || storedCity || '深圳市'
  locationCity.value = storedCity

  // 自动定位但不立即切换城市，仅展示定位结果
  setTimeout(() => {
    handleLocate(false)
  }, 200)
})

onReady(() => {
  nextTick(measureIndexBar)
})
</script>

<style lang="scss" scoped>
.city-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #f2f3f5;
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
}

.search-wrapper {
  padding: 24rpx 32rpx 12rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eef0f4;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #f0f1f5;
  border-radius: 16rpx;
  padding: 0 24rpx;
  height: 72rpx;

  .search-icon {
    font-size: 30rpx;
    color: #8f95a3;
    margin-right: 12rpx;
  }

  .search-input {
    flex: 1;
    font-size: 28rpx;
    color: #1c1f26;
  }

  .clear-icon {
    padding-left: 12rpx;
    color: #b6bbc6;
    font-size: 32rpx;
  }
}

.location-card {
  margin: 0;
  padding: 28rpx 32rpx;
  background-color: #fff;
  border-bottom: 12rpx solid #f2f3f5;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .location-label {
    font-size: 26rpx;
    color: #707784;
  }

  .location-value {
    font-size: 34rpx;
    font-weight: 600;
    margin-left: 6rpx;
    color: #1c1f26;
  }

  .location-tip {
    display: block;
    margin-top: 8rpx;
    font-size: 22rpx;
    color: #9ca4b3;
  }
}

.location-actions {
  display: flex;
  gap: 18rpx;
}

.icon-button {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  border: 1rpx solid #e1e4ea;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &__hover {
    background: #f8f9fb;
  }

  .icon-text {
    font-size: 30rpx;
    color: #111;
  }
}

.city-scroll {
  flex: 1;
  min-height: 0;
  height: 100%;
  // padding: 0 64rpx 80rpx 32rpx;
  box-sizing: border-box;
  background-color: #fff;
}

.list-wrapper {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  padding-bottom: 0;
  background-color: #fff;
}

.city-section {
  margin-bottom: 0;
}

.section-title {
  font-size: 28rpx;
  color: #d81e06;
  background-color: #f5f6f8;
  padding: 20rpx 0 20rpx 8rpx;
  letter-spacing: 2rpx;
  font-weight: 700;
  padding-left: 32rpx;
}

.city-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 30rpx 0;
  margin-left: 32rpx;
  border-bottom: 1rpx solid #eef0f4;
  font-size: 30rpx;

  .city-tag {
    font-size: 24rpx;
    color: #1fc35f;
  }
}

.empty-hint {
  text-align: center;
  color: #98a0ac;
  padding: 80rpx 0;
  font-size: 26rpx;
}

.index-bar {
  position: absolute;
  top: 50%;
  right: 12rpx;
  transform: translateY(-50%);
  width: 44rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  background-color: transparent;
  border-radius: 24rpx;
  box-shadow: none;
  z-index: 20;
}

.index-letter {
  width: 36rpx;
  height: 36rpx;
  margin: 2rpx 0;
  border-radius: 50%;
  font-size: 24rpx;
  // color: #848a99;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s ease, color 0.15s ease;

  &.active {
    color: #fff;
    background-color: #d81e06;
    font-weight: 600;
  }
}

</style>
