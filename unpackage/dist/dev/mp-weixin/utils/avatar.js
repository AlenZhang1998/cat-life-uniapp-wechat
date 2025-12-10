"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("./request.js");
const uploadAvatarToCos = (filePath) => {
  return new Promise((resolve, reject) => {
    const token = common_vendor.index.getStorageSync("token");
    if (!token) {
      common_vendor.index.showToast({ title: "请先登录", icon: "none" });
      return reject(new Error("no token"));
    }
    common_vendor.index.uploadFile({
      url: utils_request.getBaseUrl() + "/api/upload/avatar",
      filePath,
      name: "file",
      // 要和后端 upload.single('file') 对应
      header: {
        Authorization: `Bearer ${token}`
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.url) {
            resolve(data.url);
          } else {
            reject(new Error("no url in response"));
          }
        } catch (e) {
          reject(e);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};
exports.uploadAvatarToCos = uploadAvatarToCos;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/avatar.js.map
