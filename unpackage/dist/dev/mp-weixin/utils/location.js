"use strict";
const common_vendor = require("../common/vendor.js");
var define_import_meta_env_default = { VITE_CJS_IGNORE_WARNING: "true", VITE_ROOT_DIR: "D:/Learn/projectFile/cat-life-uniapp-wechat", VITE_USER_NODE_ENV: "development", BASE_URL: "/", MODE: "development", DEV: true, PROD: false, SSR: false };
const TENCENT_MAP_KEY = (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore uni-app 会在编译阶段注入 import.meta.env
  (define_import_meta_env_default == null ? void 0 : define_import_meta_env_default.VITE_TENCENT_MAP_KEY) || ""
);
const GEOCODER_ENDPOINT = "https://apis.map.qq.com/ws/geocoder/v1";
const CITY_NAME_MATCHER = /(北京市|天津市|上海市|重庆市|[\u4e00-\u9fa5]+?(?:自治州|地区|盟|市|区))/u;
const request = (options) => new Promise((resolve, reject) => {
  common_vendor.index.request({
    ...options,
    success: (res) => resolve(res),
    fail: (err) => reject(err)
  });
});
const requestLocation = () => new Promise((resolve, reject) => {
  common_vendor.index.getLocation({
    type: "gcj02",
    isHighAccuracy: true,
    highAccuracyExpireTime: 3e3,
    success: (pos) => resolve(pos),
    fail: (err) => reject(err)
  });
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
  return match ? match[1].replace(/(省|特别行政区)$/, "") : null;
};
const reverseGeocodeByTencent = async (latitude, longitude) => {
  if (!TENCENT_MAP_KEY) {
    return null;
  }
  try {
    const response = await request({
      url: GEOCODER_ENDPOINT,
      method: "GET",
      data: {
        key: TENCENT_MAP_KEY,
        location: `${latitude},${longitude}`,
        get_poi: 0
      }
    });
    if (response.data.status === 0 && response.data.result) {
      const {
        result: { address, ad_info }
      } = response.data;
      return {
        city: ad_info.city.replace(/(市|地区|盟)$/u, ""),
        province: ad_info.province,
        address
      };
    }
  } catch (error) {
    common_vendor.index.__f__("warn", "at utils/location.ts:93", "reverseGeocodeByTencent failed", error);
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
    common_vendor.index.__f__("warn", "at utils/location.ts:112", "locateCityByGPS failed", error);
  }
  return null;
};
const chooseCityFromMap = async () => {
  const selection = await chooseLocationManually();
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
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/location.js.map
