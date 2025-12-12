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
        <text v-if="keyword" class="clear-icon" @tap="clearKeyword"> ✕ </text>
      </view>
    </view>

    <view class="location-card">
      <view class="location-card__header">
        <text class="location-label">当前位置：</text>
        <text class="location-value">
          {{ locationCity || currentCity || '未定位' }}
          <!-- {{ locationProvince }}-{{ locationCity }}-{{ currentCity }} -->
        </text>
      </view>
      <!-- <text v-if="!locationCity" class="location-tip">
        {{ locating ? '定位中...' : '点击下方按钮重新定位或手动选择' }}
      </text> -->
      <view class="location-actions">
        <button
          class="action-button"
          hover-class="action-button__hover"
          :loading="locating"
          @tap="handleLocate"
        >
          <text class="action-button__text">👇 重新定位</text>
        </button>
        <button
          class="action-button"
          hover-class="action-button__hover"
          @tap="handlePickFromMap"
        >
          <text class="action-button__text">👆 手动选点</text>
          <!-- ◎ -->
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
            <text v-if="city.name === currentCity" class="city-tag">
              当前
            </text>
          </view>
        </view>

        <view v-if="!displayedSections.length" class="empty-hint">
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
import { onLoad, onReady } from '@dcloudio/uni-app';
import { computed, getCurrentInstance, nextTick, ref } from 'vue';
import { STORAGE_KEYS } from '@/constants/storage';
import { CITY_LIST, CityItem } from '@/data/cities';
import {
  chooseCityFromMap,
  ensureLocationAuth,
  locateCityByGPS,
  normalizeCityName,
} from '@/utils/location';
import { axios } from '@/utils/request';
import { useAuth } from '@/utils/auth';

type CitySection = {
  letter: string;
  items: CityItem[];
};

type IndexBarRect = {
  top: number;
  height: number;
};

type SelectedCityPayload = {
  city: string;
  province?: string;
};

type TouchLikeEvent = {
  touches?: Array<{
    clientY?: number;
    pageY?: number;
  }>;
  changedTouches?: Array<{
    clientY?: number;
    pageY?: number;
  }>;
};

const keyword = ref('');
const currentCity = ref('');
const locationProvince = ref(''); // 定位省份
const locationCity = ref(''); // 定位城市
const locating = ref(false);
const activeAnchor = ref('');
const highlightedLetter = ref('');
const eventChannel = ref<UniApp.EventChannel | null>(null);
const pageInstance = getCurrentInstance();
const indexTouching = ref(false);
const indexBarRect = ref<IndexBarRect | null>(null);
const { isLoggedIn } = useAuth();

const resolveEventChannel = () => {
  const getter =
    pageInstance?.proxy?.getOpenerEventChannel ??
    pageInstance?.ctx?.getOpenerEventChannel;
  return typeof getter === 'function' ? getter() : null;
};

const measureIndexBar = () => {
  if (!pageInstance?.proxy) return;
  uni
    .createSelectorQuery()
    .in(pageInstance.proxy)
    .select('.index-bar-fixed')
    .boundingClientRect((rect) => {
      if (rect) {
        indexBarRect.value = {
          top: rect.top ?? 0,
          height: rect.height ?? 0,
        };
      }
    })
    .exec();
};

const getClientY = (event: TouchLikeEvent) => {
  const touch = event.touches?.[0] ?? event.changedTouches?.[0];
  return touch?.clientY ?? touch?.pageY ?? null;
};

const baseCities: CityItem[] = CITY_LIST as CityItem[];

const sortSections = (entries: CitySection[]) =>
  entries.sort((a, b) => {
    if (a.letter === '#') return 1;
    if (b.letter === '#') return -1;
    return a.letter.localeCompare(b.letter);
  });

const groupCities = (cities: CityItem[]) => {
  const map = new Map<string, CityItem[]>();
  cities.forEach((city) => {
    const letter = city.letter || '#';
    if (!map.has(letter)) {
      map.set(letter, []);
    }
    map.get(letter)!.push(city);
  });
  return sortSections(
    Array.from(map.entries()).map(([letter, items]) => ({
      letter,
      items: items.sort((a, b) => a.pinyin.localeCompare(b.pinyin)),
    }))
  );
};

const allSections = computed(() => groupCities(baseCities));

const displayedSections = computed(() => {
  const rawKeyword = keyword.value.trim();
  const value = rawKeyword.toLowerCase();
  if (!rawKeyword) {
    return allSections.value;
  }

  const filtered = baseCities.filter((city) => {
    if (city.name.includes(rawKeyword)) return true;
    return city.pinyin.includes(value) || city.abbr.includes(value);
  });
  return groupCities(filtered);
});

const clearKeyword = () => {
  keyword.value = '';
};

const formatCityName = (value: string) => normalizeCityName(value) || value;

const persistCity = (cityName: string) => {
  const normalized = formatCityName(cityName);
  currentCity.value = normalized;
  uni.setStorage({
    key: STORAGE_KEYS.selectedCity,
    data: normalized,
  });
  return normalized;
};

const saveCityToProfile = async (city: string, province?: string) => {
  if (!isLoggedIn.value) return;
  try {
    await axios.put('/api/profile', {
      data: {
        city,
        province: province || '',
      },
      showErrorToast: false,
    } as any);
  } catch (err) {
    console.warn('save city to profile failed', err);
  }
};

const emitSelection = (payload: SelectedCityPayload) => {
  eventChannel.value?.emit('city-selected', payload);
};

const closePage = async (payload?: SelectedCityPayload) => {
  try {
    if (payload) {
      await saveCityToProfile(payload.city, payload.province);
    }
  } finally {
    setTimeout(() => {
      uni.navigateBack();
    }, 150);
  }
};

const handleCityTap = async (cityName: string, provinceName?: string) => {
  const normalizedCity = persistCity(cityName);
  const normalizedProvince = provinceName ? formatCityName(provinceName) : '';
  const payload = { city: normalizedCity, province: normalizedProvince };
  emitSelection(payload);
  await closePage(payload);
};

const handleLocate = async (applyCity = true) => {
  if (locating.value) return;
  locating.value = true;
  uni.showLoading({ title: '定位中...', mask: true });
  try {
    await ensureLocationAuth();
    const located = await locateCityByGPS();
    console.log(273, 'located = ', located);

    if (located?.city) {
      const normalizedCity = formatCityName(located.city);
      const normalizedProvince = formatCityName(located.province || '');

      // 保存到页面状态
      locationProvince.value = normalizedProvince;
      locationCity.value = normalizedCity;

      if (applyCity) {
        handleCityTap(normalizedCity, normalizedProvince);
      }
      return;
    }
    if (applyCity) {
      await handlePickFromMap();
    }
  } catch (error) {
    if (applyCity) {
      uni.showToast({
        title: '请先开启定位权限',
        icon: 'none',
      });
    }
  } finally {
    uni.hideLoading();
    locating.value = false;
  }
};

const handlePickFromMap = async () => {
  const result = await chooseCityFromMap();
  console.log(305, 'result = ', result);
  if (result?.city) {
    const normalizedCity = formatCityName(result.city);
    const normalizedProvince = formatCityName(result.province || '');

    locationProvince.value = normalizedProvince;
    locationCity.value = normalizedCity;

    handleCityTap(normalizedCity, normalizedProvince);
  } else {
    uni.showToast({
      title: '无法获取定位',
      icon: 'none',
    });
  }
};

const resolveClosestLetter = (letter: string) => {
  const sections = displayedSections.value;
  if (!sections.length) return '';
  const availableLetters = sections.map((section) => section.letter);
  const availableSet = new Set(availableLetters);
  if (availableSet.has(letter)) return letter;
  const orderedLetters = allSections.value.map((section) => section.letter);
  const targetIndex = orderedLetters.indexOf(letter);
  if (targetIndex !== -1) {
    for (let i = targetIndex + 1; i < orderedLetters.length; i++) {
      const candidate = orderedLetters[i];
      if (availableSet.has(candidate)) return candidate;
    }
    for (let i = targetIndex - 1; i >= 0; i--) {
      const candidate = orderedLetters[i];
      if (availableSet.has(candidate)) return candidate;
    }
  }
  return availableLetters[0];
};

const jumpTo = (letter: string) => {
  const resolvedLetter = resolveClosestLetter(letter);
  if (!resolvedLetter) return;
  highlightedLetter.value = resolvedLetter;
  activeAnchor.value = `anchor-${resolvedLetter}`;
  setTimeout(() => {
    activeAnchor.value = '';
  }, 300);
};

const handleIndexTap = (letter: string) => {
  jumpTo(letter);
};

const getLetterByClientY = (clientY: number | null) => {
  if (!clientY || !indexBarRect.value || !allSections.value.length) return null;
  const { top, height } = indexBarRect.value;
  const sections = allSections.value;
  const relativeY = clientY - top;
  if (relativeY <= 0) return sections[0].letter;
  if (relativeY >= height) return sections[sections.length - 1].letter;
  const itemHeight = height / sections.length;
  const letterIndex = Math.min(
    sections.length - 1,
    Math.max(0, Math.floor(relativeY / itemHeight))
  );
  return sections[letterIndex].letter;
};

const updateLetterByTouch = (event: TouchLikeEvent) => {
  const clientY = getClientY(event);
  const letter = getLetterByClientY(clientY);
  if (letter) {
    jumpTo(letter);
  }
};

const handleIndexTouchStart = (event: TouchLikeEvent) => {
  indexTouching.value = true;
  updateLetterByTouch(event);
};

const handleIndexTouchMove = (event: TouchLikeEvent) => {
  if (!indexTouching.value) return;
  updateLetterByTouch(event);
};

const handleIndexTouchEnd = () => {
  indexTouching.value = false;
};

const loadCityFromProfile = async () => {
  if (!isLoggedIn.value) return;
  try {
    const res = await axios.get('/api/profile', {
      showErrorToast: false,
    } as any);
    const profile =
      res && (res as any).data && (res as any).code === undefined
        ? (res as any).data
        : res || {};
    if (profile?.city) {
      const normalized = persistCity(profile.city);
      locationCity.value = normalized;
    }
  } catch (err) {
    console.warn('load profile city failed', err);
  }
};

onLoad((options) => {
  eventChannel.value = resolveEventChannel();
  const queryCityRaw =
    (options?.currentCity && decodeURIComponent(options.currentCity)) || '';
  const storedCityRaw =
    (uni.getStorageSync(STORAGE_KEYS.selectedCity) as string | null) || '';
  const queryCity = normalizeCityName(queryCityRaw);
  const storedCity = normalizeCityName(storedCityRaw);

  currentCity.value = queryCity || storedCity || '--';
  locationCity.value = storedCity;

  // 自动定位但不立即切换城市，仅展示定位结果
  const shouldAutoLocate = !storedCity;
  if (shouldAutoLocate) {
    setTimeout(() => handleLocate(true), 200);
  }

  loadCityFromProfile();
});

onReady(() => {
  nextTick(measureIndexBar);
});
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
  flex-direction: column;
  gap: 16rpx;

  &__header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 10rpx;
  }

  .location-label {
    font-size: 26rpx;
    color: #707784;
  }

  .location-value {
    font-size: 34rpx;
    font-weight: 700;
    color: #1c1f26;
    word-break: break-all;
  }

  .location-tip {
    display: block;
    font-size: 22rpx;
    color: #9ca4b3;
  }
}

.location-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  width: 100%;
}

.action-button {
  flex: 1;
  min-width: 240rpx;
  height: 72rpx;
  padding: 0 22rpx;
  border-radius: 24rpx;
  border: 1rpx solid #e4e7ed;
  // background: linear-gradient(135deg, #f7f9ff 0%, #f2f5fb 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  // box-shadow: 0 6rpx 12rpx rgba(17, 24, 39, 0.05);

  &__hover {
    background: #eef2fb;
  }

  &__text {
    display: inline-flex;
    align-items: center;
    gap: 10rpx;
    font-size: 28rpx;
    color: #1f2d3d;
    // font-weight: 600;
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
