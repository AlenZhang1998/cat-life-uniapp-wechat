<template>
  <view class="personal-info-page">
    <view class="form-card">
      <view class="avatar-section">
        <view class="avatar-preview" @tap="chooseAvatar">
          <image v-if="form.avatar" :src="form.avatar" mode="aspectFill" />
          <text v-else>添加头像</text>
        </view>
        <text class="avatar-tip">支持拍照或从本地相册选择</text>
        <button class="avatar-btn" @tap="chooseAvatar">更换头像</button>
      </view>

      <view class="form-group">
        <text class="form-label">昵称</text>
        <input class="form-input" v-model="form.name" placeholder="请输入昵称" maxlength="20" />
      </view>

      <view class="form-group">
        <text class="form-label">性别</text>
        <picker mode="selector" :range="genderOptions" :value="genderIndex" @change="onGenderChange">
          <view class="picker-value">{{ form.gender || '请选择性别' }}</view>
        </picker>
      </view>

      <view class="form-group">
        <text class="form-label">提车日期</text>
        <picker mode="date" :value="form.deliveryDate" @change="onDeliveryChange">
          <view class="picker-value">{{ form.deliveryDate || '请选择提车日期' }}</view>
        </picker>
      </view>

      <view class="form-group">
        <text class="form-label">爱车型号</text>
        <input class="form-input" v-model="form.carModel" placeholder="请输入你喜欢的车型" maxlength="30" />
      </view>

      <view class="form-group">
        <text class="form-label">联系电话</text>
        <input class="form-input" v-model="form.phone" placeholder="请输入手机号" type="number" maxlength="11" />
      </view>

      <view class="form-group">
        <text class="form-label">邮箱</text>
        <input class="form-input" v-model="form.email" placeholder="请输入邮箱地址" type="text" />
      </view>
    </view>

    <button class="save-btn" @tap="handleSave">保存</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

interface UserProfile {
  avatar: string
  name: string
  gender: string
  deliveryDate: string
  carModel: string
  phone: string
  email: string
}

const genderOptions = ['男', '女', '保密']

const form = ref<UserProfile>({
  avatar: '',
  name: '',
  gender: '保密',
  deliveryDate: '',
  carModel: '',
  phone: '',
  email: ''
})

const genderIndex = ref(2)

const syncGenderIndex = (value: string) => {
  const idx = genderOptions.indexOf(value)
  genderIndex.value = idx >= 0 ? idx : 2
}

const loadProfile = () => {
  try {
    const stored = uni.getStorageSync('userProfile')
    if (stored) {
      const profile = (typeof stored === 'string' ? JSON.parse(stored) : stored) as Partial<UserProfile> & {
        birthDate?: string
      }
      if (!profile.deliveryDate && profile.birthDate) {
        profile.deliveryDate = profile.birthDate
      }
      form.value = { ...form.value, ...profile }
      syncGenderIndex(form.value.gender || '保密')
    }
  } catch (error) {
    console.warn('加载个人信息失败', error)
  }
}

onLoad(() => {
  loadProfile()
})

const onGenderChange = (event: any) => {
  const idx = Number(event.detail.value)
  genderIndex.value = idx
  form.value.gender = genderOptions[idx]
}

const onDeliveryChange = (event: any) => {
  form.value.deliveryDate = event.detail.value
}

const chooseAvatar = () => {
  uni.showActionSheet({
    itemList: ['拍照', '从相册选择'],
    success: ({ tapIndex }) => {
      const sourceType = tapIndex === 0 ? 'camera' : 'album'
      pickAvatar(sourceType)
    }
  })
}

const pickAvatar = (sourceType: 'camera' | 'album') => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: [sourceType],
    success: (res) => {
      form.value.avatar = res.tempFilePaths[0]
    }
  })
}

const handleSave = () => {
  if (!form.value.name || !form.value.carModel || !form.value.deliveryDate) {
    uni.showToast({
      title: !form.value.name ? '请填写昵称' : !form.value.carModel ? '请填写爱车型号' : '请选择提车日期',
      icon: 'none'
    })
    return
  }

  try {
    uni.setStorageSync('userProfile', { ...form.value })
    uni.showToast({
      title: '已保存',
      icon: 'success'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (error) {
    uni.showToast({
      title: '保存失败，请稍后再试',
      icon: 'none'
    })
    console.error('保存个人信息失败', error)
  }
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.personal-info-page {
  min-height: 100vh;
  background: #f5f7fb;
  padding: 32rpx;
  box-sizing: border-box;
}

.form-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 36rpx;
  box-shadow: 0 12rpx 40rpx rgba(44, 89, 140, 0.08);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20rpx;
}

.avatar-preview {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: #f2f4f8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #96a0b5;
  overflow: hidden;
}

.avatar-preview image {
  width: 100%;
  height: 100%;
}

.avatar-tip {
  font-size: 24rpx;
  color: #8b94a8;
  margin-top: 16rpx;
}

.avatar-btn {
  margin-top: 20rpx;
  width: 240rpx;
  height: 68rpx;
  line-height: 68rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #3ed08c, #2eb872);
  color: #fff;
  font-size: 28rpx;
}

.form-group {
  margin-top: 28rpx;
}

.form-label {
  font-size: 28rpx;
  color: #5a6276;
  margin-bottom: 12rpx;
  display: block;
}

.form-input,
.picker-value {
  width: 100%;
  height: 80rpx;
  border-radius: 20rpx;
  background: #f5f7fb;
  padding: 0 24rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #2b3141;
}

.picker-value {
  display: flex;
  align-items: center;
}

.save-btn {
  margin-top: 36rpx;
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #28d39d, #2cb4ff);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}
</style>
