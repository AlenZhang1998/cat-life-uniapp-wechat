"use strict";
const common_vendor = require("../../common/vendor.js");
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
const DAY_MS = 24 * 60 * 60 * 1e3;
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const echarts = require("../../wxcomponents/ec-canvas/echarts");
    const YEAR_COLOR_POOL = [
      "#E34CFF",
      // 粉
      "#3A7AFE",
      // 蓝
      "#1EC15F",
      // 绿
      "#FF9F0A",
      // 橙
      "#FF4D4F",
      // 红
      "#8B5CF6",
      // 紫
      "#14B8A6",
      // 青
      "#F97316",
      // 深橙
      "#22C55E",
      // 深绿
      "#0EA5E9"
      // 天蓝
    ];
    const getYearColor = (year) => {
      if (!Number.isFinite(year))
        return "#3A7AFE";
      const idx = Math.abs(year) % YEAR_COLOR_POOL.length;
      return YEAR_COLOR_POOL[idx];
    };
    const { isLoggedIn, refreshLoginState } = utils_auth.useAuth();
    const showLoginSheet = common_vendor.ref(false);
    const handleLoginRequired = () => {
      if (!isLoggedIn.value) {
        showLoginSheet.value = true;
      }
    };
    const calcHeroDays = (deliveryDate) => {
      if (!deliveryDate)
        return 0;
      const parsed = new Date(deliveryDate.replace(/-/g, "/"));
      if (Number.isNaN(parsed.getTime()))
        return 0;
      const diff = Date.now() - parsed.getTime();
      if (diff < 0)
        return 0;
      const days = Math.floor(diff / DAY_MS);
      return days + 1;
    };
    const calcDaysSinceEarliestRecord = (records) => {
      if (!Array.isArray(records) || records.length === 0)
        return 0;
      let earliestTs = null;
      records.forEach((item) => {
        const dateStr = (item == null ? void 0 : item.date) || (item == null ? void 0 : item.refuelDate);
        if (!dateStr)
          return;
        const ts = new Date(String(dateStr).replace(/-/g, "/")).getTime();
        if (Number.isNaN(ts))
          return;
        if (earliestTs === null || ts < earliestTs) {
          earliestTs = ts;
        }
      });
      if (earliestTs === null)
        return 0;
      const diff = Date.now() - earliestTs;
      if (diff < 0)
        return 0;
      return Math.floor(diff / DAY_MS) + 1;
    };
    const profileDeliveryDate = common_vendor.ref(null);
    const fetchProfile = async () => {
      if (!isLoggedIn.value)
        return;
      try {
        const res = await utils_request.axios.get("/api/profile");
        const resp = res;
        const data = resp.data || resp || {};
        profileDeliveryDate.value = data.deliveryDate || "";
      } catch (err) {
        common_vendor.index.__f__("warn", "at pages/expense/index.vue:372", "fetchProfile error:", err);
      }
    };
    const HERO_RANGE_OPTIONS = [
      { key: "3m", label: "三个月" },
      { key: "6m", label: "半年" },
      { key: "1y", label: "一年" },
      { key: "2y", label: "两年" },
      { key: "all", label: "全部" }
    ];
    const heroRange = common_vendor.ref(HERO_RANGE_OPTIONS[4]);
    const showHeroPicker = common_vendor.ref(false);
    const pendingHeroRange = common_vendor.ref(heroRange.value.key);
    const heroOverview = common_vendor.ref({
      total: "--",
      fuel: "--",
      other: "--",
      metrics: [
        { key: "days", label: "爱车相伴", value: "--", unit: "天" },
        { key: "fuelKm", label: "油费/公里", value: "--", unit: "元" },
        { key: "perDay", label: "成本/天", value: "--", unit: "元" }
      ]
    });
    const mapRangeToBackend = (key) => {
      if (key === "3m" || key === "6m" || key === "1y" || key === "2y" || key === "3y") {
        return key;
      }
      return "all";
    };
    const fetchHeroData = async (rangeKey = heroRange.value.key) => {
      if (!isLoggedIn.value) {
        heroOverview.value = {
          total: "--",
          fuel: "--",
          other: "--",
          metrics: [
            { key: "days", label: "爱车相伴", value: "--", unit: "天" },
            { key: "fuelKm", label: "油费/公里", value: "--", unit: "元" },
            { key: "perDay", label: "成本/天", value: "--", unit: "元" }
          ]
        };
        return;
      }
      try {
        const backendRange = mapRangeToBackend(rangeKey);
        const res = await utils_request.axios.get(`/api/refuels/list?range=${backendRange}`);
        const resp = res;
        if (!resp || resp.success !== true) {
          throw new Error("接口返回异常");
        }
        const payload = resp.data || resp || {};
        const s = payload.summary || {};
        const list = payload.records || [];
        const totalOilNum = typeof s.totalAmount === "number" ? Number(s.totalAmount) : list.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        const otherTotalNum = 0;
        const totalSpendNum = totalOilNum + otherTotalNum;
        const asc = [...list].reverse();
        let lastFullIndex = null;
        let segmentDistanceTotal = 0;
        let segmentAmountTotal = 0;
        for (let i = 0; i < asc.length; i++) {
          const item = asc[i];
          const isFull = !!item.isFullTank;
          if (!isFull)
            continue;
          if (lastFullIndex === null) {
            lastFullIndex = i;
            continue;
          }
          const start = asc[lastFullIndex];
          const end = item;
          const startOdo = Number(start.odometer);
          const endOdo = Number(end.odometer);
          if (!Number.isFinite(startOdo) || !Number.isFinite(endOdo) || endOdo <= startOdo) {
            lastFullIndex = i;
            continue;
          }
          let segmentAmount = 0;
          for (let j = lastFullIndex + 1; j <= i; j++) {
            const amt = Number(asc[j].amount || 0);
            if (Number.isFinite(amt) && amt > 0) {
              segmentAmount += amt;
            }
          }
          const distance = endOdo - startOdo;
          if (distance > 0 && segmentAmount > 0) {
            segmentDistanceTotal += distance;
            segmentAmountTotal += segmentAmount;
          }
          lastFullIndex = i;
        }
        const fuelPerKm = segmentDistanceTotal > 0 ? segmentAmountTotal / segmentDistanceTotal : 0;
        const heroDaysNum = calcHeroDays(profileDeliveryDate.value);
        const listSpanDays = calcDaysSinceEarliestRecord(list);
        const costPerDay = listSpanDays > 0 ? totalSpendNum / listSpanDays : 0;
        heroOverview.value = {
          total: totalSpendNum.toFixed(1),
          // 总支出
          fuel: totalOilNum.toFixed(1),
          // 油费
          other: otherTotalNum.toFixed(1),
          // 其他支出
          metrics: [
            {
              key: "days",
              label: "爱车相伴",
              value: heroDaysNum ? heroDaysNum.toFixed(0) : "--",
              unit: "天"
            },
            {
              key: "fuelKm",
              label: "油费/公里",
              value: segmentDistanceTotal > 0 ? fuelPerKm.toFixed(2) : "--",
              unit: "元"
            },
            {
              key: "perDay",
              label: "成本/天",
              value: listSpanDays > 0 ? costPerDay.toFixed(2) : "--",
              unit: "元"
            }
          ]
        };
      } catch (err) {
        common_vendor.index.__f__("warn", "at pages/expense/index.vue:549", "fetchHeroData error:", err);
      }
    };
    const handleHeroRangeTap = () => {
      pendingHeroRange.value = heroRange.value.key;
      showHeroPicker.value = true;
    };
    const closeHeroPicker = () => {
      showHeroPicker.value = false;
    };
    const handleHeroRangeSelection = (value) => {
      if (value) {
        pendingHeroRange.value = value;
      }
    };
    const confirmHeroPicker = () => {
      const target = HERO_RANGE_OPTIONS.find(
        (option) => option.key === pendingHeroRange.value
      );
      if (target) {
        heroRange.value = target;
        common_vendor.index.showToast({ title: `已切换到${target.label}`, icon: "none" });
        fetchHeroData(target.key);
      }
      closeHeroPicker();
    };
    const monthlyRangeOptions = [
      { key: "1y", label: "近一年" },
      { key: "2y", label: "近两年" },
      { key: "3y", label: "近三年" },
      { key: "all", label: "全部" }
    ];
    const monthlyRange = common_vendor.ref(monthlyRangeOptions[3]);
    const showMonthlyPicker = common_vendor.ref(false);
    const pendingMonthlyRange = common_vendor.ref(monthlyRangeOptions[3].key);
    const monthlyChartData = common_vendor.ref([]);
    const monthlyBaseline = common_vendor.computed(() => {
      const data = monthlyChartData.value;
      if (!data.length)
        return "0";
      let minYear = data[0].year;
      let maxYear = data[0].year;
      let minMonth = parseInt(data[0].month, 10);
      let maxMonth = parseInt(data[0].month, 10);
      for (const item of data) {
        const y = item.year;
        const m = parseInt(item.month, 10);
        if (y < minYear || y === minYear && m < minMonth) {
          minYear = y;
          minMonth = m;
        }
        if (y > maxYear || y === maxYear && m > maxMonth) {
          maxYear = y;
          maxMonth = m;
        }
      }
      const monthCount = (maxYear - minYear) * 12 + (maxMonth - minMonth) + 1;
      const sum = data.reduce((s, p) => s + p.value, 0);
      const avg = monthCount > 0 ? sum / monthCount : 0;
      return avg.toFixed(1);
    });
    const fetchMonthlyCost = async (rangeKey = monthlyRange.value.key) => {
      if (!isLoggedIn.value) {
        monthlyChartData.value = [];
        return;
      }
      try {
        const backendRange = mapRangeToBackend(rangeKey);
        const res = await utils_request.axios.get(`/api/refuels/list?range=${backendRange}`);
        const resp = res;
        if (!resp || resp.success !== true) {
          throw new Error("接口返回异常");
        }
        const payload = resp.data || resp || {};
        const list = payload.records || [];
        const now = /* @__PURE__ */ new Date();
        const currentYear = now.getFullYear();
        let minYear = -Infinity;
        switch (rangeKey) {
          case "1y":
            minYear = currentYear;
            break;
          case "2y":
            minYear = currentYear - 1;
            break;
          case "3y":
            minYear = currentYear - 2;
            break;
          case "all":
          default:
            minYear = -Infinity;
            break;
        }
        const map = /* @__PURE__ */ new Map();
        list.forEach((item) => {
          var _a;
          const dateStr = item.date || item.refuelDate;
          if (!dateStr)
            return;
          const d = new Date(String(dateStr).replace(/-/g, "/"));
          if (Number.isNaN(d.getTime()))
            return;
          const year = d.getFullYear();
          const month = d.getMonth() + 1;
          if (year < minYear || year > currentYear)
            return;
          const key = `${year}-${String(month).padStart(2, "0")}`;
          const prev = ((_a = map.get(key)) == null ? void 0 : _a.amount) || 0;
          map.set(key, { year, month, amount: prev + Number(item.amount || 0) });
        });
        monthlyChartData.value = Array.from(map.values()).sort((a, b) => {
          if (a.year !== b.year)
            return a.year - b.year;
          return a.month - b.month;
        }).map((item) => ({
          year: item.year,
          month: `${item.month}月`,
          value: Number(item.amount.toFixed(0))
        }));
        refreshMonthlyExpenseChart();
      } catch (err) {
        common_vendor.index.__f__("warn", "at pages/expense/index.vue:701", "fetchMonthlyCost error:", err);
        monthlyChartData.value = [];
        refreshMonthlyExpenseChart();
      }
    };
    const cycleMonthlyRange = () => {
      pendingMonthlyRange.value = monthlyRange.value.key;
      showMonthlyPicker.value = true;
    };
    const closeMonthlyPicker = () => {
      showMonthlyPicker.value = false;
    };
    const handleMonthlyRangeSelection = (value) => {
      if (value) {
        pendingMonthlyRange.value = value;
      }
    };
    const confirmMonthlyPicker = () => {
      const target = monthlyRangeOptions.find(
        (option) => option.key === pendingMonthlyRange.value
      );
      if (target) {
        monthlyRange.value = target;
        common_vendor.index.showToast({ title: `已切换到${target.label}`, icon: "none" });
        fetchMonthlyCost(target.key);
      }
      closeMonthlyPicker();
    };
    const yearlyRangeOptions = [
      { key: "1y", label: "一年" },
      { key: "2y", label: "两年" },
      { key: "3y", label: "三年" },
      { key: "all", label: "全部" }
    ];
    const yearlyRange = common_vendor.ref(yearlyRangeOptions[3]);
    const showYearlyPicker = common_vendor.ref(false);
    const pendingYearlyRange = common_vendor.ref(yearlyRangeOptions[0].key);
    const yearlyChartData = common_vendor.ref([]);
    const fetchYearlyTrend = async (rangeKey = yearlyRange.value.key) => {
      if (!isLoggedIn.value) {
        yearlyChartData.value = [];
        return;
      }
      try {
        const backendRange = rangeKey === "1y" ? "1y" : "all";
        const res = await utils_request.axios.get(`/api/refuels/list?range=${backendRange}`);
        const resp = res;
        if (!resp || resp.success !== true) {
          throw new Error("接口返回异常");
        }
        const payload = resp.data || resp || {};
        const list = payload.records || [];
        const points = [];
        const bucketCount = /* @__PURE__ */ new Map();
        list.forEach((item) => {
          const consumption = item == null ? void 0 : item.consumption;
          if (consumption == null || consumption === "--")
            return;
          const consumptionNum = Number(consumption);
          if (!Number.isFinite(consumptionNum))
            return;
          const dateStr = item.date || item.refuelDate;
          if (!dateStr)
            return;
          const d = new Date(String(dateStr).replace(/-/g, "/"));
          if (Number.isNaN(d.getTime()))
            return;
          const year = d.getFullYear();
          const month = d.getMonth() + 1;
          const key = `${year}-${month}`;
          const prevCount = bucketCount.get(key) || 0;
          bucketCount.set(key, prevCount + 1);
          const offsetIndex = prevCount;
          const offset = (offsetIndex - 0.5) * 0.12;
          const x = month + offset;
          points.push({
            year,
            month,
            x,
            value: Number(consumptionNum.toFixed(2))
          });
        });
        points.sort((a, b) => a.year === b.year ? a.x - b.x : a.year - b.year);
        yearlyChartData.value = points;
        refreshYearlyExpenseChart();
      } catch (err) {
        common_vendor.index.__f__("warn", "at pages/expense/index.vue:806", "fetchYearlyTrend error:", err);
        yearlyChartData.value = [];
        refreshYearlyExpenseChart();
      }
    };
    const cycleYearlyRange = () => {
      pendingYearlyRange.value = yearlyRange.value.key;
      showYearlyPicker.value = true;
    };
    const closeYearlyPicker = () => {
      showYearlyPicker.value = false;
    };
    const handleYearlyRangeSelection = (value) => {
      if (value) {
        pendingYearlyRange.value = value;
      }
    };
    const confirmYearlyPicker = () => {
      const target = yearlyRangeOptions.find(
        (option) => option.key === pendingYearlyRange.value
      );
      if (target) {
        yearlyRange.value = target;
        common_vendor.index.showToast({ title: `已切换到${target.label}`, icon: "none" });
        fetchYearlyTrend(target.key);
      }
      closeYearlyPicker();
    };
    let monthlyExpenseChart = null;
    let yearlyExpenseChart = null;
    const buildMonthlyOption = () => {
      const categories = monthlyChartData.value.map((item) => item.month);
      const years = monthlyChartData.value.map((item) => item.year);
      const seriesData = monthlyChartData.value.map((item) => ({
        value: item.value,
        itemStyle: {
          color: getYearColor(item.year)
          // ✅ 按年份自动取色
        }
      }));
      const labelFormatter = (value, index) => {
        const year = years[index];
        const prevYear = index > 0 ? years[index - 1] : null;
        if (index === 0 || year !== prevYear) {
          const shortYear = String(year).slice(-2);
          return `${shortYear}年${value}`;
        }
        return value;
      };
      const avg = Number(monthlyBaseline.value);
      return {
        grid: { left: 32, right: 16, top: 36, bottom: 40 },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: (params) => {
            const p = params[0];
            const idx = p.dataIndex;
            const item = monthlyChartData.value[idx];
            return `${item.year}年${item.month}
油费：${item.value} 元`;
          }
        },
        xAxis: {
          type: "category",
          data: categories,
          axisLine: { lineStyle: { color: "#d0d7e3" } },
          axisTick: { show: false },
          axisLabel: {
            color: "#5f6673",
            fontSize: 12,
            interval: 0,
            formatter: labelFormatter
          }
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { color: "#eef1f5", type: "dashed" } },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: "#8a93a0", fontSize: 12 }
        },
        series: [
          {
            name: "油费",
            type: "bar",
            data: seriesData,
            barWidth: 26,
            label: {
              show: true,
              position: "top",
              color: "#1f2329",
              fontSize: 12
            },
            markLine: {
              symbol: "none",
              label: {
                show: true,
                position: "middle",
                // ✅ 不要默认 auto
                verticalAlign: "middle",
                // 垂直居中
                formatter: `${avg} 元`,
                color: "#ff6b6b"
              },
              lineStyle: {
                type: "dashed",
                color: "#ff6b6b"
              },
              data: [{ yAxis: avg }]
            }
          }
        ]
      };
    };
    const buildYearlyOption = () => {
      const data = yearlyChartData.value;
      if (!data.length) {
        return {
          title: {
            text: "暂无数据",
            left: "center",
            top: "middle",
            textStyle: { color: "#9ca3af", fontSize: 12 }
          }
        };
      }
      const years = Array.from(new Set(data.map((p) => p.year))).sort(
        (a, b) => a - b
      );
      const allValues = data.map((p) => p.value);
      const maxVal = Math.max(...allValues);
      const minVal = Math.min(...allValues);
      const yMax = Math.max(9, Math.ceil(maxVal + 0.5));
      const yMin = Math.min(4, Math.floor(minVal - 0.5));
      const series = years.map((year) => {
        const points = data.filter((p) => p.year === year);
        const color = getYearColor(year);
        return {
          name: `${year}年`,
          type: "line",
          smooth: true,
          connectNulls: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: {
            width: 2,
            color
          },
          itemStyle: {
            color,
            borderColor: "#ffffff",
            borderWidth: 2
          },
          // 用数值型 x 轴：value = [x, y]
          data: points.map((p) => [p.x, p.value])
        };
      });
      return {
        grid: { left: 40, right: 20, top: 30, bottom: 46 },
        legend: {
          bottom: 4,
          data: years.map((y) => `${y}年`),
          icon: "circle",
          textStyle: { color: "#6b7280", fontSize: 11 }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "line" },
          // backgroundColor: 'rgba(31,35,41,0.9)',
          // borderWidth: 0,
          // padding: [6, 8],
          // textStyle: { color: '#fff', fontSize: 11 },
          formatter: (params) => {
            if (!params.length)
              return "";
            const lines = params.map((p) => {
              p.value[0];
              return `${p.marker} ${p.seriesName}：${p.value[1].toFixed(
                2
              )} L/100km`;
            });
            const firstX = params[0].value[0];
            const monthLabel = `${Math.round(firstX)}月`;
            return [monthLabel, ...lines].join("\n");
          }
        },
        // X 轴：1~12 的数值轴，显示成「n 月」
        xAxis: {
          type: "value",
          min: 1,
          max: 12,
          interval: 1,
          boundaryGap: false,
          axisLine: { lineStyle: { color: "#d4d7de" } },
          axisTick: { show: false },
          // ✅ 关键：关闭竖线
          splitLine: {
            show: false
          },
          axisLabel: {
            color: "#6b7280",
            fontSize: 11,
            formatter: (val) => `${val}月`
          }
        },
        yAxis: {
          type: "value",
          min: yMin,
          max: yMax,
          splitNumber: 5,
          splitLine: { lineStyle: { color: "#e5e7eb", type: "dashed" } },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: "#9ca3af",
            fontSize: 11,
            formatter: (val) => val.toFixed(1)
          }
        },
        series
      };
    };
    const initMonthlyExpenseChart = (canvas, width, height, dpr) => {
      var _a;
      const chart = echarts.init(canvas, null, {
        width,
        height,
        devicePixelRatio: dpr
      });
      (_a = canvas.setChart) == null ? void 0 : _a.call(canvas, chart);
      chart.setOption(buildMonthlyOption());
      monthlyExpenseChart = chart;
      return chart;
    };
    const initYearlyExpenseChart = (canvas, width, height, dpr) => {
      var _a;
      const chart = echarts.init(canvas, null, {
        width,
        height,
        devicePixelRatio: dpr
      });
      (_a = canvas.setChart) == null ? void 0 : _a.call(canvas, chart);
      chart.setOption(buildYearlyOption());
      yearlyExpenseChart = chart;
      return chart;
    };
    const refreshMonthlyExpenseChart = () => {
      monthlyExpenseChart == null ? void 0 : monthlyExpenseChart.setOption(buildMonthlyOption(), true);
    };
    const refreshYearlyExpenseChart = () => {
      yearlyExpenseChart == null ? void 0 : yearlyExpenseChart.setOption(buildYearlyOption(), true);
    };
    const monthlyExpenseEc = common_vendor.ref({
      lazyLoad: false,
      onInit: initMonthlyExpenseChart
    });
    const yearlyExpenseEc = common_vendor.ref({
      lazyLoad: false,
      onInit: initYearlyExpenseChart
    });
    common_vendor.onUnmounted(() => {
      monthlyExpenseChart == null ? void 0 : monthlyExpenseChart.dispose();
      yearlyExpenseChart == null ? void 0 : yearlyExpenseChart.dispose();
      monthlyExpenseChart = null;
      yearlyExpenseChart = null;
    });
    common_vendor.onShow(() => {
      refreshLoginState();
      fetchProfile().then(() => {
        fetchHeroData(heroRange.value.key);
      });
      fetchMonthlyCost(monthlyRange.value.key);
      fetchYearlyTrend(yearlyRange.value.key);
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(heroRange.value.label),
        b: common_vendor.o(handleHeroRangeTap),
        c: common_vendor.t(heroOverview.value.total),
        d: common_vendor.t(heroOverview.value.fuel),
        e: common_vendor.t(heroOverview.value.other),
        f: common_vendor.f(heroOverview.value.metrics, (metric, k0, i0) => {
          return {
            a: common_vendor.t(metric.label),
            b: common_vendor.t(metric.value),
            c: common_vendor.t(metric.unit),
            d: metric.key
          };
        }),
        g: common_vendor.t(monthlyRange.value.label),
        h: common_vendor.o(cycleMonthlyRange),
        i: !showHeroPicker.value && !showMonthlyPicker.value && !showYearlyPicker.value,
        j: common_vendor.p({
          id: "monthlyExpenseChart",
          canvasId: "monthlyExpenseChart",
          ec: monthlyExpenseEc.value
        }),
        k: common_vendor.t(yearlyRange.value.label),
        l: common_vendor.o(cycleYearlyRange),
        m: !showHeroPicker.value && !showMonthlyPicker.value && !showYearlyPicker.value,
        n: common_vendor.p({
          id: "yearlyExpenseChart",
          canvasId: "yearlyExpenseChart",
          ec: yearlyExpenseEc.value
        }),
        o: common_vendor.o(handleHeroRangeSelection),
        p: common_vendor.o(closeHeroPicker),
        q: common_vendor.o(confirmHeroPicker),
        r: common_vendor.p({
          visible: showHeroPicker.value,
          title: "选择统计范围",
          options: HERO_RANGE_OPTIONS,
          ["selected-key"]: pendingHeroRange.value
        }),
        s: common_vendor.o(handleMonthlyRangeSelection),
        t: common_vendor.o(closeMonthlyPicker),
        v: common_vendor.o(confirmMonthlyPicker),
        w: common_vendor.p({
          visible: showMonthlyPicker.value,
          title: "选择统计范围",
          options: monthlyRangeOptions,
          ["selected-key"]: pendingMonthlyRange.value
        }),
        x: common_vendor.o(handleYearlyRangeSelection),
        y: common_vendor.o(closeYearlyPicker),
        z: common_vendor.o(confirmYearlyPicker),
        A: common_vendor.p({
          visible: showYearlyPicker.value,
          title: "选择对比区间",
          options: yearlyRangeOptions,
          ["selected-key"]: pendingYearlyRange.value
        }),
        B: showHeroPicker.value || showMonthlyPicker.value || showYearlyPicker.value ? 1 : "",
        C: common_vendor.o(($event) => showLoginSheet.value = $event),
        D: common_vendor.p({
          visible: showLoginSheet.value
        }),
        E: common_vendor.o(handleLoginRequired),
        F: common_vendor.p({
          active: "expense",
          ["is-logged-in"]: common_vendor.unref(isLoggedIn)
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1b153722"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/expense/index.js.map
