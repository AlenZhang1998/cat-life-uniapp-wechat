"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  BottomActionBar();
}
const BottomActionBar = () => "../../components/BottomActionBar.js";
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
    const isLoggedIn = common_vendor.ref(false);
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
      isLoggedIn.value = !!profile && !!profile.name;
    };
    const loadUserProfile = () => {
      try {
        const stored = common_vendor.index.getStorageSync("userProfile");
        if (stored) {
          applyProfile(typeof stored === "string" ? JSON.parse(stored) : stored);
          return;
        }
      } catch (error) {
        common_vendor.index.__f__("warn", "at pages/profile/index.vue:118", "读取用户信息失败", error);
      }
      isLoggedIn.value = false;
      user.value = { ...defaultProfile };
    };
    common_vendor.onShow(() => {
      loadUserProfile();
    });
    const handleAvatarTap = () => {
      if (isLoggedIn.value) {
        return;
      }
      common_vendor.index.showModal({
        title: "提示",
        content: "模拟微信一键登录成功",
        success: (res) => {
          if (res.confirm) {
            isLoggedIn.value = true;
          }
        }
      });
    };
    const handleFeatureTap = (item) => {
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
        a: user.value.avatar && isLoggedIn.value
      }, user.value.avatar && isLoggedIn.value ? {
        b: user.value.avatar
      } : isLoggedIn.value ? {
        d: common_vendor.t(user.value.initial)
      } : {}, {
        c: isLoggedIn.value,
        e: common_vendor.o(handleAvatarTap),
        f: isLoggedIn.value
      }, isLoggedIn.value ? {
        g: common_vendor.t(user.value.name),
        h: common_vendor.t(user.value.joinDate),
        i: common_vendor.f(user.value.tags, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag),
            b: tag
          };
        })
      } : {}, {
        j: isLoggedIn.value
      }, isLoggedIn.value ? {
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
        m: common_vendor.p({
          active: "profile"
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-201c0da5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/index.js.map
