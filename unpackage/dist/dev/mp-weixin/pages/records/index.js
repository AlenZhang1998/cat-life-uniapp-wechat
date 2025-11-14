"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  BottomActionBar();
}
const BottomActionBar = () => "../../components/BottomActionBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const yearOptions = ["2025年", "2024年", "2023年"];
    const selectedYearIndex = common_vendor.ref(0);
    const summarySnapshots = {
      "2025年": {
        totalAmount: "836.70元",
        avgFuel: "5.71升/百公里",
        pricePerLiter: "7.12元/升",
        mileage: "1,577公里"
      },
      "2024年": {
        totalAmount: "1,120.80元",
        avgFuel: "6.04升/百公里",
        pricePerLiter: "7.03元/升",
        mileage: "2,318公里"
      },
      "2023年": {
        totalAmount: "906.40元",
        avgFuel: "5.83升/百公里",
        pricePerLiter: "6.87元/升",
        mileage: "1,980公里"
      }
    };
    const recordSnapshots = {
      "2025年": [
        {
          type: "record",
          id: "2025-10-18",
          date: "10/18",
          week: "周五",
          consumption: "4.80",
          mileage: "1587",
          amount: "200.00元",
          pricePerLiter: "7.12元/升",
          deltaFuel: "+28.09升",
          oilType: "92#汽油",
          fillStatus: "加满",
          fillStatusTone: "danger",
          fuelConsumption: "-28.09升",
          deltaMileage: "+585.00公里",
          pricePerKm: "0.34元/公里"
        },
        {
          type: "record",
          id: "2025-10-09",
          date: "10/09",
          consumption: "8.59",
          mileage: "1002",
          highlight: "danger",
          compact: true,
          amount: "186.00元",
          pricePerLiter: "7.20元/升",
          deltaFuel: "+25.80升",
          oilType: "95#汽油",
          fillStatus: "日常补油",
          fuelConsumption: "-28.09升",
          deltaMileage: "+585.00公里",
          pricePerKm: "0.34元/公里"
        },
        {
          type: "record",
          id: "2025-10-02",
          date: "10/02",
          consumption: "4.72",
          mileage: "611",
          compact: true,
          amount: "160.00元",
          pricePerLiter: "6.90元/升",
          deltaFuel: "+23.30升",
          oilType: "92#汽油",
          fillStatus: "加满",
          fuelConsumption: "-28.09升",
          deltaMileage: "+585.00公里",
          pricePerKm: "0.34元/公里"
        },
        {
          type: "record",
          id: "2025-10-01A",
          date: "10/01",
          consumption: "5.10",
          mileage: "510",
          compact: true,
          amount: "120.00元",
          pricePerLiter: "6.85元/升",
          deltaFuel: "+17.51升",
          oilType: "92#汽油",
          fillStatus: "七成满"
        },
        {
          type: "record",
          id: "2025-10-01B",
          date: "10/01",
          consumption: "5.10",
          mileage: "510",
          compact: true,
          amount: "120.00元",
          pricePerLiter: "6.85元/升",
          deltaFuel: "+17.51升",
          oilType: "92#汽油",
          fillStatus: "七成满"
        },
        {
          type: "record",
          id: "2025-10-01C",
          date: "10/01",
          consumption: "5.10",
          mileage: "510",
          compact: true,
          amount: "120.00元",
          pricePerLiter: "6.85元/升",
          deltaFuel: "+17.51升",
          oilType: "92#汽油",
          fillStatus: "七成满"
        }
      ],
      "2024年": [
        {
          type: "record",
          id: "2024-12-22",
          date: "12/22",
          consumption: "5.02",
          mileage: "1320",
          amount: "180.00元",
          pricePerLiter: "6.90元/升",
          deltaFuel: "+25.21升",
          oilType: "95#汽油",
          fillStatus: "七成满",
          fillStatusTone: "accent"
        },
        {
          type: "record",
          id: "2024-11-02",
          date: "11/02",
          consumption: "6.40",
          mileage: "820",
          compact: true,
          amount: "146.00元",
          pricePerLiter: "6.80元/升",
          deltaFuel: "+21.47升",
          oilType: "92#汽油",
          fillStatus: "加满"
        }
      ],
      "2023年": [
        {
          type: "record",
          id: "2023-07-03",
          date: "07/03",
          consumption: "5.30",
          mileage: "730",
          compact: true,
          amount: "138.00元",
          pricePerLiter: "6.50元/升",
          deltaFuel: "+21.23升",
          oilType: "92#汽油",
          fillStatus: "加满"
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
    common_vendor.watch(
      currentYear,
      () => {
        const currentRecords = recordSnapshots[currentYear.value] || [];
        const firstRecord = currentRecords.find(
          (item) => item.type === "record"
        );
        expandedRecordMap.value = firstRecord ? { [firstRecord.id]: true } : {};
      },
      { immediate: true }
    );
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
        i: common_vendor.f(visibleRecords.value, (entry, k0, i0) => {
          return common_vendor.e({
            a: isRecordItem(entry)
          }, isRecordItem(entry) ? common_vendor.e({
            b: common_vendor.t(entry.date),
            c: entry.week
          }, entry.week ? {
            d: common_vendor.t(entry.week)
          } : {}, {
            e: common_vendor.t(entry.consumption),
            f: common_vendor.t(entry.mileage),
            g: isExpanded(entry.id) ? 1 : "",
            h: common_vendor.t(isExpanded(entry.id)),
            i: common_vendor.t(entry.amount || "--"),
            j: common_vendor.t(entry.pricePerLiter || "--"),
            k: common_vendor.t(entry.deltaFuel || "--"),
            l: common_vendor.t(entry.oilType || "--"),
            m: entry.fillStatus
          }, entry.fillStatus ? {
            n: common_vendor.t(entry.fillStatus),
            o: entry.fillStatusTone === "danger" ? 1 : "",
            p: entry.fillStatusTone === "accent" ? 1 : ""
          } : {}, {
            q: isExpanded(entry.id),
            r: entry.compact ? 1 : "",
            s: entry.highlight === "danger" ? 1 : "",
            t: isExpanded(entry.id) ? 1 : "",
            v: common_vendor.o(($event) => toggleRecord(entry), entry.id)
          }) : {}, {
            w: isExpanded(entry.id)
          }, isExpanded(entry.id) ? {
            x: common_vendor.t(isExpanded(entry.id)),
            y: common_vendor.t(entry.pricePerKm),
            z: common_vendor.t(entry.fuelConsumption),
            A: common_vendor.t(entry.deltaMileage)
          } : {}, {
            B: entry.id
          });
        }),
        j: common_vendor.p({
          active: "list"
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f1512143"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/records/index.js.map
