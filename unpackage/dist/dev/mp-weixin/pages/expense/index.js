"use strict";
const common_vendor = require("../../common/vendor.js");
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
      { key: "week", label: "一周" },
      { key: "month", label: "一月" },
      { key: "year", label: "一年" }
    ];
    const heroRange = common_vendor.ref(HERO_RANGE_OPTIONS[2]);
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
      const currentIndex = HERO_RANGE_OPTIONS.findIndex((option) => option.key === heroRange.value.key);
      const next = HERO_RANGE_OPTIONS[(currentIndex + 1) % HERO_RANGE_OPTIONS.length];
      heroRange.value = next;
      common_vendor.index.showToast({ title: `已切换到${next.label}`, icon: "none" });
    };
    const categoryBreakdown = common_vendor.computed(() => {
      const totalAmount = expenseRecords.value.reduce((sum, item) => sum + item.amount, 0);
      const grouped = expenseRecords.value.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
      }, {});
      return Object.entries(grouped).sort((a, b) => b[1] - a[1]).map(([key, amount]) => {
        const meta = CATEGORY_META[key];
        const percent = totalAmount ? Math.round(amount / totalAmount * 100) : 0;
        return {
          key,
          label: meta.label,
          icon: meta.icon,
          badgeColor: meta.badgeBg,
          amount: amount.toFixed(0),
          percent,
          color: meta.color
        };
      });
    });
    const expenseInsights = common_vendor.computed(() => {
      const highlightCategory = categoryBreakdown.value[0];
      const recentCount = expenseRecords.value.filter((item) => item.day >= 10).length;
      return [
        {
          key: "budget",
          index: 1,
          label: "预算余量",
          desc: `剩余 ${monthlySummary.value.budgetLeft} 元，可覆盖约 ${Math.max(
            Number(monthlySummary.value.budgetLeft) / 150,
            0
          ).toFixed(1)} 次通勤`
        },
        {
          key: "category",
          index: 2,
          label: "最高占比",
          desc: highlightCategory ? `${highlightCategory.label} 占比 ${highlightCategory.percent}%` : "等待记录更新"
        },
        {
          key: "recent",
          index: 3,
          label: "近期支出",
          desc: `近 7 天记录 ${recentCount} 笔，可考虑错峰充电/加油`
        }
      ];
    });
    const monthlyBudget = MONTHLY_BUDGET;
    const getCategoryMeta = (category) => CATEGORY_META[category];
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
        g: common_vendor.t(common_vendor.unref(monthlyBudget)),
        h: common_vendor.f(categoryBreakdown.value, (category, k0, i0) => {
          return {
            a: common_vendor.t(category.icon),
            b: category.badgeColor,
            c: category.color,
            d: common_vendor.t(category.label),
            e: common_vendor.t(category.amount),
            f: category.percent + "%",
            g: category.color,
            h: common_vendor.t(category.percent),
            i: category.key
          };
        }),
        i: common_vendor.f(expenseInsights.value, (insight, k0, i0) => {
          return {
            a: common_vendor.t(insight.index),
            b: common_vendor.t(insight.label),
            c: common_vendor.t(insight.desc),
            d: insight.key
          };
        }),
        j: common_vendor.t(expenseRecords.value.length),
        k: common_vendor.f(expenseRecords.value, (item, k0, i0) => {
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
        l: common_vendor.p({
          active: "expense"
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1b153722"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/expense/index.js.map
