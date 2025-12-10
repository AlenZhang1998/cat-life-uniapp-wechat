"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const now = /* @__PURE__ */ new Date();
    const defaultDate = now.toISOString().slice(0, 10);
    const defaultTime = now.toTimeString().slice(0, 5);
    const fuelGradeOptions = ["92#", "95#", "98#", "0#柴油", "E充电"];
    const isEditing = common_vendor.ref(false);
    const editingId = common_vendor.ref(null);
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
    const handleSubmit = async () => {
      if (!form.date || !form.time || !form.mileage || !form.fuelGrade || !form.fuelPrice || !form.amount) {
        common_vendor.index.showToast({
          title: "请完善带 * 的必填项",
          icon: "none"
        });
        return;
      }
      const mileage = toNumber(form.mileage);
      const fuelPrice = toNumber(form.fuelPrice);
      const amount = toNumber(form.amount);
      const volume = Number((amount / fuelPrice).toFixed(2));
      const payload = {
        date: form.date,
        // '2025-11-28'
        time: form.time,
        // '22:35'
        odometer: mileage,
        // 当前里程
        volume,
        // 加油量(L)
        amount,
        // 金额
        pricePerL: fuelPrice,
        // 单价
        fuelGrade: form.fuelGrade,
        // 燃油标号
        isFullTank: form.fullAutoStop,
        warningLight: form.warningLight,
        hasPreviousRecord: form.hasPreviousRecord,
        remark: form.remark
      };
      common_vendor.index.showLoading({ title: "保存中...", mask: true });
      try {
        common_vendor.index.__f__("log", "at pages/add/index.vue:281", 266, "payload = ", payload);
        let res;
        if (isEditing.value && editingId.value) {
          res = await utils_request.axios.put(`/api/refuels/${editingId.value}`, { data: payload });
        } else {
          res = await utils_request.axios.post("/api/refuels", { data: payload });
        }
        const { success, data } = res || {};
        if (!success) {
          throw new Error("接口返回异常");
        }
        common_vendor.index.showToast({
          title: "保存成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack({ delta: 1 });
        }, 400);
        resetForm();
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/add/index.vue:312", "保存油耗记录失败：", err);
        common_vendor.index.showToast({
          title: "保存失败，请稍后再试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const resetForm = () => {
      const now2 = /* @__PURE__ */ new Date();
      const defaultDate2 = now2.toISOString().slice(0, 10);
      const defaultTime2 = now2.toTimeString().slice(0, 5);
      form.date = defaultDate2;
      form.time = defaultTime2;
      form.mileage = "";
      form.fuelGrade = fuelGradeOptions[0];
      form.fuelPrice = "";
      form.amount = "";
      form.fullAutoStop = false;
      form.warningLight = false;
      form.hasPreviousRecord = true;
      form.remark = "";
    };
    const toNumber = (value) => {
      const n = Number(value);
      return Number.isNaN(n) ? NaN : n;
    };
    const loadDetail = async (id) => {
      common_vendor.index.__f__("log", "at pages/add/index.vue:347", 326, "loadDetail id = ", id);
      try {
        common_vendor.index.showLoading({ title: "加载中...", mask: true });
        const res = await utils_request.axios.get(`/api/refuels/${id}`);
        common_vendor.index.__f__("log", "at pages/add/index.vue:351", 330, "loadDetail res = ", res);
        const { success, data } = res || {};
        if (!success) {
          throw new Error("接口返回异常");
        }
        const r = res.data;
        const d = r.refuelDate ? new Date(r.refuelDate) : /* @__PURE__ */ new Date();
        form.date = d.toISOString().slice(0, 10);
        form.time = d.toTimeString().slice(0, 5);
        form.mileage = r.odometer != null ? String(r.odometer) : "";
        form.fuelGrade = r.fuelGrade || fuelGradeOptions[0];
        form.fuelPrice = r.pricePerL != null ? String(r.pricePerL) : "";
        form.amount = r.amount != null ? String(r.amount) : "";
        form.fullAutoStop = !!r.isFullTank;
        form.warningLight = !!r.warningLight;
        form.hasPreviousRecord = !!r.hasPreviousRecord;
        form.remark = r.remark || "";
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/add/index.vue:373", "查询单条数据失败：", err);
        common_vendor.index.showToast({
          title: "查询失败，请稍后再试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const handleDelete = async () => {
      common_vendor.index.__f__("log", "at pages/add/index.vue:385", 385, "handleDelete editingId = ", editingId.value);
      if (!editingId.value || !isEditing.value) {
        return;
      }
      common_vendor.index.showModal({
        title: "提示",
        content: "确定删除本条记录吗？",
        confirmColor: "#f56c6c",
        success: async (res) => {
          if (!res.confirm)
            return;
          try {
            common_vendor.index.showLoading({ title: "删除中...", mask: true });
            const res2 = await utils_request.axios.delete(`/api/refuels/${editingId.value}`);
            const { success, data } = res2 || {};
            if (!success) {
              throw new Error("接口返回异常");
            }
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.navigateBack({ delta: 1 });
            }, 400);
          } catch (err) {
            common_vendor.index.__f__("error", "at pages/add/index.vue:412", "删除本条记录失败：", err);
            common_vendor.index.showToast({
              title: "删除失败，请稍后再试",
              icon: "none"
            });
          } finally {
            common_vendor.index.hideLoading();
          }
        }
      });
    };
    common_vendor.onLoad(async (options) => {
      common_vendor.index.__f__("log", "at pages/add/index.vue:426", 325, "onLoad options = ", options);
      if (options.id) {
        isEditing.value = true;
        editingId.value = options.id;
        await loadDetail(options.id);
      } else {
        isEditing.value = false;
        editingId.value = null;
        resetForm();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
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
        t: common_vendor.n(form.fullAutoStop ? "switch-gradient--on" : ""),
        v: form.fullAutoStop,
        w: common_vendor.o((e) => handleSwitchChange("fullAutoStop", e.detail.value)),
        x: common_vendor.t(form.warningLight ? "是" : "否"),
        y: form.warningLight ? 1 : "",
        z: !form.warningLight ? 1 : "",
        A: common_vendor.n(form.warningLight ? "switch-gradient--on" : ""),
        B: form.warningLight,
        C: common_vendor.o((e) => handleSwitchChange("warningLight", e.detail.value)),
        D: common_vendor.t(form.hasPreviousRecord ? "是" : "否"),
        E: form.hasPreviousRecord ? 1 : "",
        F: !form.hasPreviousRecord ? 1 : "",
        G: common_vendor.n(form.hasPreviousRecord ? "switch-gradient--on" : ""),
        H: form.hasPreviousRecord,
        I: common_vendor.o((e) => handleSwitchChange("hasPreviousRecord", e.detail.value)),
        J: form.remark,
        K: common_vendor.o((e) => handleFieldChange("remark", e.detail.value)),
        L: common_vendor.o(handleSubmit),
        M: isEditing.value
      }, isEditing.value ? {
        N: common_vendor.o(handleDelete)
      } : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-89f6901d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/add/index.js.map
