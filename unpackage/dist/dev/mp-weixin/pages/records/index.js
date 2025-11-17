"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  BottomActionBar();
}
const BottomActionBar = () => "../../components/BottomActionBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const yearOptions = ["2025", "2024", "2023"];
    const selectedYearIndex = common_vendor.ref(0);
    const summarySnapshots = {
      "2025": {
        totalAmount: "836.70",
        avgFuel: "5.71",
        pricePerLiter: "7.12",
        mileage: "1,577"
      }
    };
    const recordSnapshots = {
      "2025": [
        {
          type: "record",
          id: "2025-10-18",
          date: "10/18",
          consumption: "4.80",
          mileage: "1587",
          amount: "200.00",
          pricePerLiter: "7.12",
          deltaFuel: "+28.09",
          oilType: "92#汽油",
          fillStatus: "加满",
          fillStatusTone: "danger",
          fuelConsumption: "-28.09",
          deltaMileage: "+585.00",
          pricePerKm: "0.34"
        },
        {
          type: "record",
          id: "2025-10-09",
          date: "10/09",
          consumption: "8.59",
          mileage: "1002",
          highlight: "danger",
          compact: true,
          amount: "186.00",
          pricePerLiter: "7.20",
          deltaFuel: "+25.80",
          oilType: "95#汽油",
          fillStatus: "加满",
          fillStatusTone: "danger",
          fuelConsumption: "-28.09",
          deltaMileage: "+585.00",
          pricePerKm: "0.34"
        },
        {
          type: "record",
          id: "2025-10-02",
          date: "10/02",
          consumption: "4.72",
          mileage: "611",
          compact: true,
          amount: "160.00",
          pricePerLiter: "6.90",
          deltaFuel: "+23.30",
          oilType: "92#汽油",
          fillStatus: "加满",
          fillStatusTone: "danger",
          fuelConsumption: "-28.09",
          deltaMileage: "+585.00",
          pricePerKm: "0.34"
        },
        {
          type: "record",
          id: "2025-10-01",
          date: "10/01",
          consumption: "4.72",
          mileage: "611",
          compact: true,
          amount: "160.00",
          pricePerLiter: "6.90",
          deltaFuel: "+23.30",
          oilType: "92#汽油",
          fillStatus: "加满",
          fillStatusTone: "danger",
          fuelConsumption: "-28.09",
          deltaMileage: "+585.00",
          pricePerKm: "0.34"
        },
        {
          type: "record",
          id: "2025-09-26",
          date: "09/26",
          consumption: "4.72",
          mileage: "611",
          compact: true,
          amount: "160.00",
          pricePerLiter: "6.90",
          deltaFuel: "+23.30",
          oilType: "92#汽油",
          fillStatus: "加满",
          fillStatusTone: "danger",
          fuelConsumption: "-28.09",
          deltaMileage: "+585.00",
          pricePerKm: "0.34"
        },
        {
          type: "record",
          id: "2025-09-15",
          date: "09/15",
          consumption: "4.72",
          mileage: "611",
          compact: true,
          amount: "160.00",
          pricePerLiter: "6.90",
          deltaFuel: "+23.30",
          oilType: "92#汽油",
          fillStatus: "加满",
          fillStatusTone: "danger",
          fuelConsumption: "-28.09",
          deltaMileage: "+585.00",
          pricePerKm: "0.34"
        },
        {
          type: "record",
          id: "2025-09-10",
          date: "09/01",
          consumption: "4.72",
          mileage: "611",
          compact: true,
          amount: "160.00",
          pricePerLiter: "6.90",
          deltaFuel: "+23.30",
          oilType: "92#汽油",
          fillStatus: "加满",
          fillStatusTone: "danger",
          fuelConsumption: "-28.09",
          deltaMileage: "+585.00",
          pricePerKm: "0.34"
        },
        {
          type: "record",
          id: "2025-09-03",
          date: "09/01",
          consumption: "4.72",
          mileage: "611",
          compact: true,
          amount: "160.00",
          pricePerLiter: "6.90",
          deltaFuel: "+23.30",
          oilType: "92#汽油",
          fillStatus: "加满",
          fillStatusTone: "danger",
          fuelConsumption: "-28.09",
          deltaMileage: "+585.00",
          pricePerKm: "0.34"
        },
        {
          type: "record",
          id: "2025-09-01",
          date: "09/01",
          consumption: "4.72",
          mileage: "611",
          compact: true,
          amount: "160.00",
          pricePerLiter: "6.90",
          deltaFuel: "+23.30",
          oilType: "92#汽油",
          fillStatus: "加满",
          fillStatusTone: "danger",
          fuelConsumption: "-28.09",
          deltaMileage: "+585.00",
          pricePerKm: "0.34"
        }
      ],
      "2024": [
        {
          type: "record",
          id: "2024-12-22",
          date: "12/22",
          consumption: "4.72",
          mileage: "611",
          compact: true,
          amount: "160.00",
          pricePerLiter: "6.90",
          deltaFuel: "+23.30",
          oilType: "92#汽油",
          fillStatus: "加满",
          fillStatusTone: "danger",
          fuelConsumption: "-28.09",
          deltaMileage: "+585.00",
          pricePerKm: "0.34"
        },
        {
          type: "record",
          id: "2024-11-02",
          date: "11/02",
          consumption: "4.72",
          mileage: "611",
          compact: true,
          amount: "160.00",
          pricePerLiter: "6.90",
          deltaFuel: "+23.30",
          oilType: "92#汽油",
          fillStatus: "加满",
          fillStatusTone: "danger",
          fuelConsumption: "-28.09",
          deltaMileage: "+585.00",
          pricePerKm: "0.34"
        }
      ],
      "2023": [
        {
          type: "record",
          id: "2023-07-03",
          date: "07/03",
          consumption: "4.72",
          mileage: "611",
          compact: true,
          amount: "160.00",
          pricePerLiter: "6.90",
          deltaFuel: "+23.30",
          oilType: "92#汽油",
          fillStatus: "加满",
          fillStatusTone: "danger",
          fuelConsumption: "-28.09",
          deltaMileage: "+585.00",
          pricePerKm: "0.34"
        }
      ]
    };
    const currentYear = common_vendor.computed(
      () => yearOptions[selectedYearIndex.value] || yearOptions[0]
    );
    const summaryCard = common_vendor.computed(
      () => summarySnapshots[currentYear.value] || summarySnapshots[yearOptions[0]]
    );
    const visibleRecords = common_vendor.computed(
      () => recordSnapshots[currentYear.value] || []
    );
    const isPageAnimated = common_vendor.ref(false);
    let enterAnimationTimer = null;
    const runPageEnterAnimation = () => {
      if (enterAnimationTimer) {
        clearTimeout(enterAnimationTimer);
        enterAnimationTimer = null;
      }
      isPageAnimated.value = false;
      enterAnimationTimer = setTimeout(() => {
        isPageAnimated.value = true;
      }, 40);
    };
    const getListAnimatedStyle = (index, variant = "card") => {
      const limitedIndex = Math.min(index, 6);
      const baseOffset = variant === "comparison" ? 140 : 60;
      return {
        "--list-delay": `${limitedIndex * 70 + baseOffset}ms`
      };
    };
    const handleYearChange = (event) => {
      selectedYearIndex.value = Number(event.detail.value);
    };
    const isRecordItem = (entry) => entry.type === "record";
    const expandedRecordMap = common_vendor.ref({});
    const isExpanded = (id) => Boolean(expandedRecordMap.value[id]);
    const toggleRecord = (entry) => {
      const next = {
        ...expandedRecordMap.value,
        [entry.id]: !expandedRecordMap.value[entry.id]
      };
      expandedRecordMap.value = next;
    };
    common_vendor.watch(currentYear, () => {
      expandedRecordMap.value = {};
      runPageEnterAnimation();
    });
    common_vendor.onShow(() => {
      runPageEnterAnimation();
    });
    common_vendor.onMounted(() => {
      runPageEnterAnimation();
    });
    common_vendor.onUnmounted(() => {
      if (enterAnimationTimer) {
        clearTimeout(enterAnimationTimer);
        enterAnimationTimer = null;
      }
    });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(currentYear.value),
        b: yearOptions,
        c: selectedYearIndex.value,
        d: common_vendor.o(handleYearChange),
        e: common_vendor.t(summaryCard.value.totalAmount),
        f: common_vendor.t(summaryCard.value.avgFuel),
        g: common_vendor.t(summaryCard.value.pricePerLiter),
        h: common_vendor.t(summaryCard.value.mileage),
        i: isPageAnimated.value ? 1 : "",
        j: common_vendor.f(visibleRecords.value, (entry, entryIndex, i0) => {
          return common_vendor.e({
            a: isRecordItem(entry)
          }, isRecordItem(entry) ? common_vendor.e({
            b: common_vendor.t(entry.date),
            c: common_vendor.t(entry.consumption),
            d: common_vendor.t(entry.mileage),
            e: isExpanded(entry.id) ? 1 : "",
            f: common_vendor.t(entry.amount ? entry.amount + "元" : "--"),
            g: common_vendor.t(entry.pricePerLiter ? entry.pricePerLiter + "元/升" : "--"),
            h: common_vendor.t(entry.deltaFuel ? entry.deltaFuel + "升" : "--"),
            i: common_vendor.t(entry.oilType || "--"),
            j: entry.fillStatus
          }, entry.fillStatus ? {
            k: common_vendor.t(entry.fillStatus),
            l: entry.fillStatusTone === "danger" ? 1 : "",
            m: entry.fillStatusTone === "accent" ? 1 : ""
          } : {}, {
            n: isExpanded(entry.id),
            o: common_vendor.n({
              "list-animated--visible": isPageAnimated.value
            }),
            p: common_vendor.n({
              "record-card--compact": entry.compact,
              "record-card--alert": entry.highlight === "danger",
              "record-card--expanded": isExpanded(entry.id)
            }),
            q: common_vendor.s(getListAnimatedStyle(entryIndex)),
            r: common_vendor.o(($event) => toggleRecord(entry), entry.id)
          }) : {}, {
            s: isRecordItem(entry) && isExpanded(entry.id)
          }, isRecordItem(entry) && isExpanded(entry.id) ? {
            t: common_vendor.t(entry.pricePerKm ? entry.pricePerKm + "元/公里" : "--"),
            v: common_vendor.t(entry.fuelConsumption ? entry.fuelConsumption + "升" : "--"),
            w: common_vendor.t(entry.deltaMileage ? entry.deltaMileage + "公里" : "--"),
            x: common_vendor.n({
              "list-animated--visible": isPageAnimated.value
            }),
            y: common_vendor.s(getListAnimatedStyle(entryIndex, "comparison"))
          } : {}, {
            z: entry.id
          });
        }),
        k: common_vendor.p({
          active: "list"
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f1512143"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/records/index.js.map
