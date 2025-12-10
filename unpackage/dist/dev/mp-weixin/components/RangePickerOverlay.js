"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "RangePickerOverlay",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: "请选择"
    },
    options: {
      type: Array,
      default: () => []
    },
    selectedKey: {
      type: [String, Number],
      default: null
    },
    cancelText: {
      type: String,
      default: "取消"
    },
    confirmText: {
      type: String,
      default: "确定"
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    }
  },
  emits: ["update:selectedKey", "confirm", "cancel"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const handleSelect = (key) => {
      emit("update:selectedKey", key);
    };
    const handleCancel = () => {
      emit("cancel");
    };
    const handleConfirm = () => {
      emit("confirm", props.selectedKey ?? null);
    };
    const handleOverlayTap = () => {
      if (props.closeOnOverlay) {
        handleCancel();
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: __props.visible
      }, __props.visible ? {
        b: common_vendor.t(__props.title),
        c: common_vendor.f(__props.options, (option, k0, i0) => {
          return {
            a: common_vendor.t(option.label),
            b: option.key,
            c: option.key === __props.selectedKey ? 1 : "",
            d: common_vendor.o(() => handleSelect(option.key), option.key)
          };
        }),
        d: common_vendor.t(__props.cancelText),
        e: common_vendor.o(handleCancel),
        f: common_vendor.t(__props.confirmText),
        g: common_vendor.o(handleConfirm),
        h: common_vendor.o(() => {
        }),
        i: common_vendor.o(handleOverlayTap),
        j: common_vendor.o(() => {
        })
      } : {});
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-644ced54"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/RangePickerOverlay.js.map
