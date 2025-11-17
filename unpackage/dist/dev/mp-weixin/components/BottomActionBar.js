"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "BottomActionBar",
  props: {
    active: {}
  },
  setup(__props) {
    const props = __props;
    const actions = [
      {
        key: "fuel",
        label: "油耗",
        icon: "⛽",
        iconActive: "🛢️",
        iconType: "text",
        type: "text",
        path: "/pages/home/index"
      },
      {
        key: "list",
        label: "列表",
        icon: "📋",
        iconActive: "📑",
        iconType: "text",
        type: "text",
        path: "/pages/records/index"
      },
      {
        key: "add",
        label: "",
        icon: "+",
        iconActive: "✚",
        iconType: "text",
        type: "primary",
        path: "/pages/add/index"
      },
      {
        key: "expense",
        label: "费用",
        icon: "💰",
        iconActive: "💵",
        iconType: "text",
        type: "text",
        path: "/pages/expense/index"
      },
      {
        key: "profile",
        label: "我的",
        icon: "🙂",
        iconActive: "😄",
        iconType: "text",
        type: "text",
        path: "/pages/profile/index"
      }
    ];
    const handleAction = (action) => {
      if (action.key === props.active && action.key !== "add") {
        return;
      }
      if (action.key === "add") {
        common_vendor.index.navigateTo({ url: action.path });
        return;
      }
      common_vendor.index.redirectTo({ url: action.path });
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(actions, (action, k0, i0) => {
          return common_vendor.e({
            a: action.iconType === "image"
          }, action.iconType === "image" ? {
            b: action.key === _ctx.active ? action.iconActive : action.icon
          } : {
            c: common_vendor.t(action.key === _ctx.active ? action.iconActive || action.icon : action.icon)
          }, {
            d: action.label
          }, action.label ? {
            e: common_vendor.t(action.label)
          } : {}, {
            f: action.key,
            g: common_vendor.o(($event) => handleAction(action), action.key),
            h: common_vendor.n(action.type === "primary" ? "primary" : ""),
            i: common_vendor.n(`action-${action.key}`),
            j: common_vendor.n(action.key === _ctx.active ? "active" : "")
          });
        })
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7a063730"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/BottomActionBar.js.map
