"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
if (!Math) {
  (LoginOverlay + BottomActionBar)();
}
const BottomActionBar = () => "../../components/BottomActionBar.js";
const LoginOverlay = () => "../../components/LoginOverlay.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const defaultProfile = {
      name: "Alen",
      initial: "熊",
      avatar: "",
      joinDate: "2024-08",
      motto: "给油门一个拥抱，让城市多一点绿。",
      tags: ["城市漫游者", "节能达人", "夜行者"],
      gender: "",
      deliveryDate: "",
      carModel: "",
      phone: "",
      email: ""
    };
    const { isLoggedIn, refreshLoginState } = utils_auth.useAuth();
    const showLoginSheet = common_vendor.ref(false);
    const user = common_vendor.ref({ ...defaultProfile });
    const features = common_vendor.ref([
      {
        key: "garage",
        icon: "🚗",
        title: "个人信息",
        desc: "编辑个人信息, 爱车型号"
      },
      {
        key: "feedback",
        icon: "💡",
        title: "建议反馈",
        desc: "和我们聊聊你的灵感，持续优化体验"
      },
      {
        key: "backup",
        icon: "☁️",
        title: "数据备份",
        desc: "同步到云端，换机无忧"
      },
      { key: "subscription", icon: "🧊", title: "订阅服务", desc: "智驾实验室体验中" },
      {
        key: "settings",
        icon: "⚙️",
        title: "设置中心",
        desc: "订阅提醒、隐私偏好、一键反馈"
      }
    ]);
    const applyProfile = (profile) => {
      const merged = { ...defaultProfile, ...profile || {} };
      merged.initial = merged.name ? merged.name.charAt(0) : defaultProfile.initial;
      user.value = merged;
    };
    const initUserFromStorage = () => {
      try {
        const stored = common_vendor.index.getStorageSync("userProfile");
        if (stored) {
          applyProfile(typeof stored === "string" ? JSON.parse(stored) : stored);
        } else {
          user.value = { ...defaultProfile };
        }
      } catch (error) {
        common_vendor.index.__f__("warn", "at pages/profile/index.vue:123", "读取用户信息失败", error);
        user.value = { ...defaultProfile };
      }
      refreshLoginState();
    };
    common_vendor.onShow(() => {
      initUserFromStorage();
    });
    const handleAvatarTap = () => {
      if (isLoggedIn.value) {
        return;
      }
      showLoginSheet.value = true;
    };
    const handleLoginSuccess = (payload) => {
      const { token, user: backendUser } = payload;
      const finalProfile = {
        ...defaultProfile,
        name: backendUser.nickname || defaultProfile.name,
        avatar: backendUser.avatarUrl || ""
        // 你后面可以再加：gender / deliveryDate / carModel 等
      };
      common_vendor.index.setStorageSync("token", token);
      common_vendor.index.setStorageSync("userProfile", finalProfile);
      applyProfile(finalProfile);
      refreshLoginState();
      showLoginSheet.value = false;
    };
    const handleLoginRequired = () => {
      if (!isLoggedIn.value) {
        showLoginSheet.value = true;
      }
    };
    const handleFeatureTap = (item) => {
      if (!isLoggedIn.value) {
        showLoginSheet.value = true;
        return;
      }
      if (item.key === "garage") {
        common_vendor.index.navigateTo({
          url: "/pages/profile/personal-info"
        });
        return;
      }
      common_vendor.index.showToast({
        title: "功能开发中，敬请期待",
        icon: "none"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: user.value.avatar && common_vendor.unref(isLoggedIn)
      }, user.value.avatar && common_vendor.unref(isLoggedIn) ? {
        b: user.value.avatar
      } : common_vendor.unref(isLoggedIn) ? {
        d: common_vendor.t(user.value.initial)
      } : {}, {
        c: common_vendor.unref(isLoggedIn),
        e: common_vendor.o(handleAvatarTap),
        f: common_vendor.unref(isLoggedIn)
      }, common_vendor.unref(isLoggedIn) ? {
        g: common_vendor.t(user.value.name),
        h: common_vendor.t(user.value.joinDate),
        i: common_vendor.f(user.value.tags, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag),
            b: tag
          };
        })
      } : {}, {
        j: common_vendor.unref(isLoggedIn)
      }, common_vendor.unref(isLoggedIn) ? {
        k: common_vendor.t(user.value.motto)
      } : {}, {
        l: common_vendor.f(features.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.icon),
            b: common_vendor.t(item.title),
            c: common_vendor.t(item.desc),
            d: item.key,
            e: common_vendor.o(($event) => handleFeatureTap(item), item.key)
          };
        }),
        m: common_vendor.o(handleLoginSuccess),
        n: common_vendor.o(($event) => showLoginSheet.value = $event),
        o: common_vendor.p({
          visible: showLoginSheet.value
        }),
        p: common_vendor.o(handleLoginRequired),
        q: common_vendor.p({
          active: "profile",
          ["is-logged-in"]: common_vendor.unref(isLoggedIn)
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-201c0da5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/index.js.map
