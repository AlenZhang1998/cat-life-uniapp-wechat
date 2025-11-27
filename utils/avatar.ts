// 上传头像到 Node 后端，后端再传腾讯云 COS

import { getBaseUrl } from './request'

export const uploadAvatarToCos = (filePath: string) => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    if (!token) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return reject(new Error('no token'))
    }

    uni.uploadFile({
      url: getBaseUrl() + '/api/upload/avatar',
      filePath,
      name: 'file', // 要和后端 upload.single('file') 对应
      header: {
        Authorization: `Bearer ${token}`
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.url) {
            resolve(data.url)        // 返回真正的 COS URL
          } else {
            reject(new Error('no url in response'))
          }
        } catch (e) {
          reject(e)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}