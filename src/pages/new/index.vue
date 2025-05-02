<template>
  <view class="index">
    <view class="title">新建</view>
    <view class="content">
      这是新建内容
    </view>
    
  </view>
  <custom-tab-bar />
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