<template>
  <view class="index">
    <view class="title">首页</view>
    <view class="content">
      这是首页内容
    </view>
    <custom-tab-bar />
  </view>
</template>

<script>
import { defineComponent } from 'vue'
import CustomTabBar from '../../custom-tab-bar/index.vue'

export default defineComponent({
  name: 'Index',
  components: {
    CustomTabBar
  }
})
</script>
<style>

</style>
