<template>
  <view class="custom-tab-bar">
    <block v-for="(item, index) in tabBar.list" :key="index">
      <navigator
        :url="'/' + item.pagePath"
        :class="['tab-bar-item', currentIndex === index ? 'active' : '']"
      >
        <image
          :src="currentIndex === index ? item.selectedIconPath : item.iconPath"
          class="icon"
        />
        <text class="text">{{ item.text }}</text>
      </navigator>
    </block>
    <!-- 中间圆形按钮 -->
    <view class="center-button" @click="handleCenterButtonClick">
      <image src="/assets/images/center-icon.png" class="center-icon" />
    </view>
  </view>
</template>

<script>
import Taro from '@tarojs/taro'
import { computed } from 'vue'

export default {
  name: 'CustomTabBar',
  setup() {
    const tabBar = Taro.getApp().config.tabBar
    const currentIndex = computed(() => {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const currentPath = currentPage.route
      return tabBar.list.findIndex(item => item.pagePath === currentPath)
    })

    const handleCenterButtonClick = () => {
      // 处理中间按钮点击事件
      console.log('中间按钮被点击')
    }

    return {
      tabBar,
      currentIndex,
      handleCenterButtonClick
    }
  }
}
</script>

<style scoped>
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.tab-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #999;
}

.tab-bar-item.active {
  color: #1296db;
}

.icon {
  width: 24px;
  height: 24px;
}

.text {
  font-size: 12px;
}

.center-button {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 50px;
  background-color: #1296db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.center-icon {
  width: 24px;
  height: 24px;
}
</style>