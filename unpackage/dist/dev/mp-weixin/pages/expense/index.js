"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _component_ec_canvas = common_vendor.resolveComponent("ec-canvas");
  _component_ec_canvas();
}
if (!Math) {
  BottomActionBar();
}
const BottomActionBar = () => "../../components/BottomActionBar.js";
const MONTHLY_BUDGET = 2200;
const HERO_DISTANCE = 1577;
const HERO_DAYS = 48;
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const echarts = require("../../wxcomponents/ec-canvas/echarts");
    const CATEGORY_META = {
      fuel: { label: "加油", icon: "⛽", color: "#1EC15F", badgeBg: "#E4FAED" },
      maintenance: { label: "保养", icon: "🛠️", color: "#3A7AFE", badgeBg: "#E2EAFF" },
      parking: { label: "停车", icon: "🅿️", color: "#FFB74D", badgeBg: "#FFF2E1" },
      charging: { label: "充电", icon: "⚡", color: "#00B8D9", badgeBg: "#D4F7FF" },
      insurance: { label: "保险", icon: "🛡️", color: "#8E64FF", badgeBg: "#F0E7FF" },
      wash: { label: "洗车", icon: "💦", color: "#00BFA5", badgeBg: "#DDF8F3" }
    };
    const expenseRecords = common_vendor.ref([
      {
        id: "2025-03-18-fuel",
        date: "03/18",
        day: 18,
        category: "fuel",
        title: "加油 45 升",
        location: "中石化 · 宝安站",
        amount: 320,
        detail: "92# · 7.12 元/升 · 里程 +585km",
        remark: "夜间油价优惠 0.3 元",
        tag: "加满"
      },
      {
        id: "2025-03-15-maintenance",
        date: "03/15",
        day: 15,
        category: "maintenance",
        title: "小保养",
        location: "广汽 Honda 授权店",
        amount: 680,
        detail: "更换机油 + 滤芯",
        remark: "赠送轮胎检测"
      },
      {
        id: "2025-03-12-parking",
        date: "03/12",
        day: 12,
        category: "parking",
        title: "停车 6 小时",
        location: "宝安中心地下停车场",
        amount: 36,
        detail: "会员 6 折 · 封顶 50",
        tag: "折扣"
      },
      {
        id: "2025-03-09-charging",
        date: "03/09",
        day: 9,
        category: "charging",
        title: "充电 28 kWh",
        location: "南山科技园超充站",
        amount: 112,
        detail: "峰谷电价 · 谷段 0.38 元/kWh"
      },
      {
        id: "2025-03-04-wash",
        date: "03/04",
        day: 4,
        category: "wash",
        title: "精洗 + 内饰除尘",
        location: "KeepClean 专业养护",
        amount: 168,
        detail: "含打蜡 · 车身镀膜保养",
        remark: "下次 8.5 折"
      }
    ]);
    const monthlySummary = common_vendor.computed(() => {
      const totalAmount = expenseRecords.value.reduce((sum, item) => sum + item.amount, 0);
      const totalCount = expenseRecords.value.length;
      const avgPerRecord = totalCount ? totalAmount / totalCount : 0;
      const budgetDiff = totalAmount - MONTHLY_BUDGET;
      const categoryTotals = expenseRecords.value.reduce((acc, record) => {
        acc[record.category] = (acc[record.category] || 0) + record.amount;
        return acc;
      }, {});
      const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
      const topCategoryLabel = topCategoryEntry ? CATEGORY_META[topCategoryEntry[0]].label : CATEGORY_META.fuel.label;
      return {
        totalAmount: totalAmount.toFixed(0),
        avgPerRecord: avgPerRecord.toFixed(0),
        count: totalCount,
        trend: budgetDiff > 0 ? "up" : "down",
        trendLabel: budgetDiff > 0 ? `超预算 +${Math.abs(budgetDiff).toFixed(0)} 元` : `剩余 ${Math.abs(budgetDiff).toFixed(0)} 元`,
        topCategory: topCategoryLabel,
        budgetLeft: Math.max(MONTHLY_BUDGET - totalAmount, 0).toFixed(0)
      };
    });
    const HERO_RANGE_OPTIONS = [
      { key: "3m", label: "三个月" },
      { key: "6m", label: "半年" },
      { key: "1y", label: "一年" },
      { key: "2y", label: "两年" },
      { key: "all", label: "全部" }
    ];
    const heroRange = common_vendor.ref(HERO_RANGE_OPTIONS[2]);
    const showHeroPicker = common_vendor.ref(false);
    const pendingHeroRange = common_vendor.ref(heroRange.value.key);
    const heroOverview = common_vendor.computed(() => {
      const total = Number(monthlySummary.value.totalAmount);
      const fuelCategories = ["fuel", "charging"];
      const fuelTotal = expenseRecords.value.filter((item) => fuelCategories.includes(item.category)).reduce((sum, item) => sum + item.amount, 0);
      const otherTotal = Math.max(total - fuelTotal, 0);
      const fuelPerKm = fuelTotal / HERO_DISTANCE;
      const costPerDay = total / HERO_DAYS;
      return {
        total: total.toFixed(1),
        fuel: fuelTotal.toFixed(1),
        other: otherTotal.toFixed(1),
        metrics: [
          { key: "days", label: "爱车相伴", value: HERO_DAYS.toFixed(0), unit: "天" },
          { key: "fuelKm", label: "油费/公里", value: fuelPerKm.toFixed(2), unit: "元" },
          { key: "perDay", label: "成本/天", value: costPerDay.toFixed(2), unit: "元" }
        ]
      };
    });
    const handleHeroRangeTap = () => {
      pendingHeroRange.value = heroRange.value.key;
      showHeroPicker.value = true;
    };
    const closeHeroPicker = () => {
      showHeroPicker.value = false;
    };
    const confirmHeroPicker = () => {
      const target = HERO_RANGE_OPTIONS.find((option) => option.key === pendingHeroRange.value);
      if (target) {
        heroRange.value = target;
        common_vendor.index.showToast({ title: `已切换到${target.label}`, icon: "none" });
      }
      closeHeroPicker();
    };
    const monthlyRangeOptions = [
      { key: "3m", label: "三个月" },
      { key: "6m", label: "半年" },
      { key: "1y", label: "一年" },
      { key: "all", label: "全部" }
    ];
    const monthlyRange = common_vendor.ref(monthlyRangeOptions[1]);
    const showMonthlyPicker = common_vendor.ref(false);
    const pendingMonthlyRange = common_vendor.ref(monthlyRangeOptions[1].key);
    const monthlyChartData = common_vendor.ref([
      { month: "7月", value: 412 },
      { month: "8月", value: 536 },
      { month: "9月", value: 623 },
      { month: "10月", value: 836 }
    ]);
    const monthlyBaseline = common_vendor.computed(() => Number(monthlySummary.value.totalAmount).toFixed(1));
    const yearlyRangeOptions = [
      { key: "1y", label: "一年" },
      { key: "2y", label: "两年" },
      { key: "3y", label: "三年" }
    ];
    const yearlyRange = common_vendor.ref(yearlyRangeOptions[0]);
    const showYearlyPicker = common_vendor.ref(false);
    const pendingYearlyRange = common_vendor.ref(yearlyRangeOptions[0].key);
    const yearlyChartData = common_vendor.ref([
      { month: "6月", value: 6.2 },
      { month: "7月", value: 5.8 },
      { month: "8月", value: 4.9 },
      { month: "9月", value: 5.1 }
    ]);
    let monthlyExpenseChart = null;
    let yearlyExpenseChart = null;
    const buildMonthlyOption = () => {
      const categories = monthlyChartData.value.map((item) => item.month);
      const seriesData = monthlyChartData.value.map((item) => item.value);
      return {
        grid: { left: 28, right: 16, top: 32, bottom: 32 },
        tooltip: { trigger: "axis" },
        xAxis: {
          type: "category",
          data: categories,
          axisLine: { lineStyle: { color: "#d0d7e3" } },
          axisTick: { show: false },
          axisLabel: { color: "#5f6673", fontSize: 12 }
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
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "#3a7afe" },
                { offset: 1, color: "#8db8ff" }
              ])
            },
            markLine: {
              data: [
                {
                  yAxis: Number(monthlyBaseline.value),
                  lineStyle: { type: "dashed", color: "#ff6b6b" },
                  label: { formatter: `${monthlyBaseline.value} 元`, color: "#ff6b6b" }
                }
              ]
            }
          }
        ]
      };
    };
    const buildYearlyOption = () => {
      const categories = yearlyChartData.value.map((item) => item.month);
      const seriesData = yearlyChartData.value.map((item) => item.value);
      return {
        grid: { left: 28, right: 20, top: 32, bottom: 28 },
        tooltip: { trigger: "axis" },
        xAxis: {
          type: "category",
          data: categories,
          axisLine: { lineStyle: { color: "#d0d7e3" } },
          axisTick: { show: false },
          axisLabel: { color: "#5f6673", fontSize: 12 }
        },
        yAxis: {
          type: "value",
          min: 4,
          max: 9,
          splitNumber: 5,
          splitLine: { lineStyle: { color: "#eef1f5", type: "dashed" } },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: "#8a93a0", fontSize: 12 }
        },
        series: [
          {
            name: "油耗",
            type: "line",
            data: seriesData,
            smooth: true,
            showSymbol: true,
            symbolSize: 6,
            itemStyle: { color: "#3a7afe" }
          }
        ]
      };
    };
    const initMonthlyExpenseChart = (canvas, width, height, dpr) => {
      var _a;
      const chart = echarts.init(canvas, null, { width, height, devicePixelRatio: dpr });
      (_a = canvas.setChart) == null ? void 0 : _a.call(canvas, chart);
      chart.setOption(buildMonthlyOption());
      monthlyExpenseChart = chart;
      return chart;
    };
    const initYearlyExpenseChart = (canvas, width, height, dpr) => {
      var _a;
      const chart = echarts.init(canvas, null, { width, height, devicePixelRatio: dpr });
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
    const cycleMonthlyRange = () => {
      pendingMonthlyRange.value = monthlyRange.value.key;
      showMonthlyPicker.value = true;
    };
    const closeMonthlyPicker = () => {
      showMonthlyPicker.value = false;
    };
    const confirmMonthlyPicker = () => {
      const target = monthlyRangeOptions.find((option) => option.key === pendingMonthlyRange.value);
      if (target) {
        monthlyRange.value = target;
        common_vendor.index.showToast({ title: `已切换到${target.label}`, icon: "none" });
        refreshMonthlyExpenseChart();
      }
      closeMonthlyPicker();
    };
    const cycleYearlyRange = () => {
      pendingYearlyRange.value = yearlyRange.value.key;
      showYearlyPicker.value = true;
    };
    const closeYearlyPicker = () => {
      showYearlyPicker.value = false;
    };
    const confirmYearlyPicker = () => {
      const target = yearlyRangeOptions.find((option) => option.key === pendingYearlyRange.value);
      if (target) {
        yearlyRange.value = target;
        common_vendor.index.showToast({ title: `已切换到${target.label}`, icon: "none" });
        refreshYearlyExpenseChart();
      }
      closeYearlyPicker();
    };
    const monthlyExpenseEc = common_vendor.ref({ lazyLoad: false, onInit: initMonthlyExpenseChart });
    const yearlyExpenseEc = common_vendor.ref({ lazyLoad: false, onInit: initYearlyExpenseChart });
    common_vendor.onUnmounted(() => {
      monthlyExpenseChart == null ? void 0 : monthlyExpenseChart.dispose();
      yearlyExpenseChart == null ? void 0 : yearlyExpenseChart.dispose();
      monthlyExpenseChart = null;
      yearlyExpenseChart = null;
    });
    const getCategoryMeta = (category) => CATEGORY_META[category];
    return (_ctx, _cache) => {
      return common_vendor.e({
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
        o: showHeroPicker.value
      }, showHeroPicker.value ? {
        p: common_vendor.f(HERO_RANGE_OPTIONS, (option, k0, i0) => {
          return {
            a: common_vendor.t(option.label),
            b: option.key,
            c: option.key === pendingHeroRange.value ? 1 : "",
            d: common_vendor.o(() => pendingHeroRange.value = option.key, option.key)
          };
        }),
        q: common_vendor.o(closeHeroPicker),
        r: common_vendor.o(confirmHeroPicker),
        s: common_vendor.o(() => {
        }),
        t: common_vendor.o(closeHeroPicker),
        v: common_vendor.o(() => {
        })
      } : {}, {
        w: showMonthlyPicker.value
      }, showMonthlyPicker.value ? {
        x: common_vendor.f(monthlyRangeOptions, (option, k0, i0) => {
          return {
            a: common_vendor.t(option.label),
            b: option.key,
            c: option.key === pendingMonthlyRange.value ? 1 : "",
            d: common_vendor.o(() => pendingMonthlyRange.value = option.key, option.key)
          };
        }),
        y: common_vendor.o(closeMonthlyPicker),
        z: common_vendor.o(confirmMonthlyPicker),
        A: common_vendor.o(() => {
        }),
        B: common_vendor.o(closeMonthlyPicker),
        C: common_vendor.o(() => {
        })
      } : {}, {
        D: showYearlyPicker.value
      }, showYearlyPicker.value ? {
        E: common_vendor.f(yearlyRangeOptions, (option, k0, i0) => {
          return {
            a: common_vendor.t(option.label),
            b: option.key,
            c: option.key === pendingYearlyRange.value ? 1 : "",
            d: common_vendor.o(() => pendingYearlyRange.value = option.key, option.key)
          };
        }),
        F: common_vendor.o(closeYearlyPicker),
        G: common_vendor.o(confirmYearlyPicker),
        H: common_vendor.o(() => {
        }),
        I: common_vendor.o(closeYearlyPicker),
        J: common_vendor.o(() => {
        })
      } : {}, {
        K: common_vendor.t(expenseRecords.value.length),
        L: common_vendor.f(expenseRecords.value, (item, k0, i0) => {
          return common_vendor.e({
            a: getCategoryMeta(item.category).color,
            b: common_vendor.t(item.date),
            c: common_vendor.t(item.amount),
            d: common_vendor.t(getCategoryMeta(item.category).icon),
            e: common_vendor.t(getCategoryMeta(item.category).label),
            f: common_vendor.t(item.title),
            g: item.tag
          }, item.tag ? {
            h: common_vendor.t(item.tag)
          } : {}, {
            i: common_vendor.t(item.location),
            j: common_vendor.t(item.detail),
            k: item.remark
          }, item.remark ? {
            l: common_vendor.t(item.remark)
          } : {}, {
            m: item.id
          });
        }),
        M: showHeroPicker.value || showMonthlyPicker.value || showYearlyPicker.value ? 1 : "",
        N: common_vendor.p({
          active: "expense"
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1b153722"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/expense/index.js.map
