const uni = wx

const DEFAULT_FORM = {
  avatar: '',
  name: '',
  gender: '保密',
  deliveryDate: '',
  carModel: '',
  phone: '',
  email: ''
}

Page({
  data: {
    genderOptions: ['男', '女', '保密'],
    genderIndex: 2,
    form: { ...DEFAULT_FORM }
  },

  onLoad() {
    this.loadProfile()
  },

  normalizeGenderIndex(value) {
    const idx = this.data.genderOptions.indexOf(value || '保密')
    return idx >= 0 ? idx : 2
  },

  loadProfile() {
    try {
      const stored = uni.getStorageSync('userProfile')
      if (stored) {
        const parsed = typeof stored === 'string' ? JSON.parse(stored) : stored
        if (!parsed.deliveryDate && parsed.birthDate) {
          parsed.deliveryDate = parsed.birthDate
        }
        const merged = { ...DEFAULT_FORM, ...parsed }
        const genderIndex = this.normalizeGenderIndex(merged.gender)
        this.setData({
          form: merged,
          genderIndex
        })
      }
    } catch (error) {
      console.warn('加载个人信息失败', error)
    }
  },

  onInputChange(event) {
    const field = event.currentTarget.dataset.field
    if (!field) return
    const value = event.detail.value
    this.setData({
      [`form.${field}`]: value
    })
  },

  onGenderChange(event) {
    const idx = Number(event.detail.value)
    this.setData({
      genderIndex: idx,
      'form.gender': this.data.genderOptions[idx] || '保密'
    })
  },

  onDeliveryChange(event) {
    this.setData({
      'form.deliveryDate': event.detail.value
    })
  },

  chooseAvatar() {
    uni.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: ({ tapIndex }) => {
        const sourceType = tapIndex === 0 ? 'camera' : 'album'
        this.pickAvatar(sourceType)
      }
    })
  },

  pickAvatar(sourceType) {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: [sourceType],
      success: (res) => {
        const files = res.tempFilePaths || []
        const path = files[0]
        if (path) {
          this.setData({
            'form.avatar': path
          })
        }
      }
    })
  },

  handleSave() {
    if (!this.data.form.name || !this.data.form.carModel || !this.data.form.deliveryDate) {
      uni.showToast({
        title: !this.data.form.name ? '请填写昵称' : !this.data.form.carModel ? '请填写爱车型号' : '请选择提车日期',
        icon: 'none'
      })
      return
    }

    try {
      uni.setStorageSync('userProfile', { ...this.data.form })
      uni.showToast({
        title: '已保存',
        icon: 'success'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 500)
    } catch (error) {
      console.error('保存个人信息失败', error)
      uni.showToast({
        title: '保存失败，请稍后再试',
        icon: 'none'
      })
    }
  }
})
