<template>
  <view class="add-page">
    <!-- 输入表单，包含日期、里程、油费等核心信息 -->
    <view class="form-card">
      <view class="form-item">
        <text class="form-label">加油日期</text>
        <picker mode="date" :value="form.date" @change="handleDateChange">
          <view class="picker-value">{{ form.date }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">行驶里程 (公里)</text>
        <input
          class="form-input"
          type="number"
          placeholder="请输入本次行驶里程"
          :value="form.mileage"
          @input="(e) => handleFieldChange('mileage', e.detail.value)"
        />
      </view>

      <view class="form-item">
        <text class="form-label">加油量 (升)</text>
        <input
          class="form-input"
          type="number"
          placeholder="请输入本次加油量"
          :value="form.fuel"
          @input="(e) => handleFieldChange('fuel', e.detail.value)"
        />
      </view>

      <view class="form-item">
        <text class="form-label">加油总额 (元)</text>
        <input
          class="form-input"
          type="number"
          placeholder="请输入本次加油花费"
          :value="form.amount"
          @input="(e) => handleFieldChange('amount', e.detail.value)"
        />
      </view>

      <view class="form-item">
        <text class="form-label">备注说明</text>
        <textarea
          class="form-textarea"
          maxlength="200"
          placeholder="例如：城际高速 + 空调节能模式"
          :value="form.remark"
          @input="(e) => handleFieldChange('remark', e.detail.value)"
        />
      </view>
    </view>

    <!-- 提交按钮 -->
    <button class="submit-btn" type="primary" @tap="handleSubmit">
      保存油耗记录
    </button>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

// 使用 reactive 构建表单数据，后续可便捷地提交给后端接口
const form = reactive({
  date: new Date().toISOString().slice(0, 10),
  mileage: '',
  fuel: '',
  amount: '',
  remark: ''
})

/**
 * picker 选择日期后更新对应字段
 */
const handleDateChange = (event: { detail: { value: string } }) => {
  form.date = event.detail.value
}

/**
 * 输入框改变时的统一处理方法
 * @param key 需要更新的字段名称
 * @param value 新值
 */
const handleFieldChange = (key: keyof typeof form, value: string) => {
  form[key] = value
}

/**
 * 简单的模拟提交，实际开发中可调用云函数或 HTTP 接口
 */
const handleSubmit = () => {
  if (!form.mileage || !form.fuel || !form.amount) {
    uni.showToast({
      title: '请完善必填项',
      icon: 'none'
    })
    return
  }

  uni.showToast({
    title: '保存成功',
    icon: 'success'
  })

  // 保存成功后可根据业务清空表单，这里简单重置数值字段
  form.mileage = ''
  form.fuel = ''
  form.amount = ''
  form.remark = ''
}
</script>

<style lang="scss" scoped>
@import '@/uni.scss';

.add-page {
  padding: 32rpx 32rpx 200rpx;
}

.form-card {
  background-color: #fff;
  border-radius: $card-radius;
  padding: $card-padding;
  box-shadow: $soft-shadow;
}

.form-item {
  margin-bottom: 28rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.picker-value,
.form-input,
.form-textarea {
  width: 100%;
  background-color: #f5f8fb;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: #1f2329;
}

.form-input {
  height: 88rpx;
}

.form-textarea {
  min-height: 160rpx;
}

.submit-btn {
  margin-top: 48rpx;
  background: linear-gradient(180deg, #1ec15f 0%, #14a04b 100%);
  border: none;
  border-radius: 999rpx;
  height: 96rpx;
  line-height: 96rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 18rpx 36rpx rgba(30, 193, 95, 0.28);
}
</style>
