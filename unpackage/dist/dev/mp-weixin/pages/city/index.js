"use strict";
const common_vendor = require("../../common/vendor.js");
const constants_storage = require("../../constants/storage.js");
const data_cities = require("../../data/cities.js");
const utils_location = require("../../utils/location.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const keyword = common_vendor.ref("");
    const currentCity = common_vendor.ref("");
    const locationCity = common_vendor.ref("");
    const locating = common_vendor.ref(false);
    const activeAnchor = common_vendor.ref("");
    const highlightedLetter = common_vendor.ref("");
    const eventChannel = common_vendor.ref(null);
    const pageInstance = common_vendor.getCurrentInstance();
    const resolveEventChannel = () => {
      var _a, _b;
      const getter = ((_a = pageInstance == null ? void 0 : pageInstance.proxy) == null ? void 0 : _a.getOpenerEventChannel) ?? ((_b = pageInstance == null ? void 0 : pageInstance.ctx) == null ? void 0 : _b.getOpenerEventChannel);
      return typeof getter === "function" ? getter() : null;
    };
    const baseCities = data_cities.CITY_LIST;
    const sortSections = (entries) => entries.sort((a, b) => {
      if (a.letter === "#")
        return 1;
      if (b.letter === "#")
        return -1;
      return a.letter.localeCompare(b.letter);
    });
    const groupCities = (cities) => {
      const map = /* @__PURE__ */ new Map();
      cities.forEach((city) => {
        const letter = city.letter || "#";
        if (!map.has(letter)) {
          map.set(letter, []);
        }
        map.get(letter).push(city);
      });
      return sortSections(
        Array.from(map.entries()).map(([letter, items]) => ({
          letter,
          items: items.sort((a, b) => a.pinyin.localeCompare(b.pinyin))
        }))
      );
    };
    const allSections = common_vendor.computed(() => groupCities(baseCities));
    const displayedSections = common_vendor.computed(() => {
      const rawKeyword = keyword.value.trim();
      const value = rawKeyword.toLowerCase();
      if (!rawKeyword) {
        return allSections.value;
      }
      const filtered = baseCities.filter((city) => {
        if (city.name.includes(rawKeyword))
          return true;
        return city.pinyin.includes(value) || city.abbr.includes(value);
      });
      return groupCities(filtered);
    });
    const clearKeyword = () => {
      keyword.value = "";
    };
    const persistCity = (cityName) => {
      currentCity.value = cityName;
      common_vendor.index.setStorage({
        key: constants_storage.STORAGE_KEYS.selectedCity,
        data: cityName
      });
    };
    const emitSelection = (cityName) => {
      var _a;
      (_a = eventChannel.value) == null ? void 0 : _a.emit("city-selected", cityName);
    };
    const closePage = () => {
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 150);
    };
    const handleCityTap = (cityName) => {
      persistCity(cityName);
      emitSelection(cityName);
      closePage();
    };
    const handleLocate = async (applyCity = true) => {
      if (locating.value)
        return;
      locating.value = true;
      try {
        await utils_location.ensureLocationAuth();
        const located = await utils_location.locateCityByGPS();
        if (located == null ? void 0 : located.city) {
          locationCity.value = located.city;
          if (applyCity) {
            handleCityTap(located.city);
          }
          return;
        }
        if (applyCity) {
          await handlePickFromMap();
        }
      } catch (error) {
        if (applyCity) {
          common_vendor.index.showToast({
            title: "请先开启定位权限",
            icon: "none"
          });
        }
      } finally {
        locating.value = false;
      }
    };
    const handlePickFromMap = async () => {
      const result = await utils_location.chooseCityFromMap();
      if (result == null ? void 0 : result.city) {
        locationCity.value = result.city;
        handleCityTap(result.city);
      } else {
        common_vendor.index.showToast({
          title: "无法获取定位",
          icon: "none"
        });
      }
    };
    const jumpTo = (letter) => {
      highlightedLetter.value = letter;
      activeAnchor.value = `anchor-${letter}`;
      setTimeout(() => {
        activeAnchor.value = "";
      }, 300);
    };
    common_vendor.onLoad((options) => {
      eventChannel.value = resolveEventChannel();
      const queryCity = (options == null ? void 0 : options.currentCity) && decodeURIComponent(options.currentCity) || "";
      const storedCity = common_vendor.index.getStorageSync(constants_storage.STORAGE_KEYS.selectedCity) || "";
      currentCity.value = queryCity || storedCity || "深圳市";
      locationCity.value = storedCity;
      setTimeout(() => {
        handleLocate(false);
      }, 200);
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: keyword.value,
        b: common_vendor.o(($event) => keyword.value = $event.detail.value),
        c: keyword.value
      }, keyword.value ? {
        d: common_vendor.o(clearKeyword)
      } : {}, {
        e: common_vendor.t(locationCity.value || currentCity.value || "未定位"),
        f: !locationCity.value
      }, !locationCity.value ? {
        g: common_vendor.t(locating.value ? "定位中..." : "点击右侧按钮重新定位")
      } : {}, {
        h: locating.value,
        i: common_vendor.o(handleLocate),
        j: common_vendor.o(handlePickFromMap),
        k: common_vendor.f(displayedSections.value, (section, k0, i0) => {
          return {
            a: common_vendor.t(section.letter),
            b: common_vendor.f(section.items, (city, k1, i1) => {
              return common_vendor.e({
                a: common_vendor.t(city.name),
                b: city.name === currentCity.value
              }, city.name === currentCity.value ? {} : {}, {
                c: city.code,
                d: common_vendor.o(($event) => handleCityTap(city.name), city.code)
              });
            }),
            c: section.letter,
            d: `anchor-${section.letter}`
          };
        }),
        l: !displayedSections.value.length
      }, !displayedSections.value.length ? {} : {}, {
        m: activeAnchor.value,
        n: common_vendor.f(allSections.value, (section, k0, i0) => {
          return {
            a: common_vendor.t(section.letter),
            b: section.letter,
            c: section.letter === highlightedLetter.value ? 1 : "",
            d: common_vendor.o(($event) => jumpTo(section.letter), section.letter)
          };
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5a18b3c9"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/city/index.js.map
