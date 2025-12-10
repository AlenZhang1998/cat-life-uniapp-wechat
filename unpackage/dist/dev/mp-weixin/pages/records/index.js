"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_auth = require("../../utils/auth.js");
const utils_request = require("../../utils/request.js");
if (!Math) {
  (LoginOverlay + BottomActionBar)();
}
const BottomActionBar = () => "../../components/BottomActionBar.js";
const LoginOverlay = () => "../../components/LoginOverlay.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const { isLoggedIn, refreshLoginState } = utils_auth.useAuth();
    const showLoginSheet = common_vendor.ref(false);
    const yearOptions = ["全部", "2025", "2024", "2023"];
    const selectedYearIndex = common_vendor.ref(0);
    const currentYear = common_vendor.computed(
      () => yearOptions[selectedYearIndex.value] || "全部"
    );
    const isAllYear = common_vendor.computed(() => currentYear.value === "全部");
    const summaryCard = common_vendor.ref({
      totalAmount: "--",
      avgFuel: "--",
      pricePerLiter: "--",
      mileage: "--"
    });
    const records = common_vendor.ref([]);
    const visibleRecords = common_vendor.computed(() => records.value);
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
    const fetchRecords = async () => {
      if (!isLoggedIn.value) {
        records.value = [];
        summaryCard.value = {
          totalAmount: "--",
          avgFuel: "--",
          pricePerLiter: "--",
          mileage: "--"
        };
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "加载中...", mask: true });
        const res = await utils_request.axios.get(`/api/refuels/list?range=all`);
        common_vendor.index.__f__("log", "at pages/records/index.vue:304", "records res:", res);
        if (!res || res.success !== true) {
          throw new Error("接口返回异常");
        }
        const payload = res.data || {};
        const list = payload.records || [];
        const currentYearNum = (/* @__PURE__ */ new Date()).getFullYear();
        const targetYearNum = Number(currentYear.value);
        const filteredList = list.filter((item) => {
          if (isAllYear.value)
            return true;
          const dateStr = item.date || item.refuelDate;
          if (!dateStr)
            return false;
          const parsed = new Date(String(dateStr).replace(/-/g, "/"));
          if (Number.isNaN(parsed.getTime()))
            return false;
          return parsed.getFullYear() === targetYearNum;
        });
        const totalAmountNum = filteredList.reduce((sum, item) => {
          const val = Number(item.amount);
          return sum + (Number.isFinite(val) ? val : 0);
        }, 0);
        let avgFuelNum = null;
        if (isAllYear.value) {
          const consumptionIndexes = [];
          filteredList.forEach((item, idx) => {
            const c = item.consumption;
            if (c === "--" || c == null)
              return;
            const num = Number(c);
            if (!Number.isFinite(num))
              return;
            consumptionIndexes.push(idx);
          });
          if (consumptionIndexes.length >= 2) {
            const firstIdx = Math.min(...consumptionIndexes);
            const lastIdx = Math.max(...consumptionIndexes);
            const nextIdx = lastIdx + 1 < filteredList.length ? lastIdx + 1 : lastIdx;
            const first = filteredList[firstIdx];
            const nextAfterLast = filteredList[nextIdx];
            const firstOdo = Number(first.odometer);
            const nextOdo = Number(nextAfterLast.odometer);
            let distance = NaN;
            if (Number.isFinite(firstOdo) && Number.isFinite(nextOdo)) {
              distance = firstOdo - nextOdo;
            }
            let volumeSum = 0;
            for (let i = firstIdx; i <= lastIdx; i++) {
              const v = Number(filteredList[i].volume);
              if (Number.isFinite(v) && v > 0) {
                volumeSum += v;
              }
            }
            if (distance > 0 && volumeSum > 0) {
              avgFuelNum = volumeSum / distance * 100;
            } else {
              avgFuelNum = null;
            }
          } else {
            avgFuelNum = null;
          }
        } else {
          const consumptionValues = filteredList.map((item) => item.consumption).filter((val) => val !== null && val !== "--").map((val) => Number(val)).filter((val) => Number.isFinite(val));
          if (consumptionValues.length > 0) {
            const sum = consumptionValues.reduce((s, v) => s + v, 0);
            avgFuelNum = sum / consumptionValues.length;
          } else {
            avgFuelNum = null;
          }
        }
        const pricePerLValues = filteredList.map((item) => Number(item.pricePerL)).filter((val) => Number.isFinite(val));
        const avgPricePerLNum = pricePerLValues.length > 0 ? pricePerLValues.reduce((s, v) => s + v, 0) / pricePerLValues.length : null;
        const totalDistanceNum = filteredList.reduce((sum, item) => {
          const val = Number(item.distance);
          return sum + (Number.isFinite(val) ? val : 0);
        }, 0);
        summaryCard.value = {
          totalAmount: totalAmountNum > 0 ? totalAmountNum.toFixed(2) : "--",
          avgFuel: avgFuelNum != null ? avgFuelNum.toFixed(2) : "--",
          pricePerLiter: avgPricePerLNum != null ? Number(avgPricePerLNum).toFixed(2) : "--",
          mileage: totalDistanceNum > 0 ? String(Math.round(totalDistanceNum)) : "--"
        };
        records.value = filteredList.map((r) => {
          const distanceNum = r.distance != null ? Number(r.distance) : NaN;
          const volumeNum = r.volume != null ? Number(r.volume) : NaN;
          const odometerNum = r.odometer != null ? Number(r.odometer) : NaN;
          const rawDateStr = r.date || r.refuelDate || "";
          let displayDate = r.monthDay || "--";
          if (rawDateStr) {
            const parsed = new Date(String(rawDateStr).replace(/-/g, "/"));
            if (!Number.isNaN(parsed.getTime())) {
              const y = parsed.getFullYear();
              const m = String(parsed.getMonth() + 1).padStart(2, "0");
              const d = String(parsed.getDate()).padStart(2, "0");
              if (isAllYear.value && y !== currentYearNum) {
                displayDate = `${y}/${m}/${d}`;
              } else if (!r.monthDay) {
                displayDate = `${m}-${d}`;
              }
            }
          }
          return {
            type: "record",
            id: r._id,
            date: displayDate,
            consumption: r.consumption != null ? Number(r.consumption).toFixed(2) : "--",
            mileage: !Number.isNaN(odometerNum) ? String(Math.round(odometerNum)) : "--",
            amount: r.amount != null ? Number(r.amount).toFixed(2) : void 0,
            pricePerLiter: r.pricePerL != null ? Number(r.pricePerL).toFixed(2) : void 0,
            deltaFuel: !Number.isNaN(volumeNum) ? `+${volumeNum.toFixed(2)}` : void 0,
            oilType: r.fuelGrade ? `${r.fuelGrade}汽油` : void 0,
            fillStatus: r.isFullTank ? "加满" : "",
            fillStatusTone: r.isFullTank ? "danger" : void 0,
            compact: true,
            highlight: void 0,
            fuelConsumption: !Number.isNaN(volumeNum) ? `-${volumeNum.toFixed(2)}` : void 0,
            deltaMileage: !Number.isNaN(distanceNum) ? `+${Math.round(distanceNum)}` : void 0,
            pricePerKm: r.pricePerKm != null ? Number(r.pricePerKm).toFixed(2) : void 0
          };
        });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/records/index.vue:478", "fetchRecords error:", err);
        common_vendor.index.showToast({
          title: "加载失败，请稍后再试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    };
    const handleLoginRequired = () => {
      if (!isLoggedIn.value) {
        showLoginSheet.value = true;
      }
    };
    const handleEdit = (entry) => {
      handleLoginRequired();
      common_vendor.index.__f__("log", "at pages/records/index.vue:498", 590, "handleEdit", entry);
      common_vendor.index.navigateTo({
        url: `/pages/add/index?id=${entry.id}`
      });
    };
    common_vendor.watch(currentYear, () => {
      expandedRecordMap.value = {};
      runPageEnterAnimation();
      fetchRecords();
    });
    common_vendor.onShow(() => {
      refreshLoginState();
      runPageEnterAnimation();
      fetchRecords();
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
        e: common_vendor.t(currentYear.value === "全部" ? "油耗概况" : "年度油耗概况"),
        f: common_vendor.t(summaryCard.value.totalAmount),
        g: common_vendor.t(currentYear.value === "全部" ? "总花费" : "本年总花费"),
        h: common_vendor.t(summaryCard.value.avgFuel),
        i: common_vendor.t(summaryCard.value.pricePerLiter),
        j: common_vendor.t(summaryCard.value.mileage),
        k: isPageAnimated.value ? 1 : "",
        l: common_vendor.f(visibleRecords.value, (entry, entryIndex, i0) => {
          return common_vendor.e({
            a: isRecordItem(entry)
          }, isRecordItem(entry) ? common_vendor.e({
            b: common_vendor.t(entry.date),
            c: entry.consumption !== "--"
          }, entry.consumption !== "--" ? {
            d: common_vendor.t(entry.consumption),
            e: Number(entry.consumption) > 9 ? 1 : ""
          } : {}, {
            f: common_vendor.t(entry.mileage),
            g: isExpanded(entry.id) ? 1 : "",
            h: common_vendor.t(entry.amount ? entry.amount + "元" : "--"),
            i: common_vendor.t(entry.pricePerLiter ? entry.pricePerLiter + "元/升" : "--"),
            j: common_vendor.t(entry.deltaFuel ? entry.deltaFuel + "升" : "--"),
            k: common_vendor.t(entry.oilType || "--"),
            l: entry.fillStatus
          }, entry.fillStatus ? {
            m: common_vendor.t(entry.fillStatus),
            n: entry.fillStatusTone === "danger" ? 1 : "",
            o: entry.fillStatusTone === "accent" ? 1 : ""
          } : {}, {
            p: common_vendor.o(($event) => handleEdit(entry), entry.id),
            q: isExpanded(entry.id),
            r: common_vendor.n({
              "list-animated--visible": isPageAnimated.value
            }),
            s: common_vendor.n({
              "record-card--compact": entry.compact,
              "record-card--alert": entry.highlight === "danger",
              "record-card--expanded": isExpanded(entry.id)
            }),
            t: common_vendor.s(getListAnimatedStyle(entryIndex)),
            v: common_vendor.o(($event) => toggleRecord(entry), entry.id)
          }) : {}, {
            w: isRecordItem(entry) && isExpanded(entry.id)
          }, isRecordItem(entry) && isExpanded(entry.id) ? common_vendor.e({
            x: entry.consumption !== "--"
          }, entry.consumption !== "--" ? {
            y: common_vendor.t(entry.pricePerKm ? entry.pricePerKm + "元/公里" : "--"),
            z: common_vendor.t(entry.fuelConsumption ? entry.fuelConsumption + "升" : "--"),
            A: common_vendor.t(entry.deltaMileage ? entry.deltaMileage + "公里" : "--")
          } : {}, {
            B: common_vendor.n({
              "list-animated--visible": isPageAnimated.value
            }),
            C: common_vendor.s(getListAnimatedStyle(entryIndex, "comparison"))
          }) : {}, {
            D: entry.id
          });
        }),
        m: common_vendor.o(($event) => showLoginSheet.value = $event),
        n: common_vendor.p({
          visible: showLoginSheet.value
        }),
        o: common_vendor.o(handleLoginRequired),
        p: common_vendor.p({
          active: "list",
          ["is-logged-in"]: common_vendor.unref(isLoggedIn)
        })
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-f1512143"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/records/index.js.map
