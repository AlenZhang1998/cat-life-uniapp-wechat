"use strict";
const common_vendor = require("../../common/vendor.js");
const constants_storage = require("../../constants/storage.js");
const data_cities = require("../../data/cities.js");
const utils_location = require("../../utils/location.js");
const common_assets = require("../../common/assets.js");
const utils_auth = require("../../utils/auth.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _component_ec_canvas = common_vendor.resolveComponent("ec-canvas");
  _component_ec_canvas();
}
if (!Math) {
  (RangePickerOverlay + LoginOverlay + BottomActionBar)();
}
const BottomActionBar = () => "../../components/BottomActionBar.js";
const RangePickerOverlay = () => "../../components/RangePickerOverlay.js";
const LoginOverlay = () => "../../components/LoginOverlay.js";
const DEFAULT_CITY = "未定位";
const DAY_MS = 24 * 60 * 60 * 1e3;
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const echarts = require("../../wxcomponents/ec-canvas/echarts");
    const normalizeOrDefault = (value) => utils_location.normalizeCityName(value) || DEFAULT_CITY;
    const cityProvinceMap = /* @__PURE__ */ new Map();
    const buildCityProvinceMap = () => {
      data_cities.CITY_LIST.forEach((item) => {
        const normalized = utils_location.normalizeCityName(item.name);
        if (normalized && !cityProvinceMap.has(normalized)) {
          cityProvinceMap.set(normalized, item.province);
        }
        if (!cityProvinceMap.has(item.name)) {
          cityProvinceMap.set(item.name, item.province);
        }
      });
    };
    buildCityProvinceMap();
    const resolveProvinceByCity = (cityName) => {
      if (!cityName)
        return "";
      const normalized = utils_location.normalizeCityName(cityName);
      return cityProvinceMap.get(normalized) || cityProvinceMap.get(cityName) || "";
    };
    const { isLoggedIn, refreshLoginState } = utils_auth.useAuth();
    const showLoginSheet = common_vendor.ref(false);
    const city = common_vendor.ref(normalizeOrDefault(DEFAULT_CITY));
    const province = common_vendor.ref(resolveProvinceByCity(city.value));
    const applyCity = (value) => {
      city.value = normalizeOrDefault(value);
      province.value = resolveProvinceByCity(value);
      common_vendor.index.__f__("log", "at pages/home/index.vue:243", 233, "applyCity = ", city.value, province.value);
    };
    common_vendor.watch(
      () => province.value,
      (v) => {
        if (v)
          fetchOilPrice();
      },
      { immediate: true }
    );
    const syncSelectedCity = () => {
      const stored = common_vendor.index.getStorageSync(constants_storage.STORAGE_KEYS.selectedCity);
      if (stored) {
        applyCity(stored);
      }
    };
    syncSelectedCity();
    const carInfo = common_vendor.ref({
      brand: "思域",
      model: "2025款 240TURBO CVT",
      trim: "智趣Plus",
      name: "--",
      // 思域 · 2025款 240TURBO CVT
      heroDays: 0
    });
    const oilPrice = common_vendor.ref({
      label: "92#",
      value: "--"
    });
    const oilPriceList = common_vendor.ref([
      // {label: "92#", value: "6.91"},
      // {label: "95#", value: "7.48"},
      // {label: "98#", value: "9.48"},
      // {label: "0#", value: "6.53"}
    ]);
    const oilLoading = common_vendor.ref(false);
    const oilError = common_vendor.ref("");
    const fetchOilPrice = async () => {
      if (!province.value)
        return;
      oilLoading.value = true;
      oilError.value = "";
      try {
        const res = await utils_request.axios.get("/api/oil-price?province=" + province.value);
        const data = res;
        if (!(data == null ? void 0 : data.success) || !Array.isArray(data.prices)) {
          oilError.value = "油价数据异常";
          return;
        }
        common_vendor.index.__f__("log", "at pages/home/index.vue:302", 276, "data = ", data);
        oilPriceList.value = data.prices;
        if (data.prices.length) {
          oilPrice.value = data.prices[0];
        }
      } catch (err) {
        common_vendor.index.__f__("warn", "at pages/home/index.vue:308", "fetchOilPrice error:", err);
        oilError.value = "获取油价失败";
      } finally {
        oilLoading.value = false;
      }
    };
    const hasRecentRefuel = common_vendor.ref(false);
    const latestFuel = common_vendor.ref("0");
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
    const getGradeByFuel = (val) => {
      if (val <= 5)
        return "S";
      if (val <= 6.5)
        return "A";
      if (val <= 7.5)
        return "B";
      if (val <= 9)
        return "C";
      return "D";
    };
    common_vendor.watch(latestFuel, (newVal) => {
      const num = Number(newVal);
      if (Number.isNaN(num)) {
        currentEfficiency.value = efficiencyLevels.value[0];
        return;
      }
      const grade = getGradeByFuel(num);
      const target = efficiencyLevels.value.find((item) => item.label === grade) || efficiencyLevels.value[0];
      currentEfficiency.value = target;
    });
    const calcHeroDays = (deliveryDate) => {
      if (!deliveryDate)
        return 0;
      const parsed = new Date(deliveryDate.replace(/-/g, "/"));
      if (Number.isNaN(parsed.getTime()))
        return 0;
      const diff = Date.now() - parsed.getTime();
      if (diff < 0)
        return 0;
      const days = Math.floor(diff / (24 * 60 * 60 * 1e3));
      return days + 1;
    };
    const fetchProfile = async () => {
      if (!isLoggedIn.value) {
        return;
      }
      try {
        const res = await utils_request.axios.get("/api/profile");
        const resp = res;
        const data = resp.data || resp || {};
        carInfo.value.name = data.favoriteCarModel;
        carInfo.value.heroDays = calcHeroDays(data.deliveryDate);
      } catch (err) {
        common_vendor.index.__f__("warn", "at pages/home/index.vue:390", "fetchProfile error:", err);
      }
    };
    const rangeOptions = [
      { key: "3m", label: "三个月" },
      { key: "6m", label: "半年" },
      { key: "1y", label: "一年" },
      { key: "all", label: "全部" }
    ];
    const normalizeDateOnly = (value) => {
      if (!value)
        return null;
      const date = value instanceof Date ? value : new Date(String(value).replace(/-/g, "/"));
      if (Number.isNaN(date.getTime()))
        return null;
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };
    const calcDateRangeDays = (start, end) => {
      const startDate = normalizeDateOnly(start);
      const endDate = normalizeDateOnly(end);
      if (!startDate || !endDate || endDate.getTime() < startDate.getTime()) {
        return null;
      }
      const diff = endDate.getTime() - startDate.getTime();
      return Math.floor(diff / DAY_MS) + 1;
    };
    const calcDaysSinceEarliestRecord = (records) => {
      if (!Array.isArray(records) || records.length === 0)
        return null;
      let earliestTime = null;
      records.forEach((item) => {
        const dateStr = (item == null ? void 0 : item.date) || (item == null ? void 0 : item.refuelDate);
        const parsed = normalizeDateOnly(dateStr);
        if (!parsed)
          return;
        const ts = parsed.getTime();
        if (earliestTime == null || ts < earliestTime) {
          earliestTime = ts;
        }
      });
      if (earliestTime == null)
        return null;
      const today = normalizeDateOnly(/* @__PURE__ */ new Date());
      if (!today)
        return null;
      const diff = today.getTime() - earliestTime;
      if (diff < 0)
        return null;
      return Math.floor(diff / DAY_MS) + 1;
    };
    const stats = common_vendor.ref([
      {
        key: "fuelAvg",
        label: "平均油耗",
        value: "0",
        unit: "升/百公里",
        accent: true
      },
      {
        key: "mileageAvg",
        label: "平均行程",
        value: "0",
        unit: "公里/天"
      },
      {
        key: "costAvg",
        label: "平均油价",
        value: "0",
        unit: "元/公里",
        accent: true
      },
      {
        key: "mileageTotal",
        label: "累计行程",
        value: "0",
        unit: "公里"
      },
      {
        key: "costTotal",
        label: "累计油费",
        value: "0",
        unit: "元"
      },
      {
        key: "discountTotal",
        label: "总计优惠",
        value: "0",
        unit: "元"
      }
    ]);
    const fetchRefuelData = async (rangeKey = rangeOptions[3].key) => {
      var _a;
      if (!isLoggedIn.value) {
        hasRecentRefuel.value = false;
        latestFuel.value = "0";
        return;
      }
      try {
        const resolvedRange = rangeKey || rangeOptions[3].key;
        const url = `/api/refuels/list?range=${resolvedRange || "all"}`;
        const res = await utils_request.axios.get(url);
        const resp = res;
        if (!resp || resp.success !== true) {
          throw new Error("接口返回异常");
        }
        const payload = resp.data || resp || {};
        const s = payload.summary || {};
        const list = payload.records || [];
        const isAllRange = resolvedRange === "all";
        hasRecentRefuel.value = Array.isArray(list) && list.length > 0;
        const latestWithConsumption = list.find((item) => {
          const val = item == null ? void 0 : item.consumption;
          if (val === "--" || val == null)
            return false;
          const num = Number(val);
          return Number.isFinite(num);
        });
        latestFuel.value = latestWithConsumption ? Number(latestWithConsumption.consumption).toFixed(2) : "0";
        let avgFuelNum = null;
        if (!isAllRange) {
          avgFuelNum = typeof s.avgFuelConsumption === "number" ? Number(s.avgFuelConsumption) : null;
        } else {
          const consumptionIndexes = [];
          list.forEach((item, idx) => {
            const c = item == null ? void 0 : item.consumption;
            if (c === "--" || c == null)
              return;
            const num = Number(c);
            if (!Number.isFinite(num))
              return;
            consumptionIndexes.push(idx);
          });
          if (consumptionIndexes.length >= 2) {
            const firstIdx = Math.min(...consumptionIndexes);
            const lastIdx = Math.max(...consumptionIndexes);
            const nextIdx = lastIdx + 1 < list.length ? lastIdx + 1 : lastIdx;
            const first = list[firstIdx] || {};
            const nextAfterLast = list[nextIdx] || {};
            const firstOdo = Number(first.odometer);
            const nextOdo = Number(nextAfterLast.odometer);
            let distance = NaN;
            if (Number.isFinite(firstOdo) && Number.isFinite(nextOdo)) {
              distance = firstOdo - nextOdo;
            }
            let volumeSum = 0;
            for (let i = firstIdx; i <= lastIdx; i++) {
              const v = Number((_a = list[i]) == null ? void 0 : _a.volume);
              if (Number.isFinite(v) && v > 0) {
                volumeSum += v;
              }
            }
            if (distance > 0 && volumeSum > 0) {
              avgFuelNum = volumeSum / distance * 100;
            } else {
              avgFuelNum = null;
            }
          } else {
            avgFuelNum = null;
          }
        }
        const avgFuel = avgFuelNum != null && Number.isFinite(avgFuelNum) ? Number(avgFuelNum).toFixed(2) : "--";
        const totalDistanceNum = s.totalDistance != null ? Number(s.totalDistance) : NaN;
        const totalDistance = Number.isFinite(totalDistanceNum) ? String(Math.round(totalDistanceNum)) : "--";
        const totalAmount = s.totalAmount != null ? Number(s.totalAmount).toFixed(2) : "--";
        const avgPricePerL = s.avgPricePerL != null ? Number(s.avgPricePerL).toFixed(2) : "--";
        const resolvedDateRangeDaysFromList = calcDaysSinceEarliestRecord(list);
        const resolvedDateRangeDays = typeof resolvedDateRangeDaysFromList === "number" ? resolvedDateRangeDaysFromList : typeof s.dateRangeDays === "number" ? s.dateRangeDays : calcDateRangeDays(s.startDate, s.endDate);
        const validDateRangeDays = typeof resolvedDateRangeDays === "number" && resolvedDateRangeDays > 0 ? resolvedDateRangeDays : null;
        const mileageAvg = Number.isFinite(totalDistanceNum) && validDateRangeDays ? (totalDistanceNum / validDateRangeDays).toFixed(2) : "--";
        stats.value = [
          {
            key: "fuelAvg",
            label: "平均油耗",
            value: avgFuel,
            unit: "升/百公里",
            accent: true
          },
          {
            key: "mileageAvg",
            label: "平均行程",
            value: mileageAvg,
            unit: "公里/天"
          },
          {
            key: "costAvg",
            label: "平均油价",
            value: avgPricePerL === "--" ? "--" : avgPricePerL,
            unit: "元/升",
            accent: true
          },
          {
            key: "mileageTotal",
            label: "累计行程",
            value: totalDistance,
            unit: "公里"
          },
          {
            key: "costTotal",
            label: "累计油费",
            value: totalAmount,
            unit: "元"
          },
          {
            key: "discountTotal",
            label: "总计优惠",
            value: "0",
            unit: "元"
          }
        ];
      } catch (err) {
        common_vendor.index.__f__("warn", "at pages/home/index.vue:669", "fetchRefuelData error:", err);
      }
    };
    const fetchTrendData = async (rangeKey = rangeOptions[3].key) => {
      if (!isLoggedIn.value) {
        trendData.value = [];
        return;
      }
      try {
        const resolvedRange = rangeKey || rangeOptions[3].key;
        const url = `/api/refuels/list?range=${resolvedRange || "all"}`;
        const res = await utils_request.axios.get(url);
        const resp = res;
        const payload = resp.data || resp || {};
        const s = payload.summary || {};
        const list = payload.records || [];
        const base = typeof s.avgFuelConsumption === "number" && s.avgFuelConsumption > 0 ? Number(s.avgFuelConsumption) : 7;
        const cityHigh = Number((base * 1.15).toFixed(2));
        const cityLow = Number((base * 0.85).toFixed(2));
        const points = list.slice().reverse().filter((item) => {
          const consumption = item == null ? void 0 : item.consumption;
          if (consumption === "--" || consumption == null)
            return false;
          const num = Number(consumption);
          return Number.isFinite(num);
        }).map((item) => {
          const dateStr = item.date || item.refuelDate;
          let year = NaN;
          if (dateStr) {
            const d = new Date(String(dateStr).replace(/-/g, "/"));
            if (!Number.isNaN(d.getTime())) {
              year = d.getFullYear();
            }
          }
          return {
            day: item.monthDay || "",
            // X 轴显示用，比如 10/09
            year,
            // 用来判断是否跨年
            value: Number(Number(item.consumption).toFixed(2)),
            // 当前车油耗
            cityHigh,
            cityLow
          };
        });
        trendData.value = points;
      } catch (err) {
        common_vendor.index.__f__("warn", "at pages/home/index.vue:734", "fetchTrendData error:", err);
        trendData.value = [];
      }
    };
    const trendData = common_vendor.ref([
      // { day: '2025-10-01', value: 4.9, cityHigh: 8.2, cityLow: 6.1 },
      // { day: '2025-10-02', value: 8.6, cityHigh: 8.15, cityLow: 6.05 },
      // { day: '2025-10-04', value: 8.1, cityHigh: 8.05, cityLow: 6.0 },
      // { day: '2025-10-06', value: 7.3, cityHigh: 8.0, cityLow: 5.96 },
      // { day: '2025-10-09', value: 4.8, cityHigh: 7.95, cityLow: 5.92 }
    ]);
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
    const applyRangeSelection = (target, key) => {
      const targetOption = rangeOptions.find((option) => option.key === key);
      if (!targetOption)
        return;
      const rangeRef = resolveTargetRange(target);
      const changed = rangeRef.value.key !== targetOption.key;
      rangeRef.value = targetOption;
      pendingRangeKey.value = targetOption.key;
      if (changed) {
        if (target === "stats") {
          fetchRefuelData(targetOption.key);
        } else {
          fetchTrendData(targetOption.key);
        }
      }
      const targetLabel = target === "stats" ? "统计" : "趋势";
      common_vendor.index.showToast({
        title: `${targetLabel}已切换到${targetOption.label}`,
        icon: "none"
      });
    };
    const confirmRangePicker = (value) => {
      const finalKey = value || pendingRangeKey.value;
      if (finalKey) {
        applyRangeSelection(activeRangeTarget.value, finalKey);
      }
      closeRangePicker();
    };
    let fuelTrendChart = null;
    const buildTrendOption = () => {
      const years = trendData.value.map((item) => item.year);
      const categories = trendData.value.map((item) => item.day);
      const actualSeries = trendData.value.map((item) => item.value);
      const highSeries = trendData.value.map((item) => item.cityHigh);
      const lowSeries = trendData.value.map((item) => item.cityLow);
      const cityLegendHigh = `${city.value}油耗参考-高位`;
      const cityLegendLow = `${city.value}油耗参考-低位`;
      const allValues = [...actualSeries, ...highSeries, ...lowSeries].filter(
        (v) => typeof v === "number" && !Number.isNaN(v)
      );
      const yMin = allValues.length > 0 ? Math.floor(Math.min(...allValues) - 0.5) : 4;
      const yMax = allValues.length > 0 ? Math.ceil(Math.max(...allValues) + 0.5) : 9;
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
            margin: 16,
            interval: 0,
            formatter: (value, index) => {
              const year = years[index];
              const prevYear = index > 0 ? years[index - 1] : null;
              if (!year || Number.isNaN(year)) {
                return value;
              }
              if (index === 0 || year !== prevYear) {
                const shortYear = String(year).slice(-2);
                return `${shortYear}年${value}`;
              }
              return value;
            }
          },
          splitLine: { show: false }
        },
        yAxis: {
          type: "value",
          // min: 4,
          // max: 9,
          min: yMin,
          max: yMax,
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
    const handleLoginRequired = () => {
      if (!isLoggedIn.value) {
        showLoginSheet.value = true;
      }
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
              applyCity(selectedCity);
            }
          }
        }
      });
    };
    common_vendor.onShow(() => {
      refreshLoginState();
      syncSelectedCity();
      runPageEnterAnimation();
      fetchProfile();
      fetchRefuelData(statsRange.value.key);
      fetchTrendData(trendRange.value.key);
    });
    common_vendor.onMounted(() => {
      runPageEnterAnimation();
    });
    common_vendor.onUnmounted(() => {
      fuelTrendChart == null ? void 0 : fuelTrendChart.dispose();
      fuelTrendChart = null;
      if (enterAnimationTimer) {
        clearTimeout(enterAnimationTimer);
        enterAnimationTimer = null;
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.unref(common_assets.locationIcon),
        b: common_vendor.t(city.value),
        c: common_vendor.unref(common_assets.dingwei_right),
        d: common_vendor.o(navigateToCity),
        e: common_vendor.t(carInfo.value.heroDays),
        f: common_vendor.t(carInfo.value.name),
        g: oilPriceList.value.length
      }, oilPriceList.value.length ? {
        h: common_vendor.f(oilPriceList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: common_vendor.t(item.value),
            c: item.label
          };
        }),
        i: oilPriceList.value.length > 1,
        j: oilPriceList.value.length > 1
      } : {
        k: common_vendor.t(oilPrice.value.label),
        l: common_vendor.t(oilPrice.value.value)
      }, {
        m: !hasRecentRefuel.value
      }, !hasRecentRefuel.value ? {} : {}, {
        n: isPageAnimated.value ? 1 : "",
        o: common_vendor.o(($event) => handleNavigate("trend")),
        p: common_vendor.t(latestFuel.value),
        q: common_vendor.f(efficiencyLevels.value, (level, k0, i0) => {
          return {
            a: common_vendor.t(level.label),
            b: level.label,
            c: level.label === currentEfficiency.value.label && common_vendor.unref(isLoggedIn) ? 1 : "",
            d: common_vendor.s(getBadgeStyle(level))
          };
        }),
        r: isPageAnimated.value ? 1 : "",
        s: common_vendor.t(statsRange.value.label),
        t: common_vendor.o(($event) => openRangePicker("stats")),
        v: common_vendor.f(stats.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: common_vendor.t(item.value),
            c: item.accent ? 1 : "",
            d: common_vendor.t(item.unit),
            e: item.key
          };
        }),
        w: isPageAnimated.value ? 1 : "",
        x: common_vendor.t(trendRange.value.label),
        y: common_vendor.o(($event) => openRangePicker("trend")),
        z: common_vendor.p({
          id: "fuelTrendChart",
          canvasId: "fuelTrendChart",
          ec: fuelTrendEc.value
        }),
        A: isPageAnimated.value ? 1 : "",
        B: common_vendor.o(handlePendingRangeChange),
        C: common_vendor.o(closeRangePicker),
        D: common_vendor.o(confirmRangePicker),
        E: common_vendor.p({
          visible: showRangePicker.value,
          title: "请选择",
          options: rangeOptions,
          ["selected-key"]: pendingRangeKey.value
        }),
        F: common_vendor.o(($event) => showLoginSheet.value = $event),
        G: common_vendor.p({
          visible: showLoginSheet.value
        }),
        H: common_vendor.o(handleLoginRequired),
        I: common_vendor.p({
          active: "fuel",
          ["is-logged-in"]: common_vendor.unref(isLoggedIn)
        }),
        J: showRangePicker.value ? 1 : ""
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-4978fed5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/index.js.map
