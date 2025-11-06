"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  BottomActionBar();
}
const BottomActionBar = () => "../../components/BottomActionBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const recordList = common_vendor.ref([
      { id: 1, date: "2025-03-12", city: "深圳", fuel: 4.8, mileage: 326 },
      { id: 2, date: "2025-02-21", city: "广州", fuel: 5.1, mileage: 280 },
      { id: 3, date: "2025-02-03", city: "东莞", fuel: 5.7, mileage: 415 }
    ]);
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(recordList.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.date),
            b: common_vendor.t(item.city),
            c: common_vendor.t(item.fuel),
            d: common_vendor.t(item.mileage),
            e: item.id
          };
        }),
        b: recordList.value.length === 0
      }, recordList.value.length === 0 ? {} : {}, {
        c: common_vendor.p({
          active: "list"
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f1512143"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/records/index.js.map
