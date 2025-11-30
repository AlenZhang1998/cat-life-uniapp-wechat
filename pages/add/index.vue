<template>
  <view class="add-page">
    <view class="page-header">
      <text class="page-title">记录本次加油</text>
      <text class="page-desc">完善必填信息，可选项帮助获得更精准的油耗分析</text>
    </view>

    <!-- 输入表单，包含日期、里程、油费等核心信息 -->
    <view class="form-card">
      <view class="section-divider">
        <text class="section-title">必填信息</text>
        <text class="section-subtitle">用于计算本次油耗</text>
      </view>
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
          @input="(e:any) => handleFieldChange('mileage', e.detail.value)"
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
          @input="(e:any) => handleFieldChange('fuelPrice', e.detail.value)"
        />
      </view>

      <view class="form-item">
        <text class="form-label">加油金额 (元) *</text>
        <input
          class="form-input"
          type="digit"
          placeholder="请输入本次加油金额"
          :value="form.amount"
          @input="(e:any) => handleFieldChange('amount', e.detail.value)"
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
            @change="(e:any) => handleSwitchChange('fullAutoStop', e.detail.value)"
          ></switch>
        </view>
      </view>

      <view class="section-divider">
        <text class="section-title">补充信息</text>
        <text class="section-subtitle">描述习惯与车辆状态</text>
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
            @change="(e:any) => handleSwitchChange('warningLight', e.detail.value)"
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
            @change="(e:any) => handleSwitchChange('hasPreviousRecord', e.detail.value)"
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
          @input="(e:any) => handleFieldChange('remark', e.detail.value)"
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
  min-height: 100vh;
  padding: 48rpx 32rpx 220rpx;
  background: linear-gradient(180deg, #f6fbff 0%, #eef6f2 35%, #f8fbfd 100%);

  .page-header {
    margin-bottom: 32rpx;
    padding: 32rpx 36rpx;
    border-radius: 32rpx;
    background: linear-gradient(135deg, rgba(30, 193, 95, 0.14), rgba(88, 177, 255, 0.14));
    border: 1rpx solid rgba(30, 193, 95, 0.16);
    box-shadow: 0 24rpx 45rpx rgba(30, 193, 95, 0.12);

    .page-title {
      display: block;
      margin-bottom: 12rpx;
      font-size: 40rpx;
      font-weight: 700;
      color: #0f172a;
    }

    .page-desc {
      font-size: 26rpx;
      color: #5b6472;
    }
  }

  .form-card {
    padding: 40rpx 32rpx 44rpx;
    border-radius: $card-radius;
    background-color: #fff;
    border: 1rpx solid rgba(8, 16, 44, 0.05);
    box-shadow: 0 28rpx 60rpx rgba(15, 23, 42, 0.08);

    .section-divider {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin: 12rpx 0 32rpx;
      padding-bottom: 16rpx;
      border-bottom: 1rpx dashed rgba(11, 23, 52, 0.08);

      .section-title {
        font-size: 30rpx;
        font-weight: 700;
      }

      .section-subtitle {
        font-size: 24rpx;
        color: $muted-text;
      }
    }

    .form-item {
      margin-bottom: 28rpx;

      &:last-child {
        margin-bottom: 0;
      }

      &.toggle-item {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .form-label {
          margin-bottom: 0;
        }
      }
    }

    .form-label {
      display: block;
      margin-bottom: 12rpx;
      font-size: 28rpx;
      font-weight: 600;
    }

    .toggle-control {
      display: flex;
      align-items: center;
      gap: 16rpx;
      padding: 4rpx 8rpx;
      border-radius: 999rpx;

      .toggle-value {
        min-width: 48rpx;
        text-align: right;
        font-size: 26rpx;
        font-weight: 600;
        color: $muted-text;

        &.on {
          color: $primary-dark;
        }
      }

      :deep(.switch-gradient.switch-gradient--on .wx-switch-input) {
        background: linear-gradient(180deg, #1ec15f 0%, #22d78a 100%);
        box-shadow: 0 12rpx 26rpx rgba(17, 168, 70, 0.35);
      }
    }

    .picker-value,
    .form-input,
    .form-textarea {
      width: 100%;
      box-sizing: border-box;
      padding: 26rpx;
      font-size: 28rpx;
      color: #1f2329;
      border-radius: 20rpx;
      border: 1rpx solid rgba(120, 146, 172, 0.18);
      background: linear-gradient(135deg, #f8fbff 0%, #f1f6fb 100%);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .form-input {
      height: 88rpx;
    }

    .form-textarea {
      min-height: 160rpx;
    }

    .picker-value:focus,
    .form-input:focus,
    .form-textarea:focus {
      border-color: rgba(17, 168, 70, 0.55);
      box-shadow: 0 12rpx 28rpx rgba(17, 168, 70, 0.12);
    }
  }

  .submit-btn {
    margin-top: 48rpx;
    height: 96rpx;
    line-height: 96rpx;
    border: none;
    border-radius: 999rpx;
    background: linear-gradient(180deg, #1ec15f 0%, #22d78a 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    box-shadow: 0 18rpx 36rpx rgba(30, 193, 95, 0.28);
  }
}
</style>
