type RequestOptions<T = any> = Omit<UniApp.RequestOptions, 'success' | 'fail' | 'complete'> & {
  showErrorToast?: boolean
  baseURL?: string
}

export interface RequestError<T = any> extends Error {
  statusCode?: number
  data?: T
  raw?: UniApp.RequestSuccessCallbackResult<T>
}

const DEFAULT_BASE_URL = 'http://10.48.75.101:3000' // 192.168.60.58

const getEnvBaseUrl = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - uni-app 编译阶段会注入 import.meta.env
    return (import.meta?.env?.VITE_API_BASE_URL as string | undefined) || ''
  } catch {
    return ''
  }
}

const BASE_URL = getEnvBaseUrl() || DEFAULT_BASE_URL

const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url)

const joinUrl = (base: string, path: string) => {
  if (!base) return path
  if (!path) return base
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

const createError = <T>(message: string, res?: UniApp.RequestSuccessCallbackResult<T>): RequestError<T> => {
  const error: RequestError<T> = new Error(message)
  if (res) {
    error.statusCode = res.statusCode
    error.data = res.data as T
    error.raw = res
  }
  return error
}

export const request = <T = any>(options: RequestOptions<T>) => {
  const {
    url,
    showErrorToast = true,
    baseURL,
    header = {},
    ...rest
  } = options as RequestOptions<T> & Record<string, any>

  const finalUrl = isAbsoluteUrl(url) ? url : joinUrl(baseURL || BASE_URL, url)

  return new Promise<T>((resolve, reject) => {
    uni.request({
      ...rest,
      url: finalUrl,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success: (res) => {
        const success = res.statusCode >= 200 && res.statusCode < 300
        if (success) {
          resolve(res.data as T)
          return
        }

        const errorPayload =
          (res.data &&
            typeof res.data === 'object' &&
            'message' in (res.data as Record<string, any>) &&
            typeof (res.data as Record<string, any>).message === 'string'
            ? ((res.data as Record<string, any>).message as string)
            : `请求失败（${res.statusCode}）`)

        if (showErrorToast) {
          uni.showToast({
            title: errorPayload,
            icon: 'none'
          })
        }

        reject(createError(errorPayload, res as UniApp.RequestSuccessCallbackResult<T>))
      },
      fail: (err) => {
        if (showErrorToast) {
          uni.showToast({
            title: '网络异常，请稍后再试',
            icon: 'none'
          })
        }
        reject(createError(err.errMsg || 'request fail'))
      }
    })
  })
}

export const getBaseUrl = () => BASE_URL
