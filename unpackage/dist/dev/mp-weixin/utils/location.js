"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("./request.js");
const TENCENT_MAP_KEY = (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore uni-app 会在编译阶段注入 import.meta.env
  "T64BZ-CJYCL-MIKPS-M4SQU-IXTRZ-GKBAA"
);
const GEOCODER_ENDPOINT = "https://apis.map.qq.com/ws/geocoder/v1";
const CITY_NAME_MATCHER = /(北京市|天津市|上海市|重庆市|[\u4e00-\u9fa5]+?(?:自治区|自治州|地区|盟|市|区|县))/u;
const PROVINCE_PREFIX_MATCHER = /^[\u4e00-\u9fa5]+?(?:省|自治区|特别行政区)/u;
const PROVINCE_SUFFIX_MATCHER = /(省|特别行政区)$/u;
const requestLocation = () => new Promise((resolve, reject) => {
  const tryOnce = (highAccuracy) => {
    common_vendor.index.getLocation({
      type: "gcj02",
      isHighAccuracy: highAccuracy,
      highAccuracyExpireTime: 3e3,
      success: (pos) => {
        common_vendor.index.__f__("log", "at utils/location.ts:37", "[requestLocation] success", pos);
        resolve(pos);
      },
      fail: (err) => {
        common_vendor.index.__f__("warn", "at utils/location.ts:41", "[requestLocation] fail", err);
        if (highAccuracy && (err.errCode === 404 || err.errCode === 2)) {
          tryOnce(false);
        } else {
          reject(err);
        }
      }
    });
  };
  tryOnce(true);
});
const chooseLocationManually = () => new Promise((resolve) => {
  common_vendor.index.chooseLocation({
    success: (res) => resolve(res),
    fail: () => resolve(null)
  });
});
const extractCityFromText = (text) => {
  if (!text)
    return null;
  const match = text.match(CITY_NAME_MATCHER);
  if (!match)
    return null;
  const raw = match[1];
  const withoutPrefix = raw.replace(PROVINCE_PREFIX_MATCHER, "");
  const normalized = withoutPrefix || raw;
  return normalized.replace(PROVINCE_SUFFIX_MATCHER, "");
};
const normalizeCityName = (text) => {
  if (!text)
    return "";
  const normalized = extractCityFromText(text);
  return (normalized ?? text).trim();
};
const reverseGeocodeByTencent = async (latitude, longitude) => {
  common_vendor.index.__f__("log", "at utils/location.ts:83", 83, "[reverseGeocodeByTencent] KEY =", TENCENT_MAP_KEY);
  try {
    const response = await utils_request.axios.request({
      url: GEOCODER_ENDPOINT,
      method: "GET",
      data: {
        key: TENCENT_MAP_KEY,
        location: `${latitude},${longitude}`,
        get_poi: 0
      },
      showErrorToast: false
    });
    if (response.status === 0 && response.result) {
      const {
        result: { address, ad_info }
      } = response;
      return {
        city: ad_info.city.replace(/(市|地区|盟)$/u, ""),
        province: ad_info.province,
        address
      };
    }
  } catch (error) {
    common_vendor.index.__f__("warn", "at utils/location.ts:123", "reverseGeocodeByTencent failed", error);
  }
  return null;
};
const locateCityByGPS = async () => {
  try {
    const { latitude, longitude } = await requestLocation();
    const geocode = await reverseGeocodeByTencent(latitude, longitude);
    if (geocode) {
      return {
        city: geocode.city,
        latitude,
        longitude,
        province: geocode.province,
        address: geocode.address
      };
    }
  } catch (error) {
    common_vendor.index.__f__("warn", "at utils/location.ts:142", "locateCityByGPS failed", error);
  }
  return null;
};
const chooseCityFromMap = async () => {
  const selection = await chooseLocationManually();
  common_vendor.index.__f__("log", "at utils/location.ts:149", 149, "selection = ", selection);
  if (!selection)
    return null;
  const cityName = extractCityFromText(selection.address) ?? extractCityFromText(selection.name);
  return {
    city: cityName || selection.name,
    latitude: selection.latitude,
    longitude: selection.longitude,
    address: selection.address
  };
};
const ensureLocationAuth = () => new Promise((resolve, reject) => {
  common_vendor.index.getSetting({
    success(setting) {
      var _a;
      if ((_a = setting.authSetting) == null ? void 0 : _a["scope.userLocation"]) {
        resolve();
        return;
      }
      common_vendor.index.authorize({
        scope: "scope.userLocation",
        success: () => resolve(),
        fail: () => {
          common_vendor.index.showModal({
            title: "需要定位权限",
            content: "开启定位权限以使用自动定位功能",
            confirmText: "去开启",
            success(res) {
              if (res.confirm) {
                common_vendor.index.openSetting({});
              }
            }
          });
          reject(new Error("user denied location scope"));
        }
      });
    },
    fail: (err) => reject(err)
  });
});
exports.chooseCityFromMap = chooseCityFromMap;
exports.ensureLocationAuth = ensureLocationAuth;
exports.locateCityByGPS = locateCityByGPS;
exports.normalizeCityName = normalizeCityName;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/location.js.map
