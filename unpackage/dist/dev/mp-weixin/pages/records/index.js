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
          meta: [
            { value: "200.00元", caption: "花费" },
            { value: "7.12元/升", caption: "单价" },
            { value: "+28.09升", caption: "油量" }
          ],
          remark: "92#汽油  加满",
          remarkTone: "danger",
          showEdit: true
        },
        {
          type: "comparison",
          id: "2025-compare-1",
          pricePerKm: "0.34元/公里",
          deltaFuel: "-28.09升",
          deltaMileage: "+585.00公里",
          tone: "success"
        },
        {
          type: "record",
          id: "2025-10-09",
          date: "10/09",
          consumption: "8.59",
          mileage: "1002",
          highlight: "danger",
          compact: true
        },
        {
          type: "record",
          id: "2025-10-02",
          date: "10/02",
          consumption: "4.72",
          mileage: "611",
          compact: true
        },
        {
          type: "record",
          id: "2025-10-01",
          date: "10/01",
          consumption: "5.10",
          mileage: "510",
          compact: true
        },
        {
          type: "record",
          id: "2025-10-01",
          date: "10/01",
          consumption: "5.10",
          mileage: "510",
          compact: true
        },
        {
          type: "record",
          id: "2025-10-01",
          date: "10/01",
          consumption: "5.10",
          mileage: "510",
          compact: true
        }
      ],
      "2024年": [
        {
          type: "record",
          id: "2024-12-22",
          date: "12/22",
          consumption: "5.02",
          mileage: "1320",
          meta: [
            { value: "180.00元", caption: "花费" },
            { value: "6.90元/升", caption: "单价" },
            { value: "+25.21升", caption: "油量" }
          ],
          remark: "95#汽油  七成满",
          remarkTone: "accent"
        },
        {
          type: "record",
          id: "2024-11-02",
          date: "11/02",
          consumption: "6.40",
          mileage: "820",
          compact: true
        }
      ],
      "2023年": [
        {
          type: "record",
          id: "2023-07-03",
          date: "07/03",
          consumption: "5.30",
          mileage: "730",
          compact: true
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
            g: entry.meta
          }, entry.meta ? {
            h: common_vendor.f(entry.meta, (meta, k1, i1) => {
              return {
                a: common_vendor.t(meta.value),
                b: common_vendor.t(meta.caption),
                c: meta.value + meta.caption
              };
            })
          } : {}, {
            i: entry.remark || entry.showEdit
          }, entry.remark || entry.showEdit ? common_vendor.e({
            j: entry.remark
          }, entry.remark ? {
            k: common_vendor.t(entry.remark),
            l: entry.remarkTone === "danger" ? 1 : "",
            m: entry.remarkTone === "accent" ? 1 : ""
          } : {}, {
            n: entry.showEdit
          }, entry.showEdit ? {} : {}) : {}, {
            o: entry.compact ? 1 : "",
            p: entry.highlight === "danger" ? 1 : ""
          }) : {
            q: common_vendor.t(entry.pricePerKm),
            r: common_vendor.t(entry.deltaFuel),
            s: common_vendor.t(entry.deltaMileage),
            t: entry.tone === "success" ? 1 : ""
          }, {
            v: entry.id
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
