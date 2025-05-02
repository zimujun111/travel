<template>
    <view class="tab-bar-container">
      <view class="tab-bar">
        <view 
          v-for="(item, index) in tabList" 
          :key="index"
          class="tab-item"
          @click="switchTab(index, item.pagePath)"
        >
          <icon
            :type="item.iconType"
            :size="24"
            :color="currentTab === index ? selectedColor : color"
          />
          <text 
            class="tab-text"
            :style="{ color: currentTab === index ? selectedColor : color }"
          >
            {{ item.text }}
          </text>
        </view>
      </view>
    </view>
  </template>

<script>
import Taro from '@tarojs/taro'
import { computed } from 'vue'
import { Icon } from '@tarojs/components' // 导入 Taro 原生图标组件
import { ref } from 'vue'


export default {
  setup() {
    const currentTab = ref(0)
    const color = '#999'
    const selectedColor = '#07c160'
    
    const tabList = [
      {
        text: '首页',
        iconType: 'home',
        pagePath: '/pages/index/index'
      },
      {
        text: '发现',
        iconType: 'search',
        pagePath: '/pages/discover/index'
      },
      {
        text: '我的',
        iconType: 'user',
        pagePath: '/pages/user/index'
      }
    ]

    const switchTab = (index, url) => {
      currentTab.value = index
      Taro.switchTab({ url })
    }

    return { currentTab, color, selectedColor, tabList, switchTab }
  }
}
</script>

<style>
/* 核心样式 */
.tab-bar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.tab-bar {
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: space-around;
  align-items: center;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  flex: 1;
}

.tab-text {
  font-size: 50rpx;
  margin-top: 4px;
}

/* 适配 iPhoneX 等有底部安全区域的设备 */
@supports (bottom: env(safe-area-inset-bottom)) {
  .tab-bar-container {
    padding-bottom: env(safe-area-inset-bottom);
    height: calc(50px + env(safe-area-inset-bottom));
  }
}
</style>