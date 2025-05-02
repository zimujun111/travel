<template>
  <view class="index">
    <view class="title">我的</view>
    <view class="content">
      这是我的内容
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