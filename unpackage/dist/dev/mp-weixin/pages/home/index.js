"use strict";
const common_vendor = require("../../common/vendor.js");
const constants_storage = require("../../constants/storage.js");
const utils_location = require("../../utils/location.js");
const common_assets = require("../../common/assets.js");
if (!Math) {
  BottomActionBar();
}
const BottomActionBar = () => "../../components/BottomActionBar.js";
const DEFAULT_CITY = "深圳市";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const normalizeOrDefault = (value) => utils_location.normalizeCityName(value) || DEFAULT_CITY;
    const city = common_vendor.ref(normalizeOrDefault(DEFAULT_CITY));
    const syncSelectedCity = () => {
      const stored = common_vendor.index.getStorageSync(
        constants_storage.STORAGE_KEYS.selectedCity
      );
      if (stored) {
        city.value = normalizeOrDefault(stored);
      }
    };
    syncSelectedCity();
    const carInfo = common_vendor.ref({
      brand: "思域",
      model: "2025款 240TURBO CVT",
      trim: "智趣Plus"
    });
    common_vendor.ref({
      label: "92#",
      value: "7.07"
    });
    const hasRecentRefuel = common_vendor.ref(false);
    const latestFuel = common_vendor.ref("4.80");
    const efficiencyLevels = common_vendor.ref([
      { label: "S", badgeBg: "#e4faed", badgeColor: "#07c263" },
      { label: "A", badgeBg: "#f0f9e7", badgeColor: "#94d951" },
      { label: "B", badgeBg: "#f4faeb", badgeColor: "#c7e969" },
      { label: "C", badgeBg: "#fff7e4", badgeColor: "#f7d36c" },
      { label: "D", badgeBg: "#fff1df", badgeColor: "#fabb59" }
    ]);
    const currentEfficiency = common_vendor.ref(efficiencyLevels.value[0]);
    const getBadgeStyle = (level) => ({
      "--badge-bg": level.badgeBg,
      "--badge-color": level.badgeColor
    });
    const stats = common_vendor.ref([
      {
        key: "fuelAvg",
        label: "平均油耗",
        value: "5.71",
        unit: "升/百公里",
        accent: true
      },
      {
        key: "mileageAvg",
        label: "平均行程",
        value: "92.76",
        unit: "公里/天"
      },
      {
        key: "costAvg",
        label: "平均油费",
        value: "0.35",
        unit: "元/公里",
        accent: true
      },
      {
        key: "mileageTotal",
        label: "累计行程",
        value: "1577",
        unit: "公里"
      },
      {
        key: "costTotal",
        label: "累计油费",
        value: "836.7",
        unit: "元"
      },
      {
        key: "discountTotal",
        label: "总计优惠",
        value: "128.4",
        unit: "元"
      }
    ]);
    const trendData = common_vendor.ref([
      { day: "周一", value: 6.2 },
      { day: "周二", value: 6.9 },
      { day: "周三", value: 8.4 },
      { day: "周四", value: 9 },
      { day: "周五", value: 7.6 },
      { day: "周六", value: 6.8 },
      { day: "周日", value: 6.5 }
    ]);
    const selectedRange = common_vendor.ref({
      label: "全部"
    });
    const maxTrendValue = common_vendor.computed(
      () => Math.max(...trendData.value.map((item) => item.value))
    );
    const minTrendValue = common_vendor.computed(
      () => Math.min(...trendData.value.map((item) => item.value))
    );
    const getPointStyle = (value, index) => {
      const safeRange = Math.max(maxTrendValue.value - minTrendValue.value, 1);
      const heightPercent = (value - minTrendValue.value) / safeRange * 80 + 10;
      const leftPercent = trendData.value.length === 1 ? 50 : index / (trendData.value.length - 1) * 100;
      return `left:${leftPercent}%;bottom:${heightPercent}%`;
    };
    const handleNavigate = (actionKey) => {
      common_vendor.index.showToast({
        title: `功能 ${actionKey} 开发中`,
        icon: "none"
      });
    };
    const navigateToCity = () => {
      common_vendor.index.navigateTo({
        url: `/pages/city/index?currentCity=${encodeURIComponent(city.value)}`,
        events: {
          "city-selected": (selectedCity) => {
            if (selectedCity) {
              city.value = normalizeOrDefault(selectedCity);
            }
          }
        }
      });
    };
    common_vendor.onShow(() => {
      syncSelectedCity();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(common_assets.locationIcon),
        b: common_vendor.t(city.value),
        c: common_vendor.unref(common_assets.dingwei_right),
        d: common_vendor.o(navigateToCity),
        e: common_vendor.t(carInfo.value.brand),
        f: common_vendor.t(carInfo.value.model),
        g: common_vendor.t(carInfo.value.trim),
        h: !hasRecentRefuel.value
      }, !hasRecentRefuel.value ? {} : {}, {
        i: common_vendor.o(($event) => handleNavigate("trend")),
        j: common_vendor.t(latestFuel.value),
        k: common_vendor.f(efficiencyLevels.value, (level, k0, i0) => {
          return {
            a: common_vendor.t(level.label),
            b: level.label,
            c: level.label === currentEfficiency.value.label ? 1 : "",
            d: common_vendor.s(getBadgeStyle(level))
          };
        }),
        l: common_vendor.t(selectedRange.value.label),
        m: common_vendor.f(stats.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: common_vendor.t(item.value),
            c: item.accent ? 1 : "",
            d: common_vendor.t(item.unit),
            e: item.key
          };
        }),
        n: common_vendor.t(selectedRange.value.label),
        o: common_vendor.f(5, (line, k0, i0) => {
          return {
            a: line
          };
        }),
        p: common_vendor.f(trendData.value, (point, index, i0) => {
          return {
            a: common_vendor.t(point.day),
            b: point.day,
            c: common_vendor.s(getPointStyle(point.value, index))
          };
        }),
        q: common_vendor.p({
          active: "fuel"
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4978fed5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/index.js.map
