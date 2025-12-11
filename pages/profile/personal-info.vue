<template>
  <view class="personal-info-page">
    <view class="form-card">
      <view class="avatar-section">
        <view class="avatar-preview" @tap="chooseAvatar">
          <image
            v-if="form.userAvatar"
            :src="form.userAvatar"
            mode="aspectFill"
          />
          <text v-else>添加头像</text>
        </view>
        <text class="avatar-tip">支持拍照或从本地相册选择</text>
        <button class="avatar-btn" @tap="chooseAvatar">更换头像</button>
      </view>

      <view class="form-group">
        <text class="form-label">用户名</text>
        <input
          class="form-input"
          v-model="form.username"
          placeholder="请输入用户名"
          maxlength="20"
        />
      </view>

      <view class="form-group">
        <text class="form-label">性别（微信）</text>
        <picker
          mode="selector"
          :range="genderOptions"
          :value="genderIndex"
          :disabled="true"
        >
          <view class="picker-value picker-value--disabled">{{
            form.gender || '保密'
          }}</view>
        </picker>
        <text class="field-tip">性别由微信同步，暂不支持修改</text>
      </view>

      <view class="form-group">
        <text class="form-label">提车日期</text>
        <picker
          mode="date"
          :value="form.deliveryDate"
          @change="onDeliveryChange"
        >
          <view class="picker-value">{{
            form.deliveryDate || '请选择提车日期'
          }}</view>
        </picker>
      </view>

      <view class="form-group">
        <text class="form-label">爱车型号</text>
        <input
          class="form-input"
          v-model="form.carModel"
          placeholder="请输入你喜欢的车型"
          maxlength="30"
        />
      </view>

      <view class="form-group">
        <text class="form-label">联系电话</text>
        <input
          class="form-input"
          v-model="form.phone"
          placeholder="请输入手机号"
          type="number"
          maxlength="11"
        />
      </view>

      <view class="form-group">
        <text class="form-label">邮箱</text>
        <input
          class="form-input"
          v-model="form.email"
          placeholder="请输入邮箱地址"
          type="text"
        />
      </view>
    </view>

    <button class="save-btn" @tap="handleSave">保存</button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useAuth } from '@/utils/auth';
import { axios } from '@/utils/request';
import { uploadAvatarToCos } from '@/utils/upload';

interface UserProfile {
  userAvatar: string;
  username: string;
  gender: string;
  deliveryDate: string;
  carModel: string;
  phone: string;
  email: string;
  // 兼容旧字段
  name?: string;
  avatar?: string;
}

const genderOptions = ['男', '女', '保密']; // 1 男，2 女，0 未知/保密

const form = ref<UserProfile>({
  userAvatar: '',
  username: '',
  gender: '保密',
  deliveryDate: '',
  carModel: '',
  phone: '',
  email: '',
});

const genderIndex = ref(2);
const { refreshLoginState } = useAuth();

const mapGenderValue = (value: unknown) => {
  if (typeof value === 'number') {
    return value === 1 ? '男' : value === 2 ? '女' : '保密';
  }
  if (typeof value === 'string' && genderOptions.includes(value)) {
    return value;
  }
  return '保密';
};

const syncGenderIndex = (value: string) => {
  const idx = genderOptions.indexOf(value);
  genderIndex.value = idx >= 0 ? idx : 2;
};

const mapGenderToNumber = (value: string) => {
  if (value === '男') return 1;
  if (value === '女') return 2;
  return 0;
};

const loadLocalProfile = () => {
  try {
    const stored = uni.getStorageSync('userProfile');
    if (stored) {
      const profile = (
        typeof stored === 'string' ? JSON.parse(stored) : stored
      ) as Partial<UserProfile> & {
        birthDate?: string;
      };
      if (!profile.deliveryDate && profile.birthDate) {
        profile.deliveryDate = profile.birthDate;
      }
      // 本地存的是用户自定义头像/昵称，不被微信数据覆盖
      form.value = { ...form.value, ...profile };
      form.value.username =
        profile.username || profile.name || form.value.username;
      form.value.userAvatar =
        profile.userAvatar || profile.avatar || form.value.userAvatar;
      form.value.gender = mapGenderValue(profile.gender);
      syncGenderIndex(form.value.gender || '保密');
    }
  } catch (error) {
    console.warn('加载个人信息失败', error);
  }
};

// 页面加载时先读本地自定义信息
onLoad(() => {
  loadLocalProfile();
  loadProfile();
});

// 页面显示时加载个人信息
// onShow(() => {
//   loadProfile()
// })

const isNonEmpty = (v: any) =>
  v !== undefined && v !== null && String(v).trim() !== '';

const loadProfile = async () => {
  const token = uni.getStorageSync('token');
  if (!token) return;

  try {
    const res = await axios.get('/api/profile', { showErrorToast: false });
    // 兼容两种 axios 封装：直接返回对象 或 包裹在 res.data
    const remote =
      res && (res as any).data && (res as any).code === undefined
        ? (res as any).data
        : res || {};

    console.log('loadProfile remote = ', remote);

    // 如果后端返回真实 username/userAvatar，就优先使用后端的（只要非空字符串）
    const finalUserAvatar = isNonEmpty(remote.userAvatar)
      ? remote.userAvatar
      : isNonEmpty(remote.avatarUrl)
      ? remote.avatarUrl
      : isNonEmpty(form.value.userAvatar)
      ? form.value.userAvatar
      : '';

    const finalUsername = isNonEmpty(remote.username)
      ? remote.username
      : isNonEmpty(remote.nickname)
      ? remote.nickname
      : isNonEmpty(form.value.username)
      ? form.value.username
      : '';

    const merged: UserProfile = {
      ...form.value,
      userAvatar: finalUserAvatar,
      username: finalUsername,
      gender: mapGenderValue(remote.gender),
      deliveryDate: isNonEmpty(remote.deliveryDate)
        ? remote.deliveryDate
        : isNonEmpty(remote.birthDate)
        ? remote.birthDate
        : form.value.deliveryDate,
      carModel: isNonEmpty(remote.favoriteCarModel)
        ? remote.favoriteCarModel
        : isNonEmpty(remote.carModel)
        ? remote.carModel
        : form.value.carModel,
      phone: isNonEmpty(remote.phone) ? remote.phone : form.value.phone,
      email: isNonEmpty(remote.email) ? remote.email : form.value.email,
    };

    form.value = merged;
    syncGenderIndex(merged.gender);
  } catch (error) {
    console.warn('请求个人信息失败', error);
    uni.showToast({
      title: '加载失败，已使用本地信息',
      icon: 'none',
    });
  }
};

const onDeliveryChange = (event: any) => {
  form.value.deliveryDate = event.detail.value;
};

const chooseAvatar = () => {
  uni.showActionSheet({
    itemList: ['拍照', '从相册选择'],
    success: ({ tapIndex }) => {
      const sourceType = tapIndex === 0 ? 'camera' : 'album';
      pickAvatar(sourceType);
    },
  });
};

const pickAvatar = (sourceType: 'camera' | 'album') => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: [sourceType],
    success: async (res) => {
      const tempPath = res.tempFilePaths[0];

      // 1. 先用 wxfile:// 做本地预览，让用户马上看到效果
      form.value.userAvatar = tempPath;

      // 2. 再上传到服务器 -> 服务器上传 COS -> 返回 https URL
      try {
        uni.showLoading({ title: '上传中...' });
        const url = await uploadAvatarToCos(tempPath);

        // 3. 用真正的 COS URL 覆盖掉临时路径
        form.value.userAvatar = url as string;
        uni.hideLoading();
        uni.showToast({ title: '头像已更新', icon: 'success' });
      } catch (err) {
        console.error('上传头像失败', err);
        uni.hideLoading();
        uni.showToast({
          title:
            err instanceof Error && err.message === 'no token for upload'
              ? '请先登录'
              : '上传头像失败',
          icon: 'none',
        });
      }
    },
  });
};

const handleSave = () => {
  console.log(199, 'handleSave form.value = ', form.value);
  const phoneRegex = /^1\d{10}$/;
  const emailRegex = /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/;

  if (
    !form.value.username ||
    !form.value.carModel ||
    !form.value.deliveryDate
  ) {
    uni.showToast({
      title: !form.value.username
        ? '请填写用户名'
        : !form.value.carModel
        ? '请填写爱车型号'
        : '请选择提车日期',
      icon: 'none',
    });
    return;
  }

  if (form.value.phone && !phoneRegex.test(form.value.phone)) {
    uni.showToast({
      title: '手机号格式不正确',
      icon: 'none',
    });
    return;
  }

  if (form.value.email && !emailRegex.test(form.value.email)) {
    uni.showToast({
      title: '邮箱格式不正确',
      icon: 'none',
    });
    return;
  }

  const payload = {
    username: form.value.username,
    userAvatar: form.value.userAvatar,
    gender: mapGenderToNumber(form.value.gender || '保密'),
    deliveryDate: form.value.deliveryDate,
    favoriteCarModel: form.value.carModel,
    phone: form.value.phone,
    email: form.value.email,
  };

  uni.showLoading({ title: '保存中', mask: true });

  const doSave = async () => {
    const token = uni.getStorageSync('token');
    if (!token) {
      uni.showToast({
        title: '请先登录再保存',
        icon: 'none',
      });
      throw new Error('no token');
    }
    await axios.put('/api/profile', { data: payload });
    // 同步给旧字段 name 方便其他页面兼容
    uni.setStorageSync('userProfile', {
      ...form.value,
      name: form.value.username,
      avatar: form.value.userAvatar,
    });
    refreshLoginState();
    uni.showToast({
      title: '已保存',
      icon: 'success',
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 500);
  };

  doSave()
    .catch((error) => {
      console.error('保存个人信息失败', error);
      uni.showToast({
        title: '保存失败，请稍后再试',
        icon: 'none',
      });
    })
    .finally(() => {
      uni.hideLoading();
    });
};
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.personal-info-page {
  min-height: 100vh;
  background: #f5f7fb;
  padding: 32rpx;
  box-sizing: border-box;
  .form-card {
    background: #fff;
    border-radius: 32rpx;
    padding: 36rpx;
    box-shadow: 0 12rpx 40rpx rgba(44, 89, 140, 0.08);

    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 20rpx;

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

        image {
          width: 100%;
          height: 100%;
        }
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
    }

    .form-group {
      margin-top: 28rpx;

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

        &--disabled {
          color: #8b94a8;
        }
      }

      .field-tip {
        margin-top: 8rpx;
        font-size: 24rpx;
        color: #8b94a8;
      }
    }
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
}
</style>
