"use strict";
const common_vendor = require("../common/vendor.js");
const utils_auth = require("../utils/auth.js");
const utils_request = require("../utils/request.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "LoginOverlay",
  props: {
    visible: { type: Boolean }
  },
  emits: ["update:visible", "login-success"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const hasAgreed = common_vendor.ref(false);
    const isSubmitting = common_vendor.ref(false);
    const { refreshLoginState } = utils_auth.useAuth();
    common_vendor.watch(
      () => props.visible,
      (visible) => {
        if (!visible) {
          hasAgreed.value = false;
          isSubmitting.value = false;
        }
      }
    );
    const closeSheet = () => {
      emit("update:visible", false);
    };
    const toggleAgreement = () => {
      hasAgreed.value = !hasAgreed.value;
    };
    const openAgreement = (type) => {
      const name = type === "user" ? "用户使用协议" : "隐私保护协议";
      common_vendor.index.showToast({
        title: `${name}暂未上线`,
        icon: "none"
      });
    };
    const handleWeChatLogin = () => {
      if (isSubmitting.value)
        return;
      if (!hasAgreed.value) {
        common_vendor.index.showToast({
          title: "请勾选协议后再登录",
          icon: "none"
        });
        return;
      }
      isSubmitting.value = true;
      common_vendor.index.getUserProfile({
        desc: "用于完善个人信息",
        success: (profileRes) => {
          const userInfo = profileRes.userInfo;
          common_vendor.index.__f__("log", "at components/LoginOverlay.vue:99", 99, "getUserProfile userInfo = ", userInfo);
          common_vendor.index.login({
            provider: "weixin",
            success: (loginRes) => {
              const code = loginRes.code;
              utils_request.axios.request({
                url: "/api/auth/login",
                method: "POST",
                data: {
                  code,
                  userInfo
                },
                showErrorToast: false
              }).then((data) => {
                common_vendor.index.__f__("log", "at components/LoginOverlay.vue:132", 116, "login success data = ", data);
                const { token, user } = data || {};
                if (!token || !user) {
                  common_vendor.index.showToast({ title: "登录数据异常", icon: "none" });
                  return;
                }
                common_vendor.index.setStorageSync("token", token);
                common_vendor.index.setStorageSync("userProfile", user);
                refreshLoginState();
                common_vendor.index.showToast({ title: "登录成功", icon: "success" });
                emit("login-success", { token, user });
                emit("update:visible", false);
              }).catch((error) => {
                common_vendor.index.__f__("log", "at components/LoginOverlay.vue:150", "login request fail", error);
                common_vendor.index.showToast({ title: "登录失败，请稍后再试", icon: "none" });
              }).finally(() => {
                isSubmitting.value = false;
              });
            },
            fail: () => {
              isSubmitting.value = false;
              common_vendor.index.showToast({ title: "寰俊鐧诲綍澶辫触", icon: "none" });
            }
          });
        },
        fail: (err) => {
          isSubmitting.value = false;
          common_vendor.index.__f__("log", "at components/LoginOverlay.vue:165", "getUserProfile fail", err);
          common_vendor.index.showToast({ title: "需要获取用户信息权限", icon: "none" });
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: _ctx.visible
      }, _ctx.visible ? common_vendor.e({
        b: common_vendor.o(closeSheet),
        c: isSubmitting.value,
        d: isSubmitting.value,
        e: common_vendor.o(handleWeChatLogin),
        f: hasAgreed.value
      }, hasAgreed.value ? {} : {}, {
        g: hasAgreed.value ? 1 : "",
        h: common_vendor.o(($event) => openAgreement("user")),
        i: common_vendor.o(($event) => openAgreement("privacy")),
        j: common_vendor.o(toggleAgreement),
        k: common_vendor.o(() => {
        }),
        l: common_vendor.o(closeSheet),
        m: common_vendor.o(() => {
        })
      }) : {});
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6defecc7"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/LoginOverlay.js.map
