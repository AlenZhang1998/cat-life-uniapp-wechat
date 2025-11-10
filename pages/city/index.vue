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

      <view class="index-bar">
        <text
          v-for="section in allSections"
          :key="section.letter"
          class="index-letter"
          :class="{ active: section.letter === highlightedLetter }"
          @tap="jumpTo(section.letter)"
        >
          {{ section.letter }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { computed, getCurrentInstance, ref } from 'vue'
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

const keyword = ref('')
const currentCity = ref('')
const locationCity = ref('')
const locating = ref(false)
const activeAnchor = ref('')
const highlightedLetter = ref('')
const eventChannel = ref<UniApp.EventChannel | null>(null)
const pageInstance = getCurrentInstance()

const resolveEventChannel = () => {
  const getter =
    pageInstance?.proxy?.getOpenerEventChannel ??
    pageInstance?.ctx?.getOpenerEventChannel
  return typeof getter === 'function' ? getter() : null
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

const jumpTo = (letter: string) => {
  highlightedLetter.value = letter
  activeAnchor.value = `anchor-${letter}`
  setTimeout(() => {
    activeAnchor.value = ''
  }, 300)
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
</script>

<style lang="scss" scoped>
.city-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
}

.search-wrapper {
  padding: 24rpx 32rpx 8rpx;
  background-color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(31, 39, 55, 0.08);
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #f2f4f7;
  border-radius: 999rpx;
  padding: 0 24rpx;
  height: 72rpx;

  .search-icon {
    font-size: 28rpx;
    color: #8b95a1;
    margin-right: 12rpx;
  }

  .search-input {
    flex: 1;
    font-size: 28rpx;
  }

  .clear-icon {
    padding-left: 12rpx;
    color: #c2c7d0;
    font-size: 32rpx;
  }
}

.location-card {
  margin: 24rpx 32rpx;
  padding: 24rpx 32rpx;
  background-color: #fff;
  border-radius: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .location-label {
    font-size: 26rpx;
    color: #8b95a1;
  }

  .location-value {
    font-size: 34rpx;
    font-weight: 600;
    margin-left: 6rpx;
    color: #222;
  }

  .location-tip {
    display: block;
    margin-top: 8rpx;
    font-size: 22rpx;
    color: #a0a7b4;
  }
}

.location-actions {
  display: flex;
  gap: 16rpx;
}

.icon-button {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  border: none;
  background: #f2f4f7;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &__hover {
    background: #e1e5ea;
  }

  .icon-text {
    font-size: 30rpx;
    color: #1fc35f;
  }
}

.city-scroll {
  flex: 1;
  padding: 0 32rpx 80rpx;
  box-sizing: border-box;
}

.list-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  padding-bottom: 32rpx;
}

.city-section {
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 26rpx;
  color: #8b95a1;
  margin-bottom: 16rpx;
}

.city-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 12rpx;
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

.list-wrapper .index-bar {
  position: absolute;
  right: 12rpx;
  top: 24rpx;
  padding: 8rpx 0;
  border-radius: 16rpx;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.index-letter {
  font-size: 20rpx;
  padding: 6rpx 12rpx;
  color: #8b95a1;

  &.active {
    color: #1fc35f;
    font-weight: 600;
  }
}
</style>
