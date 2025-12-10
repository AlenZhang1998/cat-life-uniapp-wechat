export type RequestOptions<T = any> = Omit<
  UniApp.RequestOptions,
  'success' | 'fail' | 'complete'
> & {
  showErrorToast?: boolean;
  baseURL?: string;
};

type RequestSuccessResult<T = any> = Omit<
  UniApp.RequestSuccessCallbackResult,
  'data'
> & { data: T };

export interface RequestError<T = any> extends Error {
  statusCode?: number;
  data?: T;
  raw?: RequestSuccessResult<T>;
}

const DEFAULT_BASE_URL = 'http://192.168.60.90:3000'; // 192.168.60.78    10.48.75.101

const getEnvBaseUrl = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore uni-app 会在编译阶段注入 import.meta.env
    return (import.meta?.env?.VITE_API_BASE_URL as string | undefined) || '';
  } catch {
    return '';
  }
};

const BASE_URL = getEnvBaseUrl() || DEFAULT_BASE_URL;

const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);

const joinUrl = (base: string, path: string) => {
  if (!base) return path;
  if (!path) return base;
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
};

const createError = <T>(
  message: string,
  res?: RequestSuccessResult<T>
): RequestError<T> => {
  const error: RequestError<T> = new Error(message);
  if (res) {
    error.statusCode = res.statusCode;
    error.data = res.data as T;
    error.raw = res;
  }
  return error;
};

const getStoredToken = () => {
  try {
    const token = uni.getStorageSync('token');
    return typeof token === 'string' ? token : '';
  } catch {
    return '';
  }
};

const coreRequest = <T = any>(options: RequestOptions<T>) => {
  const {
    url,
    showErrorToast = true,
    baseURL,
    header = {},
    ...rest
  } = options as RequestOptions<T> & Record<string, any>;

  const finalUrl = isAbsoluteUrl(url) ? url : joinUrl(baseURL || BASE_URL, url);
  const token = getStoredToken();
  const authHeaders = token
    ? {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        token,
      }
    : {};

  return new Promise<T>((resolve, reject) => {
    uni.request({
      ...rest,
      url: finalUrl,
      header: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...header,
      },
      success: (res) => {
        const typedRes = res as RequestSuccessResult<T>;
        const success = typedRes.statusCode >= 200 && typedRes.statusCode < 300;
        if (success) {
          resolve(typedRes.data);
          return;
        }

        const errorPayload =
          typedRes.data &&
          typeof typedRes.data === 'object' &&
          'message' in (typedRes.data as Record<string, any>) &&
          typeof (typedRes.data as Record<string, any>).message === 'string'
            ? ((typedRes.data as Record<string, any>).message as string)
            : `请求失败（${typedRes.statusCode}）`;

        if (showErrorToast) {
          uni.showToast({
            title: errorPayload,
            icon: 'none',
          });
        }

        reject(createError(errorPayload, typedRes));
      },
      fail: (err) => {
        if (showErrorToast) {
          uni.showToast({
            title: '网络异常，请稍后再试',
            icon: 'none',
          });
        }
        reject(createError(err.errMsg || 'request fail'));
      },
    });
  });
};

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const createShortcut =
  (method: Method) =>
  <T = any>(url: string, config?: Omit<RequestOptions<T>, 'url' | 'method'>) =>
    coreRequest<T>({
      ...(config as RequestOptions<T>),
      url,
      // @ts-expect-error PATCH is a valid method for our backend, but not in uni-app types.
      method,
    });

export const axios = {
  request: coreRequest,
  get: createShortcut('GET'),
  post: createShortcut('POST'),
  put: createShortcut('PUT'),
  delete: createShortcut('DELETE'),
  patch: createShortcut('PATCH'),
};

export const request = axios.request;

export const getBaseUrl = () => BASE_URL;
