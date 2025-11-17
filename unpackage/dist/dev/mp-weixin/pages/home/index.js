"use strict";
const common_vendor = require("../../common/vendor.js");
const constants_storage = require("../../constants/storage.js");
const utils_location = require("../../utils/location.js");
const common_assets = require("../../common/assets.js");
if (!Array) {
  const _component_ec_canvas = common_vendor.resolveComponent("ec-canvas");
  _component_ec_canvas();
}
if (!Math) {
  (RangePickerOverlay + BottomActionBar)();
}
const BottomActionBar = () => "../../components/BottomActionBar.js";
const RangePickerOverlay = () => "../../components/RangePickerOverlay.js";
const DEFAULT_CITY = "深圳市";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const echarts = require("../../wxcomponents/ec-canvas/echarts");
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
      { day: "2025-10-01", value: 4.9, cityHigh: 8.2, cityLow: 6.1 },
      { day: "2025-10-02", value: 8.6, cityHigh: 8.15, cityLow: 6.05 },
      { day: "2025-10-04", value: 8.1, cityHigh: 8.05, cityLow: 6 },
      { day: "2025-10-06", value: 7.3, cityHigh: 8, cityLow: 5.96 },
      { day: "2025-10-09", value: 4.8, cityHigh: 7.95, cityLow: 5.92 }
    ]);
    const rangeOptions = [
      { key: "3m", label: "三个月" },
      { key: "6m", label: "半年" },
      { key: "1y", label: "一年" },
      { key: "all", label: "全部" }
    ];
    const statsRange = common_vendor.ref(rangeOptions[3]);
    const trendRange = common_vendor.ref(rangeOptions[3]);
    const showRangePicker = common_vendor.ref(false);
    const pendingRangeKey = common_vendor.ref(rangeOptions[3].key);
    const activeRangeTarget = common_vendor.ref("stats");
    const isPageAnimated = common_vendor.ref(false);
    let enterAnimationTimer = null;
    const resolveTargetRange = (target) => target === "stats" ? statsRange : trendRange;
    const runPageEnterAnimation = () => {
      if (enterAnimationTimer) {
        clearTimeout(enterAnimationTimer);
        enterAnimationTimer = null;
      }
      isPageAnimated.value = false;
      enterAnimationTimer = setTimeout(() => {
        isPageAnimated.value = true;
      }, 30);
    };
    const openRangePicker = (target) => {
      activeRangeTarget.value = target;
      pendingRangeKey.value = resolveTargetRange(target).value.key;
      showRangePicker.value = true;
    };
    const closeRangePicker = () => {
      showRangePicker.value = false;
    };
    const handlePendingRangeChange = (value) => {
      if (value) {
        pendingRangeKey.value = value;
      }
    };
    const confirmRangePicker = () => {
      const target = rangeOptions.find((option) => option.key === pendingRangeKey.value);
      if (target) {
        const rangeRef = resolveTargetRange(activeRangeTarget.value);
        rangeRef.value = target;
      }
      closeRangePicker();
    };
    let fuelTrendChart = null;
    const buildTrendOption = () => {
      const categories = trendData.value.map((item) => item.day);
      const actualSeries = trendData.value.map((item) => item.value);
      const highSeries = trendData.value.map((item) => item.cityHigh);
      const lowSeries = trendData.value.map((item) => item.cityLow);
      const cityLegendHigh = `${city.value}油耗参考-高位`;
      const cityLegendLow = `${city.value}油耗参考-低位`;
      return {
        color: ["#F47274", "#11B561", "#AEB5C0"],
        animationDuration: 700,
        legend: {
          left: 24,
          top: 12,
          icon: "roundRect",
          itemWidth: 20,
          itemHeight: 6,
          textStyle: {
            color: "#5F6673",
            fontSize: 8
          },
          data: [cityLegendHigh, "油耗", cityLegendLow]
        },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(28,31,43,0.9)",
          borderWidth: 0,
          textStyle: {
            color: "#fff",
            fontSize: 12
          },
          axisPointer: {
            type: "line",
            lineStyle: {
              color: "#0AB068",
              width: 1,
              type: "dashed"
            }
          }
        },
        grid: {
          left: 40,
          right: 30,
          top: 40,
          bottom: 60
        },
        xAxis: {
          type: "category",
          data: categories,
          boundaryGap: false,
          axisLine: { lineStyle: { color: "#D0D7E3" } },
          axisTick: { show: false },
          axisLabel: {
            color: "#8a93a0",
            fontSize: 12,
            margin: 16
          },
          splitLine: { show: false }
        },
        yAxis: {
          type: "value",
          min: 4,
          max: 9,
          interval: 1,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: "#8a93a0",
            fontSize: 12,
            formatter: (value) => value.toFixed(1)
          },
          splitLine: {
            lineStyle: { color: "#E1E6EF", type: "dashed" }
          }
        },
        series: [
          {
            name: cityLegendHigh,
            type: "line",
            data: highSeries,
            smooth: true,
            showSymbol: true,
            symbolSize: 2,
            lineStyle: { width: 1 }
          },
          {
            name: "油耗",
            type: "line",
            data: actualSeries,
            smooth: true,
            showSymbol: true,
            symbolSize: 2,
            lineStyle: { width: 2 },
            itemStyle: { color: "#11B97A" },
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: "rgba(17,181,97,0.18)" },
                  { offset: 1, color: "rgba(17,181,97,0)" }
                ]
              }
            }
          },
          {
            name: cityLegendLow,
            type: "line",
            data: lowSeries,
            smooth: true,
            showSymbol: true,
            symbolSize: 2,
            lineStyle: { width: 1, type: "dashed", color: "#AEB5C0" },
            itemStyle: { color: "#AEB5C0" }
          }
        ]
      };
    };
    const initFuelTrendChart = (canvas, width, height, dpr) => {
      var _a;
      if (!canvas) {
        return null;
      }
      const chart = echarts.init(canvas, null, {
        width,
        height,
        devicePixelRatio: dpr
      });
      (_a = canvas.setChart) == null ? void 0 : _a.call(canvas, chart);
      chart.setOption(buildTrendOption());
      fuelTrendChart = chart;
      return chart;
    };
    const fuelTrendEc = common_vendor.ref({
      lazyLoad: false,
      onInit: initFuelTrendChart
    });
    const refreshFuelTrendChart = () => {
      if (fuelTrendChart) {
        fuelTrendChart.setOption(buildTrendOption(), true);
      }
    };
    common_vendor.watch(
      trendData,
      () => {
        refreshFuelTrendChart();
      },
      { deep: true }
    );
    common_vendor.watch(city, () => {
      refreshFuelTrendChart();
    });
    common_vendor.onUnmounted(() => {
      fuelTrendChart == null ? void 0 : fuelTrendChart.dispose();
      fuelTrendChart = null;
      if (enterAnimationTimer) {
        clearTimeout(enterAnimationTimer);
        enterAnimationTimer = null;
      }
    });
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
      runPageEnterAnimation();
    });
    common_vendor.onMounted(() => {
      runPageEnterAnimation();
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
        i: isPageAnimated.value ? 1 : "",
        j: common_vendor.o(($event) => handleNavigate("trend")),
        k: common_vendor.t(latestFuel.value),
        l: common_vendor.f(efficiencyLevels.value, (level, k0, i0) => {
          return {
            a: common_vendor.t(level.label),
            b: level.label,
            c: level.label === currentEfficiency.value.label ? 1 : "",
            d: common_vendor.s(getBadgeStyle(level))
          };
        }),
        m: isPageAnimated.value ? 1 : "",
        n: common_vendor.t(statsRange.value.label),
        o: common_vendor.o(($event) => openRangePicker("stats")),
        p: common_vendor.f(stats.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: common_vendor.t(item.value),
            c: item.accent ? 1 : "",
            d: common_vendor.t(item.unit),
            e: item.key
          };
        }),
        q: isPageAnimated.value ? 1 : "",
        r: common_vendor.t(trendRange.value.label),
        s: common_vendor.o(($event) => openRangePicker("trend")),
        t: common_vendor.p({
          id: "fuelTrendChart",
          canvasId: "fuelTrendChart",
          ec: fuelTrendEc.value
        }),
        v: isPageAnimated.value ? 1 : "",
        w: common_vendor.o(handlePendingRangeChange),
        x: common_vendor.o(closeRangePicker),
        y: common_vendor.o(confirmRangePicker),
        z: common_vendor.p({
          visible: showRangePicker.value,
          title: "请选择",
          options: rangeOptions,
          ["selected-key"]: pendingRangeKey.value
        }),
        A: common_vendor.p({
          active: "fuel"
        }),
        B: showRangePicker.value ? 1 : ""
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4978fed5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/index.js.map
