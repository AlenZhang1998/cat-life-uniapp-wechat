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
      name: "爱车车主",
      joinDate: "2024-08"
    });
    const features = common_vendor.ref([
      {
        key: "garage",
        icon: "车",
        title: "我的车库",
        desc: "管理车辆、切换默认车型"
      },
      {
        key: "report",
        icon: "报",
        title: "驾驶报告",
        desc: "查看驾驶评分与节油建议"
      },
      {
        key: "backup",
        icon: "云",
        title: "数据备份",
        desc: "同步到云端，换机无忧"
      },
      {
        key: "settings",
        icon: "设",
        title: "设置",
        desc: "通知、隐私、关于"
      }
    ]);
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(user.value.name),
        b: common_vendor.t(user.value.joinDate),
        c: common_vendor.f(features.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.icon),
            b: common_vendor.t(item.title),
            c: common_vendor.t(item.desc),
            d: item.key
          };
        }),
        d: common_vendor.p({
          active: "profile"
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-201c0da5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/index.js.map
