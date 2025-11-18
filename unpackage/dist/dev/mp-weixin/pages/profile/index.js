"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  BottomActionBar();
}
const BottomActionBar = () => "../../components/BottomActionBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const user = common_vendor.ref({
      name: "Alen",
      initial: "熊",
      joinDate: "2024-08",
      motto: "给油门一个拥抱，让城市多一点绿。",
      tags: ["城市漫游者", "节能达人", "夜行者"]
    });
    const features = common_vendor.ref([
      {
        key: "garage",
        icon: "🚗",
        title: "我的车库",
        desc: "切换默认车型，创建虚拟座驾"
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
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(user.value.initial),
        b: common_vendor.t(user.value.name),
        c: common_vendor.t(user.value.joinDate),
        d: common_vendor.f(user.value.tags, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag),
            b: tag
          };
        }),
        e: common_vendor.t(user.value.motto),
        f: common_vendor.f(features.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.icon),
            b: common_vendor.t(item.title),
            c: common_vendor.t(item.desc),
            d: item.key
          };
        }),
        g: common_vendor.p({
          active: "profile"
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-201c0da5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/index.js.map
