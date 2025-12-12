<template>
  <view class="page">
    <view class="hero">
      <text class="hero-title">疑难解答</text>
      <text class="hero-sub">常见问题集中放送，帮你快速上手</text>
    </view>

    <view class="faq-list">
      <view class="faq-card" v-for="item in faqItems" :key="item.key">
        <view class="faq-title">
          <text class="dot">·</text>
          <text class="text">{{ item.q }}</text>
        </view>
        <view class="faq-content">
          <text
            v-for="(line, idx) in item.a"
            :key="idx"
            class="faq-line"
          >
            {{ line }}
          </text>
        </view>
        <view
          v-if="item.link"
          class="faq-link"
          @tap="navigate(item.link?.path)"
        >
          <text>{{ item.link.label }}</text>
          <text class="arrow">→</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const faqItems = [
  {
    key: 'how-to-use',
    q: '1、爱车油耗怎么使用？',
    a: [
      '添加加油记录：在“添加记录”页填写日期、金额、单价、行驶里程、是否加满/亮灯。',
      '查看统计：首页统计显示平均油耗、油价、行程等；趋势卡查看区间油耗走势。',
      '选择城市：从首页或城市页选择城市，便于获取本地油价基准。',
    ],
  },
  {
    key: 'why-no-avg',
    q: '2、为什么油耗计算不出来？',
    a: [
      '至少需要 2 次加油记录且包含里程，才能计算单次和平均油耗。',
      '若里程缺失或相同，无法计算行程，油耗会显示 “--”。',
      '请检查是否勾选了“上次是否记录”，以免首次记录被当作缺口。',
    ],
    link: { label: '查看详细说明', path: '/pages/faq/why-no-avg' },
  },
  {
    key: 'good-habits',
    q: '3、爱车油耗推荐的 6 种燃油车加油记录习惯',
    a: [
      '① 每次记总金额/单价/加油量/里程；② 记录是否加满跳枪；③ 记录是否亮燃油警告灯；',
      '④ 里程表用车机/仪表读数；⑤ 逐笔记，不补录；⑥ 尽量在油灯亮后不久或跳枪时加油，便于计算。',
    ],
  },
  {
    key: 'fuel-avg',
    q: '4、燃油车的平均油耗是怎么计算的？',
    a: [
      '采用加权平均：平均油耗 = (单次油耗 × 权重) 的总和，权重为单次行程 / 行程总和。',
      '可兼容加满、亮灯等场景，计算更稳健。',
    ],
    link: { label: '查看平均油耗说明', path: '/pages/faq/fuel-avg' },
  },
  {
    key: 'single-fuel',
    q: '5、燃油车的单次油耗是怎么计算的？',
    a: [
      '连续两次加油之间的油耗：加满场景用下一次加油量 ÷ 行驶里程；亮灯场景用第一次加油量 ÷ 行驶里程；都满足优先加满算法。',
    ],
    link: { label: '查看单次油耗说明', path: '/pages/faq/single-fuel' },
  },
  {
    key: 'flags',
    q: '6、输入时“是否加满跳枪”“是否亮燃油警告灯”“上次是否记录”怎么勾选？',
    a: [
      '加满跳枪：本次加油打到跳枪且油箱满，则勾选；否则不勾。',
      '亮燃油警告灯：本次加油前油灯已亮，则勾选；否则不勾。',
      '上次是否记录：如果上一次加油你已经在应用里记录过，就勾选；若之前没记录或漏记，不勾选，这样系统会忽略缺口，避免油耗失真。',
    ],
  },
  {
    key: 'cost-per-day',
    q: '7、费用页面的“成本/天”是怎么计算的？',
    a: [
      '成本/天 = 选定时间范围内的总油费 ÷ 天数。',
      '天数来自记录的起止日期；如无日期范围则按所有记录的跨度计算。',
    ],
  },
];

const navigate = (path?: string) => {
  if (!path) return;
  uni.navigateTo({ url: path });
};
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 24rpx;
  background: linear-gradient(180deg, #f5f7fb 0%, #f8fbff 100%);
  box-sizing: border-box;
}

.hero {
  padding: 26rpx 24rpx;
  border-radius: 20rpx;
  background: #eef3ff;
  color: #1f2a44;
  box-shadow: 0 12rpx 32rpx rgba(58, 122, 254, 0.08);
  margin-bottom: 24rpx;

  .hero-title {
    font-size: 34rpx;
    font-weight: 700;
    display: block;
    margin-bottom: 8rpx;
  }
  .hero-sub {
    font-size: 24rpx;
    color: #4a5875;
  }
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.faq-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx 18rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
}

.faq-title {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  margin-bottom: 12rpx;

  .dot {
    color: #3a7afe;
    font-size: 28rpx;
    line-height: 1;
  }
  .text {
    font-size: 28rpx;
    font-weight: 600;
    color: #1f2a44;
    line-height: 1.4;
  }
}

.faq-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 10rpx;
}

.faq-line {
  font-size: 26rpx;
  color: #2f3441;
  line-height: 1.6;
}

.faq-link {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  color: #3a7afe;
  font-size: 24rpx;
  margin-top: 4rpx;
}

.arrow {
  font-size: 26rpx;
}
</style>
