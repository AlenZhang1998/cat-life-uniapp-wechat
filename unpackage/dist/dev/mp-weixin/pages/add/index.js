"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  BottomActionBar();
}
const BottomActionBar = () => "../../components/BottomActionBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const form = common_vendor.reactive({
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      mileage: "",
      fuel: "",
      amount: "",
      remark: ""
    });
    const handleDateChange = (event) => {
      form.date = event.detail.value;
    };
    const handleFieldChange = (key, value) => {
      form[key] = value;
    };
    const handleSubmit = () => {
      if (!form.mileage || !form.fuel || !form.amount) {
        common_vendor.index.showToast({
          title: "请完善必填项",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showToast({
        title: "保存成功",
        icon: "success"
      });
      form.mileage = "";
      form.fuel = "";
      form.amount = "";
      form.remark = "";
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(form.date),
        b: form.date,
        c: common_vendor.o(handleDateChange),
        d: form.mileage,
        e: common_vendor.o((e) => handleFieldChange("mileage", e.detail.value)),
        f: form.fuel,
        g: common_vendor.o((e) => handleFieldChange("fuel", e.detail.value)),
        h: form.amount,
        i: common_vendor.o((e) => handleFieldChange("amount", e.detail.value)),
        j: form.remark,
        k: common_vendor.o((e) => handleFieldChange("remark", e.detail.value)),
        l: common_vendor.o(handleSubmit),
        m: common_vendor.p({
          active: "add"
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-89f6901d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/add/index.js.map
