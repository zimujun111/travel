<template>
    <view class="container">
    
    <view class="navbar" :style="{ paddingTop: menuButtonTop + 'px' }">
      <view class="navbar-left">
        <image src="../../assets/images/xiecheng.png" class="nav-icon" />
      </view>
      <view class="search-box" @tap="goToSearch">
        <image src="../../assets/images/search.png" class="search-icon" />
        <input 
          class="search-input" 
          placeholder="搜索游记" 
          placeholder-class="placeholder-style"
          disabled
          
        />
        
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref, onMounted,computed } from 'vue'
import Taro from '@tarojs/taro'
const emit = defineEmits(['height-change'])

const statusBarHeight = ref(0)
const menuButtonHeight = ref(0)
const menuButtonTop = ref(0)

const navbarHeight = computed(() => {
  return (menuButtonTop.value - statusBarHeight.value) * 2 + menuButtonHeight.value
})
const goToSearch = () => {
  
  Taro.navigateTo({
      url: '/pages/search/index'
    })
}

onMounted(() => {
  
  const systemInfo = Taro.getSystemInfoSync()
  const menuButtonInfo = Taro.getMenuButtonBoundingClientRect()
  
  statusBarHeight.value = systemInfo.statusBarHeight
  menuButtonHeight.value = menuButtonInfo.height
  menuButtonTop.value = menuButtonInfo.top
  
  emit('height-change', navbarHeight.value + statusBarHeight.value)
  
})
</script>
<style>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding-left: 30rpx;
  padding-right: 30rpx;
  background-color: #fff;
  z-index: 1000;
  box-sizing: border-box;
  padding-bottom: 10rpx;
}
.nav-icon{
  width: 50rpx;
  height: 50rpx;
}
.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  padding: 12rpx 20rpx;
  margin-right: 176rpx; 
  margin-left: 18rpx;
}
.search-icon{
  width: 30rpx;
  height: 30rpx;
  margin-right: 10rpx;
}
</style>
