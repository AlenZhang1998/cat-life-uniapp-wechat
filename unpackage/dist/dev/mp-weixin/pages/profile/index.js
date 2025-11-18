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
    const showLoginSheet = common_vendor.ref(false);
    const hasAgreed = common_vendor.ref(false);
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
        common_vendor.index.__f__("warn", "at pages/profile/index.vue:147", "读取用户信息失败", error);
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
      showLoginSheet.value = true;
    };
    const closeLoginSheet = () => {
      showLoginSheet.value = false;
    };
    const toggleAgreement = () => {
      hasAgreed.value = !hasAgreed.value;
    };
    const handleWeChatLogin = () => {
      if (!hasAgreed.value) {
        common_vendor.index.showToast({
          title: "请勾选协议后再登录",
          icon: "none"
        });
        return;
      }
      showLoginSheet.value = false;
      common_vendor.index.getUserProfile({
        desc: "用于完善个人信息",
        success: (profileRes) => {
          const userInfo = profileRes.userInfo;
          common_vendor.index.login({
            provider: "weixin",
            success: (loginRes) => {
              const code = loginRes.code;
              common_vendor.index.request({
                url: "http://192.168.60.58:3000/api/auth/login",
                method: "POST",
                header: {
                  "Content-Type": "application/json"
                },
                data: {
                  code,
                  userInfo
                },
                success: (res) => {
                  if (res.statusCode !== 200) {
                    common_vendor.index.showToast({ title: "登录失败", icon: "none" });
                    return;
                  }
                  const { token, user: user2 } = res.data;
                  common_vendor.index.setStorageSync("token", token);
                  common_vendor.index.setStorageSync("userInfo", user2);
                  isLoggedIn.value = true;
                  common_vendor.index.showToast({ title: "登录成功", icon: "success" });
                },
                fail: () => {
                  common_vendor.index.showToast({ title: "网络错误", icon: "none" });
                }
              });
            },
            fail: () => {
              common_vendor.index.showToast({ title: "微信登录失败", icon: "none" });
            }
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/profile/index.vue:224", "getUserProfile fail", err);
          common_vendor.index.showToast({ title: "需要授权头像信息", icon: "none" });
        }
      });
    };
    const openAgreement = (type) => {
      const name = type === "user" ? "用户使用协议" : "隐私保护协议";
      common_vendor.index.showToast({
        title: `${name}暂未上线`,
        icon: "none"
      });
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
        m: showLoginSheet.value
      }, showLoginSheet.value ? common_vendor.e({
        n: common_vendor.o(closeLoginSheet),
        o: common_vendor.o(handleWeChatLogin),
        p: hasAgreed.value
      }, hasAgreed.value ? {} : {}, {
        q: hasAgreed.value ? 1 : "",
        r: common_vendor.o(($event) => openAgreement("user")),
        s: common_vendor.o(($event) => openAgreement("privacy")),
        t: common_vendor.o(toggleAgreement),
        v: common_vendor.o(() => {
        }),
        w: common_vendor.o(closeLoginSheet),
        x: common_vendor.o(() => {
        })
      }) : {}, {
        y: common_vendor.o(handleLoginRequired),
        z: common_vendor.p({
          active: "profile",
          ["is-logged-in"]: isLoggedIn.value
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-201c0da5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/index.js.map
