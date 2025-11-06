"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  BottomActionBar();
}
const BottomActionBar = () => "../../components/BottomActionBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const refuelRecords = common_vendor.ref([
      {
        id: 1,
        date: "2025-03-08",
        station: "中国石化 · 宝安站",
        volume: 42,
        amount: 295,
        remark: "跑高速，油价便宜 0.3 元/升"
      },
      {
        id: 2,
        date: "2025-02-19",
        station: "中国石油 · 西乡站",
        volume: 38,
        amount: 274,
        remark: ""
      },
      {
        id: 3,
        date: "2025-02-01",
        station: "中国石化 · 南山站",
        volume: 35,
        amount: 252,
        remark: "春节出游前补油"
      }
    ]);
    const monthlySummary = common_vendor.computed(() => {
      const totalVolume = refuelRecords.value.reduce(
        (sum, item) => sum + item.volume,
        0
      );
      const totalAmount = refuelRecords.value.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      return {
        times: refuelRecords.value.length,
        volume: totalVolume.toFixed(1),
        amount: totalAmount.toFixed(0)
      };
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(monthlySummary.value.times),
        b: common_vendor.t(monthlySummary.value.volume),
        c: common_vendor.t(monthlySummary.value.amount),
        d: common_vendor.f(refuelRecords.value, (item, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(item.date),
            b: common_vendor.t(item.station),
            c: common_vendor.t(item.volume),
            d: common_vendor.t(item.amount),
            e: item.remark
          }, item.remark ? {
            f: common_vendor.t(item.remark)
          } : {}, {
            g: item.id
          });
        }),
        e: common_vendor.p({
          active: "refuel"
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-620ae1e5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/refuel/index.js.map
