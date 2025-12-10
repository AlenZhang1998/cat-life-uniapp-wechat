"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const utils_request = require("../../utils/request.js");
const utils_avatar = require("../../utils/avatar.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "personal-info",
  setup(__props) {
    const genderOptions = ["男", "女", "保密"];
    const form = common_vendor.ref({
      userAvatar: "",
      username: "",
      gender: "保密",
      deliveryDate: "",
      carModel: "",
      phone: "",
      email: ""
    });
    const genderIndex = common_vendor.ref(2);
    const { refreshLoginState } = utils_auth.useAuth();
    const mapGenderValue = (value) => {
      if (typeof value === "number") {
        return value === 1 ? "男" : value === 2 ? "女" : "保密";
      }
      if (typeof value === "string" && genderOptions.includes(value)) {
        return value;
      }
      return "保密";
    };
    const syncGenderIndex = (value) => {
      const idx = genderOptions.indexOf(value);
      genderIndex.value = idx >= 0 ? idx : 2;
    };
    const mapGenderToNumber = (value) => {
      if (value === "男")
        return 1;
      if (value === "女")
        return 2;
      return 0;
    };
    const loadLocalProfile = () => {
      try {
        const stored = common_vendor.index.getStorageSync("userProfile");
        if (stored) {
          const profile = typeof stored === "string" ? JSON.parse(stored) : stored;
          if (!profile.deliveryDate && profile.birthDate) {
            profile.deliveryDate = profile.birthDate;
          }
          form.value = { ...form.value, ...profile };
          form.value.username = profile.username || profile.name || form.value.username;
          form.value.userAvatar = profile.userAvatar || profile.avatar || form.value.userAvatar;
          form.value.gender = mapGenderValue(profile.gender);
          syncGenderIndex(form.value.gender || "保密");
        }
      } catch (error) {
        common_vendor.index.__f__("warn", "at pages/profile/personal-info.vue:127", "加载个人信息失败", error);
      }
    };
    common_vendor.onLoad(() => {
      loadLocalProfile();
      loadProfile();
    });
    const isNonEmpty = (v) => v !== void 0 && v !== null && String(v).trim() !== "";
    const loadProfile = async () => {
      const token = common_vendor.index.getStorageSync("token");
      if (!token)
        return;
      try {
        const res = await utils_request.axios.get("/api/profile", { showErrorToast: false });
        const remote = res && res.data && res.code === void 0 ? res.data : res || {};
        common_vendor.index.__f__("log", "at pages/profile/personal-info.vue:153", "loadProfile remote = ", remote);
        const finalUserAvatar = isNonEmpty(remote.userAvatar) ? remote.userAvatar : isNonEmpty(remote.avatarUrl) ? remote.avatarUrl : isNonEmpty(form.value.userAvatar) ? form.value.userAvatar : "";
        const finalUsername = isNonEmpty(remote.username) ? remote.username : isNonEmpty(remote.nickname) ? remote.nickname : isNonEmpty(form.value.username) ? form.value.username : "";
        const merged = {
          ...form.value,
          userAvatar: finalUserAvatar,
          username: finalUsername,
          gender: mapGenderValue(remote.gender),
          deliveryDate: isNonEmpty(remote.deliveryDate) ? remote.deliveryDate : isNonEmpty(remote.birthDate) ? remote.birthDate : form.value.deliveryDate,
          carModel: isNonEmpty(remote.favoriteCarModel) ? remote.favoriteCarModel : isNonEmpty(remote.carModel) ? remote.carModel : form.value.carModel,
          phone: isNonEmpty(remote.phone) ? remote.phone : form.value.phone,
          email: isNonEmpty(remote.email) ? remote.email : form.value.email
        };
        form.value = merged;
        syncGenderIndex(merged.gender);
      } catch (error) {
        common_vendor.index.__f__("warn", "at pages/profile/personal-info.vue:182", "请求个人信息失败", error);
        common_vendor.index.showToast({
          title: "加载失败，已使用本地信息",
          icon: "none"
        });
      }
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
        success: async (res) => {
          const tempPath = res.tempFilePaths[0];
          form.value.userAvatar = tempPath;
          try {
            common_vendor.index.showLoading({ title: "上传中..." });
            const url = await utils_avatar.uploadAvatarToCos(tempPath);
            form.value.userAvatar = url;
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({ title: "头像已更新", icon: "success" });
          } catch (err) {
            common_vendor.index.__f__("error", "at pages/profile/personal-info.vue:225", "上传头像失败", err);
            common_vendor.index.hideLoading();
            common_vendor.index.showToast({ title: "上传头像失败", icon: "none" });
          }
        }
      });
    };
    const handleSave = () => {
      common_vendor.index.__f__("log", "at pages/profile/personal-info.vue:234", 199, "handleSave form.value = ", form.value);
      const phoneRegex = /^1\d{10}$/;
      const emailRegex = /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/;
      if (!form.value.username || !form.value.carModel || !form.value.deliveryDate) {
        common_vendor.index.showToast({
          title: !form.value.username ? "请填写用户名" : !form.value.carModel ? "请填写爱车型号" : "请选择提车日期",
          icon: "none"
        });
        return;
      }
      if (form.value.phone && !phoneRegex.test(form.value.phone)) {
        common_vendor.index.showToast({
          title: "手机号格式不正确",
          icon: "none"
        });
        return;
      }
      if (form.value.email && !emailRegex.test(form.value.email)) {
        common_vendor.index.showToast({
          title: "邮箱格式不正确",
          icon: "none"
        });
        return;
      }
      const payload = {
        username: form.value.username,
        userAvatar: form.value.userAvatar,
        gender: mapGenderToNumber(form.value.gender || "保密"),
        deliveryDate: form.value.deliveryDate,
        favoriteCarModel: form.value.carModel,
        phone: form.value.phone,
        email: form.value.email
      };
      common_vendor.index.showLoading({ title: "保存中", mask: true });
      const doSave = async () => {
        const token = common_vendor.index.getStorageSync("token");
        if (!token) {
          common_vendor.index.showToast({
            title: "请先登录再保存",
            icon: "none"
          });
          throw new Error("no token");
        }
        await utils_request.axios.put("/api/profile", { data: payload });
        common_vendor.index.setStorageSync("userProfile", { ...form.value, name: form.value.username, avatar: form.value.userAvatar });
        refreshLoginState();
        common_vendor.index.showToast({
          title: "已保存",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 500);
      };
      doSave().catch((error) => {
        common_vendor.index.__f__("error", "at pages/profile/personal-info.vue:297", "保存个人信息失败", error);
        common_vendor.index.showToast({
          title: "保存失败，请稍后再试",
          icon: "none"
        });
      }).finally(() => {
        common_vendor.index.hideLoading();
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: form.value.userAvatar
      }, form.value.userAvatar ? {
        b: form.value.userAvatar
      } : {}, {
        c: common_vendor.o(chooseAvatar),
        d: common_vendor.o(chooseAvatar),
        e: form.value.username,
        f: common_vendor.o(($event) => form.value.username = $event.detail.value),
        g: common_vendor.t(form.value.gender || "保密"),
        h: genderOptions,
        i: genderIndex.value,
        j: common_vendor.t(form.value.deliveryDate || "请选择提车日期"),
        k: form.value.deliveryDate,
        l: common_vendor.o(onDeliveryChange),
        m: form.value.carModel,
        n: common_vendor.o(($event) => form.value.carModel = $event.detail.value),
        o: form.value.phone,
        p: common_vendor.o(($event) => form.value.phone = $event.detail.value),
        q: form.value.email,
        r: common_vendor.o(($event) => form.value.email = $event.detail.value),
        s: common_vendor.o(handleSave)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-367060a7"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/personal-info.js.map
