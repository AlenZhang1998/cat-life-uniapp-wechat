<template>
  <view class="add-page">
    <!-- 输入表单，包含日期、里程、油费等核心信息 -->
    <view class="form-card">
      <view class="form-item">
        <text class="form-label">加油日期 *</text>
        <picker mode="date" :value="form.date" @change="handleDateChange">
          <view class="picker-value">{{ form.date }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">加油时间 *</text>
        <picker mode="time" :value="form.time" @change="handleTimeChange">
          <view class="picker-value">{{ form.time }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">当前里程 (公里) *</text>
        <input
          class="form-input"
          type="number"
          placeholder="请输入仪表盘当前里程"
          :value="form.mileage"
          @input="(e) => handleFieldChange('mileage', e.detail.value)"
        />
      </view>

      <view class="form-item">
        <text class="form-label">燃油标号 *</text>
        <picker
          mode="selector"
          :value="Math.max(fuelGradeOptions.indexOf(form.fuelGrade), 0)"
          :range="fuelGradeOptions"
          @change="handleFuelGradeChange"
        >
          <view class="picker-value">{{ form.fuelGrade }}</view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">油价 (元/升) *</text>
        <input
          class="form-input"
          type="digit"
          placeholder="请输入本次加油油价"
          :value="form.fuelPrice"
          @input="(e) => handleFieldChange('fuelPrice', e.detail.value)"
        />
      </view>

      <view class="form-item">
        <text class="form-label">加油金额 (元) *</text>
        <input
          class="form-input"
          type="digit"
          placeholder="请输入本次加油金额"
          :value="form.amount"
          @input="(e) => handleFieldChange('amount', e.detail.value)"
        />
      </view>

      <view class="form-item toggle-item">
        <text class="form-label">是否加满跳枪</text>
        <view class="toggle-control">
          <text
            class="toggle-value"
            :class="{ on: form.fullAutoStop, off: !form.fullAutoStop }"
          >
            {{ form.fullAutoStop ? '是' : '否' }}
          </text>
          <switch
            :class="['switch-gradient', form.fullAutoStop ? 'switch-gradient--on' : '']"
            :checked="form.fullAutoStop"
            @change="(e) => handleSwitchChange('fullAutoStop', e.detail.value)"
          ></switch>
        </view>
      </view>

      <view class="form-item toggle-item">
        <text class="form-label">是否亮燃油警告灯</text>
        <view class="toggle-control">
          <text
            class="toggle-value"
            :class="{ on: form.warningLight, off: !form.warningLight }"
          >
            {{ form.warningLight ? '是' : '否' }}
          </text>
          <switch
            :class="['switch-gradient', form.warningLight ? 'switch-gradient--on' : '']"
            :checked="form.warningLight"
            @change="(e) => handleSwitchChange('warningLight', e.detail.value)"
          ></switch>
        </view>
      </view>

      <view class="form-item toggle-item">
        <text class="form-label">上次是否记录</text>
        <view class="toggle-control">
          <text
            class="toggle-value"
            :class="{ on: form.hasPreviousRecord, off: !form.hasPreviousRecord }"
          >
            {{ form.hasPreviousRecord ? '是' : '否' }}
          </text>
          <switch
            :class="['switch-gradient', form.hasPreviousRecord ? 'switch-gradient--on' : '']"
            :checked="form.hasPreviousRecord"
            @change="(e) => handleSwitchChange('hasPreviousRecord', e.detail.value)"
          ></switch>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">备注</text>
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

const now = new Date()
const defaultDate = now.toISOString().slice(0, 10)
const defaultTime = now.toTimeString().slice(0, 5)

const fuelGradeOptions = ['92#', '95#', '98#', '0#柴油', 'E充电']

type FormModel = {
  date: string
  time: string
  mileage: string
  fuelGrade: string
  fuelPrice: string
  amount: string
  fullAutoStop: boolean
  warningLight: boolean
  hasPreviousRecord: boolean
  remark: string
}

type TextFieldKey = 'mileage' | 'fuelPrice' | 'amount' | 'remark'

// 使用 reactive 构建表单数据，后续可便捷地提交给后端接口
const form = reactive<FormModel>({
  date: defaultDate,
  time: defaultTime,
  mileage: '',
  fuelGrade: fuelGradeOptions[0],
  fuelPrice: '',
  amount: '',
  fullAutoStop: false,
  warningLight: false,
  hasPreviousRecord: true,
  remark: ''
})

/**
 * picker 选择日期后更新对应字段
 */
const handleDateChange = (event: { detail: { value: string } }) => {
  form.date = event.detail.value
}

/**
 * picker 选择时间
 */
const handleTimeChange = (event: { detail: { value: string } }) => {
  form.time = event.detail.value
}

/**
 * 选择燃油标号
 */
const handleFuelGradeChange = (event: { detail: { value: number } }) => {
  const index = Number(event.detail.value)
  form.fuelGrade = fuelGradeOptions[index] || form.fuelGrade
}

/**
 * 输入框改变时的统一处理方法
 * @param key 需要更新的字段名称
 * @param value 新值
 */
const handleFieldChange = (key: TextFieldKey, value: string) => {
  form[key] = value
}

/**
 * 处理开关项
 */
const handleSwitchChange = (
  key: 'fullAutoStop' | 'warningLight' | 'hasPreviousRecord',
  value: boolean
) => {
  form[key] = value
}

/**
 * 简单的模拟提交，实际开发中可调用云函数或 HTTP 接口
 */
const handleSubmit = () => {
  if (!form.date || !form.time || !form.mileage || !form.fuelGrade || !form.fuelPrice || !form.amount) {
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
  form.fuelPrice = ''
  form.amount = ''
  form.fullAutoStop = false
  form.warningLight = false
  form.hasPreviousRecord = false
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

.form-item.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-item.toggle-item .form-label {
  margin-bottom: 0;
}

.toggle-control {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.toggle-value {
  min-width: 48rpx;
  text-align: right;
  font-size: 26rpx;
  font-weight: 600;
  color: $muted-text;
}

.toggle-value.on {
  color: $primary-dark;
}

:deep(.switch-gradient.switch-gradient--on .wx-switch-input) {
  background-image: linear-gradient(180deg, #1ec15f 0%, #22d78a 100%);
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
  background: linear-gradient(180deg, #1ec15f 0%, #22d78a 100%);
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
