"use strict";
const common_vendor = require("../common/vendor.js");
const DEFAULT_BASE_URL = "http://192.168.60.90:3000";
const getEnvBaseUrl = () => {
  try {
    return "";
  } catch {
    return "";
  }
};
const BASE_URL = getEnvBaseUrl() || DEFAULT_BASE_URL;
const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url);
const joinUrl = (base, path) => {
  if (!base)
    return path;
  if (!path)
    return base;
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};
const createError = (message, res) => {
  const error = new Error(message);
  if (res) {
    error.statusCode = res.statusCode;
    error.data = res.data;
    error.raw = res;
  }
  return error;
};
const getStoredToken = () => {
  try {
    const token = common_vendor.index.getStorageSync("token");
    return typeof token === "string" ? token : "";
  } catch {
    return "";
  }
};
const coreRequest = (options) => {
  const {
    url,
    showErrorToast = true,
    baseURL,
    header = {},
    ...rest
  } = options;
  const finalUrl = isAbsoluteUrl(url) ? url : joinUrl(baseURL || BASE_URL, url);
  const token = getStoredToken();
  const authHeaders = token ? {
    Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    token
  } : {};
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      ...rest,
      url: finalUrl,
      header: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...header
      },
      success: (res) => {
        const typedRes = res;
        const success = typedRes.statusCode >= 200 && typedRes.statusCode < 300;
        if (success) {
          resolve(typedRes.data);
          return;
        }
        const errorPayload = typedRes.data && typeof typedRes.data === "object" && "message" in typedRes.data && typeof typedRes.data.message === "string" ? typedRes.data.message : `请求失败（${typedRes.statusCode}）`;
        if (showErrorToast) {
          common_vendor.index.showToast({
            title: errorPayload,
            icon: "none"
          });
        }
        reject(createError(errorPayload, typedRes));
      },
      fail: (err) => {
        if (showErrorToast) {
          common_vendor.index.showToast({
            title: "网络异常，请稍后再试",
            icon: "none"
          });
        }
        reject(createError(err.errMsg || "request fail"));
      }
    });
  });
};
const createShortcut = (method) => (url, config) => coreRequest({
  ...config,
  url,
  // @ts-expect-error PATCH is a valid method for our backend, but not in uni-app types.
  method
});
const axios = {
  request: coreRequest,
  get: createShortcut("GET"),
  post: createShortcut("POST"),
  put: createShortcut("PUT"),
  delete: createShortcut("DELETE"),
  patch: createShortcut("PATCH")
};
const getBaseUrl = () => BASE_URL;
exports.axios = axios;
exports.getBaseUrl = getBaseUrl;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/request.js.map
