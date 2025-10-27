<script setup lang="ts">
// 这里暂时不需要编写逻辑脚本，后续可在此集中处理全局生命周期事件。
</script>

<style lang="scss">
/* 为所有页面提供一个柔和的灰色背景，便于突出白色卡片区域 */
page {
  background-color: #f5f7fb;
  color: #1c1f23;
  font-size: 28rpx;
  line-height: 1.5;
}

/* 微信小程序默认字体偏细，这里统一做一下增强提升可读性 */
view,
text {
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
}
</style>
