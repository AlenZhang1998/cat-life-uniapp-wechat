import { ref } from 'vue'

const TOKEN_KEY = 'token'
const PROFILE_KEY = 'userProfile'

type StoredProfile = Record<string, any> | null

const isLoggedIn = ref(false)

const readTokenFromStorage = (): string => {
  try {
    const token = uni.getStorageSync(TOKEN_KEY)
    return typeof token === 'string' ? token : ''
  } catch (error) {
    console.warn('读取 token 失败', error)
    return ''
  }
}

const readProfileFromStorage = (): StoredProfile => {
  try {
    const stored = uni.getStorageSync(PROFILE_KEY)
    if (!stored) {
      return null
    }
    if (typeof stored === 'string') {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.warn('解析用户信息失败', error)
        return null
      }
    }
    return stored as StoredProfile
  } catch (error) {
    console.warn('读取用户信息失败', error)
    return null
  }
}

const resolveLoginState = () => {
  const token = readTokenFromStorage()
  if (token) {
    return true
  }
  const profile = readProfileFromStorage()
  return !!(profile && profile.name)
}

const refreshLoginState = () => {
  isLoggedIn.value = resolveLoginState()
  return isLoggedIn.value
}

const setStoredToken = (token?: string) => {
  try {
    if (token) {
      uni.setStorageSync(TOKEN_KEY, token)
    } else {
      uni.removeStorageSync(TOKEN_KEY)
    }
  } catch (error) {
    console.warn('写入 token 失败', error)
  }
  refreshLoginState()
}

const setStoredProfile = (profile?: StoredProfile) => {
  try {
    if (profile) {
      uni.setStorageSync(PROFILE_KEY, profile)
    } else {
      uni.removeStorageSync(PROFILE_KEY)
    }
  } catch (error) {
    console.warn('写入用户信息失败', error)
  }
  refreshLoginState()
}

refreshLoginState()

export const useAuth = () => ({
  isLoggedIn,
  refreshLoginState,
  setStoredToken,
  setStoredProfile,
  getStoredProfile: readProfileFromStorage
})
