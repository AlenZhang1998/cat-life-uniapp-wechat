"use strict";
const common_vendor = require("../common/vendor.js");
const TOKEN_KEY = "token";
const PROFILE_KEY = "userProfile";
const isLoggedIn = common_vendor.ref(false);
const readTokenFromStorage = () => {
  try {
    const token = common_vendor.index.getStorageSync(TOKEN_KEY);
    return typeof token === "string" ? token : "";
  } catch (error) {
    common_vendor.index.__f__("warn", "at utils/auth.ts:15", "读取 token 失败", error);
    return "";
  }
};
const readProfileFromStorage = () => {
  try {
    const stored = common_vendor.index.getStorageSync(PROFILE_KEY);
    if (!stored) {
      return null;
    }
    if (typeof stored === "string") {
      try {
        return JSON.parse(stored);
      } catch (error) {
        common_vendor.index.__f__("warn", "at utils/auth.ts:30", "解析用户信息失败", error);
        return null;
      }
    }
    return stored;
  } catch (error) {
    common_vendor.index.__f__("warn", "at utils/auth.ts:36", "读取用户信息失败", error);
    return null;
  }
};
const resolveLoginState = () => {
  const token = readTokenFromStorage();
  if (token) {
    return true;
  }
  const profile = readProfileFromStorage();
  return !!(profile && profile.name);
};
const refreshLoginState = () => {
  isLoggedIn.value = resolveLoginState();
  return isLoggedIn.value;
};
const setStoredToken = (token) => {
  try {
    if (token) {
      common_vendor.index.setStorageSync(TOKEN_KEY, token);
    } else {
      common_vendor.index.removeStorageSync(TOKEN_KEY);
    }
  } catch (error) {
    common_vendor.index.__f__("warn", "at utils/auth.ts:63", "写入 token 失败", error);
  }
  refreshLoginState();
};
const setStoredProfile = (profile) => {
  try {
    if (profile) {
      common_vendor.index.setStorageSync(PROFILE_KEY, profile);
    } else {
      common_vendor.index.removeStorageSync(PROFILE_KEY);
    }
  } catch (error) {
    common_vendor.index.__f__("warn", "at utils/auth.ts:76", "写入用户信息失败", error);
  }
  refreshLoginState();
};
refreshLoginState();
const useAuth = () => ({
  isLoggedIn,
  refreshLoginState,
  setStoredToken,
  setStoredProfile,
  getStoredProfile: readProfileFromStorage
});
exports.useAuth = useAuth;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/auth.js.map
