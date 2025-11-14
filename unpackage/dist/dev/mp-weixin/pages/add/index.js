"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const now = /* @__PURE__ */ new Date();
    const defaultDate = now.toISOString().slice(0, 10);
    const defaultTime = now.toTimeString().slice(0, 5);
    const fuelGradeOptions = ["92#", "95#", "98#", "0#柴油", "E充电"];
    const form = common_vendor.reactive({
      date: defaultDate,
      time: defaultTime,
      mileage: "",
      fuelGrade: fuelGradeOptions[0],
      fuelPrice: "",
      amount: "",
      fullAutoStop: false,
      warningLight: false,
      hasPreviousRecord: true,
      remark: ""
    });
    const handleDateChange = (event) => {
      form.date = event.detail.value;
    };
    const handleTimeChange = (event) => {
      form.time = event.detail.value;
    };
    const handleFuelGradeChange = (event) => {
      const index = Number(event.detail.value);
      form.fuelGrade = fuelGradeOptions[index] || form.fuelGrade;
    };
    const handleFieldChange = (key, value) => {
      form[key] = value;
    };
    const handleSwitchChange = (key, value) => {
      form[key] = value;
    };
    const handleSubmit = () => {
      if (!form.date || !form.time || !form.mileage || !form.fuelGrade || !form.fuelPrice || !form.amount) {
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
      form.fuelPrice = "";
      form.amount = "";
      form.fullAutoStop = false;
      form.warningLight = false;
      form.hasPreviousRecord = false;
      form.remark = "";
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(form.date),
        b: form.date,
        c: common_vendor.o(handleDateChange),
        d: common_vendor.t(form.time),
        e: form.time,
        f: common_vendor.o(handleTimeChange),
        g: form.mileage,
        h: common_vendor.o((e) => handleFieldChange("mileage", e.detail.value)),
        i: common_vendor.t(form.fuelGrade),
        j: Math.max(fuelGradeOptions.indexOf(form.fuelGrade), 0),
        k: fuelGradeOptions,
        l: common_vendor.o(handleFuelGradeChange),
        m: form.fuelPrice,
        n: common_vendor.o((e) => handleFieldChange("fuelPrice", e.detail.value)),
        o: form.amount,
        p: common_vendor.o((e) => handleFieldChange("amount", e.detail.value)),
        q: common_vendor.t(form.fullAutoStop ? "是" : "否"),
        r: form.fullAutoStop ? 1 : "",
        s: !form.fullAutoStop ? 1 : "",
        t: form.fullAutoStop,
        v: common_vendor.o((e) => handleSwitchChange("fullAutoStop", e.detail.value)),
        w: common_vendor.t(form.warningLight ? "是" : "否"),
        x: form.warningLight ? 1 : "",
        y: !form.warningLight ? 1 : "",
        z: form.warningLight,
        A: common_vendor.o((e) => handleSwitchChange("warningLight", e.detail.value)),
        B: common_vendor.t(form.hasPreviousRecord ? "是" : "否"),
        C: form.hasPreviousRecord ? 1 : "",
        D: !form.hasPreviousRecord ? 1 : "",
        E: form.hasPreviousRecord,
        F: common_vendor.o((e) => handleSwitchChange("hasPreviousRecord", e.detail.value)),
        G: form.remark,
        H: common_vendor.o((e) => handleFieldChange("remark", e.detail.value)),
        I: common_vendor.o(handleSubmit)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-89f6901d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/add/index.js.map
