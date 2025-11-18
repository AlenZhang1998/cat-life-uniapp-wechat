"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "personal-info",
  setup(__props) {
    const genderOptions = ["男", "女", "保密"];
    const form = common_vendor.ref({
      avatar: "",
      name: "",
      gender: "保密",
      deliveryDate: "",
      carModel: "",
      phone: "",
      email: ""
    });
    const genderIndex = common_vendor.ref(2);
    const { refreshLoginState } = utils_auth.useAuth();
    const syncGenderIndex = (value) => {
      const idx = genderOptions.indexOf(value);
      genderIndex.value = idx >= 0 ? idx : 2;
    };
    const loadProfile = () => {
      try {
        const stored = common_vendor.index.getStorageSync("userProfile");
        if (stored) {
          const profile = typeof stored === "string" ? JSON.parse(stored) : stored;
          if (!profile.deliveryDate && profile.birthDate) {
            profile.deliveryDate = profile.birthDate;
          }
          form.value = { ...form.value, ...profile };
          syncGenderIndex(form.value.gender || "保密");
        }
      } catch (error) {
        common_vendor.index.__f__("warn", "at pages/profile/personal-info.vue:101", "加载个人信息失败", error);
      }
    };
    common_vendor.onLoad(() => {
      loadProfile();
    });
    const onGenderChange = (event) => {
      const idx = Number(event.detail.value);
      genderIndex.value = idx;
      form.value.gender = genderOptions[idx];
    };
    const onDeliveryChange = (event) => {
      form.value.deliveryDate = event.detail.value;
    };
    const chooseAvatar = () => {
      common_vendor.index.showActionSheet({
        itemList: ["拍照", "从相册选择"],
        success: ({ tapIndex }) => {
          const sourceType = tapIndex === 0 ? "camera" : "album";
          pickAvatar(sourceType);
        }
      });
    };
    const pickAvatar = (sourceType) => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: [sourceType],
        success: (res) => {
          form.value.avatar = res.tempFilePaths[0];
        }
      });
    };
    const handleSave = () => {
      if (!form.value.name || !form.value.carModel || !form.value.deliveryDate) {
        common_vendor.index.showToast({
          title: !form.value.name ? "请填写昵称" : !form.value.carModel ? "请填写爱车型号" : "请选择提车日期",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.setStorageSync("userProfile", { ...form.value });
        refreshLoginState();
        common_vendor.index.showToast({
          title: "已保存",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 500);
      } catch (error) {
        common_vendor.index.showToast({
          title: "保存失败，请稍后再试",
          icon: "none"
        });
        common_vendor.index.__f__("error", "at pages/profile/personal-info.vue:164", "保存个人信息失败", error);
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: form.value.avatar
      }, form.value.avatar ? {
        b: form.value.avatar
      } : {}, {
        c: common_vendor.o(chooseAvatar),
        d: common_vendor.o(chooseAvatar),
        e: form.value.name,
        f: common_vendor.o(($event) => form.value.name = $event.detail.value),
        g: common_vendor.t(form.value.gender || "请选择性别"),
        h: genderOptions,
        i: genderIndex.value,
        j: common_vendor.o(onGenderChange),
        k: common_vendor.t(form.value.deliveryDate || "请选择提车日期"),
        l: form.value.deliveryDate,
        m: common_vendor.o(onDeliveryChange),
        n: form.value.carModel,
        o: common_vendor.o(($event) => form.value.carModel = $event.detail.value),
        p: form.value.phone,
        q: common_vendor.o(($event) => form.value.phone = $event.detail.value),
        r: form.value.email,
        s: common_vendor.o(($event) => form.value.email = $event.detail.value),
        t: common_vendor.o(handleSave)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-367060a7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/personal-info.js.map
