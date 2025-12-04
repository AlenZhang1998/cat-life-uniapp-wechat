import { axios } from '@/utils/request'

type ReverseGeocodeResult = {
  city: string
  province?: string
  address?: string
}

export type LocatedCity = {
  city: string
  latitude: number
  longitude: number
  province?: string
  address?: string
}

const TENCENT_MAP_KEY =
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore uni-app 会在编译阶段注入 import.meta.env
  (import.meta?.env?.VITE_TENCENT_MAP_KEY as string | undefined) || ''

const GEOCODER_ENDPOINT = 'https://apis.map.qq.com/ws/geocoder/v1'

const CITY_NAME_MATCHER =
  /(北京市|天津市|上海市|重庆市|[\u4e00-\u9fa5]+?(?:自治区|自治州|地区|盟|市|区|县))/u
const PROVINCE_PREFIX_MATCHER =
  /^[\u4e00-\u9fa5]+?(?:省|自治区|特别行政区)/u
const PROVINCE_SUFFIX_MATCHER = /(省|特别行政区)$/u

export const requestLocation = () =>
  new Promise<UniApp.GetLocationSuccess>((resolve, reject) => {
    const tryOnce = (highAccuracy: boolean) => {
      uni.getLocation({
        type: 'gcj02',
        isHighAccuracy: highAccuracy,
        highAccuracyExpireTime: 3000,
        success: (pos) => {
          console.log('[requestLocation] success', pos)
          resolve(pos)
        },
        fail: (err: any) => {
          console.warn('[requestLocation] fail', err)
          // 第一次高精度失败，再用普通模式试一次
          if (highAccuracy && (err.errCode === 404 || err.errCode === 2)) {
            tryOnce(false)
          } else {
            reject(err)
          }
        }
      })
    }

    tryOnce(true)
  })

export const chooseLocationManually = () =>
  new Promise<UniApp.ChooseLocationSuccess | null>((resolve) => {
    uni.chooseLocation({
      success: (res) => resolve(res),
      fail: () => resolve(null)
    })
  })

export const extractCityFromText = (text?: string | null) => {
  if (!text) return null
  const match = text.match(CITY_NAME_MATCHER)
  if (!match) return null
  const raw = match[1]
  const withoutPrefix = raw.replace(PROVINCE_PREFIX_MATCHER, '')
  const normalized = withoutPrefix || raw
  return normalized.replace(PROVINCE_SUFFIX_MATCHER, '')
}

export const normalizeCityName = (text?: string | null) => {
  if (!text) return ''
  const normalized = extractCityFromText(text)
  return (normalized ?? text).trim()
}

export const reverseGeocodeByTencent = async (
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> => {
  if (!TENCENT_MAP_KEY) {
    return null
  }

  try {
    const response = await axios.request<{
      status: number
      result?: {
        address: string
        ad_info: {
          city: string
          province: string
        }
        formatted_addresses?: {
          recommend?: string
        }
      }
    }>({
      url: GEOCODER_ENDPOINT,
      method: 'GET',
      data: {
        key: TENCENT_MAP_KEY,
        location: `${latitude},${longitude}`,
        get_poi: 0
      },
      showErrorToast: false
    })

    if (response.status === 0 && response.result) {
      const {
        result: { address, ad_info }
      } = response
      return {
        city: ad_info.city.replace(/(市|地区|盟)$/u, ''),
        province: ad_info.province,
        address
      }
    }
  } catch (error) {
    console.warn('reverseGeocodeByTencent failed', error)
  }
  return null
}

export const locateCityByGPS = async (): Promise<LocatedCity | null> => {
  try {
    const { latitude, longitude } = await requestLocation()
    const geocode = await reverseGeocodeByTencent(latitude, longitude)
    if (geocode) {
      return {
        city: geocode.city,
        latitude,
        longitude,
        province: geocode.province,
        address: geocode.address
      }
    }
  } catch (error) {
    console.warn('locateCityByGPS failed', error)
  }
  return null
}

export const chooseCityFromMap = async (): Promise<LocatedCity | null> => {
  const selection = await chooseLocationManually()
  console.log(149, 'selection = ', selection)
  if (!selection) return null

  const cityName =
    extractCityFromText(selection.address) ??
    extractCityFromText(selection.name)

  return {
    city: cityName || selection.name,
    latitude: selection.latitude,
    longitude: selection.longitude,
    address: selection.address
  }
}

export const ensureLocationAuth = () =>
  new Promise<void>((resolve, reject) => {
    uni.getSetting({
      success(setting) {
        if (setting.authSetting?.['scope.userLocation']) {
          resolve()
          return
        }

        uni.authorize({
          scope: 'scope.userLocation',
          success: () => resolve(),
          fail: () => {
            uni.showModal({
              title: '需要定位权限',
              content: '开启定位权限以使用自动定位功能',
              confirmText: '去开启',
              success(res) {
                if (res.confirm) {
                  uni.openSetting({})
                }
              }
            })
            reject(new Error('user denied location scope'))
          }
        })
      },
      fail: (err) => reject(err)
    })
  })
